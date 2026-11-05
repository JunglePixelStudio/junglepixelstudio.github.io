// Siluetas de bosque en pixeles para la portada y el pie.
// Cada capa es una sola <path> escalonada (columnas de "pixeles"), así pesa poco
// y se ve nítida a cualquier tamaño. Las capas lejanas usan pixeles más pequeños
// para dar sensación de profundidad.

function azar(semilla) {
  let s = semilla % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const entre = (r, a, b) => a + r() * (b - a);

/**
 * @param {object} o
 * @param {number} o.ancho  ancho del viewBox
 * @param {number} o.alto   alto del viewBox
 * @param {number} o.celda  tamaño del pixel
 * @param {number} o.base   altura media del terreno
 * @param {number[][]} o.ondas  [amplitud, frecuencia, fase] de las colinas
 * @param {number[]} o.altoArboles  [mín, máx]
 * @param {number[]} o.separacion   [mín, máx] columnas libres entre árboles
 * @param {number} o.pinos  probabilidad de pino (el resto son árboles redondos)
 * @param {number} o.semilla
 */
export function capa(o) {
  const { ancho, alto, celda, base, ondas, altoArboles, separacion, pinos = 0.5, semilla = 1 } = o;
  const r = azar(semilla);
  const cols = Math.ceil(ancho / celda) + 1;
  const suelo = new Array(cols);
  for (let i = 0; i < cols; i++) {
    const x = i * celda;
    let y = base;
    for (const [amp, frec, fase] of ondas) y += amp * Math.sin(x * frec + fase);
    suelo[i] = y;
  }
  const h = suelo.slice();
  let i = Math.floor(entre(r, 0, separacion[1]));
  while (i < cols) {
    const pino = r() < pinos;
    const H = entre(r, altoArboles[0], altoArboles[1]);
    const mitad = Math.max(2, Math.round((pino ? H * 0.32 : H * 0.3) / celda));
    for (let k = -mitad; k <= mitad; k++) {
      const c = i + k;
      if (c < 0 || c >= cols) continue;
      const d = Math.abs(k) / (mitad + 1);
      let perfil;
      if (pino) {
        // pino con escalones (pisos de ramas)
        perfil = H * (1 - d) - (Math.abs(k) % 2) * celda * 0.6;
      } else {
        // copa redonda sobre un tronco
        perfil = H * 0.3 + H * 0.7 * Math.sqrt(Math.max(0, 1 - d * d));
      }
      h[c] = Math.max(h[c], suelo[i] + perfil);
    }
    i += mitad * 2 + 1 + Math.floor(entre(r, separacion[0], separacion[1]));
  }
  let d = `M0 ${alto}`;
  for (let c = 0; c < cols; c++) {
    const y = Math.max(0, alto - Math.round(h[c] / celda) * celda);
    d += `V${y}H${Math.min(ancho, (c + 1) * celda)}`;
  }
  d += `V${alto}Z`;
  return d;
}

const ANCHO = 1600;
const ALTO = 440;

/** Las cuatro capas de la portada, de la más lejana a la más cercana. */
export const CAPAS_PORTADA = [
  { clase: 'f1', prof: 0.25, celda: 6, base: 170, ondas: [[34, 0.0031, 0.6], [12, 0.011, 2.1]], altoArboles: [40, 95], separacion: [0, 3], pinos: 0.8, semilla: 11 },
  { clase: 'f2', prof: 0.5, celda: 8, base: 125, ondas: [[26, 0.0042, 2.2], [10, 0.013, 0.7]], altoArboles: [70, 150], separacion: [1, 5], pinos: 0.6, semilla: 23 },
  { clase: 'f3', prof: 0.8, celda: 10, base: 80, ondas: [[22, 0.0052, 4.1], [8, 0.017, 1.3]], altoArboles: [100, 210], separacion: [3, 9], pinos: 0.45, semilla: 37 },
  { clase: 'f4', prof: 1.15, celda: 12, base: 38, ondas: [[16, 0.006, 1.2], [7, 0.021, 3.1]], altoArboles: [26, 60], separacion: [4, 12], pinos: 0.2, semilla: 41 },
];

export function svgBosque(capas = CAPAS_PORTADA, clase = 'forest') {
  return `<div class="${clase}" aria-hidden="true">${capas
    .map(
      (c) =>
        `<svg class="${clase}__layer ${clase}__layer--${c.clase}" data-depth="${c.prof}" viewBox="0 0 ${ANCHO} ${ALTO}" preserveAspectRatio="xMidYMax slice" focusable="false"><path d="${capa({ ancho: ANCHO, alto: ALTO, ...c })}"/></svg>`
    )
    .join('')}</div>`;
}

/** Una sola capa de árboles para el borde superior del pie. */
export function svgBordeBosque() {
  const c = { celda: 7, base: 34, ondas: [[10, 0.006, 0.4], [5, 0.02, 2]], altoArboles: [55, 130], separacion: [0, 6], pinos: 0.75, semilla: 77 };
  return `<svg class="footer__forest" viewBox="0 0 ${ANCHO} 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><path d="${capa({ ancho: ANCHO, alto: 200, ...c })}"/></svg>`;
}
