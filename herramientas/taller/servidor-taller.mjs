// Taller de imágenes: genera con el navegador las versiones del logotipo,
// los iconos y la imagen para redes a partir de src/marca/logo-original.webp.
//
// Uso:  npm run taller   → abre http://localhost:4175/herramientas/taller/
// La página dibuja todo con <canvas> y lo guarda en src/ a través de este servidor.
// Solo escucha en tu propio equipo (127.0.0.1) y solo puede escribir imágenes dentro de src/.

import http from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = path.join(RAIZ, 'src');
const PUERTO = Number(process.argv[2] || 4175);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
};

function dentro(base, destino) {
  const rel = path.relative(base, destino);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

async function leerCuerpo(req, limite = 8 * 1024 * 1024) {
  const trozos = [];
  let total = 0;
  for await (const t of req) {
    total += t.length;
    if (total > limite) throw new Error('demasiado grande');
    trozos.push(t);
  }
  return Buffer.concat(trozos);
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'POST' && url.pathname === '/guardar') {
        const ruta = url.searchParams.get('ruta') || '';
        const destino = path.resolve(RAIZ, ruta);
        if (!dentro(SRC, destino) || !/\.(png|webp)$/i.test(destino)) {
          res.writeHead(403).end('ruta no permitida');
          return;
        }
        const datos = await leerCuerpo(req);
        await mkdir(path.dirname(destino), { recursive: true });
        await writeFile(destino, datos);
        console.log('guardado', ruta, `${(datos.length / 1024).toFixed(1)} KB`);
        res.writeHead(200).end('ok');
        return;
      }
      let pedido = decodeURIComponent(url.pathname);
      if (pedido.endsWith('/')) pedido += 'index.html';
      const destino = path.resolve(RAIZ, '.' + path.posix.normalize(pedido));
      if (!dentro(RAIZ, destino)) {
        res.writeHead(403).end();
        return;
      }
      await stat(destino);
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(destino).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(await readFile(destino));
    } catch {
      res.writeHead(404).end();
    }
  })
  .listen(PUERTO, '127.0.0.1', () => console.log(`Taller en http://localhost:${PUERTO}/herramientas/taller/`));
