# Jungle Pixel Studio — web oficial

Web del estudio, en español e inglés, publicada gratis con GitHub Pages en
**https://junglepixelstudio.github.io**.

- Hecha a mano: HTML, CSS y JavaScript propios, **sin dependencias ni servicios de terceros**.
- Efectos: título de pixeles que se aparta del ratón y se deshace al hacer scroll, cursor de mira,
  tarjetas que se inclinan, botones imán, manifiesto que se ilumina palabra a palabra, sección de
  proceso en horizontal y marquesina que acelera con el scroll. Todo se apaga si el sistema tiene
  activado "reducir movimiento".
- Páginas legales (ES/EN): aviso legal y términos, privacidad (Ley 1581 de 2012), cookies,
  propiedad intelectual, creadores de contenido y seguridad.

> Los textos legales son una base cuidada y adaptada a Colombia, pero **no son asesoría jurídica**.
> Si un día vendes directamente desde la web, recoges datos (boletín, formularios) o firmas con un
> publisher, conviene que un abogado los revise.

## Estructura

```
src/                 ← lo que se edita
  sitio.mjs          ← configuración: correo, juegos, redes, textos, páginas
  paginas/           ← contenido de cada página (ES y EN)
  assets/css, js     ← estilos y efectos
  assets/img/        ← imágenes (pon aquí las de los juegos, en img/juegos/)
  raiz/              ← favicon e icono de iPhone
  pixelfont.mjs      ← tipografía de pixeles propia y la hoja del logo
herramientas/        ← scripts para construir, generar imágenes y probar en local
docs/                ← la web generada: ES LO QUE PUBLICA GITHUB PAGES (no editar a mano)
```

## Cómo hacer cambios

Hace falta [Node.js](https://nodejs.org) 18 o superior (ya lo tienes instalado).

1. Edita lo que quieras en `src/` (por ejemplo, añade un juego en `src/sitio.mjs`).
2. Construye la web:
   ```bash
   npm run construir
   ```
3. Mírala en local en http://localhost:4173:
   ```bash
   npm run servidor
   ```
4. Sube los cambios:
   ```bash
   git add -A
   git commit -m "Describe el cambio"
   git push
   ```
   GitHub Pages la actualiza sola en uno o dos minutos.

Si cambias el logo o la tipografía de pixeles, regenera también las imágenes con `npm run imagenes`.

### Añadir un juego

En `src/sitio.mjs`, dentro de `juegos`, hay un ejemplo comentado. Copia el bloque, rellénalo,
pon la imagen (16:9, unos 1280×720, en JPG o WebP) en `src/assets/img/juegos/` y construye.
Los tipos de enlace disponibles son `steam`, `wishlist`, `itch`, `trailer`, `presskit` y `web`.

### Redes sociales

Añádelas en `sitio.redes` (por ejemplo `{ nombre: 'YouTube', url: 'https://www.youtube.com/@...' }`).
Aparecen solas en el contacto, el pie y los datos estructurados para Google.

## Publicación en GitHub Pages

- Repositorio: `junglepixelstudio/junglepixelstudio.github.io` (público; es obligatorio para Pages gratis).
- Settings → Pages → **Deploy from a branch** → rama `main`, carpeta **`/docs`**.
- Settings → Pages → **Enforce HTTPS** activado.

### Dominio propio (cuando quieras)

1. Cómpralo en un registrador sin sobreprecio al renovar (Cloudflare Registrar o Porkbun, unos 10–12 USD/año el `.com`).
2. En `src/sitio.mjs` pon `url: 'https://tudominio.com'` y `dominioPropio: 'tudominio.com'`, y construye.
3. En el DNS del dominio crea:
   - registros `A` para `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - registros `AAAA` para `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - registro `CNAME` para `www` → `junglepixelstudio.github.io`
4. **Verifica el dominio** en la organización de GitHub (Settings → Pages → Add a domain). Así nadie
   puede secuestrarlo para su propia web de GitHub Pages.
5. En el registrador activa el bloqueo de transferencia, la verificación en dos pasos y DNSSEC.

## Seguridad

Lo que ya hace la web:

- Sitio estático: sin servidor, base de datos ni formularios que atacar.
- Política de seguridad de contenidos (CSP) que solo permite el código de la propia web.
- Ningún script, fuente ni rastreador de terceros; sin cookies.
- Se niega a mostrarse dentro de iframes ajenos (anti-clickjacking).
- El correo se monta con JavaScript para que los robots de spam no lo lean del HTML.
- `/.well-known/security.txt` (RFC 9116) para recibir avisos de vulnerabilidades.
- `robots.txt` bloquea los rastreadores conocidos que recogen contenido para entrenar IA
  (si prefieres aparecer en buscadores con IA, quita esos bloques en `herramientas/construir.mjs`).

Lo que depende de ti (es lo más importante: si entran en tu cuenta, pueden cambiar la web):

- [ ] Verificación en dos pasos en **GitHub** y en el **Gmail** del estudio.
- [ ] Guardar los códigos de recuperación de GitHub en un lugar seguro.
- [ ] En la organización: Settings → Authentication security → **Require two-factor authentication**.
- [ ] No subir nunca contraseñas, claves ni archivos `.env` al repositorio (el `.gitignore` ya los excluye).
- [ ] Revisar de vez en cuando Settings → Security log por si hay accesos raros.

## Pendientes legales recomendados

- Si quieres una identificación completa en el aviso legal, rellena `sitio.titular` (nombre y ciudad).
- Registrar los juegos en la Dirección Nacional de Derecho de Autor (gratis y en línea) da una prueba
  fechada de autoría.
- Registrar la marca "Jungle Pixel Studio" ante la Superintendencia de Industria y Comercio (de pago)
  cuando haya presupuesto; hasta entonces se usa ™, nunca ®.

---

© Jungle Pixel Studio. Todos los derechos reservados. El código de esta web es público para que
GitHub Pages pueda servirlo, pero no se concede licencia para reutilizarlo.
