// ============================================================================
//  Jungle Pixel Studio — interacciones
//  Todo el código es propio y sin dependencias (la CSP solo permite scripts de
//  este mismo sitio). Respeta "reducir movimiento" del sistema operativo.
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

const pointer = { x: -9999, y: -9999, seen: false, inside: false };
let scrollY = window.scrollY;
let lastScrollY = scrollY;
let scrollVel = 0;

const updaters = [];
const live = $('[data-live]');
const announce = (msg) => {
  if (live) live.textContent = msg;
};

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
      if (scrollY > 180 && !menuOpen && !header.contains(document.activeElement)) header.classList.add('is-hidden');
      anchorY = scrollY;
    } else if (scrollY < anchorY - 6) {
      header.classList.remove('is-hidden');
      anchorY = scrollY;
    }
    if (scrollY < 180) header.classList.remove('is-hidden');

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

// Marca en el menú la sección que se está viendo (solo portada).
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
    $$('[data-reveal]', g).forEach((el, i) => el.style.setProperty('--delay', `${(i * 0.1).toFixed(2)}s`))
  );
  let items = $$('[data-reveal]');
  if (reduce) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  // Lo de la portada aparece al cargar, en cascada, sin esperar al scroll.
  const heroItems = $$('[data-hero] [data-reveal]');
  heroItems.forEach((el, i) => {
    el.style.setProperty('--delay', `${(0.5 + i * 0.12).toFixed(2)}s`);
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
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
  );
  items.forEach((el) => io.observe(el));
}

