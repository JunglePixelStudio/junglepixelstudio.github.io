// Servidor local para ver la web antes de publicarla.
// Uso:  npm run servidor   → abre http://localhost:4173
// Sirve la carpeta docs/ tal como lo hará GitHub Pages (incluida la página 404).

import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Carpeta a servir: docs/ por defecto, o la que se pase como 2.º argumento (p. ej. demo).
const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', process.argv[3] || 'docs');
const PUERTO = Number(process.env.PORT || process.argv[2] || 4173);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};

async function archivo(ruta) {
  try {
    const s = await stat(ruta);
    if (s.isDirectory()) return archivo(path.join(ruta, 'index.html'));
    return ruta;
  } catch {
    return null;
  }
}

http
  .createServer(async (req, res) => {
    let pedido;
    try {
      pedido = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    // Evita salir de docs/ con rutas tipo /../../
    const destino = path.resolve(RAIZ, '.' + path.posix.normalize(pedido));
    if (!destino.startsWith(RAIZ)) {
      res.writeHead(403).end();
      return;
    }
    let f = await archivo(destino);
    let estado = 200;
    if (!f) {
      f = path.join(RAIZ, '404.html');
      estado = 404;
    }
    try {
      const datos = await readFile(f);
      res.writeHead(estado, {
        'Content-Type': TIPOS[path.extname(f).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(datos);
    } catch {
      res.writeHead(500).end();
    }
  })
  .listen(PUERTO, () => console.log(`Web en http://localhost:${PUERTO}  (Ctrl+C para parar)`));
