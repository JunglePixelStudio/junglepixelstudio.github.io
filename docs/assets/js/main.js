// ============================================================================
//  Jungle Pixel Studio — interacciones ("Cozy bosque")
//  Código propio y sin dependencias (la CSP solo permite scripts de este sitio).
//  Respeta "reducir movimiento" del sistema operativo.
// ============================================================================

const html = document.documentElement;

// --- Anti-clickjacking: esta web nunca debe mostrarse dentro de un iframe ajeno.
if (window.top !== window.self) {
  html.classList.add('is-framed');
  try {
    window.top.location.replace(window.self.location.href);
  } catch {
    /* el navegador lo impidió: la página sigue oculta */
  }
}

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const lang = html.lang || 'es';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;

// Estado compartido del puntero (con su velocidad, para el "viento" de las hojas)
const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, seen: false, inside: false };
let scrollY = window.scrollY;

const updaters = [];
const live = $('[data-live]');
const announce = (msg) => {
  if (live) live.textContent = msg;
};

// Lee un color #rrggbb de una variable CSS
const css = getComputedStyle(html);
function cssColor(name, fallback) {
  const v = css.getPropertyValue(name).trim();
  const m = /^#([0-9a-f]{6})$/i.exec(v);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ------------------------------------------------------------- correo y año
function initEmail() {
  const links = $$('.js-email');
  links.forEach((a) => {
    const addr = `${a.dataset.u}@${a.dataset.d}`;
    a.href = `mailto:${addr}`;
    a.textContent = addr;
  });
  const btn = $('[data-copy-email]');
  if (!btn) return;
  const label = $('[data-copy-label]', btn);
  const original = label.textContent;
  const addr = links[0] ? `${links[0].dataset.u}@${links[0].dataset.d}` : '';
  if (!navigator.clipboard || !addr) {
    btn.hidden = true;
    return;
  }
  let t;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(addr);
      label.textContent = lang === 'es' ? '¡Copiado!' : 'Copied!';
    } catch {
      label.textContent = addr;
    }
    announce(label.textContent);
    clearTimeout(t);
    t = setTimeout(() => (label.textContent = original), 2200);
  });
}

function initYear() {
  const y = String(new Date().getFullYear());
  $$('[data-year]').forEach((e) => (e.textContent = y));
}

// ------------------------------------------------------- cabecera y menú
let menuOpen = false;

function initHeader() {
  const header = $('[data-header]');
  const bar = $('[data-progress]');
  if (!header) return;
  let anchorY = scrollY;
  let lastProgress = -1;
  header.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  updaters.push(() => {
    header.classList.toggle('is-scrolled', scrollY > 20);
    if (scrollY > anchorY + 6) {
      if (scrollY > 220 && !menuOpen && !header.contains(document.activeElement)) header.classList.add('is-hidden');
      anchorY = scrollY;
    } else if (scrollY < anchorY - 6) {
      header.classList.remove('is-hidden');
      anchorY = scrollY;
    }
    if (scrollY < 220) header.classList.remove('is-hidden');

    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(scrollY / max, 0, 1) : 0;
      if (Math.abs(p - lastProgress) > 0.0005) {
        bar.style.transform = `scaleX(${p})`;
        lastProgress = p;
      }
    }
  });
}

function initMenu() {
  const toggle = $('[data-menu-toggle]');
  const menu = $('[data-menu]');
  if (!toggle || !menu) return;
  const label = $('.menu-toggle__label', toggle);
  const header = $('[data-header]');

  const setMenu = (open) => {
    menuOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? label.dataset.close : label.dataset.open;
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      header?.classList.remove('is-hidden');
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => {
        if (!menuOpen) menu.hidden = true;
      }, 380);
    }
  };

  toggle.addEventListener('click', () => setMenu(!menuOpen));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (!menuOpen) return;
    if (e.key === 'Escape') {
      setMenu(false);
      toggle.focus();
    } else if (e.key === 'Tab') {
      const items = [toggle, ...$$('a', menu)];
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', (e) => {
    if (e.matches && menuOpen) setMenu(false);
  });
}