// ------------------------------------------- títulos de pixeles (SVG)
function initPixelTitles() {
  const svgs = $$('svg.pixel').filter((s) => !s.classList.contains('pixel--hero'));
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
        { rootMargin: '0px 0px -10% 0px', threshold: 0.2 }
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

    // Los pixeles se encienden al pasar el ratón por encima y dejan una estela.
    if (!finePointer) return;
    const radius = svg.classList.contains('pixel--footer') ? 3.2 : 2.4;
    let active = false;
    let mx = -99;
    let my = -99;
    const tick = () => {
      const now = performance.now();
      let any = false;
      for (const c of cells) {
        const near = (c.x - mx) ** 2 + (c.y - my) ** 2 < radius * radius;
        if (near) c.lit = now;
        const on = now - c.lit < 380;
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

// ------------------------------------------------- hero: título de partículas
function initHero() {
  const hero = $('[data-hero]');
  if (!hero) return;
  const canvas = $('[data-hero-canvas]', hero);
  const svg = $('.pixel--hero', hero);
  const ctx = !reduce && canvas ? canvas.getContext('2d') : null;
  if (!ctx) {
    svg?.classList.add('is-static');
    return;
  }

  const vb = svg.viewBox.baseVal;
  const BASE = { '': [233, 240, 230], a: [198, 255, 61], b: [63, 209, 116], c: [35, 135, 74] };
  const HOT = { '': [198, 255, 61], a: [255, 255, 255], b: [214, 255, 150], c: [120, 220, 140] };
  const FIREFLY = [[198, 255, 61], [63, 209, 116], [140, 230, 120]];

  const parts = $$('rect', svg).map((r) => {
    const cls = r.getAttribute('class') || '';
    const gx = +r.getAttribute('x');
    const gy = +r.getAttribute('y');
    const ang = Math.random() * Math.PI * 2;
    return {
      gx,
      gy,
      base: BASE[cls] ?? BASE[''],
      hot: HOT[cls] ?? HOT[''],
      hx: 0,
      hy: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      heat: 0,
      sx: Math.cos(ang) * (0.35 + Math.random() * 0.9),
      sy: -Math.abs(Math.sin(ang)) * (0.5 + Math.random()) - 0.25,
      delay: Math.random() * 0.55 + (gx / vb.width) * 0.45,
    };
  });

  let W = 0;
  let H = 0;
  let cell = 10;
  let size = 9;
  let gridOX = 0;
  let gridOY = 0;
  let started = false;
  let visible = true;
  let t0 = 0;
  const flies = [];

  function layout() {
    const hr = hero.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hr.width;
    H = hr.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = sr.width / vb.width;
    size = cell * 0.9;
    const ox = sr.left - hr.left;
    const oy = sr.top - hr.top;
    for (const p of parts) {
      p.hx = ox + p.gx * cell;
      p.hy = oy + p.gy * cell;
    }
    // la rejilla CSS (48px) está centrada: alineamos los puntos de luz con sus cruces
    gridOX = (W / 2) % 48;
    gridOY = (H / 2) % 48;
    const n = W < 700 ? 16 : 34;
    while (flies.length < n) flies.push(newFly(true));
    flies.length = n;
    if (!started) {
      for (const p of parts) {
        p.x = p.hx + (Math.random() - 0.5) * cell * 26;
        p.y = p.hy - H * (0.35 + Math.random() * 0.6);
      }
    }
  }

  function newFly(anywhere) {
    return {
      x: Math.random() * (W || window.innerWidth),
      y: anywhere ? Math.random() * (H || window.innerHeight) : (H || window.innerHeight) + 10,
      s: Math.random() < 0.7 ? 2 : 3,
      v: 0.12 + Math.random() * 0.35,
      ph: Math.random() * Math.PI * 2,
      c: FIREFLY[(Math.random() * FIREFLY.length) | 0],
      dx: 0,
    };
  }

  new ResizeObserver(layout).observe(hero);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);
  layout();

  const bottom = $('.hero__bottom', hero);
  const eyebrow = $('.hero__eyebrow', hero);
  let lastFade = -1;

  updaters.push((dt, now) => {
    if (!visible) return;
    if (!started) {
      started = true;
      t0 = now;
    }
    const t = (now - t0) / 1000;
    const hr = hero.getBoundingClientRect();
    const mx = pointer.x - hr.left;
    const my = pointer.y - hr.top;
    const prog = clamp(scrollY / (H * 0.85), 0, 1);
    const disp = prog ** 1.35 * H * 0.95;
    const fade = 1 - prog * 1.15;
    const R = Math.max(90, cell * 4.4);
    const R2 = R * R;
    const k = 0.055 * dt;
    const damp = Math.pow(0.82, dt);

    // Desvanece el texto inferior al bajar
    if (Math.abs(prog - lastFade) > 0.002 && bottom) {
      bottom.style.transform = `translate3d(0, ${(-prog * 60).toFixed(1)}px, 0)`;
      bottom.style.opacity = String(clamp(1 - prog * 1.6, 0, 1));
      if (eyebrow) eyebrow.style.opacity = String(clamp(1 - prog * 2, 0, 1));
      lastFade = prog;
    }

    ctx.clearRect(0, 0, W, H);

    // Puntos de la rejilla que se encienden cerca del ratón
    if (pointer.inside && mx > -R && my > -R && mx < W + R && my < H + R) {
      const G = 48;
      const R0 = 210;
      const x0 = Math.floor((mx - R0 - gridOX) / G) * G + gridOX;
      const y0 = Math.floor((my - R0 - gridOY) / G) * G + gridOY;
      for (let gx = x0; gx <= mx + R0; gx += G) {
        for (let gy = y0; gy <= my + R0; gy += G) {
          const d = Math.hypot(gx - mx, gy - my);
          if (d > R0) continue;
          const f = 1 - d / R0;
          const s = 2 + Math.round(f * 4);
          ctx.globalAlpha = f * 0.55 * fade;
          ctx.fillStyle = '#3fd174';
          ctx.fillRect(Math.round(gx - s / 2), Math.round(gy - s / 2), s, s);
        }
      }
    }

    // Luciérnagas de pixel
    for (const f of flies) {
      f.y -= f.v * dt;
      f.ph += 0.02 * dt;
      const ddx = f.x - mx;
      const ddy = f.y - my;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < 140 * 140) f.dx += (ddx / Math.sqrt(d2 + 1)) * 0.25 * dt;
      f.dx *= Math.pow(0.95, dt);
      f.x += (Math.sin(f.ph) * 0.25 + f.dx) * dt;
      if (f.y < -10 || f.x < -20 || f.x > W + 20) Object.assign(f, newFly(false));
      const a = (0.25 + 0.45 * (0.5 + 0.5 * Math.sin(f.ph * 3))) * fade;
      ctx.globalAlpha = clamp(a, 0, 1);
      ctx.fillStyle = `rgb(${f.c[0]},${f.c[1]},${f.c[2]})`;
      ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
    }

    // Partículas del título
    if (fade <= 0) return;
    for (const p of parts) {
      const appear = clamp((t - p.delay) / 0.35, 0, 1);
      if (appear <= 0) continue;
      const tx = p.hx + p.sx * disp;
      const ty = p.hy + p.sy * disp;
      p.vx = (p.vx + (tx - p.x) * k) * damp;
      p.vy = (p.vy + (ty - p.y) * k) * damp;
      const ddx = p.x + size / 2 - mx;
      const ddy = p.y + size / 2 - my;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < R2 && pointer.inside) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / R) ** 2;
        p.vx += (ddx / d) * f * cell * 0.9 * dt;
        p.vy += (ddy / d) * f * cell * 0.9 * dt;
        p.heat = Math.min(1, p.heat + f * 0.6);
      }
      p.heat *= Math.pow(0.955, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const h = p.heat;
      const r = (p.base[0] + (p.hot[0] - p.base[0]) * h) | 0;
      const g = (p.base[1] + (p.hot[1] - p.base[1]) * h) | 0;
      const b = (p.base[2] + (p.hot[2] - p.base[2]) * h) | 0;
      ctx.globalAlpha = appear * fade;
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(p.x, p.y, size, size);
    }
    ctx.globalAlpha = 1;
  });
}

