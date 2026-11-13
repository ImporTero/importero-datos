/* ImporTero — extras de la home que se actualizan sin deploy de Netlify.
   Se publica dentro de importero.js (extras.js + calculadora.js), servido por jsDelivr.
   - Botón "Guías y base →" en el encabezado.
   - "Ver guía completa →" dentro de cada ficha de producto del buscador.
*/
(function () {
  var DATOS = 'https://raw.githubusercontent.com/ImporTero/importero-datos/main/productos.json';

  var st = document.createElement('style');
  st.textContent =
    '.it-base{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border:1px solid var(--green,#1C592E);border-radius:4px;' +
    'color:var(--green,#1C592E);font-weight:600;font-size:14px;text-decoration:none;white-space:nowrap;background:var(--surface,#fff)}' +
    '.it-base:hover{background:var(--green,#1C592E);color:#fff}' +
    '@media (max-width:520px){.it-base{padding:6px 10px;font-size:13px}}' +
    '.it-guia{display:inline-block;margin:6px 0 4px;font-weight:600;color:var(--green,#1C592E);text-decoration:none;border-bottom:1px solid currentColor}';
  document.head.appendChild(st);

  // 1) Botón en el encabezado
  var bar = document.querySelector('header .topbar') || document.querySelector('header');
  if (bar && !document.querySelector('.it-base')) {
    if (getComputedStyle(bar).display !== 'flex') { bar.style.display = 'flex'; bar.style.alignItems = 'center'; }
    var a = document.createElement('a');
    a.className = 'it-base'; a.href = '/base'; a.innerHTML = 'Guías y base <span aria-hidden="true">→</span>';
    bar.appendChild(a);
  }

  // 1b) Búsqueda desde un link (/?q=...): lo usan las páginas de posiciones y productos
  try {
    var q0 = new URLSearchParams(location.search).get('q'), qi = document.getElementById('ncm-q');
    if (q0 && qi) setTimeout(function () { qi.value = q0; qi.dispatchEvent(new Event('focus')); qi.dispatchEvent(new Event('input', { bubbles: true })); }, 300);
  } catch (err) {}

  // 2) Todas las posiciones del nomenclador: ficha básica al tocar cada una + búsqueda aproximada si no hay resultados
  var ncmRes = document.getElementById('ncm-res'), ncmQ = document.getElementById('ncm-q');
  var VER = 'Arancel Integrado de ARCA, datos al 29/09/2026';
  var st2 = document.createElement('style');
  st2.textContent =
    '#ncm-res .ncm-row{cursor:pointer}#ncm-res .ncm-row:hover .ncm-code{text-decoration:underline}' +
    '#ncm-res .it-ver{font-size:12px;color:var(--green,#1C592E);font-weight:600;margin-top:4px}' +
    '#ncm-res .it-mf{grid-column:1/-1;border:1px solid var(--line,#DCD4C7);background:var(--surface,#fff);border-radius:6px;padding:14px 16px;margin-top:6px;font-size:13.5px;line-height:1.55;cursor:default}' +
    '#ncm-res .it-mf dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0 0 10px}#ncm-res .it-mf dt{color:var(--ink-faint,#8B7E6F)}#ncm-res .it-mf dd{margin:0;font-weight:600}' +
    '#ncm-res .it-mf .bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}' +
    '#ncm-res .it-mf .bt a,#ncm-res .it-mf .bt button{font:inherit;font-size:13px;font-weight:600;padding:7px 11px;border-radius:4px;border:1px solid var(--green,#1C592E);color:var(--green,#1C592E);background:#fff;text-decoration:none;cursor:pointer}' +
    '#ncm-res .it-mf .bt .pri{background:var(--green,#1C592E);color:#fff}' +
    '#ncm-res .it-mf .warn{font-size:12.5px;color:var(--amber,#8A6212);background:var(--amber-soft,#F2E8D2);border-radius:4px;padding:8px 10px}' +
    '#ncm-res .it-aprox{font-size:13px;color:var(--ink-soft,#5C4E40);padding:12px 0 4px}';
  document.head.appendChild(st2);
  var pedidos = {};
  // Búsqueda aproximada propia: palabras de la calle → términos de la nomenclatura, y coincidencia por raíz
  var CALLE = {
    zapatilla: 'calzado', zapatillas: 'calzado', zapato: 'calzado', zapatos: 'calzado', botas: 'calzado', ojotas: 'calzado', sandalias: 'calzado',
    celular: 'telefonos', celulares: 'telefonos', smartphone: 'telefonos', notebook: 'portatiles', laptop: 'portatiles', tablet: 'portatiles',
    auriculares: 'auriculares', parlante: 'altavoces', parlantes: 'altavoces', tele: 'televisión', televisor: 'televisión',
    heladera: 'refrigeradores', freezer: 'congeladores', lavarropas: 'lavar ropa', microondas: 'microondas', licuadora: 'licuadoras', cafetera: 'café',
    remera: 'camisetas', remeras: 'camisetas', buzo: 'suéteres', campera: 'abrigos', jean: 'pantalones', jeans: 'pantalones', medias: 'calcetines',
    mochila: 'mochilas', cartera: 'bolsos', valija: 'baúles', anteojos: 'gafas', lentes: 'gafas', bici: 'bicicletas', moto: 'motocicletas',
    neumatico: 'neumáticos', cubierta: 'neumáticos', cubiertas: 'neumáticos', repuesto: 'partes', repuestos: 'partes', autopartes: 'partes vehículos',
    juguete: 'juguetes', muneca: 'muñecas', peluche: 'juguetes', pileta: 'piscinas', silla: 'asientos', sillon: 'asientos', colchon: 'colchones',
    vela: 'velas', perfume: 'perfumes', crema: 'belleza', maquillaje: 'maquillaje', shampoo: 'champúes', suplemento: 'preparaciones alimenticias',
    yerba: 'yerba mate', vino: 'vino', cerveza: 'cerveza', gaseosa: 'agua', golosinas: 'confitería', chocolate: 'chocolate', galletitas: 'galletas',
    herramienta: 'herramientas', taladro: 'taladros', amoladora: 'amoladoras', drone: 'aeronaves', dron: 'aeronaves', impresora: 'impresoras',
    cable: 'cables', cargador: 'cargadores', bateria: 'acumuladores', pila: 'pilas', foco: 'lámparas', lampara: 'lámparas', led: 'diodos emisores',
    mascota: 'perros gatos', perro: 'perros', gato: 'gatos', alimento: 'alimentos', balanceado: 'alimentos animales'
  };
  var NCM = null, ncmCargando = [];
  function cargarNcm(cb) {
    if (NCM) return cb(); ncmCargando.push(cb); if (ncmCargando.length > 1) return;
    fetch('/ncm.json').then(function (r) { return r.json(); }).then(function (j) {
      NCM = j.r.filter(function (f) { return f[1] && f[0].slice(0, 2) !== '00'; }).map(function (f) {
        var pa = (j.par || {})[f[0].slice(0, 4)] || '';
        return { code: f[0], desc: f[1], padre: pa, aec: f[2], ini: norm(pa || f[1]).replace(/[^a-z0-9ñ ]/g, ' ').trim(),
          txt: ' ' + norm(pa + ' ' + f[1] + ' ' + (f[5] || '')).replace(/[^a-z0-9ñ ]/g, ' ') };
      });
      ncmCargando.splice(0).forEach(function (c) { c(); });
    }).catch(function () { NCM = []; ncmCargando.splice(0).forEach(function (c) { c(); }); });
  }
  function aproximar(q, max) {
    if (!NCM) return [];
    var STOP = { de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, para: 1, con: 1, sin: 1, en: 1, y: 1, o: 1, un: 1, una: 1, por: 1, mujer: 1, hombre: 1, nino: 1, nina: 1 };
    var ts = [];
    norm(q).split(/\s+/).forEach(function (t) { if (t.length < 3 || STOP[t]) return; (CALLE[t] ? norm(CALLE[t]).split(' ') : [t]).forEach(function (x) { if (x.length > 2) ts.push(x); }); });
    if (!ts.length) return [];
    var out = [];
    NCM.forEach(function (f) {
      var s = 0;
      ts.forEach(function (t) {
        var raiz = t.length > 5 ? t.slice(0, t.length - 2) : t;
        if (f.txt.indexOf(' ' + t) >= 0) s += 3; else if (f.txt.indexOf(' ' + raiz) >= 0) s += 2; else return;
        if (f.ini.indexOf(raiz) === 0) s += 3;            // la partida "es" eso (Calzado…, Teléfonos…)
        else if (f.ini.slice(0, 60).indexOf(' ' + raiz) >= 0) s += 1;
      });
      if (s > 0) out.push({ code: f.code, desc: f.desc, padre: f.padre, aec: f.aec, s: s - (/^(los|las) demas/.test(norm(f.desc)) ? 0.5 : 0) });
    });
    out.sort(function (a, b) { return b.s - a.s || (a.code < b.code ? -1 : 1); });
    var top = out.length ? out[0].s : 0;
    return out.filter(function (x) { return x.s >= top - 1; }).slice(0, max);
  }
  function fmt(code) { code = code.replace(/\./g, ''); return code.slice(0, 4) + '.' + code.slice(4, 6) + '.' + code.slice(6); }
  function pct(x) { return String(x).replace('.', ',') + '%'; }
  function fichaNcm(code, desc, aec) {
    var vuce = 'https://www.vuce.gob.ar/busquedaPosicion?posicion=' + fmt(code) + '&operacion=importacion&pais=';
    var vuceE = vuce.replace('importacion', 'exportacion');
    return '<div class="it-mf" data-code="' + code + '"><div class="it-sims">Cargando derechos y reintegros…</div>' +
      '<dl><dt>Tasa de estadística</dt><dd>3% con tope (no paga si es de origen Mercosur)</dd>' +
      '<dt>IVA</dt><dd>21% o 10,5% según el producto, más percepciones</dd></dl>' +
      '<div class="warn">Derechos y reintegros: Arancel Integrado de ARCA, archivo del 09/11/2026. Esta posición todavía no la analizamos en detalle: los trámites e intervenciones (SENASA, ANMAT, seguridad eléctrica, etc.) los ves en VUCE, y la posición confirmala con tu despachante.</div>' +
      (window.__op === 'exportacion'
        ? '<div class="bt"><button type="button" class="pri" data-calc="' + code + '" data-aec="' + aec + '" data-op="expo">Calcular exportación</button>' +
          '<button type="button" data-calc="' + code + '" data-aec="' + aec + '">Calcular importación</button>'
        : '<div class="bt"><button type="button" class="pri" data-calc="' + code + '" data-aec="' + aec + '">Calcular importación</button>' +
          '<button type="button" data-calc="' + code + '" data-aec="' + aec + '" data-op="expo">Calcular exportación</button>') +
      '<a href="' + vuce + '" target="_blank" rel="noopener">VUCE importar</a>' +
      '<a href="' + vuceE + '" target="_blank" rel="noopener">VUCE exportar</a>' +
      '<button type="button" data-pedir="' + code + '">' + (pedidos[code] ? 'Pedido ✓' : 'Pedir que la analicemos') + '</button></div></div>';
  }
  function llenarSims(box, code) {
    var A = window.ImporteroArancel, k = fmt(code);
    if (!A) { box.textContent = ''; return; }
    A.cargarCap(k.slice(0, 2), function (d) {
      var e = d && d[k];
      if (!e || !e.s.length) { box.innerHTML = '<p style="margin:0 0 8px">No encontramos esta posición en el Arancel Integrado.</p>'; return; }
      var mer = e.s.some(function (x) { return x[4] > 0; });
      box.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:10px"><thead><tr style="text-align:left;color:var(--ink-faint,#8B7E6F);font-size:11px;text-transform:uppercase;letter-spacing:.04em">' +
        '<th style="padding:4px 6px 4px 0">SIM</th><th style="padding:4px 6px">Detalle</th><th style="padding:4px 6px;text-align:right">Derecho impo</th><th style="padding:4px 6px;text-align:right">Derecho expo</th><th style="padding:4px 0 4px 6px;text-align:right">Reintegro</th>' +
        (mer ? '<th style="padding:4px 0 4px 6px;text-align:right">Mercosur</th>' : '') + '</tr></thead><tbody>' +
        e.s.map(function (x) {
          return '<tr style="border-top:1px solid var(--line,#DCD4C7)"><td style="padding:5px 6px 5px 0;font-family:IBM Plex Mono,monospace;white-space:nowrap">' + x[0] + '</td><td style="padding:5px 6px">' + x[5].replace(/[<>]/g, '') + '</td>' +
            '<td style="padding:5px 6px;text-align:right;font-weight:600">' + pct(x[1]) + '</td><td style="padding:5px 6px;text-align:right">' + pct(x[2]) + '</td><td style="padding:5px 0 5px 6px;text-align:right">' + pct(x[3]) + '</td>' +
            (mer ? '<td style="padding:5px 0 5px 6px;text-align:right">' + pct(x[4]) + '</td>' : '') + '</tr>';
        }).join('') + '</tbody></table>';
    });
  }
  if (ncmRes) {
    ncmRes.addEventListener('click', function (e) {
      var calcB = e.target.closest('[data-calc]'), pedirB = e.target.closest('[data-pedir]');
      if (calcB) {
        e.stopPropagation();
        if (window.ImporteroCalc) {
          var pi = document.getElementById('ic-prod'), dd = calcB.closest('.ncm-row') && calcB.closest('.ncm-row').querySelector('.ncm-desc');
          if (pi && dd) pi.value = dd.textContent.slice(0, 80);
          window.ImporteroCalc.usarNcm(calcB.getAttribute('data-calc'), parseFloat(calcB.getAttribute('data-aec')), calcB.getAttribute('data-op'));
          window.ImporteroCalc.ir();
        }
        return;
      }
      if (pedirB) {
        e.stopPropagation();
        var c = pedirB.getAttribute('data-pedir'); if (pedidos[c]) return; pedidos[c] = 1;
        var row = pedirB.closest('.ncm-row'), d = row && row.querySelector('.ncm-desc');
        var datos = new URLSearchParams({ tipo: 'busqueda', producto: 'NCM ' + fmt(c) + ' — ' + ((d && d.textContent) || '').slice(0, 120) + ' (búsqueda: ' + (ncmQ ? ncmQ.value : '') + ')', email: '', pagina: location.pathname });
        fetch('https://script.google.com/macros/s/AKfycby1H6sXGh0uRpU85F8n5EMxHO5GP-UAPsUII2fOiRAolYgc1VxHdQdopj3cAnw7E4PItw/exec', { method: 'POST', mode: 'no-cors', body: datos }).catch(function () {});
        pedirB.textContent = 'Pedido ✓';
        return;
      }
      if (e.target.closest('.it-mf')) return;
      var r = e.target.closest('.ncm-row'); if (!r) return;
      var open = r.querySelector('.it-mf');
      if (open) { open.remove(); return; }
      var code = ((r.querySelector('.ncm-code') || {}).textContent || '').trim();
      var aec = parseFloat(((r.querySelector('.ncm-aec') || {}).textContent || '').replace(',', '.'));
      if (!code || isNaN(aec)) return;
      r.insertAdjacentHTML('beforeend', fichaNcm(code.replace(/\./g, ''), '', aec));
      llenarSims(r.querySelector('.it-sims'), code);
    });
    var aprox = false;
    new MutationObserver(function () {
      // marcar filas como abribles
      [].forEach.call(ncmRes.querySelectorAll('.ncm-row'), function (r) {
        var d = r.querySelector('.ncm-desc');
        if (d && !r.querySelector('.it-ver')) d.insertAdjacentHTML('afterend', '<div class="it-ver">Ver ficha ▸</div>');
      });
      // sin resultados: búsqueda aproximada por coincidencia parcial
      var vacio = ncmRes.querySelector('.ncm-st');
      if (vacio && /Sin resultados/.test(vacio.textContent) && !aprox && ncmQ) {
        var q0 = ncmQ.value;
        cargarNcm(function () {
        if (ncmQ.value !== q0) return;
        var s = (window.__ncm && window.__ncm.sugerir ? window.__ncm.sugerir(q0, 10) : []);
        if (!s.length) s = aproximar(q0, 10);
        if (s.length) {
          aprox = true;
          ncmRes.innerHTML = '<div class="it-aprox">No hay una posición que diga exactamente eso. Estas son las más parecidas (revisalas, en la nomenclatura las cosas se llaman distinto):</div>' +
            s.map(function (f) {
              return '<div class="ncm-row"><div><div class="ncm-code">' + fmt(f.code) + '</div><div class="ncm-desc">' +
                ((f.padre ? f.padre + ' › ' : '') + f.desc).replace(/[<>]/g, '') + '</div></div><div class="ncm-aec">' + String(f.aec).replace('.', ',') + '%<small>arancel</small></div></div>';
            }).join('');
          aprox = false;
        }
        });
      }
    }).observe(ncmRes, { childList: true });
  }

  // 3) Link a la guía dentro de cada ficha de producto
  var caja = document.getElementById('prod-res');
  if (!caja) return;
  var porNombre = null;
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }
  fetch(DATOS).then(function (r) { return r.json(); }).then(function (d) {
    porNombre = {};
    (d.productos || []).forEach(function (p) { porNombre[norm(p.producto)] = p; porNombre['#' + p.id] = p; });
    decorar();
  }).catch(function () {});
  function decorar() {
    if (!porNombre) return;
    [].forEach.call(caja.querySelectorAll('details.pf'), function (f) {
      if (f.querySelector('.it-guia')) return;
      var t = f.querySelector('.pf-t'), b = f.querySelector('.pf-b');
      var p = (f.dataset.id && porNombre['#' + f.dataset.id]) || (t && porNombre[norm(t.textContent)]);
      if (!p || !b) return;
      var g = (p.guias || [])[0];
      var link = document.createElement('a');
      link.className = 'it-guia';
      link.href = g ? '/base#guia=' + encodeURIComponent(g) : '/base#producto=' + encodeURIComponent(p.id);
      link.textContent = g ? 'Ver guía completa: todos los pasos y trámites →' : 'Ver en la base →';
      b.insertBefore(link, b.firstChild);
    });
  }
  new MutationObserver(decorar).observe(caja, { childList: true, subtree: true });
})();
/* ImporTero — calculadora de costo (importación) y de cobro neto (exportación). Aproximado.
   Se carga desde jsDelivr (repo público importero-datos): cambiarla NO requiere deploy de Netlify.
   Se monta en <div id="importero-calc"></div>, debajo del buscador. Se completa sola con lo que
   la persona escribe en el buscador (#ncm-q) o en su propio campo de producto.

   ALÍCUOTAS — actualizar ACÁ y solo acá, con su fuente y fecha de verificación.
*/
(function () {
  var T = {
    verificado: '2026-11-09',
    tasaEst: { pct: 3, topes: [[10000, 180], [100000, 3000], [1000000, 30000], [Infinity, 150000]],
      fuente: 'Decreto 1140/2024 (vigente hasta 31/12/2027). Exenta: origen Mercosur.' },
    percIva: { general: 20, reducida: 10, fuente: 'RG AFIP 2937/2010, art. 7 (texto según RG 4461/2019). Consumo particular de personas humanas: exceptuado.' },
    percGan: { general: 6, consumo: 11, fuente: 'RG AFIP 2281/2007, art. 5 (texto según RG 4579/2019). Bienes de uso: exceptuados (art. 3).' }
  };
  var DATOS = 'https://raw.githubusercontent.com/ImporTero/importero-datos/main/productos.json';

  var root = document.getElementById('importero-calc');
  if (!root) return;

  /* Gastos en Argentina: valores de REFERENCIA (no oficiales) de una cotización real de despachante,
     noviembre de 2026, para 5 cajas (0,12 m³, 90 kg) desde China en LCL. Editables por la persona. */
  var REF = { fecha: 'noviembre de 2026', flete: 200, seguro: 0.5, iibb: 3, gastos: [
    ['desp', 'Honorarios del despachante', 250],
    ['dep', 'Depósito fiscal', 250],
    ['term', 'Terminal y puerto', 200],
    ['ag', 'Agente de carga (documentos y desconsolidación)', 200],
    ['op', 'Gastos operativos del despachante', 120],
    ['banco', 'Banco (transferencia al exterior)', 200],
    ['sim', 'Arancel SIM, guarda y digitalización', 38],
    ['fi', 'Flete hasta tu depósito', 0]
  ] };

  /* Glosario: qué es cada cosa y de dónde sacar el número */
  var G = {
    cant: ['Cantidad', 'Las unidades del pedido. Sirve para ver cuánto te cuesta cada una y compararlo con el precio al que la vas a vender.', 'De la cotización del proveedor (el pedido mínimo suele estar ahí).'],
    pu: ['Precio por unidad (FOB)', 'El precio de cada unidad con la mercadería cargada en el barco, en el puerto de salida: eso quiere decir FOB, “libre a bordo”. Si importás, es lo que le pagás al proveedor; si exportás, lo que te paga el comprador.', 'Si importás, de la cotización del proveedor (si te cotiza EXW, en fábrica, el traslado hasta el puerto ponelo en “Gastos en origen”). Si exportás, tu precio de venta.'],
    orig: ['Gastos en origen', 'Lo que pagás aparte antes de que la carga salga del país de origen: traslado al puerto, inspección, documentos. Se suman al valor en aduana, así que también pagan impuestos.', 'Del proveedor o de tu agente de carga.'],
    flete: ['Flete internacional', 'El transporte hasta Argentina. En pedidos chicos la carga viaja “LCL”: comparte contenedor con otras y se cobra por volumen (m³) o por peso.', 'Pedile cotización a un agente de carga (forwarder) con las medidas y el peso de las cajas. Referencia: USD ' + REF.flete + ' por 5 cajas (0,12 m³) desde China, ' + REF.fecha + '.'],
    seg: ['Seguro', 'El seguro de la carga durante el viaje. Forma parte del valor en aduana.', 'Del agente de carga o de una aseguradora. Referencia: ' + String(REF.seguro).replace('.', ',') + '% de la mercadería más el flete.'],
    va: ['Valor en aduana (CIF)', 'Mercadería + gastos en origen + flete + seguro. Es la base sobre la que la aduana calcula el derecho y la tasa de estadística.', 'Lo calculamos con lo que cargaste.'],
    der: ['Derecho de importación', 'El impuesto de la aduana para ese producto. Depende de la posición arancelaria y va del 0% al 35%.', 'Se completa solo con el producto que escribas (VUCE o Arancel Integrado de ARCA). Confirmá la posición con tu despachante: si cambia la posición, cambia el derecho.'],
    te: ['Tasa de estadística', '3% del valor en aduana, con un tope según el monto. Lo que viene de países del Mercosur no la paga.', 'Decreto 1140/2024. Ya está calculada.'],
    iva: ['IVA', '21% (10,5% para algunos productos) sobre el valor en aduana más el derecho y la tasa.', 'La alícuota depende del producto. Si dudás, preguntale a tu despachante.'],
    cond: ['¿Para qué importás?', 'Define qué parte de lo que pagás recuperás después. Si sos responsable inscripto y revendés, el IVA y las percepciones los descontás de tus impuestos. Si sos monotributista o es para vos, todo es costo.', 'Tu situación ante ARCA. Si no sabés cuál es, preguntale a tu contador.'],
    iibb: ['Percepción de Ingresos Brutos', 'Un adelanto del impuesto provincial que se cobra en la aduana. Si estás inscripto, lo descontás después.', 'Depende de tu provincia y de tu inscripción: preguntale a tu contador. Referencia: ' + REF.iibb + '%.'],
    gastos: ['Gastos en Argentina', 'Lo que pagás para sacar la mercadería de la aduana y traerla: despachante, depósito, terminal, agente de carga, banco. Son casi fijos: cuestan parecido con 5 cajas que con 50, por eso pesan mucho en los pedidos chicos. Estos servicios llevan IVA 21%, que si sos responsable inscripto recuperás.', 'Pedile a tu despachante una cotización con el peso, las medidas y el valor de tu carga. Los valores cargados son de una cotización real (' + REF.fecha + ', 5 cajas desde China): usalos solo como referencia.'],
    tc: ['Dólar', 'Para ver los resultados en pesos.', 'El tipo de cambio vendedor del Banco Nación es la referencia que se usa en la aduana.'],
    res: ['Plata que necesitás y costo real', '“Plata que necesitás” es todo lo que vas a pagar, incluido el IVA y las percepciones. “Costo real” es lo que te queda como costo después de recuperarlos. “Por unidad” es el costo real dividido la cantidad.', 'Son cálculos aproximados con lo que cargaste. Antes de comprar, pedile el número final a tu despachante.'],
    de: ['Derecho de exportación', 'El impuesto que se paga al exportar ese producto. Muchos productos pagan 0%.', 'Se completa solo con el producto (VUCE o Arancel Integrado de ARCA).'],
    re: ['Reintegro', 'Un porcentaje del valor que el Estado te devuelve por exportar. Llega meses después, no al cobrar.', 'Se completa solo con el producto (VUCE o Arancel Integrado de ARCA).'],
    gexpo: ['Gastos al exportar', 'Despachante, puerto, documentos y certificados que pagás vos según cómo vendas (si vendés FOB, el flete lo paga el comprador).', 'Pedile cotización a tu despachante.']
  };
  function qb(k) { return '<button type="button" class="ic-q" data-gl="' + k + '" aria-label="Qué es ' + G[k][0] + '">?</button>'; }
  function ayuda(k) { return '<div class="ic-help" id="ic-h-' + k + '" hidden><b>' + G[k][0] + '.</b> ' + G[k][1] + '<br><span>De dónde sacarlo: ' + G[k][2] + '</span></div>'; }
  function campo(k, id, label, input, extra) { return '<div class="ic-f"' + (extra || '') + '><label for="' + id + '">' + label + ' ' + qb(k) + '</label>' + input + ayuda(k) + '</div>'; }
  function num(id, v, step, min) { return '<input type="number" inputmode="decimal" id="' + id + '" min="' + (min || 0) + '" step="' + step + '" value="' + v + '">'; }

  var css = '' +
    '#importero-calc{--c-bg:var(--surface,#fff);--c-ink:var(--ink,#2B2119);--c-soft:var(--ink-soft,#5C4E40);--c-faint:var(--ink-faint,#8B7E6F);--c-line:var(--line,#DCD4C7);--c-green:var(--green,#1C592E);--c-gsoft:var(--green-soft,#E2EDE3);--c-amber:var(--amber,#8A6212);--c-asoft:var(--amber-soft,#F2E8D2);font-size:14.5px;color:var(--c-ink)}' +
    '#importero-calc *{box-sizing:border-box}' +
    '#importero-calc .ic-head h2{font-family:"Roboto Slab",Georgia,serif;font-size:clamp(22px,3vw,28px);margin:0 0 6px}' +
    '#importero-calc .ic-head p{color:var(--c-soft);margin:0 0 18px;line-height:1.5;max-width:64ch}' +
    '#importero-calc .ic-grid{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:22px;align-items:start}' +
    '@media (max-width:780px){#importero-calc .ic-grid{grid-template-columns:1fr}}' +
    '#importero-calc .ic-card{border:1px solid var(--c-line);background:var(--c-bg);border-radius:6px;padding:16px}' +
    '#importero-calc .ic-step{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--c-green);margin:16px 0 9px;padding-top:12px;border-top:1px solid var(--c-line);display:flex;gap:8px;align-items:center}' +
    '#importero-calc .ic-step:first-of-type{border-top:0;padding-top:0;margin-top:4px}' +
    '#importero-calc .ic-step b{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:50%;background:var(--c-green);color:#fff;font-size:11px;letter-spacing:0}' +
    '#importero-calc label{display:block;font-size:12.5px;font-weight:600;color:var(--c-soft);margin:0 0 5px}' +
    '#importero-calc .ic-q{display:inline-block;vertical-align:-3px;margin-left:4px;width:17px;height:17px;border-radius:50%;border:1px solid var(--c-faint);background:#fff;color:var(--c-soft);font:600 11px/1 "IBM Plex Sans",system-ui,sans-serif;cursor:pointer;padding:0;flex:none}' +
    '#importero-calc .ic-q[aria-expanded=true]{background:var(--c-green);border-color:var(--c-green);color:#fff}' +
    '#importero-calc .ic-help{font-size:12.5px;line-height:1.5;background:var(--c-gsoft);border-radius:5px;padding:9px 11px;margin-top:6px;color:var(--c-ink)}' +
    '#importero-calc .ic-help span{color:var(--c-soft)}' +
    '#importero-calc .ic-f{margin-bottom:13px;position:relative}' +
    '#importero-calc .ic-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#importero-calc input,#importero-calc select{width:100%;padding:9px 10px;font-size:14px;border:1px solid var(--c-line);border-radius:4px;background:#fff;color:var(--c-ink);font-family:inherit}' +
    '#importero-calc input[type=number]{font-family:"IBM Plex Mono",ui-monospace,monospace}' +
    '#importero-calc .ic-hint{font-size:11.5px;color:var(--c-faint);margin-top:4px;line-height:1.4}' +
    '#importero-calc .ic-hint.ok{color:var(--c-green)}' +
    '#importero-calc .ic-mode{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--c-line);border-radius:5px;overflow:hidden;margin-bottom:14px}' +
    '#importero-calc .ic-mode button{border:0;background:#fff;padding:9px;font:inherit;font-weight:600;font-size:13.5px;color:var(--c-soft);cursor:pointer}' +
    '#importero-calc .ic-mode button.on{background:var(--c-green);color:#fff}' +
    '#importero-calc .ic-sug{position:absolute;z-index:5;left:0;right:0;top:62px;background:#fff;border:1px solid var(--c-line);border-radius:4px;max-height:230px;overflow:auto;display:none}' +
    '#importero-calc .ic-sug button{display:block;width:100%;text-align:left;border:0;background:none;padding:8px 10px;font:inherit;font-size:13.5px;cursor:pointer}' +
    '#importero-calc .ic-sug button small{color:var(--c-faint);margin-left:6px}' +
    '#importero-calc .ic-sug button:hover{background:var(--c-gsoft)}' +
    '#importero-calc details{margin-top:4px;font-size:13px}#importero-calc summary{cursor:pointer;color:var(--c-green);font-weight:600;margin-bottom:10px}' +
    '#importero-calc .ic-chk{display:flex;gap:8px;align-items:center;font-weight:400;color:var(--c-ink);font-size:13.5px}#importero-calc .ic-chk input{width:auto}' +
    '#importero-calc .ic-gl{display:grid;grid-template-columns:1fr 92px;gap:6px 10px;align-items:center;font-size:13px;margin:8px 0 4px}' +
    '#importero-calc .ic-gl input{padding:6px 8px;font-size:13px}' +
    '#importero-calc .ic-gsum{display:flex;justify-content:space-between;font-size:13px;color:var(--c-soft);margin-bottom:4px}' +
    '#importero-calc .ic-gsum b{font-family:"IBM Plex Mono",monospace;color:var(--c-ink)}' +
    '#importero-calc .ic-tiles{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px}' +
    '@media (max-width:560px){#importero-calc .ic-tiles{grid-template-columns:1fr}}' +
    '#importero-calc .ic-tile{border:1px solid var(--c-line);border-radius:6px;padding:12px 14px;background:#fff}' +
    '#importero-calc .ic-tile.cash{border-color:var(--c-amber);background:var(--c-asoft)}#importero-calc .ic-tile.real{border-color:var(--c-green);background:var(--c-gsoft)}' +
    '#importero-calc .ic-tile.unit{border-color:var(--c-ink)}' +
    '#importero-calc .ic-lbl{font-family:"IBM Plex Mono",monospace;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:5px}' +
    '#importero-calc .cash .ic-lbl{color:var(--c-amber)}#importero-calc .real .ic-lbl{color:var(--c-green)}' +
    '#importero-calc .ic-amt{font-family:"IBM Plex Mono",monospace;font-size:clamp(19px,2.6vw,24px);font-weight:600}' +
    '#importero-calc .ic-sub{font-size:12px;color:var(--c-soft);margin-top:4px;line-height:1.4}' +
    '#importero-calc table{width:100%;border-collapse:collapse;font-size:13.5px}' +
    '#importero-calc td{padding:6px 0;border-bottom:1px solid var(--c-line);vertical-align:top}' +
    '#importero-calc td.n{text-align:right;font-family:"IBM Plex Mono",monospace;white-space:nowrap;padding-left:10px}' +
    '#importero-calc tr.t td{font-weight:700}#importero-calc tr.g td{padding-top:14px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--c-faint);border-bottom:0}' +
    '#importero-calc .cf{font-size:10.5px;color:var(--c-green);border:1px solid var(--c-green);border-radius:3px;padding:0 4px;margin-left:6px;white-space:nowrap}' +
    '#importero-calc .ic-note{font-size:12px;color:var(--c-faint);line-height:1.5;margin-top:12px}' +
    '#importero-calc .ic-msg{font-size:13px;line-height:1.5;background:var(--c-gsoft);border-radius:5px;padding:10px 12px;margin-bottom:10px}' +
    '#importero-calc .ic-msg.warn{background:var(--c-asoft)}' +
    '#importero-calc .ic-glos{margin-top:26px;border-top:1px solid var(--c-line);padding-top:18px}' +
    '#importero-calc .ic-glos h3{font-family:"Roboto Slab",Georgia,serif;font-size:19px;margin:0 0 4px}' +
    '#importero-calc .ic-glos>p{color:var(--c-soft);margin:0 0 12px;font-size:13.5px}' +
    '#importero-calc .ic-glos dl{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin:0}' +
    '#importero-calc .ic-glos div{border:1px solid var(--c-line);border-radius:6px;background:#fff;padding:11px 13px}' +
    '#importero-calc .ic-glos dt{font-weight:700;font-size:13.5px;margin-bottom:4px}' +
    '#importero-calc .ic-glos dd{margin:0;font-size:13px;line-height:1.5;color:var(--c-ink)}' +
    '#importero-calc .ic-glos dd span{display:block;margin-top:5px;color:var(--c-soft)}' +
    '#importero-calc [hidden]{display:none!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var gl = REF.gastos.map(function (g) { return '<span>' + g[1] + '</span>' + num('ic-g-' + g[0], g[2], 10); }).join('');
  root.innerHTML = '' +
    '<div class="ic-head"><h2>Calculá cuánto te sale (o cuánto te queda)</h2>' +
    '<p>Completá los pasos. Lo que escribas en el buscador de arriba se carga acá solo. Tocá <b>?</b> en cada dato para ver qué es y de dónde sacarlo.</p></div>' +
    '<div class="ic-grid"><form class="ic-card" onsubmit="return false">' +
      '<div class="ic-mode" role="tablist"><button type="button" data-m="impo" class="on">Importar</button><button type="button" data-m="expo">Exportar</button></div>' +
      '<div class="ic-step"><b>1</b>Qué ' + '<span data-only="impo">traés</span><span data-only="expo" hidden>vendés</span></div>' +
      '<div class="ic-f"><label for="ic-prod">Producto</label>' +
        '<input id="ic-prod" autocomplete="off" placeholder="Ej.: anafe, toallas, miel…"><div class="ic-sug" id="ic-sug"></div>' +
        '<div class="ic-hint" id="ic-prod-hint">Escribilo y elegilo de la lista: completamos el derecho solo.</div></div>' +
      '<div class="ic-row">' + campo('cant', 'ic-cant', 'Cantidad', num('ic-cant', 500, 50, 1)) +
        campo('pu', 'ic-pu', '<span id="ic-pu-l">Precio c/u (USD)</span>', num('ic-pu', 10, 0.1)) + '</div>' +
      '<div class="ic-hint" id="ic-fob-tot" style="margin:-6px 0 6px"></div>' +
      '<div data-only="impo">' +
        '<div class="ic-step"><b>2</b>Traerlo hasta Argentina</div>' +
        campo('flete', 'ic-flete', 'Flete internacional (USD)', num('ic-flete', REF.flete, 25)) +
        '<details><summary>Seguro y gastos en origen</summary><div class="ic-row">' +
          campo('seg', 'ic-seg', 'Seguro (%)', num('ic-seg', REF.seguro, 0.1)) +
          campo('orig', 'ic-orig', 'En origen (USD)', num('ic-orig', 0, 25)) + '</div></details>' +
        '<div class="ic-step"><b>3</b>Impuestos en la aduana</div>' +
        '<div class="ic-row">' + campo('der', 'ic-der', 'Derecho (%)', '<input type="number" inputmode="decimal" id="ic-der" min="0" max="35" step="0.1" value="20">') +
          campo('iva', 'ic-iva', 'IVA', '<select id="ic-iva"><option value="21">21%</option><option value="10.5">10,5%</option></select>') + '</div>' +
        campo('cond', 'ic-cond', '¿Para qué importás?', '<select id="ic-cond">' +
          '<option value="reventa">Para revender (responsable inscripto)</option>' +
          '<option value="uso">Bien de uso de mi empresa (máquina, equipo)</option>' +
          '<option value="mono">Soy monotributista</option>' +
          '<option value="particular">Uso particular (persona)</option></select>') +
        '<details><summary>Ingresos Brutos y Mercosur</summary>' +
          campo('iibb', 'ic-iibb', 'Percepción IIBB (%)', num('ic-iibb', REF.iibb, 0.5)) +
          '<div class="ic-f"><label class="ic-chk"><input type="checkbox" id="ic-merco"> Viene de un país del Mercosur (sin tasa de estadística)</label></div></details>' +
        '<div class="ic-step"><b>4</b>Gastos en Argentina ' + qb('gastos') + '</div>' + ayuda('gastos') +
        '<label class="ic-chk" style="margin-bottom:8px"><input type="checkbox" id="ic-gon" checked> Sumar gastos de despachante, depósito, puerto y banco</label>' +
        '<div class="ic-gsum" id="ic-gsum-w"><span>Referencia (' + REF.fecha + ')</span><b id="ic-gsum"></b></div>' +
        '<details id="ic-gdet"><summary>Ver y editar cada gasto</summary><div class="ic-gl">' + gl + '</div>' +
          '<div class="ic-hint">Son valores de una cotización real para 5 cajas desde China. Reemplazalos por los de tu despachante.</div></details>' +
      '</div>' +
      '<div data-only="expo" hidden>' +
        '<div class="ic-step"><b>2</b>Derechos y reintegro</div>' +
        '<div class="ic-row">' + campo('de', 'ic-de', 'Derecho expo (%)', num('ic-de', 0, 0.1)) + campo('re', 'ic-re', 'Reintegro (%)', num('ic-re', 0, 0.05)) + '</div>' +
        '<div class="ic-step"><b>3</b>Gastos ' + qb('gexpo') + '</div>' + ayuda('gexpo') +
        '<div class="ic-row"><div class="ic-f"><label for="ic-desp">Despachante (% del valor)</label>' + num('ic-desp', 0, 0.1) + '</div>' +
        '<div class="ic-f"><label for="ic-gastos">Otros gastos (USD)</label>' + num('ic-gastos', 0, 25) + '</div></div>' +
      '</div>' +
      '<details><summary>Ver en pesos</summary>' + campo('tc', 'ic-tc', 'Dólar (ARS)', '<input type="number" inputmode="decimal" id="ic-tc" min="0" step="10" value="">') + '</details>' +
    '</form><div>' +
      '<div class="ic-tiles">' +
        '<div class="ic-tile cash"><div class="ic-lbl" id="ic-cash-l">Plata que necesitás</div><div class="ic-amt" id="ic-cash"></div><div class="ic-sub" id="ic-cash-s"></div></div>' +
        '<div class="ic-tile real"><div class="ic-lbl" id="ic-real-l">Costo real</div><div class="ic-amt" id="ic-real"></div><div class="ic-sub" id="ic-real-s"></div></div>' +
        '<div class="ic-tile unit"><div class="ic-lbl" id="ic-unit-l">Por unidad</div><div class="ic-amt" id="ic-unit"></div><div class="ic-sub" id="ic-unit-s"></div></div>' +
      '</div>' +
      '<div class="ic-msg" id="ic-msg"></div><div class="ic-msg warn" id="ic-msg2" hidden></div>' +
      '<div class="ic-card" style="padding:12px 16px"><table><tbody id="ic-rows"></tbody></table></div>' +
      '<div class="ic-note" id="ic-note"></div>' +
    '</div></div>' +
    '<div class="ic-glos" id="ic-glosario"><h3>Glosario: qué es cada número y de dónde sacarlo</h3>' +
      '<p>Para llegar al despachante sabiendo qué pedir.</p><dl>' +
      ['cant', 'pu', 'orig', 'flete', 'seg', 'va', 'der', 'te', 'iva', 'cond', 'iibb', 'gastos', 'res', 'de', 're', 'tc'].map(function (k) {
        return '<div><dt>' + G[k][0] + '</dt><dd>' + G[k][1] + '<span>De dónde sacarlo: ' + G[k][2] + '</span></dd></div>';
      }).join('') + '</dl></div>';

  root.addEventListener('click', function (e) {
    var b = e.target.closest('.ic-q'); if (!b) return;
    var h = $('ic-h-' + b.getAttribute('data-gl')); if (!h) return;
    h.hidden = !h.hidden; b.setAttribute('aria-expanded', String(!h.hidden));
  });

  function $(id) { return document.getElementById(id); }
  function n(id) { var v = parseFloat($(id).value); return isNaN(v) ? 0 : v; }
  function usd(x) { return 'USD ' + Math.round(x).toLocaleString('es-AR'); }
  function usdU(x) { return 'USD ' + x.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function u2(x) { return x.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pc(x) { return String(x).replace('.', ','); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tope(v) { for (var i = 0; i < T.tasaEst.topes.length; i++) if (v <= T.tasaEst.topes[i][0]) return T.tasaEst.topes[i][1]; return Infinity; }
  function row(l, v, o) { o = o || {}; return '<tr' + (o.c ? ' class="' + o.c + '"' : '') + '><td>' + l + (o.cf ? '<span class="cf">' + (o.cft || 'se recupera') + '</span>' : '') + '</td><td class="n">' + u2(v) + '</td></tr>'; }
  function grp(l) { return '<tr class="g"><td colspan="2">' + l + '</td></tr>'; }
  function ars(x) { var tc = n('ic-tc'); return tc ? ' · ARS ' + Math.round(x * tc).toLocaleString('es-AR') : ''; }

  var modo = 'impo';
  function setModo(m) {
    modo = m;
    [].forEach.call(root.querySelectorAll('.ic-mode button'), function (b) { b.classList.toggle('on', b.getAttribute('data-m') === m); });
    [].forEach.call(root.querySelectorAll('[data-only]'), function (el) { el.hidden = el.getAttribute('data-only') !== m; });
    $('ic-pu-l').textContent = m === 'impo' ? 'Precio c/u (USD)' : 'Venta c/u (USD)';
    calc();
  }

  function gastosArg() {
    if (!$('ic-gon').checked) return { items: [], total: 0 };
    var items = REF.gastos.map(function (g) { return [g[1], n('ic-g-' + g[0])]; }).filter(function (x) { return x[1]; });
    return { items: items, total: items.reduce(function (s, x) { return s + x[1]; }, 0) };
  }

  // Costo de importación para una cantidad dada (para mostrar cuánto baja por unidad con más volumen)
  function costoImpo(cant) {
    var cond = $('ic-cond').value, reducida = $('ic-iva').value === '10.5';
    var fob = cant * n('ic-pu'), orig = n('ic-orig'), flete = n('ic-flete');
    var seg = (fob + orig + flete) * n('ic-seg') / 100, va = fob + orig + flete + seg;
    var der = va * n('ic-der') / 100;
    var te = $('ic-merco').checked ? 0 : Math.min(va * T.tasaEst.pct / 100, tope(va));
    var base = va + der + te;
    var iva = base * parseFloat($('ic-iva').value) / 100;
    var pIva = cond === 'particular' ? 0 : base * (reducida ? T.percIva.reducida : T.percIva.general) / 100;
    var pGan = cond === 'uso' ? 0 : base * (cond === 'particular' ? T.percGan.consumo : T.percGan.general) / 100;
    var iibb = cond === 'particular' ? 0 : base * n('ic-iibb') / 100;
    var g = gastosArg(), ivaG = g.total * 0.21;
    var recupera = cond === 'reventa' || cond === 'uso';
    var percep = iva + pIva + pGan + iibb + ivaG;
    var cash = va + der + te + iva + pIva + pGan + iibb + g.total + ivaG;
    var real = cash - (recupera ? percep : 0);
    return { cond: cond, reducida: reducida, fob: fob, orig: orig, flete: flete, seg: seg, va: va, der: der, te: te, iva: iva, pIva: pIva, pGan: pGan, iibb: iibb,
      g: g, ivaG: ivaG, recupera: recupera, percep: percep, cash: cash, real: real, unit: cant ? real / cant : 0 };
  }

  function calcImpo() {
    var cant = n('ic-cant'), c = costoImpo(cant);
    $('ic-fob-tot').textContent = cant && n('ic-pu') ? 'Mercadería: ' + usd(c.fob) + ' FOB' : '';
    $('ic-gsum').textContent = usd(c.g.total) + (c.g.total ? ' + IVA' : '');
    $('ic-gsum-w').hidden = !$('ic-gon').checked; $('ic-gdet').hidden = !$('ic-gon').checked;
    $('ic-cash-l').textContent = 'Plata que necesitás'; $('ic-real-l').textContent = 'Costo real'; $('ic-unit-l').textContent = 'Costo por unidad';
    $('ic-cash').textContent = usd(c.cash); $('ic-real').textContent = usd(c.real); $('ic-unit').textContent = cant ? usdU(c.unit) : '—';
    $('ic-cash-s').textContent = 'todo lo que pagás' + ars(c.cash);
    $('ic-real-s').textContent = (c.recupera ? 'después de recuperar IVA y percepciones' : 'no recuperás IVA ni percepciones') + ars(c.real);
    $('ic-unit-s').textContent = (n('ic-pu') ? 'pagás ' + usdU(n('ic-pu')) + ' FOB' : '') + (n('ic-tc') && cant ? ' · ARS ' + Math.round(c.unit * n('ic-tc')).toLocaleString('es-AR') : '');
    $('ic-msg').innerHTML = c.recupera
      ? '<strong>' + usd(c.percep) + '</strong> son IVA y percepciones: los pagás al importar pero los recuperás como crédito fiscal. Necesitás tener esa plata, pero no es costo.'
      : (c.cond === 'mono' ? 'Como <strong>monotributista</strong> no recuperás el IVA ni las percepciones: todo lo que pagás es costo.'
        : 'En <strong>uso particular</strong> no hay crédito fiscal: todo lo que pagás es costo.');
    var fijo = c.g.total + (c.recupera ? 0 : c.ivaG), m2 = $('ic-msg2');
    if (cant && c.real && fijo / c.real > 0.2) {
      var c2 = costoImpo(cant * 2);
      m2.innerHTML = 'Los <strong>gastos en Argentina son el ' + Math.round(fijo / c.real * 100) + '% de tu costo</strong> y casi no cambian con el volumen. Con el doble de unidades (' + (cant * 2).toLocaleString('es-AR') + '), cada una te costaría <strong>' + usdU(c2.unit) + '</strong> en vez de ' + usdU(c.unit) + '.';
      m2.hidden = false;
    } else m2.hidden = true;
    var h = grp('Lo que pagás afuera') + row('Mercadería FOB (' + cant.toLocaleString('es-AR') + ' × ' + u2(n('ic-pu')) + ')', c.fob);
    if (c.orig) h += row('Gastos en origen', c.orig);
    h += row('Flete internacional', c.flete) + row('Seguro (' + pc(n('ic-seg')) + '%)', c.seg) + row('Valor en aduana (CIF)', c.va, { c: 't' });
    h += grp('Impuestos en la aduana');
    h += row('Derecho de importación (' + pc(n('ic-der')) + '%)', c.der);
    h += row('Tasa de estadística' + ($('ic-merco').checked ? ' (Mercosur: no paga)' : (c.te < c.va * 0.03 - 0.005 ? ' (con tope)' : ' (3%)')), c.te);
    h += row('IVA (' + pc($('ic-iva').value) + '%)', c.iva, { cf: c.recupera });
    if (c.pIva) h += row('Percepción de IVA (' + (c.reducida ? T.percIva.reducida : T.percIva.general) + '%)', c.pIva, { cf: c.recupera });
    if (c.pGan) h += row('Percepción de Ganancias (' + (c.cond === 'particular' ? T.percGan.consumo : T.percGan.general) + '%)', c.pGan, { cf: c.recupera });
    if (c.iibb) h += row('Percepción de Ingresos Brutos (' + pc(n('ic-iibb')) + '%)', c.iibb, { cf: c.recupera });
    if (c.g.total) {
      h += grp('Gastos en Argentina (referencia)');
      c.g.items.forEach(function (x) { h += row(x[0], x[1]); });
      h += row('IVA sobre los gastos (21%)', c.ivaG, { cf: c.recupera });
    }
    h += grp('Resultado') + row('Plata que necesitás', c.cash, { c: 't' });
    if (c.recupera) h += row('Se recupera como crédito fiscal', -c.percep);
    h += row('Costo real', c.real, { c: 't' });
    if (cant) h += row('Costo por unidad', c.unit, { c: 't' });
    $('ic-rows').innerHTML = h;
  }

  function calcExpo() {
    var cant = n('ic-cant'), fob = cant * n('ic-pu'), de = fob * n('ic-de') / 100, re = fob * n('ic-re') / 100;
    var desp = fob * n('ic-desp') / 100, gastos = n('ic-gastos');
    var neto = fob - de - desp - gastos, total = neto + re;
    $('ic-fob-tot').textContent = fob ? 'Venta total: ' + usd(fob) + ' FOB' : '';
    $('ic-cash-l').textContent = 'Te queda al cobrar'; $('ic-real-l').textContent = 'Con el reintegro'; $('ic-unit-l').textContent = 'Por unidad';
    $('ic-cash').textContent = usd(neto); $('ic-real').textContent = usd(total); $('ic-unit').textContent = cant ? usdU(total / cant) : '—';
    $('ic-cash-s').textContent = (fob ? Math.round(neto / fob * 100) + '% del precio de venta' : '') + ars(neto);
    $('ic-real-s').textContent = (fob ? Math.round(total / fob * 100) + '% del precio de venta' : '') + ars(total);
    $('ic-unit-s').textContent = 'con el reintegro';
    $('ic-msg2').hidden = true;
    $('ic-msg').innerHTML = re
      ? 'El <strong>reintegro (' + usd(re) + ')</strong> lo cobrás después, no al embarcar: no cuentes con esa plata para la operación.'
      : (de ? 'Este producto paga <strong>derecho de exportación</strong>. Si sos MiPyME con certificado, puede que no lo pagues hasta USD 500.000 por año (Decreto 302/2021): consultalo.'
        : 'Sin derecho de exportación ni reintegro: lo que vendés, menos tus gastos.');
    var h = row('Precio de venta FOB (' + cant.toLocaleString('es-AR') + ' × ' + u2(n('ic-pu')) + ')', fob);
    h += grp('Al exportar');
    h += row('Derecho de exportación (' + pc(n('ic-de')) + '%)', de ? -de : 0);
    if (desp) h += row('Despachante', -desp);
    if (gastos) h += row('Otros gastos', -gastos);
    h += row('Te queda al cobrar', neto, { c: 't' });
    h += grp('Después');
    h += row('Reintegro (' + pc(n('ic-re')) + '%)', re, { cf: !!re, cft: 'llega después' });
    h += row('Total con reintegro', total, { c: 't' });
    $('ic-rows').innerHTML = h;
  }

  function calc() { if (modo === 'impo') calcImpo(); else calcExpo(); }

  $('ic-note').innerHTML = 'Aproximado orientativo, no asesoramiento. Los gastos en Argentina, el flete, el seguro y la percepción de Ingresos Brutos son valores de referencia de una cotización real (' + REF.fecha + '), no datos oficiales: reemplazalos por los tuyos. ' +
    'No incluye licencias ni certificaciones (ANMAT, SENASA, seguridad eléctrica, ENACOM), impuestos internos ni regímenes especiales (p. ej. la exclusión de percepciones para canasta básica y MiPyMEs con certificado, RG ARCA 5490, prorrogada al 31/12/2026 por la RG 5868). ' +
    'En exportación, el derecho y el reintegro se calculan sobre el FOB de forma simplificada. ' +
    'Alícuotas verificadas el ' + T.verificado.split('-').reverse().join('/') + ': tasa de estadística — ' + T.tasaEst.fuente + ' Percepción de IVA — ' + T.percIva.fuente + ' Percepción de Ganancias — ' + T.percGan.fuente +
    ' Derechos y reintegros: VUCE (productos analizados) y Arancel Integrado de ARCA (resto de las posiciones). Confirmá los números con tu despachante antes de operar.';

  ['ic-cant', 'ic-pu', 'ic-orig', 'ic-flete', 'ic-seg', 'ic-der', 'ic-iva', 'ic-cond', 'ic-merco', 'ic-iibb', 'ic-gon', 'ic-desp', 'ic-gastos', 'ic-tc', 'ic-de', 'ic-re']
    .concat(REF.gastos.map(function (g) { return 'ic-g-' + g[0]; })).forEach(function (id) {
      $(id).addEventListener('input', calc); $(id).addEventListener('change', calc);
    });
  [].forEach.call(root.querySelectorAll('.ic-mode button'), function (b) { b.addEventListener('click', function () { setModo(b.getAttribute('data-m')); }); });

  /* ── Autocompletado ───────────────────────────────────────────────── */
  var prods = [], STOP = { de: 1, del: 1, la: 1, el: 1, los: 1, las: 1, para: 1, con: 1, sin: 1, en: 1, un: 1, una: 1, por: 1, quiero: 1, importar: 1, exportar: 1 };
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  fetch(DATOS).then(function (r) { return r.json(); }).then(function (d) {
    prods = (d.productos || []).filter(function (p) { return (p.candidatas || []).some(function (c) { return typeof c.DIE === 'number' || typeof c.DE === 'number'; }); });
  }).catch(function () {});

  function buscarProd(q) {
    var ts = norm(q).split(/\s+/).filter(function (t) { return t.length > 2 && !STOP[t]; });
    if (!ts.length) return [];
    return prods.map(function (p) {
      var txt = norm([p.producto].concat(p.alias || []).join(' ')), s = 0;
      ts.forEach(function (t) { if (txt.indexOf(t) >= 0) s += 3; else if (t.length > 4 && txt.indexOf(t.slice(0, -1)) >= 0) s += 2; });
      return { p: p, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.p; });
  }
  function hint(t, ok) { var h = $('ic-prod-hint'); h.innerHTML = t; h.classList.toggle('ok', !!ok); }

  function usarProducto(p) {
    var cs = p.candidatas.filter(function (c) { return typeof c.DIE === 'number' || typeof c.DE === 'number'; });
    var c = cs[0];
    $('ic-prod').value = p.producto;
    if (p.operacion === 'exportacion') {
      setModo('expo'); $('ic-de').value = c.DE || 0; $('ic-re').value = c.RE || 0;
      var alt = cs.slice(1).filter(function (x) { return x.RE !== c.RE || x.DE !== c.DE; }).map(function (x) { return 'DE ' + pc(x.DE || 0) + '% / RE ' + pc(x.RE || 0) + '%'; });
      hint('Derecho ' + pc(c.DE || 0) + '% y reintegro ' + pc(c.RE || 0) + '% (SIM ' + esc(c.sim) + ', VUCE).' + (alt.length ? ' Según envase o calidad puede ser ' + alt.join(' o ') + ': mirá la ficha.' : ''), true);
    } else {
      setModo('impo'); $('ic-der').value = c.DIE;
      var otros = cs.slice(1).map(function (x) { return x.DIE; }).filter(function (v, i, a) { return v !== c.DIE && a.indexOf(v) === i; });
      hint('Derecho ' + pc(c.DIE) + '% (SIM ' + esc(c.sim) + ', VUCE).' + (otros.length ? ' Según cómo sea el producto puede ser ' + otros.map(pc).join('% o ') + '%: mirá la ficha.' : ''), true);
    }
    calc();
  }
  // Arancel Integrado de ARCA por capítulo (oficial): derecho de importación, de exportación y reintegro por SIM
  var ARANCEL = DATOS.replace('productos.json', 'arancel/'), capCache = {};
  function cargarCap(cap, cb) {
    if (capCache[cap]) return cb(capCache[cap]);
    fetch(ARANCEL + cap + '.json').then(function (r) { return r.json(); }).then(function (d) { capCache[cap] = d; cb(d); }).catch(function () { cb(null); });
  }
  window.ImporteroArancel = { cargarCap: cargarCap, fuente: 'Arancel Integrado de ARCA (archivo del 09/11/2026)' };
  function fmt8(code) { code = String(code).replace(/\./g, ''); return code.slice(0, 4) + '.' + code.slice(4, 6) + '.' + code.slice(6, 8); }
  function usarNcm(code, aec, op) {
    var k = fmt8(code);
    cargarCap(k.slice(0, 2), function (d) {
      var e = d && d[k], sims = e ? e.s : [];
      if (!sims.length) {
        setModo('impo'); $('ic-der').value = aec;
        hint('Posición ' + k + ': arancel externo común ' + pc(aec) + '%. El derecho real puede ser distinto: confirmalo con tu despachante.');
        return calc();
      }
      var dies = sims.map(function (x) { return x[1]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
      if (op === 'expo') {
        var c = sims[0]; setModo('expo'); $('ic-de').value = c[2]; $('ic-re').value = c[3];
        var res = sims.map(function (x) { return x[3]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
        hint('Posición ' + k + ': derecho de exportación ' + pc(c[2]) + '% y reintegro ' + pc(c[3]) + '% (SIM ' + c[0] + ', Arancel Integrado de ARCA).' + (res.length > 1 ? ' Según envase o variedad el reintegro va de ' + pc(Math.min.apply(null, res)) + '% a ' + pc(Math.max.apply(null, res)) + '%.' : ''), true);
      } else {
        setModo('impo'); $('ic-der').value = sims[0][1];
        hint('Posición ' + k + ': derecho de importación ' + pc(sims[0][1]) + '% (SIM ' + sims[0][0] + ', Arancel Integrado de ARCA).' + (dies.length > 1 ? ' Según el producto exacto puede ser ' + dies.map(pc).join('%, ') + '%: mirá la ficha.' : ''), true);
      }
      calc();
    });
  }
  window.ImporteroCalc = { usarNcm: usarNcm, ir: function () { root.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };

  // Fichas de exportación (base.json): para rubros con guía pero sin producto (miel, granos, aceites…)
  var fichasExpo = null;
  function cargarFichas(cb) {
    if (fichasExpo) return cb();
    fetch(DATOS.replace('productos.json', 'base.json')).then(function (r) { return r.json(); }).then(function (b) {
      fichasExpo = (b.fichas || []).map(function (f) {
        var e = f.exportacion || {}, sims = (Array.isArray(e.sim) ? e.sim : []).filter(function (s) { return typeof s.DE === 'number'; });
        if (!sims.length && e.tasas_todas_las_sim) sims = [{ codigo: (e.sim_ejemplo || [f.ncm])[0], DE: e.tasas_todas_las_sim.DE, RE: e.tasas_todas_las_sim.RE }];
        var titulos = (b.guias || []).filter(function (g) { return (g.ncm || []).indexOf(f.ncm) >= 0; }).map(function (g) { return g.titulo; });
        return { ncm: f.ncm, txt: norm(f.descripcion + ' ' + titulos.join(' ')), sims: sims, soloExpo: !f.importacion };
      }).filter(function (f) { return f.sims.length; });
      cb();
    }).catch(function () { fichasExpo = []; cb(); });
  }
  function buscarFicha(q) {
    var ts = norm(q).split(/\s+/).filter(function (t) { return t.length > 2 && !STOP[t]; });
    var best = null;
    (fichasExpo || []).forEach(function (f) {
      var s = 0; ts.forEach(function (t) { if (f.txt.indexOf(t) >= 0) s++; });
      if (s === ts.length && s && (!best || s > best.s)) best = { f: f, s: s };
    });
    return best && best.f;
  }
  function usarFicha(f) {
    var c = f.sims[0], codigo = String(c.codigo).split(' ')[0];
    setModo('expo'); $('ic-de').value = c.DE || 0; $('ic-re').value = c.RE || 0;
    var alt = f.sims.slice(1).filter(function (x) { return x.RE !== c.RE || x.DE !== c.DE; }).map(function (x) { return 'RE ' + pc(x.RE || 0) + '%'; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    hint('Derecho ' + pc(c.DE || 0) + '% y reintegro ' + pc(c.RE || 0) + '% (SIM ' + esc(codigo) + ', VUCE).' + (alt.length ? ' Según envase o variedad puede ser ' + alt.join(' o ') + ': mirá la ficha en /base.' : ''), true);
    calc();
  }

  function autocompletar(q, soloNcm) {
    q = (q || '').trim(); if (q.length < 3) return;
    var r = soloNcm ? [] : buscarProd(q);
    if (r.length) { usarProducto(r[0]); return; }
    if (!soloNcm && fichasExpo === null) { cargarFichas(function () { autocompletar(q); }); return; }
    var fx = soloNcm ? null : buscarFicha(q);
    if (fx && (fx.soloExpo || modo === 'expo')) { usarFicha(fx); return; }
    var ncm = window.__ncm;
    if (ncm && ncm.sugerir) {
      var go = function () { var s = ncm.sugerir(q, 1); if (s.length) usarNcm(s[0].code, s[0].aec); else hint('No lo encontramos: completá el derecho a mano.'); };
      if (ncm.listo && ncm.listo()) go(); else if (ncm.alListo) { ncm.cargar && ncm.cargar(); ncm.alListo(go); }
    } else hint('No lo analizamos todavía: completá el derecho a mano.');
  }

  // Sugerencias en el propio campo
  var inp = $('ic-prod'), sug = $('ic-sug');
  inp.addEventListener('input', function () {
    var q = inp.value.trim(); if (q.length < 2) { sug.style.display = 'none'; return; }
    var hits = buscarProd(q).slice(0, 8);
    sug.innerHTML = hits.map(function (p) { return '<button type="button" data-i="' + prods.indexOf(p) + '">' + esc(p.producto) + '<small>' + (p.operacion === 'exportacion' ? 'exportar' : 'importar') + '</small></button>'; }).join('') +
      '<button type="button" data-q="1">Buscar “' + esc(q) + '” en la nomenclatura<small>aproximado</small></button>';
    sug.style.display = 'block';
  });
  sug.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; sug.style.display = 'none';
    if (b.getAttribute('data-q')) { autocompletar(inp.value, true); return; }
    usarProducto(prods[+b.getAttribute('data-i')]);
  });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) sug.style.display = 'none'; });

  // Sincronía con el buscador de arriba
  var bq = document.getElementById('ncm-q'), tb;
  if (bq) bq.addEventListener('input', function () { clearTimeout(tb); tb = setTimeout(function () { if (bq.value.trim().length >= 3) { $('ic-prod').value = bq.value.trim(); autocompletar(bq.value); } }, 700); });
  setModo('impo');
})();