function initActiveNav() {
  const links = $$('.nav a[href^="#"]');
  if (!links.length) return;
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const a = map.get(e.target.id);
        if (a) a.classList.toggle('is-current', e.isIntersecting);
      }
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  map.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });
}

// ------------------------------------------------------------ apariciones
function initReveal() {
  $$('[data-reveal-group]').forEach((g) =>
    $$(':scope > [data-reveal]', g).forEach((el, i) => el.style.setProperty('--delay', `${(i * 0.09).toFixed(2)}s`))
  );
  let items = $$('[data-reveal]');
  if (reduce) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const heroItems = $$('[data-hero] [data-reveal]');
  heroItems.forEach((el, i) => {
    el.style.setProperty('--delay', `${(0.15 + i * 0.12).toFixed(2)}s`);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
  });
  items = items.filter((el) => !heroItems.includes(el));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
  );
  items.forEach((el) => io.observe(el));
}

// ------------------------------------------- pixeles en SVG (pie, 404, "?")
function initPixelTitles() {
  const svgs = $$('svg.pixel');
  const io = reduce
    ? null
    : new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('is-in');
              io.unobserve(e.target);
            }
          }
        },
        { rootMargin: '0px 0px -5% 0px', threshold: 0.15 }
      );

  svgs.forEach((svg) => {
    const vb = svg.viewBox.baseVal;
    const cells = $$('rect', svg).map((el) => ({
      el,
      x: +el.getAttribute('x') + 0.45,
      y: +el.getAttribute('y') + 0.45,
      lit: 0,
    }));
    if (reduce) {
      svg.classList.add('is-in');
    } else {
      cells.forEach((c) => {
        const a = Math.random() * Math.PI * 2;
        const d = 4 + Math.random() * 12;
        c.el.style.setProperty('--x', `${(Math.cos(a) * d).toFixed(2)}px`);
        c.el.style.setProperty('--y', `${(Math.sin(a) * d - 3).toFixed(2)}px`);
        c.el.style.setProperty('--d', `${(Math.random() * 0.45 + (c.x / vb.width) * 0.35).toFixed(3)}s`);
      });
      io.observe(svg);
    }
    if (!finePointer || svg.classList.contains('secret__glyph')) return;
    const radius = svg.classList.contains('pixel--footer') ? 3.2 : 2.4;
    let active = false;
    let mx = -99;
    let my = -99;
    const tick = () => {
      const now = performance.now();
      let any = false;
      for (const c of cells) {
        if ((c.x - mx) ** 2 + (c.y - my) ** 2 < radius * radius) c.lit = now;
        const on = now - c.lit < 420;
        if (on !== c.el.classList.contains('is-lit')) c.el.classList.toggle('is-lit', on);
        if (on) any = true;
      }
      if (active || any) requestAnimationFrame(tick);
    };
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const s = r.width / vb.width;
      mx = (e.clientX - r.left) / s;
      my = (e.clientY - r.top) / s;
      if (!active) {
        active = true;
        requestAnimationFrame(tick);
      }
    });
    svg.addEventListener('pointerleave', () => {
      active = false;
      mx = my = -99;
    });
  });
}

