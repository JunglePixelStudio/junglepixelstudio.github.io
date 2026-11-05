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

  // Redes sociales. Se muestran en el contacto y el pie si hay alguna.
  // Ejemplo: { nombre: 'YouTube', url: 'https://www.youtube.com/@tucanal' }
  redes: [],
};

// ----------------------------------------------------------------------------
//  JUEGOS
//  Cada juego es una tarjeta en la portada. Para añadir uno, copia el bloque de
//  ejemplo del final, rellénalo y pon la imagen en src/assets/img/juegos/.
// ----------------------------------------------------------------------------
export const juegos = [
  {
    id: 'proyecto-01',
    secreto: true, // tarjeta de "proyecto sin anunciar" con portada animada
    titulo: { es: 'Proyecto 01', en: 'Project 01' },
    estado: { es: 'En desarrollo', en: 'In development' },
    etiquetas: { es: ['Sin anunciar', 'PC'], en: ['Unannounced', 'PC'] },
    descripcion: {
      es: 'Algo se está cocinando en la jungla. Nuestro primer juego está en desarrollo y muy pronto lo anunciaremos.',
      en: 'Something is brewing in the jungle. Our first game is in development and we will announce it very soon.',
    },
    enlaces: [],
  },

  // EJEMPLO para cuando anuncies un juego (quita las barras // para activarlo):
  // {
  //   id: 'mi-juego',
  //   titulo: { es: 'Mi Juego', en: 'My Game' },
  //   estado: { es: 'Próximamente en Steam', en: 'Coming soon to Steam' },
  //   etiquetas: { es: ['Cooperativo', '1–4 jugadores', 'PC'], en: ['Co-op', '1–4 players', 'PC'] },
  //   descripcion: { es: 'Frase de tienda en español.', en: 'Store line in English.' },
  //   imagen: 'assets/img/juegos/mi-juego.jpg', // 16:9, unos 1280x720
  //   imagenAlt: { es: 'Captura de Mi Juego', en: 'Mi Juego screenshot' },
  //   enlaces: [
  //     { tipo: 'steam', url: 'https://store.steampowered.com/app/000000/' },
  //     { tipo: 'trailer', url: 'https://www.youtube.com/watch?v=XXXXXXXX' },
  //   ],
  // },
];

// Texto de los botones de cada tipo de enlace de juego.
export const tiposEnlace = {
  steam: { es: 'Ver en Steam', en: 'View on Steam' },
  wishlist: { es: 'Añadir a la lista de deseados', en: 'Wishlist on Steam' },
  itch: { es: 'Ver en itch.io', en: 'View on itch.io' },
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
        'Jungle Pixel Studio es un estudio independiente de videojuegos de Colombia. Hacemos juegos para jugar con amigos, reír cuando todo sale mal y pedir otra partida.',
    },
    en: {
      ruta: 'en/index.html',
      titulo: 'Jungle Pixel Studio — Independent game studio',
      descripcion:
        'Jungle Pixel Studio is an independent video game studio from Colombia. We make games to play with friends, laugh when everything goes wrong and ask for one more round.',
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
    hecho: 'Hecho a mano en Colombia.',
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
    hecho: 'Handcrafted in Colombia.',
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