// --------------------------------------------------------------- marquesina
function initMarquee() {
  const wrap = $('[data-marquee]');
  const track = $('[data-marquee-track]');
  if (!track || reduce) {
    if (track) track.style.animation = 'none';
    return;
  }
  let x = 0;
  let half = track.scrollWidth / 2;
  let dir = 1;
  let skew = 0;
  let visible = true;
  new ResizeObserver(() => (half = track.scrollWidth / 2)).observe(track);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(wrap);
  updaters.push((dt) => {
    if (!visible) return;
    const v = clamp(scrollVel, -80, 80);
    if (v > 0.5) dir = 1;
    else if (v < -0.5) dir = -1;
    x -= (0.7 + Math.abs(v) * 0.4) * dt * dir;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    skew = lerp(skew, clamp(v * 0.18, -8, 8), 0.12);
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0) skewX(${(-skew).toFixed(2)}deg)`;
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
    const start = vh * 0.82;
    const end = vh * 0.3;
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

// ------------------------------------------------- proceso en horizontal
function initProcess() {
  const sec = $('[data-process]');
  if (!sec) return;
  const track = $('[data-process-track]', sec);
  const steps = $$('.step', sec);
  const mq = window.matchMedia('(min-width: 861px)');
  let enabled = false;
  let dist = 0;

  const setup = () => {
    enabled = mq.matches && !reduce;
    sec.classList.toggle('is-horizontal', enabled);
    if (!enabled) {
      sec.style.height = '';
      track.style.transform = '';
      return;
    }
    dist = Math.max(0, track.scrollWidth - window.innerWidth);
    sec.style.height = `${window.innerHeight + dist}px`;
  };
  setup();
  window.addEventListener('resize', setup);
  mq.addEventListener('change', setup);

  let lastActive = -1;
  updaters.push(() => {
    const r = sec.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    if (enabled) {
      const p = clamp(-r.top / Math.max(1, sec.offsetHeight - vh), 0, 1);
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px,0,0)`;
    }
    const cx = window.innerWidth / 2;
    const cy = vh / 2;
    let best = 0;
    let bestD = Infinity;
    steps.forEach((s, i) => {
      const b = s.getBoundingClientRect();
      const d = Math.hypot(b.left + b.width / 2 - cx, (b.top + b.height / 2 - cy) * (enabled ? 0 : 1));
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    if (best !== lastActive) {
      steps.forEach((s, i) => s.classList.toggle('is-active', i === best));
      lastActive = best;
    }
  });
}