// ------------------------------------------------- portada: el bosque vivo
function initForest() {
  const hero = $('[data-hero]');
  if (!hero) return;
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);

  // Fondo de la portada: paralaje suave con el ratón y el scroll
  const bg = $('[data-parallax-bg]', hero);
  if (bg && !reduce) {
    let bx = 0;
    let by = 0;
    updaters.push(() => {
      if (!visible) return;
      const nx = pointer.seen ? clamp(pointer.x / window.innerWidth - 0.5, -0.5, 0.5) : 0;
      const ny = pointer.seen ? clamp(pointer.y / window.innerHeight - 0.5, -0.5, 0.5) : 0;
      bx = lerp(bx, -nx * 30, 0.06);
      by = lerp(by, -ny * 20 + scrollY * 0.25, 0.12);
      bg.style.transform = `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0)`;
    });
  }

  // Letras del título que rebotan al acercar el ratón
  const title = $('[data-letters]', hero);
  if (title && !reduce) {
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    const chars = [];
    const split = (node) => {
      for (const child of [...node.childNodes]) {
        if (child.nodeType === Node.TEXT_NODE) {
          // Cada palabra va en un bloque que no se parte; dentro, una caja por letra
          const frag = document.createDocumentFragment();
          for (const part of child.textContent.split(/(\s+)/)) {
            if (!part) continue;
            if (/^\s+$/.test(part)) {
              frag.append(document.createTextNode(part));
              continue;
            }
            const word = document.createElement('span');
            word.className = 'word';
            word.setAttribute('aria-hidden', 'true');
            for (const ch of part) {
              const s = document.createElement('span');
              s.className = 'ch';
              s.textContent = ch;
              word.append(s);
              chars.push({ el: s, cx: 0, cy: 0, y: 0, r: 0, vy: 0, vr: 0 });
            }
            frag.append(word);
          }
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          split(child);
        }
      }
    };
    split(title);
    const measure = () => {
      for (const c of chars) {
        const b = c.el.getBoundingClientRect();
        c.cx = b.left + b.width / 2;
        c.cy = b.top + b.height / 2 + scrollY;
      }
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    if (finePointer) {
      updaters.push((dt) => {
        if (!visible) return;
        const R = 140;
        for (const c of chars) {
          const dx = pointer.x - c.cx;
          const dy = pointer.y - (c.cy - scrollY);
          const d = Math.hypot(dx, dy);
          const f = pointer.inside && d < R ? (1 - d / R) ** 2 : 0;
          const ty = -f * 18;
          const tr = f * clamp(-dx / 40, -1, 1) * 9;
          c.vy = (c.vy + (ty - c.y) * 0.18 * dt) * Math.pow(0.72, dt);
          c.vr = (c.vr + (tr - c.r) * 0.18 * dt) * Math.pow(0.72, dt);
          c.y += c.vy * dt;
          c.r += c.vr * dt;
          if (Math.abs(c.y) > 0.05 || Math.abs(c.r) > 0.05 || f > 0) {
            c.el.style.transform = `translate3d(0, ${c.y.toFixed(2)}px, 0) rotate(${c.r.toFixed(2)}deg)`;
          } else if (c.el.style.transform) {
            c.el.style.transform = '';
          }
        }
      });
    }
  }

  // Hojas de pixel que caen y luciérnagas que siguen al ratón
  const canvas = $('[data-hero-canvas]', hero);
  const ctx = !reduce && canvas ? canvas.getContext('2d') : null;
  if (!ctx) return;

  const LEAF_COLORS = [cssColor('--leaf-a', [124, 159, 92]), cssColor('--leaf-b', [78, 124, 87]), cssColor('--moss', [124, 159, 92]), cssColor('--wood', [168, 106, 61]), cssColor('--sun', [240, 201, 106])];
  const SUN = cssColor('--sun', [240, 201, 106]);
  // Formas de hoja (celdas encendidas en una rejilla 3x3)
  const SHAPES = [
    [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
    [[0, 0], [1, 1], [2, 2], [1, 0], [2, 1]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ];

  // Sprite de brillo para las luciérnagas (se dibuja una vez)
  const glow = document.createElement('canvas');
  glow.width = glow.height = 48;
  const g = glow.getContext('2d');
  const grad = g.createRadialGradient(24, 24, 0, 24, 24, 24);
  grad.addColorStop(0, `rgba(${SUN[0]},${SUN[1]},${SUN[2]},0.95)`);
  grad.addColorStop(0.25, `rgba(${SUN[0]},${SUN[1]},${SUN[2]},0.45)`);
  grad.addColorStop(1, `rgba(${SUN[0]},${SUN[1]},${SUN[2]},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 48, 48);

  let W = 0;
  let H = 0;
  const leaves = [];
  const flies = [];

  const newLeaf = (top) => ({
    x: Math.random() * W,
    y: top ? -20 - Math.random() * H * 0.3 : Math.random() * H,
    vx: 0,
    vy: 0.35 + Math.random() * 0.55,
    s: Math.random() < 0.6 ? 3 : 4,
    shape: SHAPES[(Math.random() * SHAPES.length) | 0],
    c: LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0],
    rot: (Math.random() * 4) | 0,
    t: Math.random() * 100,
    sway: 0.6 + Math.random() * 0.9,
  });
  const newFly = () => ({
    x: Math.random() * W,
    y: H * (0.45 + Math.random() * 0.5),
    vx: 0,
    vy: 0,
    ph: Math.random() * Math.PI * 2,
    sp: 0.4 + Math.random() * 0.6,
  });

  function layout() {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const nl = W < 700 ? 14 : 26;
    const nf = W < 700 ? 8 : 16;
    while (leaves.length < nl) leaves.push(newLeaf(false));
    leaves.length = nl;
    while (flies.length < nf) flies.push(newFly());
    flies.length = nf;
  }
  new ResizeObserver(layout).observe(hero);
  layout();

  updaters.push((dt, now) => {
    if (!visible) return;
    const hr = hero.getBoundingClientRect();
    const mx = pointer.x - hr.left;
    const my = pointer.y - hr.top;
    const near = pointer.inside;
    ctx.clearRect(0, 0, W, H);

    // Luciérnagas: vagan cerca del bosque y se acercan al ratón
    for (const f of flies) {
      f.ph += 0.015 * dt;
      let ax = Math.cos(f.ph * 1.3) * 0.02;
      let ay = Math.sin(f.ph) * 0.02;
      const dx = mx - f.x;
      const dy = my - f.y;
      const d = Math.hypot(dx, dy);
      if (near && d < 260 && d > 30) {
        ax += (dx / d) * 0.06 * f.sp;
        ay += (dy / d) * 0.06 * f.sp;
      } else if (near && d <= 30) {
        ax -= (dx / (d || 1)) * 0.08;
        ay -= (dy / (d || 1)) * 0.08;
      }
      f.vx = (f.vx + ax * dt) * Math.pow(0.96, dt);
      f.vy = (f.vy + ay * dt) * Math.pow(0.96, dt);
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < -20) f.x = W + 20;
      if (f.x > W + 20) f.x = -20;
      if (f.y < H * 0.2) f.vy += 0.02 * dt;
      if (f.y > H + 10) f.y = H * 0.6;
      const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(now / 420 + f.ph * 3));
      ctx.globalAlpha = tw;
      ctx.drawImage(glow, f.x - 12, f.y - 12, 24, 24);
      ctx.fillStyle = '#fff6d6';
      ctx.fillRect(Math.round(f.x) - 1, Math.round(f.y) - 1, 2, 2);
    }

    // Hojas: caen balanceándose; el movimiento del ratón sopla como viento
    const wind = near ? clamp(pointer.vx, -40, 40) : 0;
    const windY = near ? clamp(pointer.vy, -40, 40) : 0;
    for (const l of leaves) {
      l.t += 0.02 * dt;
      const dx = l.x - mx;
      const dy = l.y - my;
      const d2 = dx * dx + dy * dy;
      if (near && d2 < 170 * 170) {
        const f = 1 - Math.sqrt(d2) / 170;
        l.vx += wind * 0.035 * f * dt;
        l.vy += windY * 0.02 * f * dt;
        if (d2 < 60 * 60) {
          l.vx += (dx / 60) * 0.3 * f;
          l.vy += (dy / 60) * 0.3 * f;
        }
      }
      l.vx *= Math.pow(0.95, dt);
      l.vy = lerp(l.vy, 0.35 + l.sway * 0.35, 0.02 * dt);
      l.x += (l.vx + Math.sin(l.t * l.sway) * 0.45) * dt;
      l.y += l.vy * dt;
      if (((now / 260 + l.t * 10) | 0) % 9 === 0) l.rot = (l.rot + 1) % 4;
      if (l.y > H + 20 || l.x < -40 || l.x > W + 40) Object.assign(l, newLeaf(true));
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = `rgb(${l.c[0]},${l.c[1]},${l.c[2]})`;
      const px = Math.round(l.x);
      const py = Math.round(l.y);
      for (const [cx, cy] of l.shape) {
        let x = cx - 1;
        let y = cy - 1;
        for (let k = 0; k < l.rot; k++) [x, y] = [-y, x];
        ctx.fillRect(px + x * l.s, py + y * l.s, l.s, l.s);
      }
    }
    ctx.globalAlpha = 1;
  });
}

// ------------------------------------------- logo grande que mira al ratón
function initLogoTilt() {
  if (reduce) return;
  $$('[data-logo-tilt]').forEach((logo) => {
    let visible = false;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(logo);
    let rx = 0;
    let ry = 0;
    logo.addEventListener('click', () => {
      logo.animate(
        [{ transform: logo.style.transform }, { transform: logo.style.transform + ' translateY(-30px) scale(1.05,0.95)' }, { transform: logo.style.transform }],
        { duration: 600, easing: 'cubic-bezier(.34,1.56,.64,1)' }
      );
    });
    updaters.push(() => {
      if (!visible || !pointer.seen || !finePointer) return;
      const b = logo.getBoundingClientRect();
      const dx = (pointer.x - (b.left + b.width / 2)) / window.innerWidth;
      const dy = (pointer.y - (b.top + b.height / 2)) / window.innerHeight;
      ry = lerp(ry, clamp(dx * 30, -16, 16), 0.08);
      rx = lerp(rx, clamp(-dy * 24, -12, 12), 0.08);
      logo.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
  });
}

// ------------------------------------------------- lianas que se apartan
function initVines() {
  if (reduce) return;
  $$('.vines').forEach((caja) => {
    let visible = false;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(caja);
    const lianas = $$('[data-vine]', caja).map((el) => ({ el, ang: 0, vel: 0 }));
    updaters.push((dt) => {
      if (!visible) return;
      for (const l of lianas) {
        const b = l.el.getBoundingClientRect();
        let empuje = 0;
        if (pointer.inside && pointer.y > b.top && pointer.y < b.bottom + 30) {
          const dx = pointer.x - (b.left + b.width / 2);
          if (Math.abs(dx) < 110) {
            // la liana se aparta del ratón y recoge su "viento"
            empuje = -Math.sign(dx || 1) * (1 - Math.abs(dx) / 110) * 14 + clamp(pointer.vx, -30, 30) * 0.25;
          }
        }
        l.vel = (l.vel + (empuje - l.ang) * 0.06 * dt) * Math.pow(0.9, dt);
        l.ang += l.vel * dt;
        if (Math.abs(l.ang) > 0.02 || Math.abs(l.vel) > 0.02) {
          l.el.style.transform = `rotate(${l.ang.toFixed(2)}deg)`;
        }
      }
    });
  });
}

// ------------------------------------------------- visor de capturas
function initLightbox() {
  const box = $('[data-lightbox]');
  const items = $$('[data-gallery] [data-full]');
  if (!box || !items.length) return;
  const img = $('[data-lightbox-img]', box);
  let actual = 0;
  let origen = null;
  const mostrar = (i) => {
    actual = (i + items.length) % items.length;
    img.src = items[actual].dataset.full;
    img.alt = items[actual].dataset.alt || '';
  };
  const abrir = (i) => {
    origen = document.activeElement;
    mostrar(i);
    box.hidden = false;
    document.body.classList.add('lightbox-open');
    requestAnimationFrame(() => box.classList.add('is-open'));
    $('[data-lightbox-close]', box).focus();
  };
  const cerrar = () => {
    box.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    setTimeout(() => (box.hidden = true), 250);
    origen?.focus();
  };
  items.forEach((el, i) => el.addEventListener('click', () => abrir(i)));
  $('[data-lightbox-close]', box).addEventListener('click', cerrar);
  $('[data-lightbox-prev]', box).addEventListener('click', () => mostrar(actual - 1));
  $('[data-lightbox-next]', box).addEventListener('click', () => mostrar(actual + 1));
  box.addEventListener('click', (e) => {
    if (e.target === box) cerrar();
  });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') cerrar();
    else if (e.key === 'ArrowLeft') mostrar(actual - 1);
    else if (e.key === 'ArrowRight') mostrar(actual + 1);
    else if (e.key === 'Tab') {
      const focos = $$('button', box);
      const i = focos.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        focos[focos.length - 1].focus();
      } else if (!e.shiftKey && i === focos.length - 1) {
        e.preventDefault();
        focos[0].focus();
      }
    }
  });
}

// --------------------------------------------------- manifiesto palabra a palabra
function initWords() {
  const el = $('[data-words]');
  if (!el) return;
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  const spans = words.map((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = w;
    el.append(s);
    if (i < words.length - 1) el.append(' ');
    return s;
  });
  if (reduce) {
    spans.forEach((s) => s.classList.add('is-lit'));
    return;
  }
  let last = -1;
  updaters.push(() => {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < -200 || r.top > vh + 200) return;
    const start = vh * 0.85;
    const end = vh * 0.35;
    const p = clamp((start - r.top) / (start - end + r.height * 0.5), 0, 1);
    const n = Math.round(p * spans.length);
    if (n === last) return;
    spans.forEach((s, i) => {
      s.classList.toggle('is-lit', i < n);
      s.classList.toggle('is-head', i === n - 1 && n < spans.length);
    });
    last = n;
  });
}

// ------------------------------------------------- sendero que se dibuja al bajar
function initTrail() {
  const sec = $('[data-trail]');
  if (!sec) return;
  const walk = $('[data-trail-walk]', sec);
  const steps = $$('.step', sec);
  if (reduce) {
    if (walk) walk.style.strokeDashoffset = '0';
    steps.forEach((s) => s.classList.add('is-active'));
    return;
  }
  let last = -1;
  updaters.push(() => {
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    const p = clamp((vh * 0.8 - r.top) / (r.height * 0.75), 0, 1);
    if (Math.abs(p - last) < 0.002) return;
    last = p;
    if (walk) walk.style.strokeDashoffset = String(1 - p);
    steps.forEach((s, i) => s.classList.toggle('is-active', p >= (i + 0.35) / steps.length));
  });
}

// ------------------------------------------------ tarjetas que se inclinan
function initTilt() {
  if (!finePointer || reduce) return;
  $$('[data-tilt]').forEach((el) => {
    el.addEventListener('pointerenter', () => {
      el.style.transition = 'transform .2s ease-out, box-shadow .4s ease, rotate .5s cubic-bezier(.34,1.56,.64,1)';
    });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1000px) translateY(-6px) rotateX(${((0.5 - py) * 6).toFixed(2)}deg) rotateY(${((px - 0.5) * 7).toFixed(2)}deg)`;
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      el.style.setProperty('--mx', ((px - 0.5) * 2).toFixed(3));
      el.style.setProperty('--my', ((py - 0.5) * 2).toFixed(3));
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .7s cubic-bezier(.34,1.56,.64,1), box-shadow .4s ease, rotate .6s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = '';
      el.style.setProperty('--mx', '0');
      el.style.setProperty('--my', '0');
    });
  });
}

