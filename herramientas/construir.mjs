// Genera la web publicable en docs/ a partir de src/.
// Uso:  npm run construir   (o: node herramientas/construir.mjs)
// No necesita dependencias: solo Node 18 o superior.

import { readFile, writeFile, mkdir, rm, cp, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sitio, juegos, tiposEnlace, paginas, textos } from '../src/sitio.mjs';
import { svgPixel } from '../src/pixelfont.mjs';
import { svgBosque, svgBordeBosque } from '../src/bosque.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(RAIZ, 'src');
const IDIOMAS = ['es', 'en'];

const OUT = path.join(RAIZ, 'docs');

// Versión de los estilos y scripts: cambia cuando cambian, así los navegadores
// nunca mezclan una página nueva con un archivo viejo guardado en caché.
const V = createHash('sha256')
  .update(await readFile(path.join(SRC, 'assets/css/main.css')))
  .update(await readFile(path.join(SRC, 'assets/js/main.js')))
  .update(await readFile(path.join(SRC, 'assets/js/early.js')))
  .digest('hex')
  .slice(0, 10);

// ---------------------------------------------------------------- utilidades
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const profundidad = (ruta) => ruta.split('/').length - 1;
const prefijo = (ruta) => '../'.repeat(profundidad(ruta));
const sinIndex = (ruta) => ruta.replace(/(^|\/)index\.html$/, '$1');

/** Enlace relativo desde la página `desde` a la ruta `hacia` (con #ancla opcional). */
function enlace(desde, hacia, ancla = '') {
  if (sinIndex(desde) === sinIndex(hacia) && ancla) return ancla;
  let href = prefijo(desde) + sinIndex(hacia);
  if (href === '') href = './';
  return href + ancla;
}

const absoluta = (ruta) => `${sitio.url}/${sinIndex(ruta)}`;
const pagina = (id) => paginas.find((p) => p.id === id);
const legales = paginas.filter((p) => p.tipo === 'legal');

const CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'none'",
  "manifest-src 'self'",
  "media-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

// ------------------------------------------------------------- piezas comunes
function correo(lang, desde, clase = '') {
  const [u, d] = sitio.correo.split('@');
  const href = enlace(desde, pagina('inicio')[lang].ruta, '#contacto');
  return `<a class="email js-email ${clase}" href="${href}" data-u="${esc(u)}" data-d="${esc(d)}">${esc(u)}<span class="email__at"> ${textos[lang].arroba} </span>${esc(d)}</a>`;
}

function enlacesRedes(clase) {
  return sitio.redes
    .map((r) => `<li><a class="${clase}" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer me">${esc(r.nombre)}<span class="sr-only"> (Jungle Pixel Studio)</span></a></li>`)
    .join('');
}

/** Bloque "Síguenos" con botones (contacto). */
function redes(lang) {
  if (!sitio.redes.length) return '';
  return `<div class="social"><p class="social__title">${lang === 'es' ? 'Síguenos' : 'Follow us'}</p><ul class="social__list">${enlacesRedes('social__link')}</ul></div>`;
}

/** Lista sencilla para el pie. */
function redesPie(lang) {
  if (!sitio.redes.length) return '';
  return `<p class="eyebrow footer__social-title">${lang === 'es' ? 'Síguenos' : 'Follow us'}</p><ul class="footer__social">${enlacesRedes('')}</ul>`;
}

function titular(lang) {
  const t = sitio.titular;
  const filas = [];
  if (lang === 'es') {
    filas.push(['Nombre comercial', 'Jungle Pixel Studio']);
    if (t.nombre) filas.push(['Responsable', esc(t.nombre)]);
    filas.push(['Naturaleza', 'Desarrollador independiente (persona natural) que publica bajo el nombre comercial Jungle Pixel Studio']);
    filas.push(['Domicilio', t.ciudad ? `${esc(t.ciudad)}, Colombia` : 'Colombia']);
  } else {
    filas.push(['Trade name', 'Jungle Pixel Studio']);
    if (t.nombre) filas.push(['Controller', esc(t.nombre)]);
    filas.push(['Nature', 'Independent developer (natural person) publishing under the trade name Jungle Pixel Studio']);
    filas.push(['Location', t.ciudad ? `${esc(t.ciudad)}, Colombia` : 'Colombia']);
  }
  return filas;
}

