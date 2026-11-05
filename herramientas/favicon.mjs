// Junta src/raiz/favicon-16.png, -32.png y -48.png en src/raiz/favicon.ico.
// Las PNG las genera el taller de imágenes (npm run taller).
// Uso:  npm run favicon

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'raiz');
const TAMANOS = [16, 32, 48];

const pngs = await Promise.all(TAMANOS.map(async (t) => ({ t, datos: await readFile(path.join(RAIZ, `favicon-${t}.png`)) })));
const cab = Buffer.alloc(6 + 16 * pngs.length);
cab.writeUInt16LE(0, 0);
cab.writeUInt16LE(1, 2);
cab.writeUInt16LE(pngs.length, 4);
let offset = cab.length;
pngs.forEach(({ t, datos }, i) => {
  const o = 6 + i * 16;
  cab[o] = t;
  cab[o + 1] = t;
  cab.writeUInt16LE(1, o + 4);
  cab.writeUInt16LE(32, o + 6);
  cab.writeUInt32LE(datos.length, o + 8);
  cab.writeUInt32LE(offset, o + 12);
  offset += datos.length;
});
await writeFile(path.join(RAIZ, 'favicon.ico'), Buffer.concat([cab, ...pngs.map((p) => p.datos)]));
console.log('favicon.ico listo');
