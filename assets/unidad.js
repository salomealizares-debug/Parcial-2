document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "https://team-404-grupo-4-del-integrante-jhamel.onrender.com/api/oficina";

   
    const inputId        = document.getElementById('inputId');
    const inputNombre    = document.getElementById('inputNombre');
    const txtDescripcion = document.getElementById('txtDescripcion');
    const inputEstado    = document.getElementById('inputEstado');

    const btnGrabar          = document.getElementById('btnGrabar');
    const btnActualizar      = document.getElementById('btnActualizar');
    const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
    const btnSalir           = document.getElementById('btnSalir');

    const cuerpoTabla = document.getElementById('cuerpoTabla');

    
    const popup            = document.getElementById('popup');
    const popupMensaje     = document.getElementById('popupMensaje');
    const btnCerrarPopup   = document.getElementById('btnCerrarPopup');
    const btnAceptarPopup  = document.getElementById('btnAceptarPopup');

    const popupEliminar        = document.getElementById('popupEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    const btnCancelarEliminar  = document.getElementById('btnCancelarEliminar');
    const btnCerrarEliminar    = document.getElementById('btnCerrarEliminar');

    let idAEliminar = null;

    
    function mostrarPopup(mensaje) {
        popupMensaje.textContent = mensaje;
        popup.classList.add('activo');
    }

    function cerrarPopup() {
        popup.classList.remove('activo');
        window.location.hash = '';
    }

    function mostrarPopupEliminar(id) {
        idAEliminar = id;
        popupEliminar.classList.add('activo');
    }

    function cerrarPopupEliminar() {
        idAEliminar = null;
        popupEliminar.classList.remove('activo');
        window.location.hash = '';
    }

    btnCerrarPopup.addEventListener('click',  cerrarPopup);
    btnAceptarPopup.addEventListener('click', (e) => { e.preventDefault(); cerrarPopup(); });
    btnCerrarEliminar.addEventListener('click',  cerrarPopupEliminar);
    btnCancelarEliminar.addEventListener('click', (e) => { e.preventDefault(); cerrarPopupEliminar(); });

   
    function limpiarFormulario() {
        inputId.value        = '';
        inputNombre.value    = '';
        txtDescripcion.value = '';
        inputEstado.value    = '';
        // Volver al modo CREAR
        btnGrabar.style.display          = 'inline-block';
        btnActualizar.style.display      = 'none';
        btnCancelarEdicion.style.display = 'none';
    }

    
    async function cargarTabla() {
        try {
            cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">Cargando...</td></tr>';

            const resp  = await fetch(API_URL, { headers: { 'Accept': 'application/json' } });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const lista = await resp.json();

            if (!lista.length) {
                cuerpoTabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">Sin registros</td></tr>';
                return;
            }

            cuerpoTabla.innerHTML = lista.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.nombre}</td>
                    <td>${item.descripcion}</td>
                    <td>${item.estado}</td>
                    <td>
                        <button class="btn-editar"   onclick="editarRegistro(${item.id}, '${escapar(item.nombre)}', '${escapar(item.descripcion)}', '${escapar(item.estado)}')">Editar</button>
                        <button class="btn-eliminar" onclick="confirmarEliminar(${item.id})">Eliminar</button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            cuerpoTabla.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error al cargar datos</td></tr>`;
            console.error("Error al cargar tabla:", error);
        }
    }

    function escapar(texto) {
        return String(texto).replace(/'/g, "\\'");
    }

    
    btnGrabar.addEventListener('click', async () => {
        if (!inputNombre.value.trim()) { alert("El nombre es obligatorio."); return; }

        const cuerpo = {
            nombre:      inputNombre.value.trim(),
            descripcion: txtDescripcion.value.trim(),
            estado:      inputEstado.value.trim()
        };

        try {
            btnGrabar.disabled   = true;
            btnGrabar.innerText  = "Guardando...";

            const resp = await fetch(API_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body:    JSON.stringify(cuerpo)
            });

            if (resp.ok) {
                limpiarFormulario();
                await cargarTabla();
                mostrarPopup("El registro fue creado correctamente.");
            } else {
                throw new Error(`HTTP ${resp.status}`);
            }

        } catch (error) {
            console.error("Error al grabar:", error);
            alert("No se pudo guardar. Intenta de nuevo.");
        } finally {
            btnGrabar.disabled  = false;
            btnGrabar.innerText = "Grabar";
        }
    });

   
    window.editarRegistro = function(id, nombre, descripcion, estado) {
        inputId.value        = id;
        inputNombre.value    = nombre;
        txtDescripcion.value = descripcion;
        inputEstado.value    = estado;

        
        btnGrabar.style.display          = 'none';
        btnActualizar.style.display      = 'inline-block';
        btnCancelarEdicion.style.display = 'inline-block';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    btnCancelarEdicion.addEventListener('click', limpiarFormulario);

    
    btnActualizar.addEventListener('click', async () => {
        const id = inputId.value;
        if (!id) { alert("No hay registro seleccionado."); return; }
        if (!inputNombre.value.trim()) { alert("El nombre es obligatorio."); return; }

        const cuerpo = {
            nombre:      inputNombre.value.trim(),
            descripcion: txtDescripcion.value.trim(),
            estado:      inputEstado.value.trim()
        };

        try {
            btnActualizar.disabled  = true;
            btnActualizar.innerText = "Actualizando...";

            const resp = await fetch(`${API_URL}/${id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body:    JSON.stringify(cuerpo)
            });

            if (resp.ok) {
                limpiarFormulario();
                await cargarTabla();
                mostrarPopup("El registro fue actualizado correctamente.");
            } else {
                throw new Error(`HTTP ${resp.status}`);
            }

        } catch (error) {
            console.error("Error al actualizar:", error);
            alert("No se pudo actualizar. Intenta de nuevo.");
        } finally {
            btnActualizar.disabled  = false;
            btnActualizar.innerText = "Actualizar";
        }
    });

   
    window.confirmarEliminar = function(id) {
        mostrarPopupEliminar(id);
    };

    btnConfirmarEliminar.addEventListener('click', async () => {
        if (!idAEliminar) return;

        try {
            btnConfirmarEliminar.disabled  = true;
            btnConfirmarEliminar.innerText = "Eliminando...";

            const resp = await fetch(`${API_URL}/${idAEliminar}`, { method: 'DELETE' });

            if (resp.ok) {
                cerrarPopupEliminar();
                await cargarTabla();
                mostrarPopup("El registro fue eliminado correctamente.");
            } else {
                throw new Error(`HTTP ${resp.status}`);
            }

        } catch (error) {
            console.error("Error al eliminar:", error);
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