// ---------------------------------------------------------- correo imán
function initMagnetic() {
  if (!finePointer || reduce) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = el.classList.contains('contact__email') ? 0.1 : 0.2;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

// --------------------------------------------------- cursor: una hoja
const HOJA_CURSOR = ['...aaaa', '..aaaab', '.aaa.bb', '.aa.bbb', '.a.bbb.', '.cbbb..', 'c......'];

function svgHojaCursor() {
  // La punta de la hoja (arriba a la derecha) se gira para quedar arriba a la izquierda, como una flecha
  let rects = '';
  HOJA_CURSOR.forEach((fila, y) =>
    [...fila].forEach((c, x) => {
      if (c !== '.') rects += `<rect class="${c}" x="${6 - x}" y="${y}" width="1.02" height="1.02"/>`;
    })
  );
  return `<svg viewBox="0 0 7 7" aria-hidden="true" focusable="false" shape-rendering="crispEdges">${rects}</svg>`;
}

function initCursor() {
  if (!finePointer || reduce) return;
  const hoja = document.createElement('div');
  hoja.className = 'cursor-leaf';
  hoja.setAttribute('aria-hidden', 'true');
  hoja.innerHTML = svgHojaCursor();
  document.body.append(hoja);
  html.classList.add('has-cursor');
  const svg = hoja.firstElementChild;

  window.addEventListener('pointerdown', () => hoja.classList.add('is-down'));
  window.addEventListener('pointerup', () => hoja.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const hit = e.target.closest('a, button, summary, [data-tilt], [data-copy-email], [data-logo-tilt], [data-full]');
    hoja.classList.toggle('is-hover', !!hit);
  });
  document.addEventListener('pointerleave', () => hoja.classList.remove('is-visible'));

  // Pedacitos de hoja que caen cuando mueves el ratón deprisa
  const trozos = [];
  let ultimo = 0;
  let giro = 0;
  const update = (dt, now) => {
    if (!pointer.seen) return;
    if (!hoja.classList.contains('is-visible') && pointer.inside) hoja.classList.add('is-visible');
    hoja.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    giro = lerp(giro, clamp(pointer.vx * 1.2, -25, 25), 0.2);
    if (!hoja.classList.contains('is-hover') && !hoja.classList.contains('is-down')) svg.style.transform = `rotate(${giro.toFixed(1)}deg)`;
    else svg.style.transform = '';
    const rapidez = Math.hypot(pointer.vx, pointer.vy);
    if (rapidez > 9 && now - ultimo > 45 && trozos.length < 24) {
      ultimo = now;
      const el = document.createElement('div');
      el.className = 'cursor-bit';
      el.setAttribute('aria-hidden', 'true');
      document.body.append(el);
      trozos.push({ el, x: pointer.x + 8, y: pointer.y + 10, vx: (Math.random() - 0.5) * 1.5, vy: 0.5 + Math.random(), vida: 1, r: Math.random() * 90 });
    }
    for (let i = trozos.length - 1; i >= 0; i--) {
      const t = trozos[i];
      t.vy += 0.08 * dt;
      t.x += (t.vx + Math.sin(now / 200 + t.r) * 0.6) * dt;
      t.y += t.vy * dt;
      t.vida -= 0.02 * dt;
      t.r += 4 * dt;
      if (t.vida <= 0) {
        t.el.remove();
        trozos.splice(i, 1);
        continue;
      }
      t.el.style.opacity = t.vida.toFixed(2);
      t.el.style.transform = `translate3d(${t.x.toFixed(1)}px, ${t.y.toFixed(1)}px, 0) rotate(${t.r.toFixed(0)}deg)`;
    }
  };
  update.isCursor = true;
  updaters.push(update);
}

