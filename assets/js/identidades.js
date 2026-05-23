
const BASE_URL = 'https://team-404-grupo-4-del-integrante-jhamel.onrender.com/api/organismos-fin';


function obtenerDatos() {
    return {
        id:              parseInt(document.getElementById('entidadId').value) || 0,
        gestion:         parseInt(document.getElementById('gestion').value)   || 0,
        codigoOrganismo: parseInt(document.getElementById('codigoOrganismo').value) || 0,
        descripcion:     document.getElementById('institucion').value.trim(),
        sigla:           document.getElementById('sigla').value.trim()
    };
}

function mostrarMensaje(texto, tipo = 'ok') {
    const el = document.getElementById('mensaje');
    if (!el) return;
    el.textContent = texto;
    el.className = 'mensaje ' + tipo;
    setTimeout(() => { el.textContent = ''; el.className = 'mensaje'; }, 5000);
}

function limpiarFormulario() {
    document.getElementById('entidadId').value       = '0';
    document.getElementById('gestion').value         = '';
    document.getElementById('sigla').value           = '';
    document.getElementById('institucion').value     = '';
    document.getElementById('codigoOrganismo').selectedIndex = 0;
    mostrarMensaje('', '');
}

async function getOrganismos() {
    try {
        const res = await fetch(BASE_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const lista = await res.json();
        mostrarMensaje(`Se obtuvieron ${lista.length} registros.`, 'ok');
        return lista;

    } catch (e) {
        mostrarMensaje('No se pudo conectar al servidor. ' + e.message, 'error');
        return [];
    }
}

async function getOrganismoPorId() {
    const id = document.getElementById('entidadId').value;

    if (!id || id === '0') {
        mostrarMensaje('⚠ Ingrese un ID válido para buscar.', 'warning');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.status === 404) {
            mostrarMensaje(`⚠ No existe un organismo con ID ${id}.`, 'warning');
            return;
        }
        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();

        document.getElementById('entidadId').value   = data.id;
        document.getElementById('gestion').value     = data.gestion;
        document.getElementById('sigla').value       = data.sigla;
        document.getElementById('institucion').value = data.descripcion;

        const sel = document.getElementById('codigoOrganismo');
        for (let opt of sel.options) {
            if (parseInt(opt.value) === data.codigoOrganismo) {
                opt.selected = true;
                break;
            }
        }

        mostrarMensaje(`Organismo ID ${data.id} cargado.`, 'ok');

    } catch (e) {
        mostrarMensaje('Error al buscar: ' + e.message, 'error');
    }
}

async function postOrganismo() {
    const datos = obtenerDatos();

    // Validaciones básicas
    if (!datos.gestion) {
        mostrarMensaje('⚠ Ingrese la Gestión.', 'warning'); return;
    }
    if (!datos.descripcion) {
        mostrarMensaje('⚠ Ingrese la Institución / Descripción.', 'warning'); return;
    }
    if (!datos.sigla) {
        mostrarMensaje('⚠ Ingrese la Sigla.', 'warning'); return;
    }

    const { id, ...datosPost } = datos;

    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPost)
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.status} — ${msg}`);
        }

        const creado = await res.json();
        document.getElementById('entidadId').value = creado.id;
        mostrarMensaje(`✔ Organismo creado con ID: ${creado.id}`, 'ok');

    } catch (e) {
        mostrarMensaje('✘ Error al guardar: ' + e.message, 'error');
    }
}

async function putOrganismo() {
    const id = document.getElementById('entidadId').value;

    if (!id || id === '0') {
        mostrarMensaje('⚠ Primero busque un registro (OK / Buscar) para editar.', 'warning');
        return;
    }

    const datos = obtenerDatos();

    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${res.status} — ${msg}`);
        }

        mostrarMensaje(`✔ Organismo ID ${id} actualizado correctamente.`, 'ok');

    } catch (e) {
        mostrarMensaje('✘ Error al actualizar: ' + e.message, 'error');
    }
}

async function deleteOrganismo() {
    const id = document.getElementById('entidadId').value;

    if (!id || id === '0') {
        mostrarMensaje('⚠ Ingrese un ID para eliminar.', 'warning');
        return;
    }

    const confirmar = confirm(`¿Está seguro de eliminar el organismo con ID ${id}?`);
    if (!confirmar) return;

    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.status === 404) {
            mostrarMensaje(`⚠ No existe un organismo con ID ${id}.`, 'warning');
            return;
        }
        if (!res.ok) throw new Error(`Error ${res.status}`);

        mostrarMensaje(`✔ Organismo ID ${id} eliminado.`, 'ok');
        limpiarFormulario();

    } catch (e) {
        mostrarMensaje('✘ Error al eliminar: ' + e.message, 'error');
    }
}