function bloqueTitular(lang, desde) {
  const filas = titular(lang);
  filas.push([lang === 'es' ? 'Correo electrónico' : 'Email', correo(lang, desde)]);
  filas.push([lang === 'es' ? 'Sitio web' : 'Website', `<a href="${sitio.url}/">${sitio.url.replace(/^https?:\/\//, '')}</a>`]);
  return `<dl class="data-list">${filas.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
}

function tarjetaJuego(j, lang, desde) {
  const t = (o) => (typeof o === 'string' ? o : o[lang]);
  const etiquetas =
    (j.etiquetas?.[lang] ?? []).map((e) => `<li class="chip">${esc(e)}</li>`).join('') +
    (j.plataformas ? `<li class="chip chip--plat">${esc(j.plataformas)}</li>` : '');
  let portada;
  if (j.secreto) {
    portada = `<div class="secret" aria-hidden="true">${svgBosque(undefined, 'mini-forest')}${svgPixel(['?'], { clase: 'pixel secret__glyph' })}<span class="secret__label">${lang === 'es' ? 'Sin anunciar' : 'Unannounced'}</span></div>`;
  } else {
    portada = `<img src="${prefijo(desde)}${esc(j.imagen)}" alt="${esc(t(j.imagenAlt ?? j.titulo))}" width="756" height="600" loading="lazy" decoding="async">`;
  }
  const enlaces = (j.enlaces ?? [])
    .map(
      (e, i) =>
        `<a class="btn btn--small ${i === 0 ? 'btn--primary' : 'btn--ghost'}" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(tiposEnlace[e.tipo]?.[lang] ?? e.texto?.[lang] ?? e.url)}</span><span class="sr-only"> — ${esc(t(j.titulo))}</span><span class="btn__arrow" aria-hidden="true">↗</span></a>`
    )
    .join('');
  const pie = enlaces
    ? `<div class="game-card__links">${enlaces}</div>`
    : `<p class="game-card__soon"><span class="dot" aria-hidden="true"></span>${lang === 'es' ? 'Anuncio muy pronto' : 'Announcement coming soon'}</p>`;
  const ancha = juegos.length === 1 ? ' game-card--wide' : '';
  return `<article class="game-card${ancha}" data-tilt data-reveal>
  <div class="game-card__cover">${portada}<span class="game-card__glare" aria-hidden="true"></span></div>
  <div class="game-card__body">
    <p class="game-card__status"><span class="dot dot--live" aria-hidden="true"></span>${esc(t(j.estado))}</p>
    <h3 class="game-card__title">${esc(t(j.titulo))}</h3>
    <p class="game-card__text">${esc(t(j.descripcion))}</p>
    ${etiquetas ? `<ul class="chips">${etiquetas}</ul>` : ''}
    ${pie}
  </div>
</article>`;
}

// Logotipo + nombre (cabecera y 404)
function marca(r) {
  return `<img class="brand__logo" src="${r}assets/img/logo/logo-160.webp" width="160" height="160" alt="" decoding="async"><span class="brand__name">Jungle Pixel<small>Studio</small></span>`;
}

// ---------------------------------------------------------------- plantilla
function cabecera(p, lang) {
  const t = textos[lang];
  const ruta = p[lang].ruta;
  const otro = lang === 'es' ? 'en' : 'es';
  const inicio = pagina('inicio')[lang].ruta;
  const nav = ['juegos', 'estudio', 'contacto']
    .map((k) => `<li><a href="${enlace(ruta, inicio, '#' + k)}" data-magnetic>${t.nav[k]}</a></li>`)
    .join('');
  const navMovil = ['juegos', 'estudio', 'contacto']
    .map((k, i) => `<li><a href="${enlace(ruta, inicio, '#' + k)}"><span class="menu-movil__num">0${i + 1}</span>${t.nav[k]}</a></li>`)
    .join('');
  const idiomas = `<div class="lang" role="group" aria-label="${t.idioma}">
        <a href="${enlace(ruta, pagina(p.id).es.ruta)}" hreflang="es" lang="es"${lang === 'es' ? ' aria-current="true"' : ''}>ES</a>
        <span aria-hidden="true">/</span>
        <a href="${enlace(ruta, pagina(p.id).en.ruta)}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a>
      </div>`;
  return `<a class="skip" href="#contenido">${t.saltar}</a>
<div class="progress" aria-hidden="true"><span data-progress></span></div>
<header class="site-header" data-header>
  <div class="container site-header__inner">
    <a class="brand" href="${enlace(ruta, inicio)}" aria-label="Jungle Pixel Studio — ${t.inicio}">${marca(prefijo(ruta))}</a>
    <nav class="nav" aria-label="${lang === 'es' ? 'Principal' : 'Main'}"><ul>${nav}</ul></nav>
    ${idiomas}
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-movil" data-menu-toggle>
      <span class="menu-toggle__label" data-open="${t.menu}" data-close="${t.cerrar}">${t.menu}</span>
      <span class="menu-toggle__icon" aria-hidden="true"><i></i><i></i></span>
    </button>
  </div>
