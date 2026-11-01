/**
 * 3125株式会社 — Chrome objects (three.js)
 * One transparent fixed canvas; every element with [data-3d="shape"] gets its
 * own little scene rendered into that element's rect via scissor.
 *   data-3d     : helix | knot | torus | cone | cube | stack | sphere
 *   data-drops  : number of floating chrome droplets (default 3)
 *   data-calm   : quiet mode — slow turn only, no mouse/scroll motion
 *   data-scale  : object scale multiplier (default 1)
 * Changing data-3d at runtime morphs to the new shape (used by the hero switcher).
 */
import * as THREE from './vendor/three.module.min.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isSmall = window.matchMedia('(max-width: 768px)').matches;

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) {
    return false;
  }
}

/* ── Studio environment: black room with white soft-box strips ── */
function studioEnvironment(renderer) {
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x1c1c1c);
  const panel = (w, h, pos, intensity) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide })
    );
    m.position.set(pos[0], pos[1], pos[2]);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  panel(16, 3.2, [0, 7, 1], 5.0);     /* top strip */
  panel(2.6, 12, [-7, 0, 2], 3.6);    /* left strip */
  panel(1.4, 12, [7, 1, -1], 2.8);    /* right strip */
  panel(7, 6, [3, 2, 7], 2.4);        /* front key */
  panel(14, 2.2, [0, -6, 3], 1.2);    /* floor bounce */
  panel(4, 8, [-3, 1, -7], 1.6);      /* back rim */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.025).texture;
  pmrem.dispose();
  return env;
}

/* ── Geometry factory ── */
class Helix extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2 * 2.6;
    return target.set(Math.cos(a) * 0.85, (t - 0.5) * 3.0, Math.sin(a) * 0.85);
  }
}

function roundedBox(size, radius, bevel) {
  const s = size / 2 - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-s, -s - radius);
  shape.lineTo(s, -s - radius);
  shape.quadraticCurveTo(s + radius, -s - radius, s + radius, -s);
  shape.lineTo(s + radius, s);
  shape.quadraticCurveTo(s + radius, s + radius, s, s + radius);
  shape.lineTo(-s, s + radius);
  shape.quadraticCurveTo(-s - radius, s + radius, -s - radius, s);
  shape.lineTo(-s - radius, -s);
  shape.quadraticCurveTo(-s - radius, -s - radius, -s, -s - radius);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: size - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: 8, curveSegments: 16,
  });
  g.center();
  return g;
}

const GEOMETRY = {
  helix:  () => new THREE.TubeGeometry(new Helix(), isSmall ? 260 : 420, 0.2, 32, false),
  knot:   () => new THREE.TorusKnotGeometry(0.72, 0.24, isSmall ? 200 : 320, 40, 2, 3),
  torus:  () => new THREE.TorusGeometry(0.95, 0.34, 64, 200),
  cone:   () => new THREE.ConeGeometry(0.85, 1.75, 128, 1),
  cube:   () => roundedBox(1.55, 0.16, 0.1),
  sphere: () => new THREE.SphereGeometry(1, 96, 64),
};

function buildShape(kind, chrome, ceramic) {
  const group = new THREE.Group();
  if (kind === 'stack') {
    const g = roundedBox(1.5, 0.14, 0.08);
    g.scale(1, 0.26, 1);
    [-0.55, 0, 0.55].forEach((y, i) => {
      const m = new THREE.Mesh(g, i === 1 ? ceramic : chrome);
      m.position.y = y;
      m.rotation.y = i * 0.35;
      group.add(m);
    });
    return group;
  }
  const make = GEOMETRY[kind] || GEOMETRY.knot;
  const mesh = new THREE.Mesh(make(), kind === 'cone' ? ceramic : chrome);
  if (kind === 'cone') {
    /* half ceramic / half chrome like a machined part */
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.86, 0.5, 128, 1, true), chrome);
    cap.position.y = -0.62;
    group.add(cap);
  }
  group.add(mesh);
  return group;
}

