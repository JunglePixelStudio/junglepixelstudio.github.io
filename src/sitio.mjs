// ============================================================================
//  CONFIGURACIÓN DE LA WEB DE JUNGLE PIXEL STUDIO
//  Casi todo lo que querrás cambiar está aquí. Después de editar, ejecuta:
//      npm run construir
//  y la carpeta docs/ (la que publica GitHub Pages) se regenera sola.
// ============================================================================

export const sitio = {
  nombre: 'Jungle Pixel Studio',

  // Dirección pública de la web, sin barra al final.
  // Si cambias el nombre de la organización de GitHub o compras un dominio, cámbiala aquí.
  url: 'https://junglepixelstudio.github.io',

  // Si compras un dominio (p. ej. 'junglepixelstudio.com'), ponlo aquí y en "url":
  // se generará el archivo CNAME que necesita GitHub Pages.
  dominioPropio: '',

  correo: 'junglepixel2024@gmail.com',

  // Datos del titular para los textos legales. Opcionales: si los rellenas, aparecen en el aviso legal
  // y en la política de privacidad (recomendable si algún día recoges datos con formularios o boletines).
  titular: {
    nombre: '', // p. ej. 'Nombre Apellido'
    ciudad: '', // p. ej. 'Medellín'
  },

  // Fecha de la última revisión de los textos legales.
  fechaLegal: { iso: '2026-11-04', es: '4 de noviembre de 2026', en: 'November 4, 2026' },

  // Redes sociales del estudio. Se muestran en el contacto, en el pie y en los datos para Google.
  redes: [
    { nombre: 'itch.io', url: 'https://enmanuel-gutierrez.itch.io/' },
    { nombre: 'LinkedIn', url: 'https://www.linkedin.com/company/jungle-pixel-studio/' },
    { nombre: 'X', url: 'https://x.com/_JunglePixel' },
    { nombre: 'Instagram', url: 'https://www.instagram.com/junglepixelstudio_/' },
    { nombre: 'TikTok', url: 'https://www.tiktok.com/@jungle_pixel_studio' },
    { nombre: 'YouTube', url: 'https://www.youtube.com/@JunglePixelStudio' },
  ],
};

// ----------------------------------------------------------------------------
//  JUEGOS (en el orden en que aparecen en la portada)
//  Para añadir uno, copia un bloque, cambia los datos y pon su portada en
//  src/assets/img/juegos/ (WebP de 756x600; el taller las genera: npm run taller
//  y abre /herramientas/taller/portadas.html).
//  Tipos de enlace: itch, googleplay, crazygames, steam, wishlist, trailer, presskit, web.
// ----------------------------------------------------------------------------
const accesoAnticipado = { es: 'Acceso anticipado', en: 'Early access' };
const disponible = { es: 'Disponible', en: 'Out now' };

