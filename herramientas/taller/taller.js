// Genera las imágenes de marca a partir de src/marca/logo-original.webp
import { capa, CAPAS_PORTADA } from '/src/bosque.mjs';

const estado = document.getElementById('estado');
const salidas = document.getElementById('salidas');

const cargar = (src) =>
  new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = mal;
    img.src = src;
  });

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

/** Reduce en pasos de la mitad para que el resultado quede nítido. */
function reducir(img, sx, sy, sw, sh, tam) {
  let src = lienzo(sw, sh);
  src.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  let w = sw;
  while (w / 2 > tam) {
    const n = lienzo(Math.round(w / 2), Math.round(w / 2));
    const x = n.getContext('2d');
    x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, n.width, n.height);
    src = n;
    w = n.width;
  }
  const fin = lienzo(tam, tam);
  const x = fin.getContext('2d');
  x.imageSmoothingQuality = 'high';
  x.drawImage(src, 0, 0, tam, tam);
  return fin;
}

const aBlob = (c, tipo, calidad) => new Promise((ok) => c.toBlob(ok, tipo, calidad));

async function guardar(c, ruta, tipo = 'image/png', calidad) {
  const blob = await aBlob(c, tipo, calidad);
  const r = await fetch(`/guardar?ruta=${encodeURIComponent(ruta)}`, { method: 'POST', body: blob });
  if (!r.ok) throw new Error(`No se pudo guardar ${ruta}`);
  const fig = document.createElement('figure');
  const vista = lienzo(c.width, c.height);
  vista.getContext('2d').drawImage(c, 0, 0);
  fig.append(vista);
  const cap = document.createElement('figcaption');
  cap.textContent = `${ruta} — ${c.width}×${c.height} — ${(blob.size / 1024).toFixed(1)} KB`;
  fig.append(cap);
  salidas.append(fig);
  return blob.size;
}

async function main() {
  const logo = await cargar('/src/marca/logo-original.webp');
  const L = logo.naturalWidth;

  // Logotipo para la web
  await guardar(reducir(logo, 0, 0, L, L, 480), 'src/assets/img/logo/logo-480.webp', 'image/webp', 0.9);
  await guardar(reducir(logo, 0, 0, L, L, 160), 'src/assets/img/logo/logo-160.webp', 'image/webp', 0.9);
  await guardar(reducir(logo, 0, 0, L, L, 512), 'src/assets/img/logo/logo-512.png');

  // Iconos de la pestaña: la cara del mono (recorte centrado en la cabeza)
  const cara = { x: L * 0.296, y: L * 0.13, t: L * 0.408 };
  for (const t of [16, 32, 48]) await guardar(reducir(logo, cara.x, cara.y, cara.t, cara.t, t), `src/raiz/favicon-${t}.png`);

  // Icono de iPhone/Android: logo completo sobre papel crema
  const apple = lienzo(180, 180);
  const a = apple.getContext('2d');
  a.fillStyle = '#f4f0e4';
  a.fillRect(0, 0, 180, 180);
  a.drawImage(reducir(logo, 0, 0, L, L, 168), 6, 6);
  await guardar(apple, 'src/raiz/apple-touch-icon.png');

  // Imagen para redes sociales (1200x630)
  await document.fonts.load('700 80px Fraunces');
  await document.fonts.load('600 30px Nunito');
  const og = lienzo(1200, 630);
  const g = og.getContext('2d');
  const cielo = g.createLinearGradient(0, 0, 0, 630);
  cielo.addColorStop(0, '#e8ecdb');
  cielo.addColorStop(1, '#d6dcc8');
  g.fillStyle = cielo;
  g.fillRect(0, 0, 1200, 630);
  const sol = g.createRadialGradient(930, 230, 0, 930, 230, 330);
  sol.addColorStop(0, 'rgba(250,226,160,0.9)');
  sol.addColorStop(0.45, 'rgba(250,226,160,0.35)');
  sol.addColorStop(1, 'rgba(250,226,160,0)');
  g.fillStyle = sol;
  g.fillRect(0, 0, 1200, 630);
  const colores = ['#bfcaab', '#9fb58e', '#739468', '#cbd3bc'];
  CAPAS_PORTADA.forEach((c, i) => {
    g.save();
    g.translate(-60, 400);
    g.scale(0.82, 0.82);
    g.fillStyle = colores[i];
    g.fill(new Path2D(capa({ ancho: 1600, alto: 440, ...c })));
    g.restore();
  });
  g.drawImage(reducir(logo, 0, 0, L, L, 400), 740, 40);
  g.fillStyle = '#24382c';
  g.font = '700 92px Fraunces';
  g.fillText('Jungle Pixel', 70, 215);
  g.fillStyle = '#3f6b4b';
  g.fillText('Studio', 70, 315);
  g.fillStyle = '#364a3d';
  g.font = '600 30px Nunito';
  g.fillText('Indie game studio · Colombia · Venezuela', 74, 375);
  await guardar(og, 'src/assets/img/og.png');

  estado.textContent = 'Listo: imágenes guardadas en src/.';
  document.title = 'LISTO';
}

main().catch((e) => {
  estado.textContent = 'Error: ' + e.message;
  document.title = 'ERROR';
  console.error(e);
});
