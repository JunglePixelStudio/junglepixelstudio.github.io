// Se carga en <head> antes de pintar: marca que hay JavaScript y, si main.js no llega
// a arrancar (bloqueado, error de red…), devuelve la página a su versión sin efectos
// para que nunca quede contenido invisible.
(function () {
  var html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js');
  window.setTimeout(function () {
    if (!html.classList.contains('js-ready')) {
      html.classList.remove('js');
      html.classList.add('no-js');
    }
  }, 4000);
})();