</header>
<div class="menu-movil" id="menu-movil" data-menu hidden>
  <nav aria-label="${lang === 'es' ? 'Menú móvil' : 'Mobile menu'}"><ul>${navMovil}</ul></nav>
  <p class="menu-movil__lang"><a href="${enlace(ruta, pagina(p.id)[otro].ruta)}" hreflang="${otro}" lang="${otro}">${t.idiomaOtro}</a></p>
</div>`;
}

function pie(p, lang) {
  const t = textos[lang];
  const ruta = p[lang].ruta;
  const links = legales
    .map((l) => `<li><a href="${enlace(ruta, l[lang].ruta)}"${l.id === p.id ? ' aria-current="page"' : ''}>${l[lang].corto}</a></li>`)
    .join('');
  return `<footer class="site-footer">
  ${svgBordeBosque()}
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <img class="footer__logo" src="${prefijo(ruta)}assets/img/logo/logo-160.webp" width="160" height="160" alt="" loading="lazy" decoding="async">
        <p><strong>Jungle Pixel Studio™</strong><br>${t.lema}<br>${t.hecho}</p>
      </div>
      <nav class="footer__col" aria-label="${t.legal}">
        <p class="eyebrow">${t.legal}</p>
        <ul class="footer__list">${links}</ul>
      </nav>
      <div class="footer__col">
        <p class="eyebrow">${t.contacto}</p>
        <p>${correo(lang, ruta)}</p>
        ${redesPie(lang)}
      </div>
    </div>
    <div class="footer__big" data-reveal>${svgPixel(['JUNGLE PIXEL'], { clase: 'pixel pixel--footer' })}</div>
    <div class="footer__bottom">
      <p>© <span data-year>2026</span> Jungle Pixel Studio. ${t.derechos} ${t.marcas}</p>
      <a class="to-top" href="#top" data-magnetic>${t.arriba} <span aria-hidden="true">↑</span></a>
    </div>
  </div>
</footer>`;
}

function head(p, lang, extra = '') {
  const datos = p[lang];
  const r = prefijo(datos.ruta);
  const alt = (l) => absoluta(p[l].ruta);
  const og = `${sitio.url}/assets/img/og.png`;
  return `<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(datos.titulo)}${p.tipo === 'legal' ? ' — Jungle Pixel Studio' : ''}</title>
<meta name="description" content="${esc(datos.descripcion)}">
<meta name="author" content="Jungle Pixel Studio">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#d6dcc8">
<link rel="canonical" href="${absoluta(datos.ruta)}">
<link rel="alternate" hreflang="es" href="${alt('es')}">
<link rel="alternate" hreflang="en" href="${alt('en')}">
<link rel="alternate" hreflang="x-default" href="${alt('es')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Jungle Pixel Studio">
<meta property="og:title" content="${esc(datos.titulo)}">
<meta property="og:description" content="${esc(datos.descripcion)}">
<meta property="og:url" content="${absoluta(datos.ruta)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Jungle Pixel Studio">
<meta property="og:locale" content="${lang === 'es' ? 'es_CO' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="${r}favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="${r}apple-touch-icon.png">
<link rel="preload" href="${r}assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${r}assets/fonts/nunito.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${r}assets/css/main.css?v=${V}">
<script src="${r}assets/js/early.js?v=${V}"></script>
<script type="module" src="${r}assets/js/main.js?v=${V}"></script>
${extra}</head>`;
}

function documento(p, lang, main, extraHead = '') {
  const clase = p.tipo === 'legal' ? 'page-legal' : 'page-home';
  return `<!doctype html>
