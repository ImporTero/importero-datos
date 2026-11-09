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
      '<div class="bt"><button type="button" class="pri" data-calc="' + code + '" data-aec="' + aec + '">Calcular importación</button>' +
      '<button type="button" data-calc="' + code + '" data-aec="' + aec + '" data-op="expo">Calcular exportación</button>' +
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
    (d.productos || []).forEach(function (p) { porNombre[norm(p.producto)] = p; });
    decorar();
  }).catch(function () {});
  function decorar() {
    if (!porNombre) return;
    [].forEach.call(caja.querySelectorAll('details.pf'), function (f) {
      if (f.querySelector('.it-guia')) return;
      var t = f.querySelector('.pf-t'), b = f.querySelector('.pf-b');
      var p = t && porNombre[norm(t.textContent)];
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
