const BASE = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com";

let modoActual  = null;
let oficinas    = [];
let estados     = [];
let seleccionId = null;


const inputCodigo   = document.querySelector(".oficina-box input");
const selectOficina = document.querySelector(".oficina-box select");
const estadoBox     = document.querySelector(".estado");
const textarea      = document.querySelector("textarea");
const tbody         = document.querySelector("table tbody");


const [btnActivarDer, btnInactivarDer] =
    document.querySelectorAll(".menu-derecha button");


const [btnFiltroActivo, btnFiltroInactivo,
       btnNuevo, btnModificar,
       btnGuardar, btnDeshacer, btnSalir] =
    document.querySelectorAll(".footer button");


async function apiFetch(url, method = "GET", body = null) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(BASE + url, opts);
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    if (res.status === 204) return null;
    return res.json();
}


function activarEdicion(on) {
    inputCodigo.disabled   = !on;
    selectOficina.disabled = !on;
    textarea.disabled      = !on;
}

function limpiarFormulario() {
    inputCodigo.value     = "";
    textarea.value        = "";
    estadoBox.textContent = "-";
    seleccionId = null;
    modoActual  = null;
    activarEdicion(false);
    tbody.querySelectorAll("tr.seleccionada")
         .forEach(r => r.classList.remove("seleccionada"));
    if (selectOficina.options.length) selectOficina.selectedIndex = 0;
}


async function inicializar() {
    try {
        estados = await apiFetch("/api/estado");
        await cargarOficinas();
    } catch (e) {
        alert("Error al inicializar:\n" + e.message);
    }
}


async function cargarOficinas() {
    try {
        oficinas = await apiFetch("/api/oficina");
        poblarSelect(oficinas);
        renderTabla(oficinas);
    } catch (e) {
        alert("Error al cargar oficinas:\n" + e.message);
    }
}

function poblarSelect(lista) {
    selectOficina.innerHTML = "";
    lista.forEach(of => {
        const opt = document.createElement("option");
        opt.value       = of.id;
        opt.textContent = `${of.id} - ${of.nombre ?? ""}`.trim();
        selectOficina.appendChild(opt);
    });
}

function renderTabla(lista) {
    tbody.innerHTML = "";
    const MIN_FILAS = 8;
    lista.forEach(of => {
        const tr = document.createElement("tr");
        tr.dataset.id = of.id;
        tr.innerHTML = `
            <td>${of.id          ?? ""}</td>
            <td>${of.nombre      ?? ""}</td>
            <td>${of.descripcion ?? ""}</td>
            <td>${of.estado      ?? ""}</td>
        `;
        tr.addEventListener("click", () => seleccionarFila(tr, of));
        tbody.appendChild(tr);
    });
    for (let i = lista.length; i < MIN_FILAS; i++) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>&nbsp;</td><td></td><td></td><td></td>`;
        tbody.appendChild(tr);
    }
}


function seleccionarFila(tr, of) {
    tbody.querySelectorAll("tr.seleccionada")
         .forEach(r => r.classList.remove("seleccionada"));
    tr.classList.add("seleccionada");
    seleccionId = of.id;

    inputCodigo.value     = of.id          ?? "";
    textarea.value        = of.descripcion ?? "";
    estadoBox.textContent = of.estado      ?? "-";

    const opt = selectOficina.querySelector(`option[value="${of.id}"]`);
    if (opt) selectOficina.value = of.id;
}


function accionNuevo() {
    limpiarFormulario();
    modoActual = "nuevo";
    activarEdicion(true);
    estadoBox.textContent = estados[0]?.nomestado ?? "ACTIVO";
    inputCodigo.focus();
}


function accionModificar() {
    if (!seleccionId) {
        alert("Seleccioná una fila de la tabla primero.");
        return;
    }
    modoActual = "modificar";
    activarEdicion(true);
    textarea.focus();
}


async function accionGuardar() {
    if (!modoActual) {
        alert("Presioná Nuevo o Modificar antes de guardar.");
        return;
    }

    const payload = {
        nombre:      inputCodigo.value.trim(),
        descripcion: textarea.value.trim(),
        estado:      estadoBox.textContent.trim() || "ACTIVO"
    };

    if (!payload.nombre) {
        alert("El nombre es obligatorio.");
        return;
    }

    try {
        if (modoActual === "nuevo") {
            await apiFetch("/api/oficina", "POST", payload);
            alert("Oficina creada correctamente.");
        } else {
            await apiFetch(`/api/oficina/${seleccionId}`, "PUT", payload);
            alert("Oficina actualizada correctamente.");
        }
        await cargarOficinas();
        limpiarFormulario();
    } catch (e) {
        alert("Error al guardar:\n" + e.message);
    }
}


async function cambiarEstado(nuevoEstado) {
    if (!seleccionId) {
        alert("Seleccioná una fila primero.");
        return;
    }
    const oficina = oficinas.find(o => o.id == seleccionId);
    if (!oficina) return;
    try {
        await apiFetch(`/api/oficina/${seleccionId}`, "PUT",
            { ...oficina, estado: nuevoEstado });
        estadoBox.textContent = nuevoEstado;
        await cargarOficinas();
    } catch (e) {
        alert("Error al cambiar estado:\n" + e.message);
    }
}


function filtrarTabla(estado) {
    const lista = oficinas.filter(o =>
        (o.estado ?? "").toUpperCase() === estado.toUpperCase()
    );
    renderTabla(lista);
}


async function accionDeshacer() {
    limpiarFormulario();
    await cargarOficinas();
}


function accionSalir() {
    if (modoActual && !confirm("¿Salir sin guardar los cambios?")) return;
    window.history.back();
}


document.querySelectorAll(".textarea-buttons button")
    .forEach((btn, i) => {
        btn.addEventListener("click", () => {
            textarea.scrollTop += i === 0 ? -30 : 30;
        });
    });


btnActivarDer.addEventListener("click",   () => cambiarEstado("ACTIVO"));
btnInactivarDer.addEventListener("click", () => cambiarEstado("INACTIVO"));

btnFiltroActivo.addEventListener("click",   () => filtrarTabla("ACTIVO"));
btnFiltroInactivo.addEventListener("click", () => filtrarTabla("INACTIVO"));
btnNuevo.addEventListener("click",          accionNuevo);
btnModificar.addEventListener("click",      accionModificar);
btnGuardar.addEventListener("click",        accionGuardar);
btnDeshacer.addEventListener("click",       accionDeshacer);
btnSalir.addEventListener("click",          accionSalir);


activarEdicion(false);
inicializar();