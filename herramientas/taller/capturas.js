// Convierte las capturas de src/marca/capturas/ en WebP para la galería (960x540)
// y genera el fondo de la portada (1920x1080) a partir de la primera de Hoard Sweeper.
const CAPTURAS = [
  'hoard-sweeper-1.png',
  'hoard-sweeper-2.png',
  'hoard-sweeper-3.png',
  'hoard-sweeper-4.png',
  'trick-or-treat-at-3am-1.jpg',
  'trick-or-treat-at-3am-2.jpg',
  'trick-or-treat-at-3am-3.jpg',
  'bald-peacock-1.png',
  'bald-peacock-2.png',
  'bald-peacock-3.png',
  'bald-peacock-4.png',
];
const FONDOS = [{ src: 'hoard-sweeper-1.png', id: 'portada-hoard-sweeper', w: 1920, h: 1080, q: 0.72 }];

const estado = document.getElementById('estado');
const salidas = document.getElementById('salidas');

const cargar = (src) =>
  new Promise((ok, mal) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => mal(new Error('No se pudo cargar ' + src));
    img.src = src;
  });

function lienzo(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function cubrir(img, W, H) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const escala = Math.max(W / iw, H / ih);
  const sw = W / escala;
  const sh = H / escala;
  let src = img;
  let x = (iw - sw) / 2;
  let y = (ih - sh) / 2;
  let w = sw;
  let h = sh;
  while (w / 2 > W && h / 2 > H) {
    const c = lienzo(Math.round(w / 2), Math.round(h / 2));
    const g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, x, y, w, h, 0, 0, c.width, c.height);
    src = c;
    x = 0;
    y = 0;
    w = c.width;
    h = c.height;
  }
  const fin = lienzo(W, H);
  const g = fin.getContext('2d');
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, x, y, w, h, 0, 0, W, H);
  return fin;
}

async function guardar(c, ruta, q) {
  const blob = await new Promise((ok) => c.toBlob(ok, 'image/webp', q));
  const r = await fetch(`/guardar?ruta=${encodeURIComponent(ruta)}`, { method: 'POST', body: blob });
  if (!r.ok) throw new Error('No se pudo guardar ' + ruta);
  const fig = document.createElement('figure');
  c.style.width = '240px';
  fig.append(c);
  const cap = document.createElement('figcaption');
  cap.textContent = `${ruta} — ${(blob.size / 1024).toFixed(0)} KB`;
  fig.append(cap);
  salidas.append(fig);
}

async function main() {
  for (const f of CAPTURAS) {
    const img = await cargar(`/src/marca/capturas/${f}`);
    await guardar(cubrir(img, 960, 540), `src/assets/img/capturas/${f.replace(/\.(png|jpg)$/, '.webp')}`, 0.8);
  }
  for (const f of FONDOS) {
    const img = await cargar(`/src/marca/capturas/${f.src}`);
    await guardar(cubrir(img, f.w, f.h), `src/assets/img/capturas/${f.id}.webp`, f.q);
  }
  estado.textContent = 'Listo: capturas guardadas.';
  document.title = 'LISTO';
}

main().catch((e) => {
  estado.textContent = 'Error: ' + e.message;
  document.title = 'ERROR';
  console.error(e);
});
