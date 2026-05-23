document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com/api/oficina";
 
    
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    let filaSeleccionada = null;
    let idSeleccionado   = null;
 
    
    const btnNuevo    = document.getElementById('btnNuevo');
    const btnEditar   = document.getElementById('btnEditar');
    const btnEliminar = document.getElementById('btnEliminar');
    const btnSalir    = document.getElementById('btnSalir');
 
   
    const modalForm      = document.getElementById('modalForm');
    const modalTitulo    = document.getElementById('modalTitulo');
    const inputId        = document.getElementById('inputId');
    const inputNombre    = document.getElementById('inputNombre');
    const txtDescripcion = document.getElementById('txtDescripcion');
    const inputEstado    = document.getElementById('inputEstado');
    const btnGuardar     = document.getElementById('btnGuardar');
    const btnCancelar    = document.getElementById('btnCancelar');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
 
    
    const modalEliminar        = document.getElementById('modalEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    const btnCancelarEliminar  = document.getElementById('btnCancelarEliminar');
    const btnCerrarEliminar    = document.getElementById('btnCerrarEliminar');
 
    
    const modalExito     = document.getElementById('modalExito');
    const mensajeExito   = document.getElementById('mensajeExito');
    const btnAceptarExito = document.getElementById('btnAceptarExito');
    const btnCerrarExito  = document.getElementById('btnCerrarExito');
 
   
    function abrirModal(modal)  { modal.classList.add('activo'); }
    function cerrarModal(modal) { modal.classList.remove('activo'); }
 
    function mostrarExito(msg) {
        mensajeExito.textContent = msg;
        abrirModal(modalExito);
    }
 
    btnAceptarExito.addEventListener('click', () => cerrarModal(modalExito));
    btnCerrarExito.addEventListener('click',  () => cerrarModal(modalExito));
 
    
    async function cargarTabla() {
        filaSeleccionada = null;
        idSeleccionado   = null;
 
        try {
            cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando...</td></tr>';
 
            const resp = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
 
            const lista = await resp.json();
 
            if (!lista.length) {
                cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">Sin registros</td></tr>';
                return;
            }
 
            cuerpoTabla.innerHTML = lista.map(item => `
                <tr data-id="${item.id}"
                    data-nombre="${escapar(item.nombre)}"
                    data-descripcion="${escapar(item.descripcion)}"
                    data-estado="${escapar(item.estado)}">
                    <td>${item.id}</td>
                    <td>${item.nombre}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.estado}</td>
                </tr>
            `).join('');
 
            
            cuerpoTabla.querySelectorAll('tr').forEach(fila => {
                fila.addEventListener('click', () => {
                    if (filaSeleccionada) filaSeleccionada.classList.remove('seleccionado');
                    filaSeleccionada = fila;
                    idSeleccionado   = fila.dataset.id;
                    fila.classList.add('seleccionado');
                });
 
                // Doble click → editar directamente
                fila.addEventListener('dblclick', () => {
                    filaSeleccionada = fila;
                    idSeleccionado   = fila.dataset.id;
                    abrirFormEditar();
                });
            });
 
        } catch (error) {
            cuerpoTabla.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Error al cargar datos</td></tr>';
            console.error("Error cargarTabla:", error);
        }
    }
 
    function escapar(txt) { return String(txt ?? '').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
 
    
    btnNuevo.addEventListener('click', () => {
        modalTitulo.textContent = 'NUEVA OFICINA';
        inputId.value        = '';
        inputNombre.value    = '';
        txtDescripcion.value = '';
        inputEstado.value    = '';
        abrirModal(modalForm);
        inputNombre.focus();
    });
 
   
    function abrirFormEditar() {
        if (!idSeleccionado) { alert("Seleccione un registro de la tabla."); return; }
        const fila = filaSeleccionada;
        modalTitulo.textContent = 'EDITAR OFICINA';
        inputId.value        = fila.dataset.id;
        inputNombre.value    = fila.dataset.nombre;
        txtDescripcion.value = fila.dataset.descripcion;
        inputEstado.value    = fila.dataset.estado;
        abrirModal(modalForm);
        inputNombre.focus();
    }
 
    btnEditar.addEventListener('click', abrirFormEditar);
 
    btnCerrarModal.addEventListener('click', () => cerrarModal(modalForm));
    btnCancelar.addEventListener('click',    () => cerrarModal(modalForm));
 
    
    btnGuardar.addEventListener('click', async () => {
        if (!inputNombre.value.trim()) { alert("El nombre es obligatorio."); return; }
 
        const esEdicion = !!inputId.value;
        const cuerpo = {
            nombre:      inputNombre.value.trim(),
            descripcion: txtDescripcion.value.trim(),
            estado:      inputEstado.value.trim()
        };
 
        const url    = esEdicion ? `${API_URL}/${inputId.value}` : API_URL;
        const metodo = esEdicion ? 'PUT' : 'POST';
 
        try {
            btnGuardar.disabled  = true;
            btnGuardar.innerText = "Guardando...";
 
            const resp = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(cuerpo)
            });
 
            if (resp.ok) {
                cerrarModal(modalForm);
                await cargarTabla();
                mostrarExito(esEdicion
                    ? "Registro actualizado correctamente."
                    : "Registro creado correctamente.");
            } else {
                throw new Error(`HTTP ${resp.status}`);
            }
 
        } catch (error) {
            console.error("Error guardar:", error);
            alert("No se pudo guardar. Intenta de nuevo.");
        } finally {
            btnGuardar.disabled  = false;
            btnGuardar.innerText = "Guardar";
        }
    });
 
   
    btnEliminar.addEventListener('click', () => {
        if (!idSeleccionado) { alert("Seleccione un registro de la tabla."); return; }
        abrirModal(modalEliminar);
    });
 
    btnCerrarEliminar.addEventListener('click',  () => cerrarModal(modalEliminar));
    btnCancelarEliminar.addEventListener('click', () => cerrarModal(modalEliminar));
 
    btnConfirmarEliminar.addEventListener('click', async () => {
        try {
            btnConfirmarEliminar.disabled  = true;
            btnConfirmarEliminar.innerText = "Eliminando...";
 
            const resp = await fetch(`${API_URL}/${idSeleccionado}`, { method: 'DELETE' });
 
            if (resp.ok) {
                cerrarModal(modalEliminar);
                await cargarTabla();
                mostrarExito("Registro eliminado correctamente.");
            } else {
                throw new Error(`HTTP ${resp.status}`);
            }
 
        } catch (error) {
            console.error("Error eliminar:", error);
            alert("No se pudo eliminar. Intenta de nuevo.");
        } finally {
            btnConfirmarEliminar.disabled  = false;
            btnConfirmarEliminar.innerText = "Sí, eliminar";
        }
    });
 
    
    btnSalir.addEventListener('click', () => {
        if (confirm("¿Está seguro de que desea salir?")) {
            window.history.back();
        }
    });
 
    
    cargarTabla();
});