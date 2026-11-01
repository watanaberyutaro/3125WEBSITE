/**
 * 3125株式会社 — Opening (first visit, home only)
 * Three ink-comic keyframes (the supplied drawings, used as-is) played as a
 * short film that always fills the whole screen:
 *   1. the newsstand prints onto the paper, the camera tilts down from the
 *      sign to the counter as the old man walks up
 *   2. cut — he hands over the coin, the shopkeeper hands over the paper
 *   3. cut — he opens it; we push in on his paper → it opens out, drawn in the
 *      same ink style, to fill the screen → we dive into the headline and the
 *      site (the same front page) is there.
 * Lines "boil" on twos like hand-drawn animation throughout.
 * Exposes window.runIntro(lenis) → Promise (resolved when the site may show).
 */

const doc = document.documentElement;

/* the drawings are 1086 × 1448; all positions below are in those pixels */
const ART_W = 1086;
const ART_H = 1448;
const PAPER = { cx: 290, cy: 915, w: 270, rot: -7 };   /* the paper he opens in frame 3 */
const FRAMES = [1, 2, 3].map((i) => `/assets/images/newsstand-${i}.webp`);
const INK = '#151311';

/* ── the spread, drawn in the same ink style ─────────────────── */
function bars(x0, y0, x1, y1, gap, seed) {
  let s = '';
  let r = seed;
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  for (let y = y0; y < y1; y += gap) {
    let x = x0;
    while (x < x1 - 30) {
      const len = Math.min(x1 - x, 40 + rnd() * 120);
      s += `<path d="M${x.toFixed(0)} ${y} h${(len - 14).toFixed(0)}"/>`;
      x += len + 6;
    }
  }
  return s;
}

function spreadSVG() {
  return `<svg class="nst-spread__svg" viewBox="0 0 1200 760" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <pattern id="nstTone" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
        <circle cx="4.5" cy="4.5" r="2.1" fill="${INK}"/>
      </pattern>
    </defs>
    <path d="M18 26 Q300 12 598 30 Q900 12 1182 26 L1176 736 Q900 750 602 732 Q300 750 24 736 Z" fill="#F8F4F0" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
    <path d="M600 34 L602 728" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <path d="M560 40 Q580 380 566 724" stroke="${INK}" stroke-width="2.5" opacity=".35" fill="none"/>
    <g class="nst-spread__left">
      <text x="300" y="118" text-anchor="middle" font-family="'UnifrakturMaguntia', serif" font-size="74" fill="${INK}">The 3125 Times</text>
      <path d="M58 140 H544 M58 152 H544" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <rect x="58" y="174" width="486" height="92" rx="6" fill="${INK}"/>
      <text x="301" y="236" text-anchor="middle" font-family="'Shippori Mincho B1', serif" font-weight="800" font-size="37" fill="#F8F4F0">AIで、ビジネスを変える。</text>
      <g stroke="${INK}" stroke-width="10" stroke-linecap="round">${bars(66, 306, 300, 700, 30, 7)}</g>
      <rect x="326" y="296" width="218" height="190" rx="6" fill="url(#nstTone)" stroke="${INK}" stroke-width="7"/>
      <circle cx="435" cy="390" r="58" fill="#F8F4F0" stroke="${INK}" stroke-width="7"/>
      <path d="M404 370 q18 -22 44 -14" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g stroke="${INK}" stroke-width="10" stroke-linecap="round">${bars(334, 520, 544, 700, 30, 3)}</g>
    </g>
    <g class="nst-spread__right">
      <text x="900" y="106" text-anchor="middle" font-family="'Playfair Display', serif" font-weight="900" font-size="54" fill="${INK}">Learn, Build, Create.</text>
      <path d="M656 132 H1144" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <g stroke="${INK}" stroke-width="10" stroke-linecap="round">${bars(664, 172, 880, 700, 30, 11)}</g>
      <rect x="906" y="166" width="238" height="250" rx="6" fill="${INK}"/>
      <rect x="926" y="186" width="198" height="210" rx="4" fill="url(#nstTone)" stroke="#F8F4F0" stroke-width="5"/>
      <rect x="906" y="450" width="238" height="250" rx="6" fill="#F8F4F0" stroke="${INK}" stroke-width="7"/>
      <text x="1025" y="540" text-anchor="middle" font-family="'Shippori Mincho B1', serif" font-weight="800" font-size="40" fill="${INK}">無料相談</text>
      <text x="1025" y="596" text-anchor="middle" font-family="'Shippori Mincho B1', serif" font-weight="800" font-size="40" fill="${INK}">受付中</text>
      <path d="M950 636 H1100" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    </g>
  </svg>`;
}