<html lang="${lang}" class="no-js">
${head(p, lang, extraHead)}
<body class="${clase}" id="top">
${cabecera(p, lang)}
${main}
${pie(p, lang)}
<p class="sr-only" aria-live="polite" data-live></p>
</body>
</html>
`;
}

// ---------------------------------------------------------- tokens de texto
function reemplazar(html, lang, ruta) {
  return html
    .replace(/\{\{correo\}\}/g, () => correo(lang, ruta))
    .replace(/\{\{correo-grande\}\}/g, () => correo(lang, ruta, 'email--big'))
    .replace(/\{\{titular\}\}/g, () => bloqueTitular(lang, ruta))
    .replace(/\{\{redes\}\}/g, () => redes(lang))
    .replace(/\{\{fecha\}\}/g, () => sitio.fechaLegal[lang])
    .replace(/\{\{url\}\}/g, () => sitio.url)
    .replace(/\{\{dominio\}\}/g, () => sitio.url.replace(/^https?:\/\//, ''))
    .replace(/\{\{raiz\}\}/g, () => prefijo(ruta))
    .replace(/\{\{juegos\}\}/g, () => juegos.map((j) => tarjetaJuego(j, lang, ruta)).join('\n'))
    .replace(/\{\{numJuegos\}\}/g, () => String(juegos.length).padStart(2, '0'))
    .replace(/\{\{hero\}\}/g, () => svgPixel(['JUNGLE', 'PIXEL@'], { clase: 'pixel pixel--hero' }))
    .replace(/\{\{bosque\}\}/g, () => svgBosque())
    .replace(/\{\{icono:([^}]+)\}\}/g, (_, ch) => svgPixel([ch], { clase: 'pixel-icon', hueco: 0, nitido: true }))
    .replace(/\{\{logo-portada\}\}/g, () => `<div class="hero__logo" data-hero-logo><img src="${prefijo(ruta)}assets/img/logo/logo-480.webp" width="480" height="480" alt="${lang === 'es' ? 'Logotipo de Jungle Pixel Studio: un mono con un mando entre hojas de la jungla' : 'Jungle Pixel Studio logo: a monkey holding a game controller among jungle leaves'}" fetchpriority="high" decoding="async"></div>`)
    .replace(/\{\{logo-sello\}\}/g, () => `<img src="${prefijo(ruta)}assets/img/logo/logo-160.webp" width="160" height="160" alt="" loading="lazy" decoding="async">`)
    .replace(/\{\{hoja\}\}/g, () => svgPixel(['@'], { clase: 'pixel-icon pixel-icon--leaf', hueco: 0, nitido: true }))
    .replace(/\{\{claseJuegos\}\}/g, () => (juegos.length > 1 ? 'games__grid--many' : 'games__grid--one'))
    .replace(/\{\{pixel:([^}]+)\}\}/g, (_, txt) => svgPixel([txt], { clase: 'pixel pixel--title' }))
    .replace(/\{\{enlace:([a-z0-9-]+)(#[a-z0-9-]+)?\}\}/g, (_, id, ancla = '') => {
      const destino = pagina(id);
      if (!destino) throw new Error(`Enlace a página desconocida: ${id}`);
      return enlace(ruta, destino[lang].ruta, ancla);
    });
}

function paginaLegal(p, lang, cuerpo) {
  const t = textos[lang];
  const ruta = p[lang].ruta;
  const indice = [...cuerpo.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)]
    .map((m) => `<li><a href="#${m[1]}">${m[2]}</a></li>`)
    .join('');
  const docs = legales
    .map((l) => `<li><a href="${enlace(ruta, l[lang].ruta)}"${l.id === p.id ? ' aria-current="page"' : ''}>${l[lang].corto}</a></li>`)
    .join('');
  return `<main id="contenido" class="legal">
  <div class="container legal__grid">
    <aside class="legal__aside">
      <details class="toc" open data-toc>
        <summary>${t.enEstaPagina}</summary>
        <ol>${indice}</ol>
      </details>
      <nav class="legal__docs" aria-label="${t.documentos}">
        <p class="eyebrow">${t.documentos}</p>
        <ul>${docs}</ul>
      </nav>
    </aside>
    <article class="legal__article prose">
      <p class="eyebrow">${t.legal}</p>
      <h1>${esc(p[lang].titulo)}</h1>
      <p class="legal__meta">${t.actualizado}: <time datetime="${sitio.fechaLegal.iso}">${sitio.fechaLegal[lang]}</time></p>
      ${cuerpo}
    </article>
  </div>
</main>`;
}

function jsonLd() {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jungle Pixel Studio',
    url: `${sitio.url}/`,
    logo: `${sitio.url}/assets/img/logo/logo-512.png`,
    email: sitio.correo,
    description: 'Independent video game studio from Colombia and Venezuela.',
    address: { '@type': 'PostalAddress', addressCountry: 'CO' },
    sameAs: sitio.redes.map((r) => r.url),
  };
  return `<script type="application/ld+json">${JSON.stringify(datos).replace(/</g, '\\u003c')}</script>\n`;
}

// --------------------------------------------------------- archivos sueltos
function pagina404() {
  return `<!doctype html>
