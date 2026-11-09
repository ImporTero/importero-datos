/* ImporTero — calculadora de costo de importación (aproximado).
   Se carga desde jsDelivr (repo público importero-datos): cambiarla NO requiere deploy de Netlify.
   Se monta en <div id="importero-calc"></div>.

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
    '#importero-calc .ic-head p{color:var(--c-soft);margin:0 0 20px;line-height:1.5;max-width:62ch}' +
    '#importero-calc .ic-grid{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:22px;align-items:start}' +
    '@media (max-width:780px){#importero-calc .ic-grid{grid-template-columns:1fr}}' +
    '#importero-calc .ic-card{border:1px solid var(--c-line);background:var(--c-bg);border-radius:6px;padding:16px}' +
    '#importero-calc label{display:block;font-size:12.5px;font-weight:600;color:var(--c-soft);margin:0 0 5px}' +
    '#importero-calc .ic-f{margin-bottom:13px;position:relative}' +
    '#importero-calc .ic-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}' +
    '#importero-calc input,#importero-calc select{width:100%;padding:9px 10px;font-size:14px;border:1px solid var(--c-line);border-radius:4px;background:#fff;color:var(--c-ink);font-family:inherit}' +
    '#importero-calc input[type=number]{font-family:"IBM Plex Mono",ui-monospace,monospace}' +
    '#importero-calc .ic-hint{font-size:11.5px;color:var(--c-faint);margin-top:4px;line-height:1.4}' +
    '#importero-calc .ic-sug{position:absolute;z-index:5;left:0;right:0;top:100%;background:#fff;border:1px solid var(--c-line);border-radius:4px;max-height:220px;overflow:auto;display:none}' +
    '#importero-calc .ic-sug button{display:block;width:100%;text-align:left;border:0;background:none;padding:8px 10px;font:inherit;font-size:13.5px;cursor:pointer}' +
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
    '#importero-calc .ic-msg{font-size:13px;line-height:1.5;background:var(--c-gsoft);border-radius:5px;padding:10px 12px;margin-bottom:14px}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  root.innerHTML = '' +
    '<div class="ic-head"><h2>¿Cuánto te sale ponerlo acá?</h2>' +
    '<p>Un aproximado en cuatro datos. Si elegís un producto que ya analizamos, el derecho se completa solo.</p></div>' +
    '<div class="ic-grid"><form class="ic-card" onsubmit="return false">' +
      '<div class="ic-f"><label for="ic-prod">Producto <span style="font-weight:400;color:var(--c-faint)">(opcional)</span></label>' +
        '<input id="ic-prod" autocomplete="off" placeholder="Ej.: anafe, mesa de luz…"><div class="ic-sug" id="ic-sug"></div>' +
        '<div class="ic-hint" id="ic-prod-hint"></div></div>' +
      '<div class="ic-f"><label for="ic-fob">Valor de la mercadería (FOB, USD)</label><input type="number" id="ic-fob" min="0" step="100" value="5000"></div>' +
      '<div class="ic-f"><label for="ic-flete">Flete y seguro (USD)</label><input type="number" id="ic-flete" min="0" step="50" value="750">' +
        '<div class="ic-hint">Si todavía no cotizaste, poné un estimado: es una suposición tuya, no un dato.</div></div>' +
      '<div class="ic-row"><div class="ic-f"><label for="ic-der">Derecho (%)</label><input type="number" id="ic-der" min="0" max="35" step="0.1" value="16"></div>' +
        '<div class="ic-f"><label for="ic-iva">IVA</label><select id="ic-iva"><option value="21">21%</option><option value="10.5">10,5%</option></select></div></div>' +
      '<div class="ic-f"><label for="ic-cond">¿Para qué importás?</label><select id="ic-cond">' +
        '<option value="reventa">Para revender (responsable inscripto)</option>' +
        '<option value="uso">Bien de uso de mi empresa (máquina, equipo)</option>' +
        '<option value="mono">Soy monotributista</option>' +
        '<option value="particular">Uso particular (persona)</option></select></div>' +
      '<details><summary>Más opciones</summary>' +
        '<div class="ic-f"><label class="ic-chk"><input type="checkbox" id="ic-merco"> Origen Mercosur (sin tasa de estadística)</label></div>' +
        '<div class="ic-row"><div class="ic-f"><label for="ic-desp">Despachante (% del CIF)</label><input type="number" id="ic-desp" min="0" step="0.1" value="0"></div>' +
        '<div class="ic-f"><label for="ic-gastos">Otros gastos (USD)</label><input type="number" id="ic-gastos" min="0" step="25" value="0"></div></div>' +
        '<div class="ic-row"><div class="ic-f"><label for="ic-iibb">Percepción IIBB (%)</label><input type="number" id="ic-iibb" min="0" max="10" step="0.5" value="0"><div class="ic-hint">Depende de tu provincia.</div></div>' +
        '<div class="ic-f"><label for="ic-tc">Dólar (ARS)</label><input type="number" id="ic-tc" min="0" step="10" value=""><div class="ic-hint">Para ver el total en pesos.</div></div></div>' +
      '</details>' +
    '</form><div>' +
      '<div class="ic-tiles"><div class="ic-tile cash"><div class="ic-lbl">Plata que necesitás</div><div class="ic-amt" id="ic-cash">—</div><div class="ic-sub" id="ic-cash-s"></div></div>' +
      '<div class="ic-tile real"><div class="ic-lbl">Costo real</div><div class="ic-amt" id="ic-real">—</div><div class="ic-sub" id="ic-real-s"></div></div></div>' +
      '<div class="ic-msg" id="ic-msg"></div>' +
      '<div class="ic-card"><table><tbody id="ic-rows"></tbody></table></div>' +
      '<p class="ic-note" id="ic-note"></p>' +
    '</div></div>';

  function $(id) { return document.getElementById(id); }
  function n(id) { var v = parseFloat($(id).value); return isNaN(v) ? 0 : v; }
  function usd(x) { return 'USD ' + Math.round(x).toLocaleString('es-AR'); }
  function u2(x) { return x.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function tope(cif) { for (var i = 0; i < T.tasaEst.topes.length; i++) if (cif <= T.tasaEst.topes[i][0]) return T.tasaEst.topes[i][1]; return Infinity; }
  function row(l, v, o) { o = o || {}; return '<tr' + (o.c ? ' class="' + o.c + '"' : '') + '><td>' + l + (o.cf ? '<span class="cf">se recupera</span>' : '') + '</td><td class="n">' + u2(v) + '</td></tr>'; }
  function grp(l) { return '<tr class="g"><td colspan="2">' + l + '</td></tr>'; }

  function calc() {
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

    $('ic-cash').textContent = usd(cash);
    $('ic-real').textContent = usd(real);
    var tc = n('ic-tc');
    $('ic-cash-s').textContent = (fob ? '+' + Math.round((cash / fob - 1) * 100) + '% sobre el FOB' : '') + (tc ? ' · ARS ' + Math.round(cash * tc).toLocaleString('es-AR') : '');
    $('ic-real-s').textContent = (fob ? '+' + Math.round((real / fob - 1) * 100) + '% sobre el FOB' : '') + (tc ? ' · ARS ' + Math.round(real * tc).toLocaleString('es-AR') : '');
    $('ic-msg').innerHTML = recupera
      ? '<strong>' + usd(percep) + '</strong> son IVA y percepciones: los pagás en la aduana pero los recuperás como crédito fiscal. Necesitás tenerlos, pero no son costo.'
      : (cond === 'mono' ? 'Como <strong>monotributista</strong> no recuperás el IVA ni las percepciones: todo lo que pagás en la aduana es costo.'
        : 'En <strong>uso particular</strong> no hay crédito fiscal: todo lo que pagás es costo.');

    var h = '';
    h += row('Mercadería (FOB)', fob) + row('Flete y seguro', flete) + row('Valor CIF', cif, { c: 't' });
    h += grp('Tributos de importación');
    h += row('Derecho de importación (' + n('ic-der') + '%)', der);
    h += row('Tasa de estadística' + ($('ic-merco').checked ? ' (Mercosur: no paga)' : (te < cif * 0.03 - 0.005 ? ' (con tope)' : ' (3%)')), te);
    h += row('IVA (' + $('ic-iva').value.replace('.', ',') + '%)', iva, { cf: recupera });
    if (pIva) h += row('Percepción de IVA (' + (reducida ? T.percIva.reducida : T.percIva.general) + '%)', pIva, { cf: recupera });
    if (pGan) h += row('Percepción de Ganancias (' + (cond === 'particular' ? T.percGan.consumo : T.percGan.general) + '%)', pGan, { cf: recupera });
    if (iibb) h += row('Percepción de IIBB', iibb, { cf: recupera });
    if (desp || gastos) { h += grp('Gastos'); if (desp) h += row('Despachante', desp); if (gastos) h += row('Otros gastos', gastos); }
    h += grp('Resultado') + row('Plata que necesitás', cash, { c: 't' });
    if (recupera) h += row('Se recupera como crédito fiscal', -percep);
    h += row('Costo real', real, { c: 't' });
    $('ic-rows').innerHTML = h;
  }

  $('ic-note').innerHTML = 'Aproximado orientativo, no asesoramiento. No incluye licencias ni certificaciones (ANMAT, SENASA, seguridad eléctrica, ENACOM), ' +
    'impuestos internos ni regímenes especiales (p. ej. la exclusión de percepciones para canasta básica y MiPyMEs con certificado, RG ARCA 5490, prorrogada al 31/12/2026 por la RG 5868). ' +
    'Alícuotas verificadas el ' + T.verificado.split('-').reverse().join('/') + ': tasa de estadística — ' + T.tasaEst.fuente + ' Percepción de IVA — ' + T.percIva.fuente + ' Percepción de Ganancias — ' + T.percGan.fuente +
    ' Confirmá los números con tu despachante antes de comprar.';

  ['ic-fob', 'ic-flete', 'ic-der', 'ic-iva', 'ic-cond', 'ic-merco', 'ic-desp', 'ic-gastos', 'ic-iibb', 'ic-tc'].forEach(function (id) {
    $(id).addEventListener('input', calc); $(id).addEventListener('change', calc);
  });

  // Producto → derecho (solo candidatas de importación verificadas en VUCE)
  var prods = [];
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  fetch(DATOS).then(function (r) { return r.json(); }).then(function (d) {
    prods = (d.productos || []).filter(function (p) { return p.operacion === 'importacion' && (p.candidatas || []).some(function (c) { return typeof c.DIE === 'number'; }); });
  }).catch(function () {});
  var inp = $('ic-prod'), sug = $('ic-sug');
  inp.addEventListener('input', function () {
    var q = norm(inp.value).trim(); if (q.length < 2) { sug.style.display = 'none'; return; }
    var hits = prods.filter(function (p) { return [p.producto].concat(p.alias || []).some(function (a) { return norm(a).indexOf(q) >= 0; }); }).slice(0, 8);
    sug.innerHTML = hits.map(function (p, i) { return '<button type="button" data-i="' + prods.indexOf(p) + '">' + p.producto + '</button>'; }).join('') ||
      '<div style="padding:8px 10px;font-size:13px;color:var(--c-faint)">Todavía no lo analizamos: poné el derecho a mano.</div>';
    sug.style.display = 'block';
  });
  sug.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var p = prods[+b.getAttribute('data-i')], cs = p.candidatas.filter(function (c) { return typeof c.DIE === 'number'; });
    inp.value = p.producto; sug.style.display = 'none';
    $('ic-der').value = cs[0].DIE;
    var otros = cs.slice(1).map(function (c) { return c.DIE; }).filter(function (v, i, a) { return v !== cs[0].DIE && a.indexOf(v) === i; });
    $('ic-prod-hint').textContent = 'Derecho ' + cs[0].DIE + '% (SIM ' + cs[0].sim + ', VUCE)' + (otros.length ? '. Según cómo sea el producto puede ser ' + otros.join('% o ') + '%: mirá la ficha.' : '.');
    calc();
  });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) sug.style.display = 'none'; });

  calc();
})();