export const juegos = [
  {
    id: 'hoard-sweeper',
    titulo: 'Hoard Sweeper',
    estado: accesoAnticipado,
    etiquetas: { es: ['Acogedor', 'Idle', 'Cooperativo'], en: ['Cozy', 'Idle', 'Co-op'] },
    plataformas: 'Web · Windows',
    descripcion: {
      es: 'Aspira, ordena y cuenta el tesoro de un dragón: ¡100.000 riquezas te esperan!',
      en: "Vacuum, sort and count down a dragon's hoard of 100,000 treasures.",
    },
    imagen: 'assets/img/juegos/hoard-sweeper.webp',
    enlaces: [{ tipo: 'itch', url: 'https://enmanuel-gutierrez.itch.io/hoard-sweeper' }],
  },
  {
    id: 'trick-or-treat-at-3am',
    titulo: 'Trick or Treat at 3AM',
    estado: accesoAnticipado,
    etiquetas: { es: ['Terror', 'Halloween', 'Primera persona'], en: ['Horror', 'Halloween', 'First person'] },
    plataformas: 'Web · Windows',
    descripcion: {
      es: 'Son las 3 AM de Halloween. Alguien llama a la puerta. No todos son niños.',
      en: "It's 3 AM on Halloween. Someone is knocking. Not all of them are kids.",
    },
    imagen: 'assets/img/juegos/trick-or-treat-at-3am.webp',
    enlaces: [{ tipo: 'itch', url: 'https://enmanuel-gutierrez.itch.io/trick-or-treat-at-3am' }],
  },
  {
    id: 'puffy-merge-zoo',
    titulo: 'Puffy Merge Zoo',
    estado: disponible,
    etiquetas: { es: ['Puzle', 'Física', 'Relajante'], en: ['Puzzle', 'Physics', 'Relaxing'] },
    plataformas: 'Android',
    descripcion: {
      es: '¡Suelta y combina animalitos kawaii! El puzle de física más tierno y relajante.',
      en: 'Drop and merge kawaii animals! The cutest and most relaxing physics puzzle.',
    },
    imagen: 'assets/img/juegos/puffy-merge-zoo.webp',
    enlaces: [
      { tipo: 'googleplay', url: 'https://play.google.com/store/apps/details?id=com.JunglePixel.PuffyZoo' },
      { tipo: 'itch', url: 'https://enmanuel-gutierrez.itch.io/puffy-merge-zoo' },
    ],
  },
  {
    id: 'harbor-quest',
    titulo: 'Harbor Quest',
    estado: disponible,
    etiquetas: { es: ['Barcos', 'Simulación', 'Contrarreloj'], en: ['Boats', 'Simulation', 'Time attack'] },
    plataformas: 'Android',
    descripcion: {
      es: 'Rutas de carga contrarreloj. Transporta rápido, gana monedas y amplía tu flota.',
      en: 'Timed cargo runs. Haul fast, earn coins, and build your fleet!',
    },
    imagen: 'assets/img/juegos/harbor-quest.webp',
    enlaces: [
      { tipo: 'googleplay', url: 'https://play.google.com/store/apps/details?id=com.junglepixel.harborquest' },
      { tipo: 'itch', url: 'https://enmanuel-gutierrez.itch.io/harbor-quest' },
    ],
  },
  {
    id: 'bald-peacock',
    titulo: 'Bald Peacock',
    estado: accesoAnticipado,
    etiquetas: { es: ['Acogedor', 'Clicker', 'Divertido'], en: ['Cozy', 'Clicker', 'Funny'] },
    plataformas: 'Web · Windows',
    descripcion: {
      es: 'Aspira 150.000 plumas y devuélvele la cola a un pavo real calvo y presumido.',
      en: 'Vacuum 150,000 feathers and give a vain, bald peacock his tail back.',
    },
    imagen: 'assets/img/juegos/bald-peacock.webp',
    enlaces: [{ tipo: 'itch', url: 'https://enmanuel-gutierrez.itch.io/bald-peacock' }],
  },
  {
    id: 'bonk-the-donk',
    titulo: 'Bonk the Donk',
    estado: accesoAnticipado,
    etiquetas: { es: ['Piñatas', 'Clicker', 'Satisfactorio'], en: ['Piñatas', 'Clicker', 'Satisfying'] },
    plataformas: 'Web · Windows',
    descripcion: {
      es: 'Rompe piñatas. Aspira 1.000.000 de caramelos. Dale un buen golpe al Donk gigante.',
      en: 'Smash piñatas. Suck up 1,000,000 candies. Bonk the giant Donk.',
    },
    imagen: 'assets/img/juegos/bonk-the-donk.webp',
    enlaces: [{ tipo: 'itch', url: 'https://enmanuel-gutierrez.itch.io/bonk-the-donk' }],
  },
  {
    id: 'proximo-proyecto',
    secreto: true, // tarjeta de "proyecto sin anunciar" con un bosquecito y un "?"
    titulo: { es: 'Próximo proyecto', en: 'Next project' },
    estado: { es: 'En desarrollo', en: 'In development' },
    etiquetas: { es: ['Sin anunciar'], en: ['Unannounced'] },
    plataformas: 'PC',
    descripcion: {
      es: 'Algo más grande se está cocinando en la jungla. Muy pronto lo anunciaremos.',
      en: "Something bigger is brewing in the jungle. We'll announce it very soon.",
    },
    enlaces: [],
  },
];

// Texto de los botones de cada tipo de enlace de juego.
export const tiposEnlace = {
  steam: { es: 'Ver en Steam', en: 'View on Steam' },
  wishlist: { es: 'Añadir a la lista de deseados', en: 'Wishlist on Steam' },
  itch: { es: 'Jugar en itch.io', en: 'Play on itch.io' },
  googleplay: { es: 'Google Play', en: 'Google Play' },
  crazygames: { es: 'Jugar en CrazyGames', en: 'Play on CrazyGames' },
  trailer: { es: 'Ver tráiler', en: 'Watch trailer' },
  presskit: { es: 'Kit de prensa', en: 'Press kit' },
  web: { es: 'Web del juego', en: 'Game website' },
};

