/* =============================================
   Administración de Recursos
   script_ADM.js
   API: https://team-404-grupo-4-del-integrante-jhamel.onrender.com
   ============================================= */

const API = 'https://team-404-grupo-4-del-integrante-jhamel.onrender.com';

/* ─────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────── */

/** Obtiene el año del input */
function getGestion() {
  return document.getElementById('input-gestion').value.trim() || '2013';
}

/** Escribe HTML en la caja de resultados */
function setCaja(html) {
  document.querySelector('.caja').innerHTML = html;
}

/** Muestra "Cargando..." en la caja */
function cajaLoading() {
  setCaja('<p style="padding:8px;font-size:12px;color:#333;">⏳ Cargando...</p>');
}

/** Muestra un error en la caja */
function cajaError(msg) {
  setCaja('<p style="padding:8px;font-size:12px;color:red;">✘ ' + msg + '</p>');
}

/** Genera una tabla HTML simple a partir de un array de objetos */
function hacerTabla(datos, campos, cabeceras) {
  if (!datos || datos.length === 0) {
    return '<p style="padding:8px;font-size:12px;">Sin registros.</p>';
  }

  var html = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';

  // Cabecera
  html += '<thead><tr>';
  cabeceras.forEach(function (c) {
    html += '<th style="background:#2f5f85;color:#fff;padding:4px 6px;text-align:left;">' + c + '</th>';
  });
  html += '</tr></thead><tbody>';

  // Filas
  datos.forEach(function (fila, i) {
    var bg = i % 2 === 0 ? '#fff' : '#dbe7f0';
    html += '<tr style="background:' + bg + ';">';
    campos.forEach(function (campo) {
      var valor = fila[campo] !== undefined ? fila[campo] : '—';
      html += '<td style="padding:4px 6px;border-bottom:1px solid #ccc;">' + valor + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

/* ─────────────────────────────────────────────
   FETCH GENÉRICO
───────────────────────────────────────────── */

async function apiCall(endpoint, method, body) {
  method = method || 'GET';

  var opciones = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (body) {
    opciones.body = JSON.stringify(body);
  }

  var respuesta = await fetch(API + endpoint, opciones);

  if (!respuesta.ok) {
    throw new Error('Error ' + respuesta.status + ' al llamar ' + endpoint);
  }

  var texto = await respuesta.text();
  return texto ? JSON.parse(texto) : null;
}

/* ─────────────────────────────────────────────
   1. CERRAR GESTIÓN
   GET /api/estado  → muestra estados en la caja
───────────────────────────────────────────── */
async function cerrarGestion() {
  var gestion = getGestion();
  cajaLoading();

  try {
    var datos = await apiCall('/api/estado', 'GET');

    var tabla = hacerTabla(
      datos,
      ['id', 'descripcion'],
      ['ID', 'Estado']
    );

    setCaja(
      '<p style="padding:4px 8px;font-size:11px;color:#2f5f85;font-weight:bold;">Gestión: ' + gestion + '</p>' +
      tabla
    );

  } catch (e) {
    cajaError(e.message);
  }
}

/* ─────────────────────────────────────────────
   2. CAMBIAR GESTIÓN
   GET /api/estado  → misma consulta, distinto contexto
───────────────────────────────────────────── */
async function cambiarGestion() {
  var gestion = getGestion();
  cajaLoading();

  try {
    var datos = await apiCall('/api/estado', 'GET');

    var tabla = hacerTabla(
      datos,
      ['id', 'descripcion'],
      ['ID', 'Estado']
    );

    setCaja(
      '<p style="padding:4px 8px;font-size:11px;color:#2f5f85;font-weight:bold;">Cambiar a gestión: ' + gestion + '</p>' +
      tabla
    );

  } catch (e) {
    cajaError(e.message);
  }
}

/* ─────────────────────────────────────────────
   3. IMPORTAR / EXPORTAR
   GET /api/organismos-fin → lista organismos
───────────────────────────────────────────── */
async function importarExportar() {
  cajaLoading();

  try {
    var datos = await apiCall('/api/organismos-fin', 'GET');

    setCaja(hacerTabla(
      datos,
      ['id', 'descripcion', 'sigla'],
      ['ID', 'Organismo', 'Sigla']
    ));

  } catch (e) {
    cajaError(e.message);
  }
}

/* ─────────────────────────────────────────────
   4. ÍNDICES UFV
   GET /api/meses → lista meses con índices
───────────────────────────────────────────── */
async function indicesUFV() {
  cajaLoading();

  try {
    var datos = await apiCall('/api/meses', 'GET');

    setCaja(hacerTabla(
      datos,
      ['id', 'nombre', 'numero'],
      ['ID', 'Mes', 'Número']
    ));

  } catch (e) {
    cajaError(e.message);
  }
}

/* ─────────────────────────────────────────────
   5. SEGURIDAD
   GET /usuarios → lista usuarios del sistema
───────────────────────────────────────────── */
async function seguridad() {
  cajaLoading();

  try {
    var datos = await apiCall('/usuarios', 'GET');

    setCaja(hacerTabla(
      datos,
      ['id', 'nombre', 'email', 'rol'],
      ['ID', 'Nombre', 'Email', 'Rol']
    ));

  } catch (e) {
    cajaError(e.message);
  }
}

/* ─────────────────────────────────────────────
   6. RE-INDEXAR
   GET /api/tiposbaja → lista tipos de baja
───────────────────────────────────────────── */
async function reIndexar() {
  cajaLoading();

  try {
    var datos = await apiCall('/api/tiposbaja', 'GET');

    setCaja(hacerTabla(
      datos,
      ['id', 'descripcion'],
      ['ID', 'Tipo de Baja']
    ));

  } catch (e) {
    cajaError(e.message);
  }
}

/* ─────────────────────────────────────────────
   7. MIGRADOR
   El popup pregunta si es único usuario.
   → Sí: GET /api/oficina  (inicia migración)
   → No: cierra popup sin hacer nada
───────────────────────────────────────────── */
async function migrarSi() {
  // Cerrar popup
  window.location.hash = '';
  cajaLoading();

  try {
    var datos = await apiCall('/api/oficina', 'GET');

    setCaja(
      '<p style="padding:4px 8px;font-size:11px;color:green;font-weight:bold;">✔ Migración iniciada</p>' +
      hacerTabla(
        datos,
        ['id', 'nombre', 'descripcion'],
        ['ID', 'Oficina', 'Descripción']
      )
    );

  } catch (e) {
    cajaError(e.message);
  }
}

function migrarNo() {
  // Solo cierra el popup
  window.location.hash = '';
  setCaja('<p style="padding:8px;font-size:12px;color:red;">Migración cancelada.</p>');
}

/* ─────────────────────────────────────────────
   8. SALIR
───────────────────────────────────────────── */
function salir() {
  if (confirm('¿Desea salir del sistema?')) {
    setCaja('<p style="padding:8px;font-size:12px;">Sesión finalizada.</p>');
  }
}

/* ─────────────────────────────────────────────
   ASIGNAR EVENTOS AL CARGAR LA PÁGINA
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  var botones = document.querySelectorAll('.btn');

  // Los botones según el orden en que aparecen en el HTML
  // 0: Cerrar Gestión
  // 1: Cambiar Gestión
  // 2: Importar/Exportar
  // 3: Índices UFV
  // 4: Seguridad
  // 5: Re-indexar
  // 6: Migrador (es un <a>, se maneja aparte)

  if (botones[0]) botones[0].addEventListener('click', cerrarGestion);
  if (botones[1]) botones[1].addEventListener('click', cambiarGestion);
  if (botones[2]) botones[2].addEventListener('click', importarExportar);
  if (botones[3]) botones[3].addEventListener('click', indicesUFV);
  if (botones[4]) botones[4].addEventListener('click', seguridad);
  if (botones[5]) botones[5].addEventListener('click', reIndexar);

  // Botones del popup Migrador
  var btnSi = document.querySelector('.si');
  var btnNo = document.querySelector('.no');
  if (btnSi) btnSi.addEventListener('click', function (e) { e.preventDefault(); migrarSi(); });
  if (btnNo) btnNo.addEventListener('click', function (e) { e.preventDefault(); migrarNo(); });

  // Botón Salir
  var btnSalir = document.querySelector('.salir');
  if (btnSalir) btnSalir.addEventListener('click', salir);

  // Agregar id al input para poder leerlo
  var inputGestion = document.querySelector('.input');
  if (inputGestion) inputGestion.id = 'input-gestion';

});