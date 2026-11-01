/**
 * 3125株式会社 — Paper edition runtime (loaded by components/paper/PaperRuntime.tsx)
 * The site is rendered by Next.js; this file only adds motion on top of it.
 * Page heroes / footer mark / nav / mobile menu are rendered by React.
 * Features: Smooth scroll (Lenis) · Shutter page transitions · Counter loader
 *           Crosshair cursor · Split-text reveals · Chrome type sheen
 *           Hero pillar switcher (drives js/objects.js via data-3d)
 *           Pinned horizontal "chapters" with vertical Japanese text
 *           Velocity marquees · Drifting display type · Page-hero 3D stage
 *           Works filter · Contact form · Mobile menu
 */

(function () {
  'use strict';

  const doc = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGSAP && !reduceMotion;

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (motion) doc.classList.add('motion');


  /* ═══════════════════════════════════════════════════════════════
     SMOOTH SCROLL — Lenis synced with ScrollTrigger
  ═══════════════════════════════════════════════════════════════ */
  let lenis = null;

  function initSmoothScroll() {
    if (!motion || !window.Lenis) return;
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  function scrollToTarget(target) {
    const navH = parseInt(getComputedStyle(doc).getPropertyValue('--nav-h'), 10) || 64;
    if (lenis) lenis.scrollTo(target, { offset: -navH, duration: 1.2 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
  }


  /* ═══════════════════════════════════════════════════════════════
     PAGE HERO FIGURE — every inner page gets one ink illustration
     (cut from the opening's newsstand drawings)
  ═══════════════════════════════════════════════════════════════ */
  const PAGE_ART = {
    'about': 'editorial-sign.jpg', 'services': 'feature-build.jpg', 'works': 'ink-hanging.jpg',
    'news': 'feature-learn.jpg', 'news-detail': 'feature-learn.jpg', 'company': 'cta-board.jpg',
    'contact': 'feature-create.jpg', 'work': 'ink-hanging.jpg',
  };

  function initFooterMark() {
    const footer = document.querySelector('.footer');
    if (!footer || footer.querySelector('.footer__mark')) return;
    const mark = document.createElement('div');
    mark.className = 'display footer__mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.dataset.drift = '-6';
    mark.textContent = '3125';
    footer.appendChild(mark);
  }

  /* each inner page is a "面" of the paper: section name + photo caption */
  const PAGE_SECTIONS = {
    'about':       ['第二面', '会社案内', '街角に掲げた看板。毎朝ここから一日が始まる。'],
    'services':    ['第三面', '事業', '必要なものを、使う人に合わせて揃えた売店の棚。'],
    'works':       ['第四面', '写真特集', '店先に吊るされた、今日の紙面。'],
    'news':        ['第五面', '短信', '届いたばかりの紙面に目を通す。'],
    'news-detail': ['第五面', '短信', '届いたばかりの紙面に目を通す。'],
    'company':     ['第六面', '会社概要', '店先の立て看板。今日の知らせはここに。'],
    'contact':     ['第七面', '投書・お問い合わせ', '窓口で、手から手へ。'],
    'work':        ['第四面', '写真特集', '店先に吊るされた、今日の紙面。'],
  };

  function pageKey() {
    const file = (window.location.pathname.split('/').pop() || '').replace(/\.(html|php)$/, '');
    return /^work-/.test(file) ? 'work' : file;
  }

  function makeStrip(men, section) {
    const strip = document.createElement('div');
    strip.className = 'page-hero__strip';
    strip.innerHTML =
      '<span class="page-hero__strip-title">The 3125 Times</span>' +
      `<span class="page-hero__strip-section">${men}　${section}</span>` +
      '<span class="page-hero__strip-date" data-today></span>';
    return strip;
  }

  function initPageStage() {
    const key = pageKey();
    const [men, section, caption] = PAGE_SECTIONS[key] || ['', '', '新聞スタンドの一場面。'];
    const hero = document.querySelector('.page-hero');

    /* article / work detail pages: just the masthead strip above the story */
    if (!hero) {
      const story = document.querySelector('.article-hero, .work-detail-hero');
      if (story && men) {
        const strip = makeStrip(men, section);
        strip.classList.add('page-hero__strip--solo');
        story.before(strip);
      }
      return;
    }
    if (hero.querySelector('[data-3d]')) return;

    /* masthead strip: title · section · date */
    hero.prepend(makeStrip(men, section));

    /* the photo: a column-width figure with a caption, not a centrepiece */
    const fig = document.createElement('figure');
    fig.className = 'page-hero__figure';
    const stage = document.createElement('div');
    stage.className = 'page-hero__stage page-hero__stage--ink';
    stage.setAttribute('aria-hidden', 'true');
    const art = document.createElement('img');
    art.className = 'ink-art';
    art.src = `assets/images/${PAGE_ART[key] || 'feature-build.jpg'}`;
    art.alt = '';
    art.decoding = 'async';
    stage.appendChild(art);
    const cap = document.createElement('figcaption');
    cap.className = 'page-hero__caption';
    cap.textContent = `【図】${caption}`;
    fig.append(stage, cap);
    hero.appendChild(fig);
  }


  /* ═══════════════════════════════════════════════════════════════
     SHUTTER PAGE TRANSITION — black panel with frame lines
  ═══════════════════════════════════════════════════════════════ */
  let veil;

  function buildVeil() {
    veil = document.createElement('div');
    veil.className = 'veil';
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = '<div class="veil__panel"><span class="veil__mark">3125</span><span class="veil__marks">+ + +</span></div>';
    document.body.appendChild(veil);
  }

  function veilOut() {
    return new Promise((resolve) => {
      if (!doc.classList.contains('is-veiled') || !motion) {
        doc.classList.remove('is-veiled');
        return resolve();
      }
      const panel = veil.querySelector('.veil__panel');
      veil.classList.add('is-on');
      gsap.set(panel, { yPercent: 0 });
      doc.classList.remove('is-veiled');
      gsap.timeline({ onComplete: () => { veil.classList.remove('is-on'); resolve(); } })
        .to(panel.children, { opacity: 0, duration: 0.2 }, 0)
        .to(panel, { yPercent: -100, duration: 0.55, ease: 'expo.inOut' }, 0.05);
    });
  }

  function veilIn(href) {
    try { sessionStorage.setItem('3125_veil', '1'); } catch (e) { /* storage blocked */ }
    if (lenis) lenis.stop();
    const panel = veil.querySelector('.veil__panel');
    veil.classList.add('is-on');
    gsap.timeline({ onComplete: () => { window.location.href = href; } })
      .fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.42, ease: 'expo.inOut' })
      .fromTo(panel.children, { opacity: 0 }, { opacity: 1, duration: 0.15 }, '-=0.12');
    setTimeout(() => { window.location.href = href; }, 2000);
  }

  function initTransitions() {
    buildVeil();
    if (!motion) return;
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      const raw = a.getAttribute('href');
      if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript):/i.test(raw)) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
      e.preventDefault();
      if (window.closeMenu) window.closeMenu();
      veilIn(url.href);
    }, true);
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        veil.classList.remove('is-on');
        if (lenis) lenis.start();
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     LOADER — first visit only: framed counter
  ═══════════════════════════════════════════════════════════════ */
  function skipLoader() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('done');
    const intro = document.getElementById('intro');
    if (intro) intro.remove();
    doc.classList.remove('has-loader');
    try { sessionStorage.setItem('3125_visited', '1'); } catch (e) { /* storage blocked */ }
  }

  function runLoader() {
    return new Promise((resolve) => {
      const loader = document.getElementById('loader');
      if (!loader) return resolve();
      let firstVisit = true;
      try { firstVisit = !sessionStorage.getItem('3125_visited'); } catch (e) { /* storage blocked */ }
      if (!firstVisit || !motion) { skipLoader(); return resolve(); }
      try { sessionStorage.setItem('3125_visited', '1'); } catch (e) { /* storage blocked */ }

      if (lenis) lenis.stop();
      const pct = document.getElementById('loaderPct');
      const bar = loader.querySelector('.loader__bar i');
      const state = { v: 0 };
      gsap.timeline({
        onComplete: () => {
          loader.classList.add('done');
          doc.classList.remove('has-loader');
          if (lenis) lenis.start();
        },
      })
        .to(state, {
          v: 100, duration: 1.6, ease: 'power3.inOut',
          onUpdate: () => {
            if (pct) pct.textContent = String(Math.round(state.v)).padStart(3, '0');
            if (bar) bar.style.transform = `scaleX(${state.v / 100})`;
          },
        })
        .add(resolve, '+=0.05')
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'expo.inOut' });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     CURSOR — crosshair with label
  ═══════════════════════════════════════════════════════════════ */
  function initCursor() {
    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    if (!finePointer || reduceMotion) { cursor.style.display = 'none'; return; }
    cursor.innerHTML = '<span class="cursor__label"></span>';
    const label = cursor.firstChild;
    let tx = -100, ty = -100, cx = tx, cy = ty;
    /* 追従が止まったらループも止める（静止中まで毎フレーム合成し直さない） */
    let running = false;
    function loop() {
      cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25;
      if (Math.abs(tx - cx) < 0.1 && Math.abs(ty - cy) < 0.1) { cx = tx; cy = ty; running = false; }
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (running) requestAnimationFrame(loop);
    }
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY; doc.classList.add('cursor-on');
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('mouseleave', () => doc.classList.remove('cursor-on'));
    document.addEventListener('mouseover', (e) => {
      const view = e.target.closest('.work-card, .wc__card');
      const hot = e.target.closest('a, button, select, input, textarea, label, .pillar');
      cursor.classList.toggle('is-view', !!view);
      cursor.classList.toggle('is-hover', !!hot && !view);
      label.textContent = view ? 'VIEW' : '';
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     NAVIGATION · MOBILE MENU
  ═══════════════════════════════════════════════════════════════ */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('scrolled', window.scrollY > 12);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* the mobile menu is React state (components/layout/Nav.tsx); clicking a
     link there closes it via its own onClick */
  function closeMenu() {}
  window.closeMenu = closeMenu;


  /* ═══════════════════════════════════════════════════════════════
     SPLIT TEXT — chars wrapped, words / punctuation kept together
  ═══════════════════════════════════════════════════════════════ */
  const TOKEN = /([A-Za-z0-9'’&\-]+[.,!?:]?|[^\s][、。」』）！？]+|\s+|.)/gu;

  function splitChars(el) {
    if (el.dataset.split === 'done') return el.querySelectorAll('.ch');
    const plain = el.textContent.replace(/\s+/g, ' ').trim();
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const text = child.textContent;
          if (!text.trim()) return;
          const frag = document.createDocumentFragment();
          (text.match(TOKEN) || []).forEach((tok) => {
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const host = document.createElement('span');
            host.className = 'w';
            Array.from(tok).forEach((c) => {
              const s = document.createElement('span');
              s.className = 'ch';
              s.textContent = c;
              host.appendChild(s);
            });
            frag.appendChild(host);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && !/^(BR|SVG|IMG)$/i.test(child.tagName)) {
          walk(child);
        }
      });
    };
    const visual = document.createElement('span');
    visual.className = 'split-visual';
    visual.setAttribute('aria-hidden', 'true');
    while (el.firstChild) visual.appendChild(el.firstChild);
    walk(visual);
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = plain;
    el.append(sr, visual);
    el.dataset.split = 'done';
    return el.querySelectorAll('.ch');
  }


  /* ═══════════════════════════════════════════════════════════════
     SCROLL ANIMATIONS
  ═══════════════════════════════════════════════════════════════ */
  const HEADINGS = [
    '.heading-xl', '.heading-lg', '.home-cta__title', '.svc__title', '.contact-info__title',
    '.article-hero__title', '.work-detail-hero__title', '.display', '[data-split]',
  ].join(',');
  const HERO_SCOPE = '.home-hero, .page-hero, .article-hero, .work-detail-hero';

  function delayOf(el) {
    const m = el.className.match(/\bd(\d)\b/);
    return m ? parseInt(m[1], 10) * 0.08 : 0;
  }

  let headingEls = [];

  function prepare() {
    if (!motion) return;
    headingEls = Array.from(document.querySelectorAll(HEADINGS));
    headingEls.forEach((el) => gsap.set(splitChars(el), { yPercent: 105 }));
    gsap.set(
      Array.from(document.querySelectorAll('.reveal, .reveal-l, .reveal-r')).filter((el) => el.dataset.split !== 'done'),
      { opacity: 0 }
    );
  }

  function charsIn(el, delay) {
    return gsap.to(el.querySelectorAll('.ch'), {
      yPercent: 0, duration: 1, ease: 'expo.out',
      stagger: el.classList.contains('display') ? 0.035 : 0.018, delay: delay || 0,
    });
  }

  function initHeadings() {
    headingEls.forEach((el) => {
      if (el.closest(HERO_SCOPE)) { charsIn(el, 0.1 + delayOf(el)); return; }
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => charsIn(el, delayOf(el)) });
    });
  }

  function initReveals() {
    document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach((el) => {
      if (el.dataset.split === 'done') return;
      const go = (d) => gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: d, clearProps: 'transform' });
      if (el.closest(HERO_SCOPE)) { go(0.3 + delayOf(el)); return; }
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => go(delayOf(el)) });
    });
  }

  /* frame cells: lines draw, content follows */
  function initCells() {
    const items = document.querySelectorAll(
      '.service-item, .team-card, .work-card, .concept-panel, .hn__item, .news-item, .info-row, ' +
      '.contact-detail__item, .svc__list li, .work-detail-meta__item, .contact-chip, .cell'
    );
    if (items.length) {
      gsap.set(items, { opacity: 0, y: 30 });
      ScrollTrigger.batch(items, {
        start: 'top 94%', once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, clearProps: 'transform' }),
      });
    }
    document.querySelectorAll('.rule').forEach((r) => {
      gsap.fromTo(r, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: r, start: 'top 95%', once: true } });
    });
  }

  /* chrome type: highlight sweeps as you scroll */
  function initChrome() {
    document.querySelectorAll('.chrome').forEach((el) => {
      gsap.fromTo(el, { backgroundPosition: '50% 0%' }, {
        backgroundPosition: '50% 100%', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* giant type drifts sideways */
  function initDrift() {
    document.querySelectorAll('[data-drift]').forEach((el) => {
      const amt = parseFloat(el.dataset.drift) || -10;
      gsap.fromTo(el, { xPercent: 0 }, {
        xPercent: amt, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
    const ghost = document.querySelector('.page-hero__num');
    if (ghost) {
      gsap.to(ghost, {
        xPercent: -8, ease: 'none',
        scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true },
      });
    }
  }

  /* velocity marquees */
  function initMarquees() {
    const tracks = document.querySelectorAll('.ticker__track, .marquee__track');
    if (!tracks.length) return;
    const loops = Array.from(tracks).map((t) => gsap.to(t, {
      xPercent: -50, ease: 'none', repeat: -1, duration: t.classList.contains('marquee__track') ? 26 : 40,
    }));
    let dir = 1;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) > 20) dir = v > 0 ? 1 : -1;
        const boost = 1 + Math.min(Math.abs(v) / 300, 5);
        loops.forEach((tw) => gsap.to(tw, { timeScale: dir * boost, duration: 0.2, overwrite: true }));
      },
    });
    ScrollTrigger.addEventListener('scrollEnd', () => {
      loops.forEach((tw) => gsap.to(tw, { timeScale: dir, duration: 1, overwrite: true }));
    });
  }

  /* home: pinned horizontal chapters (vertical Japanese columns) */
  function initChapters() {
    const sec = document.querySelector('.chapters');
    if (!sec) return;
    const track = sec.querySelector('.chapters__track');
    const tabs = sec.querySelectorAll('.chapters__tabs li');
    const chapters = sec.querySelectorAll('.chapter');
    const meter = sec.querySelector('.chapters__meter i');

    const setActive = (idx) => tabs.forEach((t, i) => t.classList.toggle('is-active', i === idx));

    gsap.matchMedia()
      .add('(min-width: 900px)', () => {
        sec.classList.add('is-pinned');
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        /* pin just below the fixed nav so the tab bar stays visible */
        const navBottom = () => { const n = document.getElementById('nav'); return n ? Math.round(n.getBoundingClientRect().bottom) : 0; };
        const tween = gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: sec, start: () => 'top ' + navBottom(), end: () => '+=' + dist(),
            pin: true, scrub: 0.6, invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (meter) meter.style.transform = `scaleX(${self.progress})`;
              const mid = window.innerWidth * 0.5;
              let idx = 0;
              chapters.forEach((c, i) => { if (c.getBoundingClientRect().left < mid) idx = i; });
              setActive(idx);
            },
          },
        });
        /* vertical headings slide in as each column enters */
        sec.querySelectorAll('.col__title').forEach((t) => {
          gsap.from(t, {
            yPercent: -30, opacity: 0, ease: 'none',
            scrollTrigger: { trigger: t, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true },
          });
        });
        return () => sec.classList.remove('is-pinned');
      })
      .add('(max-width: 899px)', () => {
        chapters.forEach((c, i) => ScrollTrigger.create({
          trigger: c, start: 'top 50%', end: 'bottom 50%', onToggle: (s) => { if (s.isActive) setActive(i); },
        }));
      });
  }

  /* home hero: pillar switcher morphs the chrome object */
  function initPillars() {
    const stage = document.querySelector('.hero-stage[data-3d]');
    const pillars = document.querySelectorAll('.pillar');
    if (!stage || !pillars.length) return;
    const caption = document.querySelector('.hero-stage__caption');
    const tag = document.querySelector('.hero-stage__tag');
    let idx = 0, timer = null;

    const select = (i) => {
      idx = (i + pillars.length) % pillars.length;
      const p = pillars[idx];
      pillars.forEach((el, k) => {
        el.classList.toggle('is-active', k === idx);
        el.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
      stage.dataset['3d'] = p.dataset.shape;
      if (tag) tag.innerHTML = `<b>${p.dataset.en}</b><span>${p.dataset.jp}</span>`;
      if (caption) {
        caption.textContent = p.dataset.caption;
        if (motion) gsap.fromTo(caption, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      }
    };
    const restart = () => {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => select(idx + 1), 4800);
    };

    pillars.forEach((p, i) => p.addEventListener('click', () => { select(i); restart(); }));
    const prev = document.getElementById('stagePrev');
    const next = document.getElementById('stageNext');
    if (prev) prev.addEventListener('click', () => { select(idx - 1); restart(); });
    if (next) next.addEventListener('click', () => { select(idx + 1); restart(); });
    select(0);
    restart();
  }

  /* images: shutter reveal + slow zoom */
  function initImages() {
    document.querySelectorAll('.work-card__thumb, .news-item__thumb, .article-body__image, .map-vis__area, .work-detail-hero, .feature__art, .page-hero__stage--ink').forEach((box) => {
      gsap.fromTo(box, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath',
        scrollTrigger: { trigger: box, start: 'top 92%', once: true },
      });
      const img = box.querySelector('img');
      if (img) gsap.fromTo(img, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: box, start: 'top 92%', once: true } });
    });
  }

  /* scroll progress in the nav */
  function initProgress() {
    const bar = document.querySelector('.nav__progress i');
    if (!bar || !hasGSAP) return;
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }


  /* ═══════════════════════════════════════════════════════════════
     WORKS FILTER
  ═══════════════════════════════════════════════════════════════ */
  function initWorksFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const workCards  = document.querySelectorAll('.work-card[data-cat]');
    if (!filterBtns.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.filter;
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        workCards.forEach((card) => {
          const show = cat === 'all' || card.dataset.cat === cat;
          card.style.display = show ? '' : 'none';
          if (show && hasGSAP) gsap.fromTo(card, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', clearProps: 'transform' });
        });
        if (hasGSAP) ScrollTrigger.refresh();
      });
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     CONTACT FORM — AJAX submit
  ═══════════════════════════════════════════════════════════════ */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.form-submit');

      /* 送信中 */
      if (btn) {
        btn.textContent = '送信中…';
        btn.disabled    = true;
      }

      try {
        const res = await fetch(contactForm.action, {
          method:  'POST',
          body:    new FormData(contactForm),
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          /* 成功 */
          if (btn) {
            btn.innerHTML = '送信完了 — ありがとうございます ✓';
            btn.style.opacity = '0.8';
          }
          contactForm.reset();
        } else {
          const data = await res.json().catch(() => ({}));
          const msg  = data.errors ? data.errors.map(er => er.message).join(', ') : '送信に失敗しました';
          throw new Error(msg);
        }
      } catch (err) {
        /* エラー */
        if (btn) {
          btn.innerHTML = '送信に失敗しました — 直接メールでご連絡ください';
          btn.disabled  = false;
        }
        console.error('Form submission error:', err);
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════════
     SMOOTH ANCHOR SCROLL
  ═══════════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  function scrollToHash() {
    if (!window.location.hash || window.location.hash.length < 2) return;
    let target = null;
    try { target = document.querySelector(window.location.hash); } catch (e) { /* invalid selector */ }
    if (target) setTimeout(() => scrollToTarget(target), 200);
  }



  /* ═══════════════════════════════════════════════════════════════
     PAPER MOTION — newspaper-flavoured scroll animation
     stamps · printing wipes · ink parallax · falling tate type ·
     sheets lifting into place · scissors on the coupon · 面 indicator
  ═══════════════════════════════════════════════════════════════ */
  function initPaperMotion() {
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    const once = (el, start = 'top 88%') => ({ trigger: el, start, once: true });

    /* 1. hanko stamps: labels thump onto the page */
    $$('.feature__num, .feature__kicker, .ad-page__eyebrow, .ad-page__tag, .kicker, .section__label, .page-hero__strip-section, .ad-tag')
      .forEach((el) => {
        gsap.fromTo(el, { scale: 2.1, rotation: -14, opacity: 0 }, {
          scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(2.2)', clearProps: 'transform',
          scrollTrigger: once(el, 'top 90%'),
        });
      });

    /* 2. ink illustrations drift inside their frames (parallax) */
    $$('.feature__art img, .ad-page__art img, .ink-art').forEach((img) => {
      const box = img.parentElement;
      img.classList.add('is-parallax');
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    /* 3. body type is "printed" line by line: a top-to-bottom wipe */
    $$('.feature__body, .front__cols p, .page-hero__desc, .svc__body p, .info-val, .feature__fig figcaption, .ad-page__sub')
      .filter((el) => !el.matches('.reveal, .reveal-l, .reveal-r') && !el.closest('.reveal, .reveal-l, .reveal-r, .hero-stage'))
      .forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)', y: 8 }, {
          clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'power2.out', clearProps: 'clipPath,transform',
          scrollTrigger: once(el, 'top 92%'),
        });
      });

    /* 4. vertical headlines: characters fall into the column one by one */
    $$('.feature__title-tate').forEach((el) => {
      if (el.dataset.fall) return;
      el.dataset.fall = '1';
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = Array.from(el.textContent.trim()).map((c) => `<span class="fall" aria-hidden="true">${c}</span>`).join('');
      gsap.fromTo(el.querySelectorAll('.fall'), { yPercent: -120, opacity: 0, rotation: -8 }, {
        yPercent: 0, opacity: 1, rotation: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07,
        scrollTrigger: once(el, 'top 80%'),
      });
    });

    /* 5. feature columns are laid down one after another, rules drawing */
    const cols = $$('.feature__ch');
    if (cols.length) {
      gsap.fromTo(cols, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: 0.18, clearProps: 'clipPath',
        scrollTrigger: once(cols[0], 'top 85%'),
      });
    }

    /* 6. big sheets lift into place as they come up the page */
    $$('.feature__sheet, .ad-page__frame, .info-table, .front__grid').forEach((el) => {
      gsap.fromTo(el, { y: 70, scale: 0.965, rotationX: 6, transformPerspective: 1400, transformOrigin: '50% 0%' }, {
        y: 0, scale: 1, rotationX: 0, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: 0.6 },
      });
    });

    /* 7. editorial / front type: masthead tightens as the front page scrolls away */
    const mt = document.querySelector('.masthead__title');
    if (mt) {
      gsap.to(mt, {
        letterSpacing: '0.08em', opacity: 0.35, ease: 'none',
        scrollTrigger: { trigger: '.front', start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    /* 8. the coupon: scissors cut along the dotted line */
    const coupon = document.querySelector('.ad-page__coupon');
    const sc = coupon && coupon.querySelector('.ad-page__scissors');
    if (sc) {
      gsap.fromTo(sc, { x: 0 }, {
        x: () => Math.max(0, coupon.clientWidth - sc.offsetWidth - 32), ease: 'none',
        scrollTrigger: { trigger: coupon, start: 'top 95%', end: 'bottom 40%', scrub: 0.5, invalidateOnRefresh: true },
      });
      const tk = coupon.querySelector('.ad-page__ticket');
      if (tk) gsap.fromTo(tk, { xPercent: -6, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: once(coupon) });
    }

    /* 10. home: which 面 you are reading, flipping as you scroll */
    const map = [['.front', '第一面'], ['.intro', '社説'], ['.feature', '特集'], ['#works-heading', '写真特集'], ['#news-home-heading', '短信'], ['.ad-page', '広告']];
    const marks = map.map(([sel, name]) => {
      const el = document.querySelector(sel);
      return el ? [el.closest('section') || el, name] : null;
    }).filter(Boolean);
    if (marks.length > 2) {
      const tag = document.createElement('div');
      tag.className = 'men-indicator';
      tag.setAttribute('aria-hidden', 'true');
      tag.innerHTML = '<span class="men-indicator__k">The 3125 Times</span><span class="men-indicator__v">第一面</span>';
      document.body.appendChild(tag);
      const v = tag.querySelector('.men-indicator__v');
      const show = (name) => {
        if (v.textContent === name) return;
        gsap.timeline()
          .to(v, { rotationX: 90, opacity: 0, duration: 0.18, ease: 'power1.in' })
          .add(() => { v.textContent = name; })
          .fromTo(v, { rotationX: -90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
      };
      marks.forEach(([el, name], i) => {
        ScrollTrigger.create({
          trigger: el, start: 'top 55%', end: 'bottom 55%',
          onToggle: (self) => { if (self.isActive) show(name); else if (i === 0 && self.direction < 0) show(name); },
        });
      });
      ScrollTrigger.create({ start: 120, end: 'max', onToggle: (self) => tag.classList.toggle('is-on', self.isActive) });
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════ */
  initSmoothScroll();
  initTransitions();
  initCursor();
  initWorksFilter();
  initPillars();
  prepare();

  /* masthead date line: today in Japanese newspaper style */
  (function stampDate() {
    const els = document.querySelectorAll('[data-today]');
    if (!els.length) return;
    const d = new Date();
    const wd = '日月火水木金土'[d.getDay()];
    const text = `${d.getFullYear()}年（令和${d.getFullYear() - 2018}年）${d.getMonth() + 1}月${d.getDate()}日（${wd}）`;
    els.forEach((e) => { e.textContent = text; });
  })();

  const opening = () => (window.runIntro ? window.runIntro(lenis) : runLoader());

  /* シャッター遷移で来たときは、幕が上がり始めるのと同じフレームで演出を組み立てる。
     幕が上がり切ってから組み立てると、見えていたカードや本文が一瞬消えてから
     出直す（フラッシュする）ため。 */
  if (doc.classList.contains('is-veiled')) {
    skipLoader();
    veilOut();
    start();
  } else {
    opening().then(start);
  }

  function start() {
    if (motion) {
      initHeadings();
      initReveals();
      initCells();
      initChrome();
      initDrift();
      initMarquees();
      initImages();
      initProgress();
      initChapters();
      initPaperMotion();
      ScrollTrigger.refresh();
    }
    doc.classList.add('is-ready');
    scrollToHash();
  }

  window.addEventListener('load', () => { if (hasGSAP) ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready && hasGSAP) document.fonts.ready.then(() => ScrollTrigger.refresh());

})();