/* ── Player ──────────────────────────────────────────────────── */
function shouldPlay() {
  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!document.getElementById('intro')) return false;
  try { return !sessionStorage.getItem('3125_visited'); } catch (e) { return false; }
}

function done(host) {
  try { sessionStorage.setItem('3125_visited', '1'); } catch (e) { /* storage blocked */ }
  doc.classList.remove('has-loader');
  if (host) host.remove();
}

function loadImages(srcs) {
  return Promise.all(srcs.map((src) => new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = res;
    im.src = src;
  })));
}

function fontsReady() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.race([
    Promise.all([
      document.fonts.load("800 40px 'Shippori Mincho B1'"),
      document.fonts.load("40px 'UnifrakturMaguntia'"),
      document.fonts.load("900 40px 'Playfair Display'"),
    ]),
    new Promise((r) => setTimeout(r, 2000)),
  ]);
}

window.runIntro = function (lenis) {
  const host = document.getElementById('intro');
  if (!shouldPlay()) { done(host); return Promise.resolve(); }

  return new Promise((resolve) => {
    if (lenis) lenis.stop();
    host.insertAdjacentHTML('afterbegin', `
      <div class="nst-stage"><div class="nst-cam"><div class="nst-boil">
        ${FRAMES.map((src, i) => `<img class="nst-frame nst-frame--${i + 1}" src="${src}" alt="" draggable="false">`).join('')}
      </div></div></div>
      <div class="nst-spread">${spreadSVG()}</div>
      <div class="intro-anim__fade"></div>`);
    Promise.all([loadImages(FRAMES), fontsReady()]).then(() => play(host, lenis, resolve));
  });
};