// ----------------------------------------------------------------------------
//  PÁGINAS (rutas en cada idioma; el selector ES/EN salta a la equivalente)
// ----------------------------------------------------------------------------
export const paginas = [
  {
    id: 'inicio',
    tipo: 'inicio',
    es: {
      ruta: 'index.html',
      titulo: 'Jungle Pixel Studio — Estudio independiente de videojuegos',
      descripcion:
        'Jungle Pixel Studio es un estudio independiente de videojuegos de Colombia y Venezuela. Hacemos juegos para jugar con amigos, reír cuando todo sale mal y pedir otra partida.',
    },
    en: {
      ruta: 'en/index.html',
      titulo: 'Jungle Pixel Studio — Independent game studio',
      descripcion:
        'Jungle Pixel Studio is an independent video game studio from Colombia and Venezuela. We make games to play with friends, laugh when everything goes wrong and ask for one more round.',
    },
  },
  {
    id: 'aviso-legal',
    tipo: 'legal',
    es: { ruta: 'legal/aviso-legal.html', titulo: 'Aviso legal y términos de uso', corto: 'Aviso legal', descripcion: 'Titular, condiciones de uso y ley aplicable de la web de Jungle Pixel Studio.' },
    en: { ruta: 'en/legal/legal-notice.html', titulo: 'Legal notice and terms of use', corto: 'Legal notice', descripcion: 'Owner, terms of use and governing law of the Jungle Pixel Studio website.' },
  },
  {
    id: 'privacidad',
    tipo: 'legal',
    es: { ruta: 'legal/privacidad.html', titulo: 'Política de privacidad y tratamiento de datos personales', corto: 'Privacidad', descripcion: 'Cómo trata Jungle Pixel Studio los datos personales, conforme a la Ley 1581 de 2012.' },
    en: { ruta: 'en/legal/privacy.html', titulo: 'Privacy policy', corto: 'Privacy', descripcion: 'How Jungle Pixel Studio handles personal data.' },
  },
  {
    id: 'cookies',
    tipo: 'legal',
    es: { ruta: 'legal/cookies.html', titulo: 'Política de cookies', corto: 'Cookies', descripcion: 'Esta web no usa cookies ni rastreadores. Aquí te lo explicamos.' },
    en: { ruta: 'en/legal/cookies.html', titulo: 'Cookie policy', corto: 'Cookies', descripcion: 'This website uses no cookies or trackers. Here is how.' },
  },
  {
    id: 'propiedad-intelectual',
    tipo: 'legal',
    es: { ruta: 'legal/propiedad-intelectual.html', titulo: 'Propiedad intelectual y derechos de autor', corto: 'Propiedad intelectual', descripcion: 'Derechos de autor, marcas, usos permitidos y cómo denunciar una infracción.' },
    en: { ruta: 'en/legal/intellectual-property.html', titulo: 'Intellectual property and copyright', corto: 'Intellectual property', descripcion: 'Copyright, trademarks, permitted uses and how to report an infringement.' },
  },
  {
    id: 'creadores',
    tipo: 'legal',
    es: { ruta: 'legal/creadores.html', titulo: 'Política para creadores de contenido', corto: 'Creadores de contenido', descripcion: 'Puedes hacer y monetizar vídeos y directos de nuestros juegos. Estas son las condiciones.' },
    en: { ruta: 'en/legal/content-creators.html', titulo: 'Content creator policy', corto: 'Content creators', descripcion: 'You may create and monetize videos and streams of our games. Here are the terms.' },
  },
  {
    id: 'seguridad',
    tipo: 'legal',
    es: { ruta: 'legal/seguridad.html', titulo: 'Seguridad y divulgación responsable', corto: 'Seguridad', descripcion: 'Cómo protegemos esta web y cómo reportarnos una vulnerabilidad.' },
    en: { ruta: 'en/legal/security.html', titulo: 'Security and responsible disclosure', corto: 'Security', descripcion: 'How we protect this website and how to report a vulnerability to us.' },
  },
];

// ----------------------------------------------------------------------------
//  TEXTOS DE LA INTERFAZ (cabecera, pie, botones)
// ----------------------------------------------------------------------------
export const textos = {
  es: {
    saltar: 'Saltar al contenido',
    inicio: 'Inicio',
    nav: { juegos: 'Juegos', estudio: 'Estudio', contacto: 'Contacto' },
    menu: 'Menú',
    cerrar: 'Cerrar',
    idioma: 'Idioma',
    idiomaOtro: 'English',
    lema: 'Estudio independiente de videojuegos.',
    hecho: 'Hecho a mano en Colombia, con corazón venezolano.',
    derechos: 'Todos los derechos reservados.',
    marcas: 'Jungle Pixel Studio y su logotipo son signos distintivos de su titular.',
    legal: 'Legal',
    arriba: 'Volver arriba',
    copiar: 'Copiar correo',
    copiado: '¡Copiado!',
    arroba: '[arroba]',
    actualizado: 'Última actualización',
    enEstaPagina: 'En esta página',
    documentos: 'Documentos legales',
    redes: 'Redes',
    contacto: 'Contacto',
  },
  en: {
    saltar: 'Skip to content',
    inicio: 'Home',
    nav: { juegos: 'Games', estudio: 'Studio', contacto: 'Contact' },
    menu: 'Menu',
    cerrar: 'Close',
    idioma: 'Language',
    idiomaOtro: 'Español',
    lema: 'Independent video game studio.',
    hecho: 'Handcrafted in Colombia, with a Venezuelan heart.',
    derechos: 'All rights reserved.',
    marcas: 'Jungle Pixel Studio and its logo are trademarks of their owner.',
    legal: 'Legal',
    arriba: 'Back to top',
    copiar: 'Copy email',
    copiado: 'Copied!',
    arroba: '[at]',
    actualizado: 'Last updated',
    enEstaPagina: 'On this page',
    documentos: 'Legal documents',
    redes: 'Social',
    contacto: 'Contact',
  },
};
