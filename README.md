# ImporTero — datos públicos

`productos.json`: productos clasificados que muestra el buscador de [ImporTero](https://importero.app).
Posiciones arancelarias sugeridas con fuente en VUCE. Información orientativa: no reemplaza al despachante de aduana.

Lo actualizan los agentes de ImporTero desde el repositorio privado.

## importero.js
La home de ImporTero carga `importero.js` desde jsDelivr (`cdn.jsdelivr.net/gh/ImporTero/importero-datos@main/importero.js`): botón a la base, link a la guía en cada ficha y calculadora. Se arma con `cat extras.js calculadora.js > importero.js`. Cambiarlo no requiere deploy de Netlify; después de pushear, refrescar la caché con `https://purge.jsdelivr.net/gh/ImporTero/importero-datos@main/importero.js`.
