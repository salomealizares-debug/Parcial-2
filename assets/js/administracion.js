const BASE = 'https://team-404-grupo-4-del-integrante-jhamel.onrender.com';
let filaSeleccionada = null;
let idSeleccionado = null;
let modoEditar = false;

async function cargarDatos() {
    setMensaje('Cargando datos...', 'cargando');
    try {
        const res = await fetch(`${BASE}/api/oficina`);
        if (!res.ok) throw new Error('Error ' + res.status);
        const datos = await res.json();
        renderTabla(datos);
        setMensaje('', '');
    } catch (e) {
        setMensaje('No se pudo conectar con el servidor.', 'err');
    }
}

function renderTabla(datos) {
    const tbody = document.getElementById('tbody');
    if (!datos.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="color:#888">Sin registros</td></tr>';
        return;
    }
    tbody.innerHTML = datos.map(o => `
        <tr data-id="${o.id}" onclick="seleccionar(this, ${o.id})">
            <td>${o.id}</td>
            <td>${o.nombre ?? ''}</td>
            <td>${o.descripcion ?? ''}</td>
            <td>${o.estado ?? ''}</td>
        </tr>
    `).join('');
}

function seleccionar(tr, id) {
    if (filaSeleccionada) filaSeleccionada.classList.remove('seleccionado');
    filaSeleccionada = tr;
    idSeleccionado = id;
    tr.classList.add('seleccionado');
    document.getElementById('btnEditar').disabled = false;
    document.getElementById('btnEliminar').disabled = false;
}

function deseleccionar() {
    if (filaSeleccionada) filaSeleccionada.classList.remove('seleccionado');
    filaSeleccionada = null;
    idSeleccionado = null;
    document.getElementById('btnEditar').disabled = true;
    document.getElementById('btnEliminar').disabled = true;
}

function abrirModalNuevo() {
    modoEditar = false;
    document.getElementById('modalTitulo').textContent = 'NUEVA OFICINA';
    document.getElementById('fNombre').value = '';
    document.getElementById('fDescripcion').value = '';
    document.getElementById('fEstado').value = 'ACTIVO';
    document.getElementById('modal').classList.add('activo');
}

async function abrirModalEditar() {
    if (!idSeleccionado) return;
    modoEditar = true;
    document.getElementById('modalTitulo').textContent = 'EDITAR OFICINA';
    try {
        const res = await fetch(`${BASE}/api/oficina/${idSeleccionado}`);  // ✅ corregido
        const o = await res.json();
        document.getElementById('fNombre').value = o.nombre ?? '';
        document.getElementById('fDescripcion').value = o.descripcion ?? '';
        document.getElementById('fEstado').value = o.estado ?? 'ACTIVO';
        document.getElementById('modal').classList.add('activo');
    } catch {
        setMensaje('No se pudo cargar el registro.', 'err');
    }
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('activo');
}

async function guardar() {
    const body = {
        nombre:      document.getElementById('fNombre').value.trim(),
        descripcion: document.getElementById('fDescripcion').value.trim(),
        estado:      document.getElementById('fEstado').value
    };
    if (!body.nombre) { alert('El nombre es obligatorio'); return; }

    const url    = modoEditar ? `${BASE}/api/oficina/${idSeleccionado}` : `${BASE}/api/oficina`;  // ✅ corregido
    const method = modoEditar ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error('Error ' + res.status);
        cerrarModal();
        deseleccionar();
        await cargarDatos();
        setMensaje(modoEditar ? 'Registro actualizado.' : 'Registro creado.', 'ok');
    } catch {
        setMensaje('Error al guardar. Revisá los datos.', 'err');
    }
}

async function eliminar() {
    if (!idSeleccionado) return;
    if (!confirm(`¿Eliminar la oficina con ID ${idSeleccionado}?`)) return;  // ✅ corregido
    try {
        const res = await fetch(`${BASE}/api/oficina/${idSeleccionado}`, { method: 'DELETE' });  // ✅ corregido
        if (!res.ok) throw new Error('Error ' + res.status);
        deseleccionar();
        await cargarDatos();
        setMensaje('Registro eliminado.', 'ok');
    } catch {
        setMensaje('No se pudo eliminar.', 'err');
    }
}

function setMensaje(texto, tipo) {
    const el = document.getElementById('mensaje');
    el.textContent = texto;
    el.className = 'mensaje ' + tipo;
}

document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) cerrarModal();
});

cargarDatos();