// -------------------------------------------------- índice de páginas legales
function initToc() {
  const toc = $('[data-toc]');
  if (!toc) return;
  if (window.matchMedia('(max-width: 900px)').matches) toc.open = false;
  const links = $$('a', toc);
  const map = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.remove('is-active'));
        map.get(e.target.id)?.classList.add('is-active');
      }
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );
  map.forEach((_, id) => {
    const h = document.getElementById(id);
    if (h) io.observe(h);
  });
}

// ------------------------------------------------------------- bucle único
function initLoop() {
  let lastMove = performance.now();
  window.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      const dt = Math.max(8, now - lastMove) / 16.667;
      if (pointer.seen) {
        pointer.vx = lerp(pointer.vx, (e.clientX - pointer.x) / dt, 0.5);
        pointer.vy = lerp(pointer.vy, (e.clientY - pointer.y) / dt, 0.5);
      }
      lastMove = now;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.seen = true;
      pointer.inside = true;
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => (pointer.inside = false));
  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch') pointer.inside = false;
  });

  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(3, (now - last) / 16.667);
    last = now;
    scrollY = window.scrollY;
    pointer.vx *= Math.pow(0.85, dt);
    pointer.vy *= Math.pow(0.85, dt);
    for (let i = updaters.length - 1; i >= 0; i--) {
      try {
        updaters[i](dt, now);
      } catch (err) {
        console.error(err);
        if (updaters[i].isCursor) html.classList.remove('has-cursor');
        updaters.splice(i, 1);
      }
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------------ inicio
const inits = [initEmail, initYear, initHeader, initMenu, initActiveNav, initReveal, initPixelTitles, initForest, initLogoTilt, initVines, initLightbox, initWords, initTrail, initTilt, initMagnetic, initCursor, initToc];
for (const init of inits) {
  try {
    init();
  } catch (err) {
    console.error(err);
  }
}
initLoop();
html.classList.add('js-ready');
