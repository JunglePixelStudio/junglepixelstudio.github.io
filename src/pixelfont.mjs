// Tipografía pixel propia de Jungle Pixel Studio (5x7) y la hoja del logotipo.
// La usan herramientas/construir.mjs (SVG en el HTML) y herramientas/imagenes.mjs (PNG).
// '#' = pixel normal; 'a' 'b' 'c' = colores de la hoja; '.' = vacío.

export const GLIFOS = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
  J: ['....#', '....#', '....#', '....#', '....#', '#...#', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['...', '...', '...', '...', '...', '...', '...'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  '-': ['...', '...', '...', '###', '...', '...', '...'],
  '!': ['#', '#', '#', '#', '#', '.', '#'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  ':': ['.', '#', '.', '.', '.', '#', '.'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  // Hoja del logotipo: a = lima, b = verde, c = tallo.
  '@': ['...aaaa', '..aaaab', '.aaa.bb', '.aa.bbb', '.a.bbb.', '.cbbb..', 'c......'],
};

export const ALTO = 7;
export const ESPACIO_LETRAS = 1;
export const ESPACIO_LINEAS = 2;

function glifo(ch) {
  const g = GLIFOS[ch] ?? GLIFOS[ch.toUpperCase()];
  if (!g) throw new Error(`La tipografía pixel no tiene el carácter «${ch}»`);
  return g;
}

/** Ancho en celdas de una línea de texto. */
export function anchoLinea(texto) {
  let ancho = 0;
  [...texto].forEach((ch, i) => {
    ancho += glifo(ch)[0].length + (i > 0 ? ESPACIO_LETRAS : 0);
  });
  return ancho;
}

/**
 * Devuelve las celdas encendidas de un bloque de líneas.
 * @returns {{ancho:number, alto:number, celdas:{x:number,y:number,c:string,letra:number}[]}}
 */
export function celdas(lineas) {
  const lista = [];
  let y0 = 0;
  let ancho = 0;
  let letra = 0;
  lineas.forEach((linea, li) => {
    if (li > 0) y0 += ALTO + ESPACIO_LINEAS;
    let x0 = 0;
    [...linea].forEach((ch, i) => {
      if (i > 0) x0 += ESPACIO_LETRAS;
      const g = glifo(ch);
      g.forEach((fila, y) => {
        [...fila].forEach((p, x) => {
          if (p !== '.') lista.push({ x: x0 + x, y: y0 + y, c: p, letra });
        });
      });
      x0 += g[0].length;
      if (ch !== ' ') letra++;
    });
    ancho = Math.max(ancho, x0);
  });
  return { ancho, alto: y0 + ALTO, celdas: lista };
}

/**
 * SVG en línea con un <rect> por pixel (para que el JS pueda animarlos uno a uno).
 * @param {string[]} lineas
 * @param {{clase?:string, hueco?:number, nitido?:boolean}} op
 */
export function svgPixel(lineas, op = {}) {
  const { clase = 'pixel', hueco = 0.1, nitido = false } = op;
  const { ancho, alto, celdas: lista } = celdas(lineas);
  const t = +(1 - hueco).toFixed(3);
  const m = +(hueco / 2).toFixed(3);
  const rects = lista
    .map(({ x, y, c }) => {
      const cls = c === '#' ? '' : ` class="${c}"`;
      return `<rect${cls} x="${+(x + m).toFixed(3)}" y="${+(y + m).toFixed(3)}" width="${t}" height="${t}"/>`;
    })
    .join('');
  const render = nitido ? ' shape-rendering="crispEdges"' : '';
  return `<svg class="${clase}" viewBox="0 0 ${ancho} ${alto}" aria-hidden="true" focusable="false"${render}>${rects}</svg>`;
}

export const COLORES_HOJA = { a: '#7c9f5c', b: '#4e7c57', c: '#2f5240' };
