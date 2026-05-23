const BASE_URL = 'https://team-404-grupo-4-del-integrante-jhamel.onrender.com';
let usuarioActual = null;


function mostrarMensaje(texto, tipo) {
    const el = document.getElementById('mensaje');
    el.textContent = texto;
    el.className = `mensaje ${tipo}`;
    if (tipo !== 'cargando') {
        setTimeout(() => { el.className = 'mensaje'; }, 4000);
    }
}

async function cargarListaUsuarios() {
    try {
        const res = await fetch(`${BASE_URL}/usuarios`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const usuarios = await res.json();

        const select = document.getElementById('nuevoResponsable');
        select.innerHTML = '<option value="">-- Seleccione un usuario --</option>';
        usuarios.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.textContent = `${u.id} - ${u.nombre}`;
            select.appendChild(opt);
        });

        const tbody = document.getElementById('tablaUsuarios');
        if (usuarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="tabla-vacia">No hay usuarios registrados.</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        usuarios.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${u.id}</td><td>${u.nombre}</td><td>${u.correo}</td>`;
            tr.addEventListener('click', () => seleccionarDesdeTabla(u, tr));
            tbody.appendChild(tr);
        });

    } catch (err) {
        mostrarMensaje('No se pudo cargar la lista: ' + err.message, 'error');
        document.getElementById('tablaUsuarios').innerHTML =
            '<tr><td colspan="3" class="tabla-vacia">Error al cargar usuarios.</td></tr>';
    }
}
 
function seleccionarDesdeTabla(u, fila) {
    document.querySelectorAll('#tablaUsuarios tr').forEach(tr => tr.classList.remove('seleccionado'));
    fila.classList.add('seleccionado');

    usuarioActual = u;
    document.getElementById('usuarioIdInput').value = u.id;
    document.getElementById('nombreActual').value   = u.nombre;
    document.getElementById('correoActual').value   = u.correo;
    document.getElementById('nuevoNombre').value    = u.nombre;
    document.getElementById('nuevoCorreo').value    = u.correo;

    mostrarMensaje(`Usuario "${u.nombre}" seleccionado.`, 'exito');
}

async function cargarUsuario() {
    const id = document.getElementById('usuarioIdInput').value.trim();
    if (!id) { mostrarMensaje('Ingrese un ID de usuario.', 'error'); return; }

    mostrarMensaje('Cargando usuario...', 'cargando');
    try {
        const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
        });
        if (!res.ok) throw new Error(`Usuario no encontrado (${res.status})`);
        const u = await res.json();
        usuarioActual = u;

        document.getElementById('nombreActual').value = u.nombre;
        document.getElementById('correoActual').value = u.correo;
        document.getElementById('nuevoNombre').value  = u.nombre;
        document.getElementById('nuevoCorreo').value  = u.correo;

        document.querySelectorAll('#tablaUsuarios tr').forEach(tr => {
            tr.classList.remove('seleccionado');
            if (tr.children[0] && tr.children[0].textContent == id) {
                tr.classList.add('seleccionado');
            }
        });

        mostrarMensaje('Usuario cargado correctamente.', 'exito');
    } catch (err) {
        mostrarMensaje('Error al cargar usuario: ' + err.message, 'error');
    }
}

async function actualizarUsuario() {
    if (!usuarioActual) { mostrarMensaje('Primero busque o seleccione un usuario.', 'error'); return; }

    const nuevoNombre = document.getElementById('nuevoNombre').value.trim();
    const nuevoCorreo = document.getElementById('nuevoCorreo').value.trim();
    if (!nuevoNombre || !nuevoCorreo) {
        mostrarMensaje('El nombre y el correo son obligatorios.', 'error'); return;
    }

    mostrarMensaje('Guardando transferencia...', 'cargando');
    const body = { id: usuarioActual.id, nombre: nuevoNombre, correo: nuevoCorreo };

    try {
        const res = await fetch(`${BASE_URL}/usuarios/${usuarioActual.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`${res.status} - ${await res.text()}`);

        mostrarMensaje('Transferencia realizada con éxito.', 'exito');
        limpiarTodo();
        cargarListaUsuarios();
    } catch (err) {
        mostrarMensaje('Error al actualizar: ' + err.message, 'error');
    }
}

async function eliminarUsuario() {
    const id = document.getElementById('usuarioIdInput').value.trim();
    if (!id) { mostrarMensaje('Ingrese o seleccione un ID para eliminar.', 'error'); return; }
    if (!confirm(`¿Seguro que desea eliminar al usuario con ID ${id}?`)) return;

    mostrarMensaje('Eliminando usuario...', 'cargando');
    try {
        const res = await fetch(`${BASE_URL}/usuarios/${id}`, {
            method: 'DELETE',
            mode: 'cors'
        });
        if (!res.ok) throw new Error(`${res.status} - ${await res.text()}`);

        mostrarMensaje(`Usuario ${id} eliminado correctamente.`, 'exito');
        limpiarTodo();
        cargarListaUsuarios();
    } catch (err) {
        mostrarMensaje('Error al eliminar: ' + err.message, 'error');
    }
}


async function crearUsuario() {
    const nombre = document.getElementById('nuevoNombre').value.trim();
    const correo = document.getElementById('nuevoCorreo').value.trim();
    if (!nombre || !correo) {
        mostrarMensaje('Nombre y correo son obligatorios para crear.', 'error'); return;
    }

    mostrarMensaje('Creando usuario...', 'cargando');
    try {
        const res = await fetch(`${BASE_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            mode: 'cors',
            body: JSON.stringify({ nombre, correo }),
        });
        if (!res.ok) throw new Error(`${res.status} - ${await res.text()}`);

        const creado = await res.json();
        mostrarMensaje(`Usuario creado con ID ${creado.id}.`, 'exito');
        limpiarTodo();
        cargarListaUsuarios();
    } catch (err) {
        mostrarMensaje('Error al crear usuario: ' + err.message, 'error');
    }
}


function limpiarTodo() {
    document.getElementById('usuarioIdInput').value = '';
    ['nombreActual','correoActual','nuevoNombre','nuevoCorreo'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('nuevoResponsable').value = '';
    document.querySelectorAll('#tablaUsuarios tr').forEach(tr => tr.classList.remove('seleccionado'));
    usuarioActual = null;
}

function cancelar() {
    limpiarTodo();
    mostrarMensaje('Operación cancelada.', 'cargando');
}


window.addEventListener('DOMContentLoaded', cargarListaUsuarios);