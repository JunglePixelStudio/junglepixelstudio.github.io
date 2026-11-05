// Genera las imágenes de la web sin programas externos: favicon (SVG e ICO),
// icono de iPhone, imagen para redes sociales (og.png) y la textura de grano.
// Uso:  npm run imagenes   (después, npm run construir)

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { celdas, GLIFOS, COLORES_HOJA } from '../src/pixelfont.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(RAIZ, 'src');

// ------------------------------------------------------------ PNG mínimo
const TABLA = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLA[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(tipo, datos) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(datos.length);
  const td = Buffer.concat([Buffer.from(tipo, 'ascii'), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(img) {
  const { w, h, px } = img;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
function ico(pngs) {
  const cab = Buffer.alloc(6 + 16 * pngs.length);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(pngs.length, 4);
  let offset = cab.length;
  pngs.forEach(({ tam, datos }, i) => {
    const o = 6 + i * 16;
    cab[o] = tam >= 256 ? 0 : tam;
    cab[o + 1] = tam >= 256 ? 0 : tam;
    cab.writeUInt16LE(1, o + 4);
    cab.writeUInt16LE(32, o + 6);
    cab.writeUInt32LE(datos.length, o + 8);
    cab.writeUInt32LE(offset, o + 12);
    offset += datos.length;
  });
  return Buffer.concat([cab, ...pngs.map((p) => p.datos)]);
}

// --------------------------------------------------------------- lienzo
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function lienzo(w, h, fondo = null) {
  const px = Buffer.alloc(w * h * 4);
  if (fondo) {
    const [r, g, b] = hex(fondo);
    for (let i = 0; i < w * h; i++) px.set([r, g, b, 255], i * 4);
  }
  return { w, h, px };
}
function rect(img, x, y, w, h, color, alfa = 1) {
  const [r, g, b] = hex(color);
  const x0 = Math.max(0, Math.round(x));
  const y0 = Math.max(0, Math.round(y));
  const x1 = Math.min(img.w, Math.round(x + w));
  const y1 = Math.min(img.h, Math.round(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const i = (yy * img.w + xx) * 4;
      const a0 = img.px[i + 3] / 255;
      const a = alfa + a0 * (1 - alfa);
      if (a === 0) continue;
      img.px[i] = Math.round((r * alfa + img.px[i] * a0 * (1 - alfa)) / a);
      img.px[i + 1] = Math.round((g * alfa + img.px[i + 1] * a0 * (1 - alfa)) / a);
      img.px[i + 2] = Math.round((b * alfa + img.px[i + 2] * a0 * (1 - alfa)) / a);
      img.px[i + 3] = Math.round(a * 255);
    }
  }
}
function texto(img, lineas, x, y, escala, color, hueco = 0) {
  const { celdas: lista } = celdas(lineas);
  for (const c of lista) {
    const col = c.c === '#' ? color : COLORES_HOJA[c.c];
    rect(img, x + c.x * escala, y + c.y * escala, escala - hueco, escala - hueco, col);
  }
}

// --------------------------------------------------------------- piezas
const FONDO = '#c9c6be';
const TEXTO = '#1c1c1a';
const LIMA = '#3c6a4e';

function favicon(tam) {
  const img = lienzo(tam, tam);
  const escala = Math.floor(tam / 8);
  const off = Math.floor((tam - escala * 7) / 2);
  texto(img, ['@'], off, off, escala, LIMA);
  return png(img);
}

function appleIcon() {
  const img = lienzo(180, 180, FONDO);
  texto(img, ['@'], 20, 20, 20, LIMA);
  return png(img);
}

function og() {
  const W = 1200;
  const H = 630;
  const img = lienzo(W, H, FONDO);
  // rejilla de puntos
  for (let x = 24; x < W; x += 48) for (let y = 15; y < H; y += 48) rect(img, x - 1, y - 1, 2, 2, TEXTO, 0.14);
  // pixeles sueltos (luciérnagas)
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 60; i++) {
    const s = azar() < 0.7 ? 6 : 9;
    const col = [LIMA, '#7c9f5c', TEXTO][(azar() * 3) | 0];
    rect(img, 80 + azar() * 1040, 40 + azar() * 550, s, s, col, 0.08 + azar() * 0.25);
  }
  const esc = 20;
  texto(img, ['JUNGLE', 'PIXEL@'], 90, 110, esc, TEXTO, 2);
  texto(img, ['STUDIO'], 90 + 0, 110 + 16 * esc + 40, 8, LIMA, 1);
  texto(img, ['INDIE GAMES - COLOMBIA'], 90, 560, 3, '#4f4d47');
  return png(img);
}

function ruido() {
  const tam = 160;
  const img = lienzo(tam, tam);
  let semilla = 12345;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < tam * tam; i++) {
    const v = azar() < 0.5 ? 255 : 0;
    img.px.set([v, v, v, Math.round(azar() * 70)], i * 4);
  }
  return png(img);
}

function faviconSvg() {
  const filas = GLIFOS['@'];
  let rects = '';
  filas.forEach((fila, y) =>
    [...fila].forEach((c, x) => {
      if (c !== '.') rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${COLORES_HOJA[c]}"/>`;
    })
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 8 8" shape-rendering="crispEdges">${rects}</svg>\n`;
}

// ------------------------------------------------------------- escribir
async function guardar(rel, datos) {
  const f = path.join(SRC, rel);
  await mkdir(path.dirname(f), { recursive: true });
  await writeFile(f, datos);
  console.log('  ', rel, `${(datos.length / 1024).toFixed(1)} KB`);
}

console.log('Generando imágenes en src/:');
await guardar('raiz/favicon.ico', ico([{ tam: 16, datos: favicon(16) }, { tam: 32, datos: favicon(32) }, { tam: 48, datos: favicon(48) }]));
await guardar('raiz/favicon.svg', faviconSvg());
await guardar('raiz/apple-touch-icon.png', appleIcon());
await guardar('assets/img/og.png', og());
console.log('Listo.');
