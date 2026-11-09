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

  var css = '' +
    '#importero-calc{--c-bg:var(--surface,#fff);--c-ink:var(--ink,#2B2119);--c-soft:var(--ink-soft,#5C4E40);--c-faint:var(--ink-faint,#8B7E6F);--c-line:var(--line,#DCD4C7);--c-green:var(--green,#1C592E);--c-gsoft:var(--green-soft,#E2EDE3);--c-amber:var(--amber,#8A6212);--c-asoft:var(--amber-soft,#F2E8D2);font-size:14.5px;color:var(--c-ink)}' +
    '#importero-calc *{box-sizing:border-box}' +
    '#importero-calc .ic-head h2{font-family:"Roboto Slab",Georgia,serif;font-size:clamp(22px,3vw,28px);margin:0 0 6px}' +
    '#importero-calc .ic-head p{color:var(--c-soft);margin:0 0 18px;line-height:1.5;max-width:64ch}' +
    '#importero-calc .ic-grid{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:22px;align-items:start}' +
    '@media (max-width:780px){#importero-calc .ic-grid{grid-template-columns:1fr}}' +
    '#importero-calc .ic-card{border:1px solid var(--c-line);background:var(--c-bg);border-radius:6px;padding:16px}' +
    '#importero-calc label{display:block;font-size:12.5px;font-weight:600;color:var(--c-soft);margin:0 0 5px}' +
    '#importero-calc .ic-f{margin-bottom:13px;position:relative}' +
    '#importero-calc .ic-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#importero-calc input,#importero-calc select{width:100%;padding:9px 10px;font-size:14px;border:1px solid var(--c-line);border-radius:4px;background:#fff;color:var(--c-ink);font-family:inherit}' +
    '#importero-calc input[type=number]{font-family:"IBM Plex Mono",ui-monospace,monospace}' +
    '#importero-calc .ic-hint{font-size:11.5px;color:var(--c-faint);margin-top:4px;line-height:1.4}' +
    '#importero-calc .ic-hint.ok{color:var(--c-green)}' +
    '#importero-calc .ic-mode{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--c-line);border-radius:5px;overflow:hidden;margin-bottom:14px}' +
    '#importero-calc .ic-mode button{border:0;background:#fff;padding:9px;font:inherit;font-weight:600;font-size:13.5px;color:var(--c-soft);cursor:pointer}' +
    '#importero-calc .ic-mode button.on{background:var(--c-green);color:#fff}' +
    '#importero-calc .ic-sug{position:absolute;z-index:5;left:0;right:0;top:100%;background:#fff;border:1px solid var(--c-line);border-radius:4px;max-height:230px;overflow:auto;display:none}' +
    '#importero-calc .ic-sug button{display:block;width:100%;text-align:left;border:0;background:none;padding:8px 10px;font:inherit;font-size:13.5px;cursor:pointer}' +
    '#importero-calc .ic-sug button small{color:var(--c-faint);margin-left:6px}' +
    '#importero-calc .ic-sug button:hover{background:var(--c-gsoft)}' +
    '#importero-calc details{margin-top:6px;font-size:13px}#importero-calc summary{cursor:pointer;color:var(--c-green);font-weight:600;margin-bottom:10px}' +
    '#importero-calc .ic-chk{display:flex;gap:8px;align-items:center;font-weight:400;color:var(--c-ink);font-size:13.5px}#importero-calc .ic-chk input{width:auto}' +
    '#importero-calc .ic-tiles{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}' +
    '@media (max-width:480px){#importero-calc .ic-tiles{grid-template-columns:1fr}}' +
    '#importero-calc .ic-tile{border:1px solid var(--c-line);border-radius:6px;padding:14px 16px}' +
    '#importero-calc .ic-tile.cash{border-color:var(--c-amber);background:var(--c-asoft)}#importero-calc .ic-tile.real{border-color:var(--c-green);background:var(--c-gsoft)}' +
    '#importero-calc .ic-lbl{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.05em;text-transform:uppercase;margin-bottom:5px}' +
    '#importero-calc .cash .ic-lbl{color:var(--c-amber)}#importero-calc .real .ic-lbl{color:var(--c-green)}' +
    '#importero-calc .ic-amt{font-family:"IBM Plex Mono",monospace;font-size:clamp(20px,3vw,26px);font-weight:600}' +
    '#importero-calc .ic-sub{font-size:12.5px;color:var(--c-soft);margin-top:4px;line-height:1.4}' +
    '#importero-calc table{width:100%;border-collapse:collapse;font-size:13.5px}' +
    '#importero-calc td{padding:6px 0;border-bottom:1px solid var(--c-line);vertical-align:top}' +
    '#importero-calc td.n{text-align:right;font-family:"IBM Plex Mono",monospace;white-space:nowrap;padding-left:10px}' +
    '#importero-calc tr.t td{font-weight:700}#importero-calc tr.g td{padding-top:14px;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--c-faint);border-bottom:0}' +
    '#importero-calc .cf{font-size:10.5px;color:var(--c-green);border:1px solid var(--c-green);border-radius:3px;padding:0 4px;margin-left:6px;white-space:nowrap}' +
    '#importero-calc .ic-note{font-size:12px;color:var(--c-faint);line-height:1.5;margin-top:12px}' +
    '#importero-calc .ic-msg{font-size:13px;line-height:1.5;background:var(--c-gsoft);border-radius:5px;padding:10px 12px;margin-bottom:14px}' +
    '#importero-calc [hidden]{display:none!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  root.innerHTML = '' +
    '<div class="ic-head"><h2>Calculá cuánto te sale (o cuánto te queda)</h2>' +
    '<p>Un aproximado en pocos datos. Lo que escribas en el buscador de arriba se completa acá solo: la operación, el derecho y, si exportás, el reintegro.</p></div>' +
    '<div class="ic-grid"><form class="ic-card" onsubmit="return false">' +
      '<div class="ic-mode" role="tablist"><button type="button" data-m="impo" class="on">Importar</button><button type="button" data-m="expo">Exportar</button></div>' +
      '<div class="ic-f"><label for="ic-prod">Producto</label>' +
        '<input id="ic-prod" autocomplete="off" placeholder="Ej.: anafe, miel, maní…"><div class="ic-sug" id="ic-sug"></div>' +
        '<div class="ic-hint" id="ic-prod-hint">Si no lo encontramos, completá el derecho a mano.</div></div>' +
      '<div class="ic-f"><label for="ic-fob" id="ic-fob-l">Valor de la mercadería (FOB, USD)</label><input type="number" id="ic-fob" min="0" step="100" value="5000"></div>' +
      '<div class="ic-f" data-only="impo"><label for="ic-flete">Flete y seguro (USD)</label><input type="number" id="ic-flete" min="0" step="50" value="750">' +
        '<div class="ic-hint">Si todavía no cotizaste, poné un estimado: es una suposición tuya, no un dato.</div></div>' +
      '<div class="ic-row" data-only="impo"><div class="ic-f"><label for="ic-der">Derecho (%)</label><input type="number" id="ic-der" min="0" max="35" step="0.1" value="16"></div>' +
        '<div class="ic-f"><label for="ic-iva">IVA</label><select id="ic-iva"><option value="21">21%</option><option value="10.5">10,5%</option></select></div></div>' +
      '<div class="ic-row" data-only="expo" hidden><div class="ic-f"><label for="ic-de">Derecho expo (%)</label><input type="number" id="ic-de" min="0" max="40" step="0.1" value="0"></div>' +
        '<div class="ic-f"><label for="ic-re">Reintegro (%)</label><input type="number" id="ic-re" min="0" max="10" step="0.05" value="0"></div></div>' +
      '<div class="ic-f" data-only="impo"><label for="ic-cond">¿Para qué importás?</label><select id="ic-cond">' +
        '<option value="reventa">Para revender (responsable inscripto)</option>' +
        '<option value="uso">Bien de uso de mi empresa (máquina, equipo)</option>' +
        '<option value="mono">Soy monotributista</option>' +
        '<option value="particular">Uso particular (persona)</option></select></div>' +
      '<details><summary>Más opciones</summary>' +
        '<div class="ic-f" data-only="impo"><label class="ic-chk"><input type="checkbox" id="ic-merco"> Origen Mercosur (sin tasa de estadística)</label></div>' +
        '<div class="ic-row"><div class="ic-f"><label for="ic-desp">Despachante (% del valor)</label><input type="number" id="ic-desp" min="0" step="0.1" value="0"></div>' +
        '<div class="ic-f"><label for="ic-gastos">Otros gastos (USD)</label><input type="number" id="ic-gastos" min="0" step="25" value="0"></div></div>' +
        '<div class="ic-row"><div class="ic-f" data-only="impo"><label for="ic-iibb">Percepción IIBB (%)</label><input type="number" id="ic-iibb" min="0" max="10" step="0.5" value="0"><div class="ic-hint">Depende de tu provincia.</div></div>' +
        '<div class="ic-f"><label for="ic-tc">Dólar (ARS)</label><input type="number" id="ic-tc" min="0" step="10" value=""><div class="ic-hint">Para verlo en pesos.</div></div></div>' +
      '</details>' +
    '</form><div>' +
      '<div class="ic-tiles"><div class="ic-tile cash"><div class="ic-lbl" id="ic-cash-l"></div><div class="ic-amt" id="ic-cash">—</div><div class="ic-sub" id="ic-cash-s"></div></div>' +
      '<div class="ic-tile real"><div class="ic-lbl" id="ic-real-l"></div><div class="ic-amt" id="ic-real">—</div><div class="ic-sub" id="ic-real-s"></div></div></div>' +
      '<div class="ic-msg" id="ic-msg"></div>' +
      '<div class="ic-card"><table><tbody id="ic-rows"></tbody></table></div>' +
      '<p class="ic-note" id="ic-note"></p>' +
    '</div></div>';

  function $(id) { return document.getElementById(id); }
  function n(id) { var v = parseFloat($(id).value); return isNaN(v) ? 0 : v; }
  function usd(x) { return 'USD ' + Math.round(x).toLocaleString('es-AR'); }
  function u2(x) { return x.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pc(x) { return String(x).replace('.', ','); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tope(cif) { for (var i = 0; i < T.tasaEst.topes.length; i++) if (cif <= T.tasaEst.topes[i][0]) return T.tasaEst.topes[i][1]; return Infinity; }
  function row(l, v, o) { o = o || {}; return '<tr' + (o.c ? ' class="' + o.c + '"' : '') + '><td>' + l + (o.cf ? '<span class="cf">' + (o.cft || 'se recupera') + '</span>' : '') + '</td><td class="n">' + u2(v) + '</td></tr>'; }
  function grp(l) { return '<tr class="g"><td colspan="2">' + l + '</td></tr>'; }
  function ars(x) { var tc = n('ic-tc'); return tc ? ' · ARS ' + Math.round(x * tc).toLocaleString('es-AR') : ''; }

  var modo = 'impo';
  function setModo(m) {
    modo = m;
    [].forEach.call(root.querySelectorAll('.ic-mode button'), function (b) { b.classList.toggle('on', b.getAttribute('data-m') === m); });
    [].forEach.call(root.querySelectorAll('[data-only]'), function (el) { el.hidden = el.getAttribute('data-only') !== m; });
    $('ic-fob-l').textContent = m === 'impo' ? 'Valor de la mercadería (FOB, USD)' : 'Precio de venta (FOB, USD)';
    calc();
  }

  function calcImpo() {
    var fob = n('ic-fob'), flete = n('ic-flete'), cif = fob + flete, cond = $('ic-cond').value;
    var der = cif * n('ic-der') / 100;
    var te = $('ic-merco').checked ? 0 : Math.min(cif * T.tasaEst.pct / 100, tope(cif));
    var base = cif + der + te;
    var reducida = $('ic-iva').value === '10.5';
    var iva = base * parseFloat($('ic-iva').value) / 100;
    var pIva = cond === 'particular' ? 0 : base * (reducida ? T.percIva.reducida : T.percIva.general) / 100;
    var pGan = cond === 'uso' ? 0 : base * (cond === 'particular' ? T.percGan.consumo : T.percGan.general) / 100;
    var iibb = base * n('ic-iibb') / 100;
    var desp = cif * n('ic-desp') / 100, gastos = n('ic-gastos');
    var recupera = cond === 'reventa' || cond === 'uso';
    var percep = iva + pIva + pGan + iibb;
    var cash = cif + der + te + percep + desp + gastos;
    var real = cash - (recupera ? percep : 0);

    $('ic-cash-l').textContent = 'Plata que necesitás'; $('ic-real-l').textContent = 'Costo real';
    $('ic-cash').textContent = usd(cash); $('ic-real').textContent = usd(real);
    $('ic-cash-s').textContent = (fob ? '+' + Math.round((cash / fob - 1) * 100) + '% sobre el FOB' : '') + ars(cash);
    $('ic-real-s').textContent = (fob ? '+' + Math.round((real / fob - 1) * 100) + '% sobre el FOB' : '') + ars(real);
    $('ic-msg').innerHTML = recupera
      ? '<strong>' + usd(percep) + '</strong> son IVA y percepciones: los pagás en la aduana pero los recuperás como crédito fiscal. Necesitás tenerlos, pero no son costo.'
      : (cond === 'mono' ? 'Como <strong>monotributista</strong> no recuperás el IVA ni las percepciones: todo lo que pagás en la aduana es costo.'
        : 'En <strong>uso particular</strong> no hay crédito fiscal: todo lo que pagás es costo.');
    var h = row('Mercadería (FOB)', fob) + row('Flete y seguro', flete) + row('Valor CIF', cif, { c: 't' });
    h += grp('Tributos de importación');
    h += row('Derecho de importación (' + pc(n('ic-der')) + '%)', der);
    h += row('Tasa de estadística' + ($('ic-merco').checked ? ' (Mercosur: no paga)' : (te < cif * 0.03 - 0.005 ? ' (con tope)' : ' (3%)')), te);
    h += row('IVA (' + pc($('ic-iva').value) + '%)', iva, { cf: recupera });
    if (pIva) h += row('Percepción de IVA (' + (reducida ? T.percIva.reducida : T.percIva.general) + '%)', pIva, { cf: recupera });
    if (pGan) h += row('Percepción de Ganancias (' + (cond === 'particular' ? T.percGan.consumo : T.percGan.general) + '%)', pGan, { cf: recupera });
    if (iibb) h += row('Percepción de IIBB', iibb, { cf: recupera });
    if (desp || gastos) { h += grp('Gastos'); if (desp) h += row('Despachante', desp); if (gastos) h += row('Otros gastos', gastos); }
    h += grp('Resultado') + row('Plata que necesitás', cash, { c: 't' });
    if (recupera) h += row('Se recupera como crédito fiscal', -percep);
    h += row('Costo real', real, { c: 't' });
    $('ic-rows').innerHTML = h;
  }

  function calcExpo() {
    var fob = n('ic-fob'), de = fob * n('ic-de') / 100, re = fob * n('ic-re') / 100;
    var desp = fob * n('ic-desp') / 100, gastos = n('ic-gastos');
    var neto = fob - de - desp - gastos, total = neto + re;
    $('ic-cash-l').textContent = 'Te queda al cobrar'; $('ic-real-l').textContent = 'Con el reintegro';
    $('ic-cash').textContent = usd(neto); $('ic-real').textContent = usd(total);
    $('ic-cash-s').textContent = (fob ? Math.round(neto / fob * 100) + '% del precio de venta' : '') + ars(neto);
    $('ic-real-s').textContent = (fob ? Math.round(total / fob * 100) + '% del precio de venta' : '') + ars(total);
    $('ic-msg').innerHTML = re
      ? 'El <strong>reintegro (' + usd(re) + ')</strong> lo cobrás después, no al embarcar: no cuentes con esa plata para la operación.'
      : (de ? 'Este producto paga <strong>derecho de exportación</strong>. Si sos MiPyME con certificado, puede que no lo pagues hasta USD 500.000 por año (Decreto 302/2021): consultalo.'
        : 'Sin derecho de exportación ni reintegro: lo que vendés, menos tus gastos.');
    var h = row('Precio de venta (FOB)', fob);
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

  $('ic-note').innerHTML = 'Aproximado orientativo, no asesoramiento. No incluye licencias ni certificaciones (ANMAT, SENASA, seguridad eléctrica, ENACOM), ' +
    'impuestos internos ni regímenes especiales (p. ej. la exclusión de percepciones para canasta básica y MiPyMEs con certificado, RG ARCA 5490, prorrogada al 31/12/2026 por la RG 5868). ' +
    'En exportación, el derecho y el reintegro se calculan sobre el FOB de forma simplificada. ' +
    'Alícuotas verificadas el ' + T.verificado.split('-').reverse().join('/') + ': tasa de estadística — ' + T.tasaEst.fuente + ' Percepción de IVA — ' + T.percIva.fuente + ' Percepción de Ganancias — ' + T.percGan.fuente +
    ' Derechos y reintegros: VUCE (productos analizados) y Arancel Integrado de ARCA (resto de las posiciones). Confirmá los números con tu despachante antes de operar.';

  ['ic-fob', 'ic-flete', 'ic-der', 'ic-iva', 'ic-cond', 'ic-merco', 'ic-desp', 'ic-gastos', 'ic-iibb', 'ic-tc', 'ic-de', 'ic-re'].forEach(function (id) {
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