// ------------------------------------------------ tarjetas que se inclinan
function initTilt() {
  if (!finePointer || reduce) return;
  $$('[data-tilt]').forEach((el) => {
    const max = el.classList.contains('game-card') ? 5 : 8;
    el.addEventListener('pointerenter', () => {
      el.style.transition = 'transform .18s ease-out, border-color .3s ease';
    });
    el.addEventListener('pointermove', (e) => {
      if (!el.classList.contains('is-in') && el.hasAttribute('data-reveal')) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1100px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg)`;
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .8s cubic-bezier(.16,1,.3,1), border-color .3s ease';
      el.style.transform = '';
    });
  });
}

// ---------------------------------------------------------- botones imán
function initMagnetic() {
  if (!finePointer || reduce) return;
  $$('[data-magnetic]').forEach((el) => {
    const strength = el.classList.contains('contact__email') ? 0.1 : el.classList.contains('brand') ? 0.15 : 0.3;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}

// --------------------------------------------------- cursor y foco de luz
function initCursor() {
  if (!finePointer || reduce) return;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  const spot = document.createElement('div');
  dot.className = 'cursor';
  ring.className = 'cursor-ring';
  spot.className = 'spotlight';
  [dot, ring, spot].forEach((n) => n.setAttribute('aria-hidden', 'true'));
  document.body.append(spot, ring, dot);
  html.classList.add('has-cursor');

  let rx = pointer.x;
  let ry = pointer.y;
  let sx = pointer.x;
  let sy = pointer.y;

  window.addEventListener('pointerdown', () => ring.classList.add('is-down'));
  window.addEventListener('pointerup', () => ring.classList.remove('is-down'));
  document.addEventListener('pointerover', (e) => {
    const hit = e.target.closest('a, button, summary, [data-tilt], [data-copy-email]');
    ring.classList.toggle('is-hover', !!hit);
  });
  document.addEventListener('pointerleave', () => [dot, ring, spot].forEach((n) => n.classList.remove('is-visible')));
  document.addEventListener('pointerenter', () => [dot, ring, spot].forEach((n) => n.classList.add('is-visible')));

  const update = (dt) => {
    if (!pointer.seen) return;
    if (!dot.classList.contains('is-visible') && pointer.inside) [dot, ring, spot].forEach((n) => n.classList.add('is-visible'));
    rx = lerp(rx, pointer.x, 1 - Math.pow(0.78, dt));
    ry = lerp(ry, pointer.y, 1 - Math.pow(0.78, dt));
    sx = lerp(sx, pointer.x, 1 - Math.pow(0.93, dt));
    sy = lerp(sy, pointer.y, 1 - Math.pow(0.93, dt));
    dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
    spot.style.transform = `translate3d(${sx.toFixed(1)}px, ${(sy).toFixed(1)}px, 0)`;
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
  window.addEventListener(
    'pointermove',
    (e) => {
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
    scrollVel = lerp(scrollVel, scrollY - lastScrollY, 0.35);
    lastScrollY = scrollY;
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
const inits = [initEmail, initYear, initHeader, initMenu, initActiveNav, initReveal, initPixelTitles, initHero, initMarquee, initWords, initProcess, initTilt, initMagnetic, initCursor, initToc];
for (const init of inits) {
  try {
    init();
  } catch (err) {
    console.error(err);
  }
}
initLoop();
html.classList.add('js-ready');