/* teardrop: tapered, slightly lumpy sphere */
function dropGeometry() {
  const g = new THREE.SphereGeometry(1, 48, 32);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const taper = v.y > 0 ? 1 - Math.pow(v.y, 1.6) * 0.72 : 1;
    v.x *= taper; v.z *= taper;
    v.y *= v.y > 0 ? 1.45 : 1;
    v.multiplyScalar(1 + Math.sin(v.x * 3.1) * Math.cos(v.z * 2.7) * 0.05);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* ── Main ── */
function init() {
  const hosts = () => Array.from(document.querySelectorAll('[data-3d]'));
  if (!hosts().length) return;
  if (!supportsWebGL()) { document.documentElement.classList.add('no-webgl'); return; }

  const canvas = document.createElement('canvas');
  canvas.className = 'chrome-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setScissorTest(true);

  const env = studioEnvironment(renderer);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.09, envMap: env, envMapIntensity: 1.35 });
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf4f4f2, metalness: 0, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env, envMapIntensity: 0.9 });
  const dropGeo = dropGeometry();

  const views = new Map();

  function createView(el) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 8);
    const holder = new THREE.Group();
    scene.add(holder);

    const kind = el.dataset['3d'];
    const shape = buildShape(kind, chrome, ceramic);
    holder.add(shape);

    const drops = [];
    const n = el.dataset.drops !== undefined ? parseInt(el.dataset.drops, 10) : 3;
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(dropGeo, chrome);
      const a = (i / Math.max(n, 1)) * Math.PI * 2 + Math.random() * 0.8;
      const r = 1.9 + Math.random() * 0.7;
      m.userData = {
        base: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.75, (Math.random() - 0.5) * 1.5),
        s: 0.12 + Math.random() * 0.12,
        phase: Math.random() * Math.PI * 2,
        spin: new THREE.Vector3(Math.random(), Math.random(), Math.random()).multiplyScalar(0.6),
      };
      m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      scene.add(m);
      drops.push(m);
    }
    return { el, scene, camera, holder, shape, kind, drops, morph: 1, pending: null, seed: Math.random() * 10, calm: el.dataset.calm !== undefined };
  }

  function sync() {
    hosts().forEach((el) => { if (!views.has(el)) views.set(el, createView(el)); });
    views.forEach((v, el) => { if (!el.isConnected) views.delete(el); });
  }
  sync();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const clock = new THREE.Clock();
  let time = 0;
  const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    /* the anime opening covers the page — don't spend GPU behind it */
    if (document.getElementById('intro')) return;
    time += dt * (reduceMotion ? 0.2 : 1);
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;

    const W = window.innerWidth, H = window.innerHeight;
    renderer.setScissor(0, 0, W, H);
    renderer.clear();

    views.forEach((v) => {
      const r = v.el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W || r.width < 2 || r.height < 2) return;

      /* shape swap: shrink out, rebuild, spring in */
      const want = v.el.dataset['3d'];
      if (want !== v.kind && !v.pending) v.pending = want;
      if (v.pending) {
        v.morph -= dt * 4;
        if (v.morph <= 0) {
          v.holder.remove(v.shape);
          v.shape.traverse((o) => { if (o.geometry && o.geometry !== dropGeo) o.geometry.dispose(); });
          v.shape = buildShape(v.pending, chrome, ceramic);
          v.holder.add(v.shape);
          v.kind = v.pending;
          v.pending = null;
          v.morph = 0;
        }
      } else if (v.morph < 1) {
        v.morph = Math.min(1, v.morph + dt * 1.6);
      }
      const grow = v.calm ? 1 : (v.pending ? Math.max(v.morph, 0) : easeOutBack(v.morph));

      /* scroll progress of the host through the viewport: 0 → 1 */
      const p = THREE.MathUtils.clamp((H - r.top) / (H + r.height), 0, 1);
      const aspect = r.width / r.height;
      v.camera.aspect = aspect;
      v.camera.updateProjectionMatrix();

      const fit = Math.min(1, aspect * 0.9) * (parseFloat(v.el.dataset.scale) || 1);
      v.holder.scale.setScalar(Math.max(grow, 0.001) * fit);
      if (v.calm) {
        /* quiet "printed photo": slow turn only — no mouse, scroll spin or bob */
        v.holder.rotation.set(0.38, v.seed + time * 0.12, 0);
        v.holder.position.y = 0;
      } else {
        v.holder.rotation.set(
          0.35 + mouse.y * 0.25 + Math.sin(time * 0.4 + v.seed) * 0.08,
          p * Math.PI * 2.2 + time * 0.25 + mouse.x * 0.4,
          Math.sin(time * 0.3 + v.seed) * 0.1
        );
        v.holder.position.y = Math.sin(time * 0.8 + v.seed) * 0.08;
      }

      v.drops.forEach((m) => {
        const u = m.userData;
        m.position.set(
          (u.base.x + Math.sin(time * 0.6 + u.phase) * 0.15) * fit,
          (u.base.y + Math.cos(time * 0.7 + u.phase) * 0.2 - (p - 0.5) * 1.2) * fit,
          u.base.z
        );
        m.scale.setScalar(u.s * fit);
        m.rotation.x += u.spin.x * dt;
        m.rotation.y += u.spin.y * dt;
      });

      const x = r.left, y = H - r.bottom;
      renderer.setViewport(x, y, r.width, r.height);
      renderer.setScissor(x, y, r.width, r.height);
      renderer.render(v.scene, v.camera);
    });
  }

  /* render after Lenis has moved the page (gsap ticker), else plain rAF */
  if (window.gsap && window.gsap.ticker) {
    window.gsap.ticker.add(render);
  } else {
    (function loop() { render(); requestAnimationFrame(loop); })();
  }

  /* hosts injected later (e.g. page hero stage) */
  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  document.documentElement.classList.add('chrome-ready');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
