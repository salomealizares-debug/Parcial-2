const BASE_URL = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com";
const API_URL = `${BASE_URL}/api/tiposbaja`;

let modoEdicion = false;
let idActual = null;


const inputGrupo     = document.querySelector(".input-corto");
const selectNombre   = document.querySelector(".input-largo");
const txtObservacion = document.querySelector("textarea");
const tbody          = document.querySelector(".tabla-scroll table tbody");
const botones        = document.querySelectorAll(".btn");

const btnNuevo    = botones[0];
const btnModif    = botones[1];
const btnGuardar  = botones[2];
const btnEliminar = botones[3];
const btnDeshacer = botones[4];


function estadoInicial() {
  btnGuardar.disabled  = true;  btnGuardar.classList.add("disabled");
  btnDeshacer.disabled = true;  btnDeshacer.classList.add("disabled");
  btnNuevo.disabled    = false; btnNuevo.classList.remove("disabled");
  btnModif.disabled    = false; btnModif.classList.remove("disabled");
  btnEliminar.disabled = false; btnEliminar.classList.remove("disabled");
}

function estadoEdicion() {
  btnGuardar.disabled  = false; btnGuardar.classList.remove("disabled");
  btnDeshacer.disabled = false; btnDeshacer.classList.remove("disabled");
}


async function cargarDatos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error GET /api/tiposbaja");
    const data = await res.json();
    renderTabla(data);
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el servidor.\n" + err.message);
  }
}


function renderTabla(data) {
  tbody.innerHTML = "";
  data.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${item.id}</td><td>${item.nombre ?? ""}</td>`;
    tr.style.cursor = "pointer";

    tr.addEventListener("click", () => {
      idActual = item.id;
      inputGrupo.value = item.id;
      selectNombre.innerHTML = `<option value="${item.nombre ?? ""}">${item.nombre ?? ""}</option>`;
      txtObservacion.value = item.descripcion ?? "";
      document.querySelectorAll(".tabla-scroll tr").forEach(r => r.classList.remove("fila-activa"));
      tr.classList.add("fila-activa");
    });

    tbody.appendChild(tr);
  });
}


function getBody(incluirId = false) {
  const body = {
    nombre: selectNombre.value,
    descripcion: txtObservacion.value,
  };
  if (incluirId) {
    body.id = parseInt(inputGrupo.value) || 0;
  }
  return body;
}


function limpiarFormulario() {
  inputGrupo.value = "";
  selectNombre.innerHTML = `<option>MUEBLES Y ENSERES DE OFICINA</option>`;
  txtObservacion.value = "";
  idActual = null;
  modoEdicion = false;
  document.querySelectorAll(".tabla-scroll tr").forEach(r => r.classList.remove("fila-activa"));
}


async function guardarNuevo() {
  const body = getBody(false); // sin id
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Error POST: ${res.status}`);
    alert("✔ Registro guardado correctamente.");
    limpiarFormulario();
    estadoInicial();
    cargarDatos();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar.\n" + err.message);
  }
}


async function actualizarRegistro() {
  if (idActual === null) { alert("Seleccione un registro de la tabla."); return; }
  const body = getBody(true); // con id
  try {
    const res = await fetch(`${API_URL}/${idActual}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Error PUT: ${res.status}`);
    alert("✔ Registro modificado correctamente.");
    limpiarFormulario();
    estadoInicial();
    cargarDatos();
  } catch (err) {
    console.error(err);
    alert("No se pudo modificar.\n" + err.message);
  }
}


async function eliminarRegistro() {
  if (idActual === null) { alert("Seleccione un registro de la tabla."); return; }
  if (!confirm(`¿Eliminar el registro con ID ${idActual}?`)) return;
  try {
    const res = await fetch(`${API_URL}/${idActual}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error DELETE: ${res.status}`);
    alert("✔ Registro eliminado.");
    limpiarFormulario();
    estadoInicial();
    cargarDatos();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar.\n" + err.message);
  }
}


btnNuevo.addEventListener("click", () => {
  limpiarFormulario();
  modoEdicion = false;
  inputGrupo.focus();
  estadoEdicion();
});

btnModif.addEventListener("click", () => {
  if (idActual === null) { alert("Seleccione un registro de la tabla."); return; }
  modoEdicion = true;
  estadoEdicion();
});

btnGuardar.addEventListener("click", () => {
  if (modoEdicion) {
    actualizarRegistro();
  } else {
    guardarNuevo();
  }
});

btnEliminar.addEventListener("click", eliminarRegistro);

btnDeshacer.addEventListener("click", () => {
  limpiarFormulario();
  estadoInicial();
  cargarDatos();
});


estadoInicial();
cargarDatos();