<html lang="es" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#d6dcc8">
<title>404 — Jungle Pixel Studio</title>
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
<link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=${V}">
<script src="/assets/js/early.js?v=${V}"></script>
<script type="module" src="/assets/js/main.js?v=${V}"></script>
</head>
<body class="page-404" id="top">
<main id="contenido" class="not-found">
  <div class="container not-found__inner">
    <a class="brand" href="/" aria-label="Jungle Pixel Studio">${marca('/')}</a>
    <h1 class="not-found__title"><span class="sr-only">404</span>${svgPixel(['404'], { clase: 'pixel pixel--title pixel--404' })}</h1>
    <p class="not-found__text" lang="es">Esta página se perdió en la jungla.</p>
    <p class="not-found__text not-found__text--en" lang="en">This page got lost in the jungle.</p>
    <div class="not-found__actions">
      <a class="btn btn--primary" href="/" data-magnetic><span>Volver al inicio</span></a>
      <a class="btn btn--ghost" href="/en/" lang="en" data-magnetic><span>Back to home</span></a>
    </div>
  </div>
</main>
<div class="not-found__forest">${svgBosque()}</div>
</body>
</html>
`;
}

function sitemap() {
  const urls = paginas
    .flatMap((p) =>
      IDIOMAS.map(
        (lang) => `  <url>
    <loc>${absoluta(p[lang].ruta)}</loc>
    <lastmod>${sitio.fechaLegal.iso}</lastmod>
${IDIOMAS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluta(p[l].ruta)}"/>`).join('\n')}
  </url>`
      )
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function robots() {
  // Bloquea los rastreadores conocidos que recopilan contenido para entrenar IA.
  // Los buscadores normales (Google, Bing, DuckDuckGo…) sí pueden indexar la web.
  const ia = ['GPTBot', 'ChatGPT-User', 'CCBot', 'Google-Extended', 'anthropic-ai', 'ClaudeBot', 'Claude-Web', 'Bytespider', 'PerplexityBot', 'Applebot-Extended', 'meta-externalagent', 'Diffbot', 'omgili', 'Amazonbot', 'cohere-ai'];
  return `# Jungle Pixel Studio
${ia.map((b) => `User-agent: ${b}\nDisallow: /`).join('\n\n')}

User-agent: *
Allow: /

Sitemap: ${sitio.url}/sitemap.xml
`;
}

function securityTxt() {
  const fecha = new Date(sitio.fechaLegal.iso + 'T00:00:00Z');
  fecha.setUTCDate(fecha.getUTCDate() + 360);
  return `# Jungle Pixel Studio — política: ${sitio.url}/legal/seguridad.html
Contact: mailto:${sitio.correo}
Expires: ${fecha.toISOString()}
Preferred-Languages: es, en
Canonical: ${sitio.url}/.well-known/security.txt
Policy: ${sitio.url}/legal/seguridad.html
Policy: ${sitio.url}/en/legal/security.html
`;
}

// ---------------------------------------------------------------- principal
async function existe(f) {
  try {
    await access(f);
    return true;
  } catch {
    return false;
  }
}

async function escribir(rel, contenido) {
  const destino = path.join(OUT, rel);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, contenido, 'utf8');
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await cp(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });
  if (await existe(path.join(SRC, 'raiz'))) await cp(path.join(SRC, 'raiz'), OUT, { recursive: true });

  let n = 0;
  for (const p of paginas) {
    for (const lang of IDIOMAS) {
      const ruta = p[lang].ruta;
      const fuente = path.join(SRC, 'paginas', `${p.id}.${lang}.html`);
      let cuerpo = reemplazar(await readFile(fuente, 'utf8'), lang, ruta);
      let html;
      if (p.tipo === 'legal') {
        html = documento(p, lang, paginaLegal(p, lang, cuerpo));
      } else {
        html = documento(p, lang, `<main id="contenido">\n${cuerpo}\n</main>`, jsonLd());
      }
      if (/\{\{[^}]+\}\}/.test(html)) throw new Error(`Quedó un {{token}} sin reemplazar en ${ruta}`);
      await escribir(ruta, html);
      n++;
    }
  }

  await escribir('404.html', pagina404());
  await escribir('sitemap.xml', sitemap());
  await escribir('robots.txt', robots());
  await escribir('.well-known/security.txt', securityTxt());
  await escribir('.nojekyll', '');
  if (sitio.dominioPropio) await escribir('CNAME', sitio.dominioPropio + '\n');

  console.log(`Listo: ${n} páginas + 404, sitemap, robots y security.txt en docs/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