function play(host, lenis, resolve) {
  const $ = (s) => host.querySelector(s);
  const stage = $('.nst-stage');
  const cam = $('.nst-cam');
  const boil = $('.nst-boil');
  const [f1, f2, f3] = host.querySelectorAll('.nst-frame');
  const spread = $('.nst-spread');
  const fade = $('.intro-anim__fade');

  /* camera: the drawing always covers the whole screen (no letterbox).
     fx/fy = point of the drawing at screen centre (0–1), z = zoom over cover */
  let vw, vh, S0;
  const measure = () => {
    vw = window.innerWidth; vh = window.innerHeight;
    S0 = Math.max(vw / ART_W, vh / ART_H);
    cam.style.width = ART_W * S0 + 'px';
    cam.style.height = ART_H * S0 + 'px';
  };
  measure();
  const view = (fx, fy, z) => {
    const dw = ART_W * S0 * z, dh = ART_H * S0 * z;
    const tx = Math.min(0, Math.max(vw - dw, vw / 2 - fx * dw));
    const ty = Math.min(0, Math.max(vh - dh, vh / 2 - fy * dh));
    return { tx, ty, k: S0 * z };
  };

  /* the opened paper: from its place in frame 3 to a spread that fits the screen */
  const ratio = 1200 / 760;
  const fitRect = () => {
    const fw = Math.min(vw * 0.94, vh * 0.86 * ratio);
    return { x: (vw - fw) / 2, y: (vh - fw / ratio) / 2, w: fw, h: fw / ratio };
  };

  const st = { fx: 0.5, fy: 0.0, z: 1, p: 0, dive: 1 };
  let from = null;
  const render = () => {
    const v = view(st.fx, st.fy, st.z);
    cam.style.transform = `translate(${v.tx.toFixed(2)}px, ${v.ty.toFixed(2)}px) scale(${st.z.toFixed(4)})`;
    if (st.p <= 0 || !from) {
      /* keep the spread glued to his paper until it starts to open */
      const w = PAPER.w * v.k;
      from = { x: v.tx + PAPER.cx * v.k - w / 2, y: v.ty + PAPER.cy * v.k - w / ratio / 2, w, h: w / ratio };
    }
    const to = fitRect();
    const p = st.p;
    Object.assign(spread.style, {
      left: from.x + (to.x - from.x) * p + 'px', top: from.y + (to.y - from.y) * p + 'px',
      width: from.w + (to.w - from.w) * p + 'px', height: from.h + (to.h - from.h) * p + 'px',
      transformOrigin: '25% 27%',
      transform: `rotate(${(PAPER.rot * (1 - p)).toFixed(2)}deg) scale(${st.dive.toFixed(3)})`,
    });
  };
  render();

  /* hand-drawn "line boil": the drawing shivers on twos */
  let lastBoil = 0;
  const doBoil = (t) => {
    if (t - lastBoil < 0.12) return;
    lastBoil = t;
    const dx = (Math.random() - 0.5) * 1.1, dy = (Math.random() - 0.5) * 1.1, r = (Math.random() - 0.5) * 0.14;
    boil.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(1.006)`;
  };

  let finished = false;
  const tl = gsap.timeline({ paused: true, onUpdate: render });
  window.__introTimeline = tl; /* handle for previews / QA seeking */
  const finish = () => {
    if (finished) return;
    finished = true;
    resolve();
    gsap.to(host, {
      opacity: 0, duration: 0.8, ease: 'power2.out',
      onComplete: () => { done(host); if (lenis) lenis.start(); },
    });
  };
  tl.eventCallback('onComplete', finish);

  /* a cut between keyframes: a three-step dissolve (like re-inked cels) + a camera bump */
  const cut = (next, at) => tl
    .fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'steps(3)' }, at)
    .fromTo(stage, { scale: 1.035 }, { scale: 1, duration: 0.45, ease: 'power3.out' }, at);

  /* on tall (phone) screens only a slice of the width shows: keep the man in shot */
  const tall = vw / vh < 0.8;
  tl
    /* 1 — the newsstand prints down onto the paper; tilt from the sign to the counter */
    .fromTo(boil, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut' }, 0.05)
    .fromTo(st, { fx: 0.5, fy: 0.0, z: 1 }, { fx: tall ? 0.33 : 0.42, fy: 0.64, z: 1.12, duration: 2.3, ease: 'power2.inOut' }, 0.35);
  /* 2 — the hand-over */
  cut(f2, 2.75);
  tl.to(st, { fx: tall ? 0.34 : 0.4, fy: 0.6, z: 1.26, duration: 1.3, ease: 'sine.inOut' }, 2.75);
  /* 3 — he opens the paper; push in on it */
  cut(f3, 4.15);
  tl.set(st, { fx: tall ? 0.26 : 0.34, fy: 0.62, z: 1.3 }, 4.15)
    .to(st, { fx: PAPER.cx / ART_W, fy: PAPER.cy / ART_H, z: 2.5, duration: 1.35, ease: 'power2.inOut' }, 4.45)
    /* his paper opens out to the screen */
    .fromTo(spread, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'none' }, 5.6)
    .to(st, { p: 1, duration: 1.0, ease: 'power3.inOut' }, 5.65)
    .to(stage, { opacity: 0, filter: 'blur(5px)', duration: 0.6, ease: 'power1.in' }, 5.85)
    /* and we dive into the headline */
    .to(st, { dive: 3.4, duration: 1.1, ease: 'power3.in' }, 6.9)
    .fromTo(fade, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.in' }, 7.5)
    .to({}, { duration: 0.05 });

  /* own loop with a capped step: a slow frame slows the film, never skips it */
  let last = performance.now();
  let clock = 0;
  (function frame(now) {
    if (!host.isConnected) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;
    if (!finished && !window.__introHold) tl.time(tl.time() + dt);
    doBoil(clock);
    requestAnimationFrame(frame);
  })(last);

  window.addEventListener('resize', () => { measure(); from = null; render(); });
  const skip = host.querySelector('.intro-anim__skip');
  if (skip) skip.addEventListener('click', () => { tl.progress(1); finish(); });
}
