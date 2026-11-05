// Convierte las portadas originales (src/marca/portadas/) en WebP ligeros para las tarjetas de juego.
// Todas salen en 756x600 (la proporción de las portadas de itch.io, 630x500, al doble de tamaño útil).
const W = 756;
const H = 600;

// modo 'cubrir' recorta para llenar; 'icono' centra la imagen sobre un fondo de color
const PORTADAS = [
  { id: 'hoard-sweeper', src: 'hoard-sweeper.png', modo: 'cubrir' },
  { id: 'trick-or-treat-at-3am', src: 'trick-or-treat-at-3am.png', modo: 'cubrir' },
  { id: 'puffy-merge-zoo', src: 'puffy-merge-zoo.png', modo: 'icono', fondo: ['#d8ecfb', '#b9dcf5'] },
  { id: 'harbor-quest', src: 'harbor-quest.png', modo: 'cubrir', foco: 0.45 },
  { id: 'bald-peacock', src: 'bald-peacock.png', modo: 'cubrir' },
  { id: 'bonk-the-donk', src: 'bonk-the-donk.jpg', modo: 'cubrir' },
];

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

/** Dibuja reduciendo por pasos para que quede nítido. */
function dibujar(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
  let src = img;
  let w = sw;
  let h = sh;
  let x = sx;
  let y = sy;
  while (w / 2 > dw && h / 2 > dh) {
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
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, x, y, w, h, dx, dy, dw, dh);
}

async function main() {
  for (const p of PORTADAS) {
    const img = await cargar(`/src/marca/portadas/${p.src}`);
    const c = lienzo(W, H);
    const g = c.getContext('2d');
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    if (p.modo === 'icono') {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, p.fondo[0]);
      grad.addColorStop(1, p.fondo[1]);
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      const t = H * 0.84;
      const escala = t / Math.max(iw, ih);
      const dw = iw * escala;
      const dh = ih * escala;
      g.shadowColor = 'rgba(36,56,44,0.25)';
      g.shadowBlur = 30;
      g.shadowOffsetY = 12;
      dibujar(g, img, 0, 0, iw, ih, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      const escala = Math.max(W / iw, H / ih);
      const sw = W / escala;
      const sh = H / escala;
      const foco = p.foco ?? 0.5;
      dibujar(g, img, (iw - sw) / 2, (ih - sh) * foco, sw, sh, 0, 0, W, H);
    }
    const blob = await new Promise((ok) => c.toBlob(ok, 'image/webp', 0.86));
    const ruta = `src/assets/img/juegos/${p.id}.webp`;
    const r = await fetch(`/guardar?ruta=${encodeURIComponent(ruta)}`, { method: 'POST', body: blob });
    if (!r.ok) throw new Error('No se pudo guardar ' + ruta);
    const fig = document.createElement('figure');
    c.style.width = '300px';
    fig.append(c);
    const cap = document.createElement('figcaption');
    cap.textContent = `${ruta} — ${(blob.size / 1024).toFixed(0)} KB`;
    fig.append(cap);
    salidas.append(fig);
  }
  estado.textContent = 'Listo: portadas guardadas.';
  document.title = 'LISTO';
}

main().catch((e) => {
  estado.textContent = 'Error: ' + e.message;
  document.title = 'ERROR';
  console.error(e);
});
