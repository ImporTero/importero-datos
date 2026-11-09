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

  // 2) Link a la guía dentro de cada ficha de producto
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
