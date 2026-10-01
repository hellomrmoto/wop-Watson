/* ------------------------------------------------------------------
   MAIN — all motion. Original code (GSAP + Lenis), written from scratch.
   Sections below are independent: delete or tweak any of them.
     1. helpers          5. intro  (the first motion — swap it here)
     2. DOM builders     6. scroll motion (hero, text, parallax, marquee, reel)
     3. smooth scroll    7. interactions (menu, cursor, tracks, shop, form)
     4. text splitting
------------------------------------------------------------------- */
(function () {
  'use strict';

  const S = window.SITE;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const pad = (n, l) => String(n).padStart(l || 2, '0');

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const skipIntro = reduce || /[?&]nointro\b/.test(location.search);

  gsap.registerPlugin(ScrollTrigger);

  /* 2. DOM builders ------------------------------------------------ */
  function fillText() {
    const words = S.artist.split(' ');
    $$('[data-artist]').forEach((el) => { el.textContent = S.artist; });
    $$('[data-artist-short]').forEach((el) => { el.textContent = words[0]; });
    $$('[data-artist-lines]').forEach((el) => {
      el.setAttribute('aria-label', S.artist);
      words.forEach((w) => {
        const line = document.createElement('span');
        line.className = 'line';
        line.textContent = w;
        el.append(line);
      });
    });
    $('#year').textContent = S.year;
    document.title = S.artist;
  }

  function buildSocials() {
    ['#menuSocial', '#footerSocial'].forEach((sel) => {
      const ul = $(sel);
      S.socials.forEach((s) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = s.href; a.textContent = s.label; a.target = '_blank'; a.rel = 'noopener';
        li.append(a); ul.append(li);
      });
    });
  }

  function buildMarquee() {
    const items = ['New music out now', 'Merch dropping', 'Tour dates soon', 'Stay locked in'];
    $$('.marquee__row').forEach((row) => {
      const set = $('.marquee__set', row);
      for (let i = 0; i < 3; i++) {
        items.forEach((t) => {
          const s = document.createElement('span');
          s.textContent = t;
          const dot = document.createElement('i');
          dot.className = 'dot';
          set.append(s, dot);
        });
      }
      row.append(set.cloneNode(true));          // second copy → seamless -50% loop
      row.lastChild.setAttribute('aria-hidden', 'true');
    });
  }

  function buildTracks() {
    const ul = $('#tracks');
    const preview = $('#trackPreview');
    S.tracks.forEach((t, i) => {
      const li = document.createElement('li');
      li.innerHTML = '<a class="track" data-i="' + i + '"><span class="track__n"></span>' +
        '<span class="track__t"></span><span class="track__m"></span><span class="track__go">Listen ↗</span></a>';
      const a = $('a', li);
      a.href = t.href;
      $('.track__n', li).textContent = pad(i + 1);
      $('.track__t', li).textContent = t.title;
      $('.track__m', li).textContent = t.meta;
      ul.append(li);

      const p = document.createElement('div');
      p.className = 'preview';
      p.innerHTML = '<div class="media" data-type="image"></div>';
      const m = $('.media', p);
      m.dataset.id = t.img;
      m.dataset.tone = String((i % 4) + 1);
      m.dataset.spec = 'Hover preview · uses image-' + pad(t.img);
      preview.append(p);
    });
  }

  async function buildShop() {
    let products;
    try { products = await S.loadProducts(); } catch (e) { products = S.products; }
    const grid = $('#shopGrid');
    products.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'product';
      card.innerHTML =
        '<a class="product__link" data-cursor="View"><div class="media" data-ratio="4/5"></div></a>' +
        '<div class="product__info"><div><h3></h3><span class="product__price"></span></div>' +
        '<button type="button" class="product__add">Add to bag</button></div>';
      const link = $('.product__link', card);
      link.href = p.url || '#';
      const m = $('.media', card);
      m.dataset.type = p.image ? 'image' : 'ph';
      if (p.image) m.dataset.src = p.image;
      m.dataset.id = i + 1;
      m.dataset.tone = p.tone || (i % 4) + 1;
      m.dataset.spec = 'Product · 4:5 · 1200×1500';
      if (p.tag) {
        const b = document.createElement('span');
        b.className = 'product__tag'; b.textContent = p.tag;
        link.append(b);
      }
      $('h3', card).textContent = p.title;
      $('.product__price', card).textContent = p.price;
      grid.append(card);
    });
    // TODO(shop): replace this stub with a real Shopify cart (Storefront API cartCreate / cartLinesAdd).
    let bag = 0;
    grid.addEventListener('click', (e) => {
      if (!e.target.closest('.product__add')) return;
      $('#bagCount').textContent = ++bag;
      gsap.fromTo('#bagCount', { scale: 1.8 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
    });
  }

  /* 3. smooth scroll ---------------------------------------------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();                                 // locked until the intro finishes
  }

  /* 4. text splitting --------------------------------------------- */
  // el → <span.w><span.c>…</span></span> per word (or per char). Returns the .c nodes.
  function split(el, mode) {
    const text = el.textContent.trim();
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', text);
    el.textContent = '';
    const out = [];
    text.split(/\s+/).forEach((word, wi, arr) => {
      const w = document.createElement('span');
      w.className = 'w'; w.setAttribute('aria-hidden', 'true');
      const parts = mode === 'chars' ? Array.from(word) : [word];
      parts.forEach((p) => {
        const c = document.createElement('span');
        c.className = 'c'; c.textContent = p;
        w.append(c); out.push(c);
      });
      el.append(w);
      if (wi < arr.length - 1) el.append(' ');
    });
    return out;
  }

  /* 5. intro — the first motion ----------------------------------- */
  // Black screen → name letters rise → counter to 100 → curtain lifts
  // → hero video settles from 1.25× → hero letters rise → nav fades in.
  let introDone = false;
  function finish() {
    if (introDone) return;
    introDone = true;
    document.body.classList.remove('is-loading');
    gsap.set('#intro', { display: 'none' });
    gsap.set(['.nav', '.hero__foot'], { clearProps: 'all' });
    if (lenis) lenis.start();
    ScrollTrigger.refresh();
  }

  async function intro(heroReady) {
    const nameChars = split($('.intro__name'), 'chars');
    const heroChars = $$('.hero__title .line').flatMap((l) => split(l, 'chars'));
    const count = $('.intro__count');
    const counter = { v: 0 };

    gsap.set(nameChars, { yPercent: 115 });
    gsap.set(heroChars, { yPercent: 115 });
    gsap.set('.hero__media', { scale: 1.25 });
    gsap.set(['.nav', '.hero__foot'], { autoAlpha: 0, y: 24 });

    const failsafe = setTimeout(finish, 9000);

    // phase 1 — build up
    const tlIn = gsap.timeline();
    tlIn.to(nameChars, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05 }, 0.15)
        .to(counter, {
          v: 100, duration: 2.2, ease: 'power2.inOut',
          onUpdate: () => { count.textContent = pad(Math.round(counter.v), 3); }
        }, 0)
        .to('.intro__bar i', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' }, 0);
    await tlIn.then();

    // hold until the hero media is actually decoded (max 4s)
    await Promise.race([heroReady, new Promise((r) => setTimeout(r, 4000))]);

    // phase 2 — release
    const tlOut = gsap.timeline({ onComplete: () => { clearTimeout(failsafe); finish(); } });
    tlOut.to(nameChars, { yPercent: -115, duration: 0.7, ease: 'expo.in', stagger: 0.025 }, 0)
         .to('.intro__foot, .intro__bar', { autoAlpha: 0, duration: 0.4 }, 0.1)
         .to('#intro', { clipPath: 'inset(0 0 100% 0)', duration: 1.25, ease: 'expo.inOut' }, 0.55)
         .to('.hero__media', { scale: 1, duration: 2.2, ease: 'expo.out' }, 0.7)
         .to(heroChars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.06 }, 1.15)
         .to(['.nav', '.hero__foot'], { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1 }, 1.7);
  }

  /* 6. scroll motion ---------------------------------------------- */
  function scrollMotion() {
    // hero: media drifts, title lifts and fades as you leave
    gsap.to('.hero__media', {
      yPercent: 22, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero__inner', {
      yPercent: -14, autoAlpha: 0.0, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '15% top', end: '85% top', scrub: true }
    });

    // headings: words rise out of a mask
    $$('[data-reveal]').forEach((el) => {
      if (el.classList.contains('label')) {
        gsap.from(el, { autoAlpha: 0, y: 14, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
        return;
      }
      const lines = $$('.line', el);
      const targets = lines.length ? lines : [el];
      const words = targets.flatMap((t) => split(t, 'words'));
      gsap.from(words, { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // about paragraph: words light up as you scroll through it
    const about = $('[data-scrub]');
    if (about) {
      const words = split(about, 'words');
      gsap.fromTo(words, { opacity: 0.14 }, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: about, start: 'top 82%', end: 'bottom 50%', scrub: true }
      });
    }

    // images: clip-path wipe + inner scale settle
    $$('[data-reveal-media]').forEach((el) => {
      const st = { trigger: el, start: 'top 90%', once: true };
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', scrollTrigger: st });
      gsap.fromTo($('.media__inner', el), { scale: 1.35 },
        { scale: 1, duration: 1.8, ease: 'expo.out', scrollTrigger: st });
    });

    // parallax: each [data-parallax] drifts at its own speed
    $$('[data-parallax]').forEach((el) => {
      const sp = parseFloat(el.dataset.parallax) || 1;
      gsap.fromTo(el, { yPercent: 9 * sp }, { yPercent: -9 * sp, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // rows, cards: staggered entrance
    gsap.from('.track', { autoAlpha: 0, y: 40, duration: 1, ease: 'power3.out', stagger: 0.09,
      scrollTrigger: { trigger: '.tracks', start: 'top 85%', once: true } });
    gsap.from('.product', { autoAlpha: 0, y: 60, duration: 1.1, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: '.shop__grid', start: 'top 85%', once: true } });

    // footer wordmark rises into place
    gsap.fromTo('.footer__mark', { yPercent: 35 }, { yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });

    // marquee: constant drift, speeds up with scroll velocity
    const loops = $$('.marquee__row').map((row) => {
      const dir = +row.dataset.dir;
      return gsap.fromTo(row, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 40, ease: 'none', repeat: -1 });
    });
    let boost = 0;
    gsap.ticker.add(() => {
      const v = lenis ? Math.min(Math.abs(lenis.velocity), 60) : 0;
      boost += (v * 0.35 - boost) * 0.08;
      loops.forEach((t) => t.timeScale(1 + boost));
      gsap.set('.marquee__row', { skewX: lenis ? Math.max(-6, Math.min(6, -lenis.velocity * 0.12)) : 0 });
    });

    // nav hides on scroll-down, returns on scroll-up
    if (lenis) {
      lenis.on('scroll', (l) => {
        $('#nav').classList.toggle('is-hidden', l.direction === 1 && l.scroll > 240 && !document.body.classList.contains('menu-open'));
      });
    }

    // reel: pinned horizontal scroll on desktop (touch/mobile = native snap scroller, see CSS)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const track = $('#reelTrack');
      const films = $$('.film', track);
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.reel', pin: true, scrub: 0.6, start: 'top top',
          end: () => '+=' + dist(), invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => {
            gsap.set('.reel__bar i', { scaleX: self.progress });
            $('#reelIdx').textContent = pad(Math.round(self.progress * (films.length - 1)) + 1);
          }
        }
      });
    });
  }

  /* 7. interactions ----------------------------------------------- */
  function menu() {
    const btn = $('#menuBtn'), panel = $('#menu');
    panel.inert = true;
    $$('.menu__list li').forEach((li, i) => li.style.setProperty('--i', i));
    const set = (open) => {
      document.body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      if (lenis) open ? lenis.stop() : lenis.start();
      else document.body.style.overflow = open ? 'hidden' : '';
    };
    btn.addEventListener('click', () => set(!document.body.classList.contains('menu-open')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    return set;
  }

  function anchors(closeMenu) {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute('href');
      if (id === '#') return;                      // placeholder links
      const target = $(id);
      if (!target) return;
      closeMenu(false);
      // A pinned section (the reel) reports its *end* position once the pin has released,
      // so aim at the ScrollTrigger's start instead of the element's current rect.
      const pin = ScrollTrigger.getAll().find((st) => st.pin && st.trigger === target);
      const dest = pin ? pin.start : target;
      if (lenis) lenis.scrollTo(dest, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else if (pin) window.scrollTo({ top: dest, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function cursor() {
    if (!finePointer || reduce) return;
    const c = $('.cursor'), label = $('.cursor__label');
    document.documentElement.classList.add('has-cursor');   // hides the native cursor over [data-cursor] only
    gsap.set(c, { xPercent: -50, yPercent: -50 });
    const x = gsap.quickTo(c, 'x', { duration: 0.45, ease: 'power3' });
    const y = gsap.quickTo(c, 'y', { duration: 0.45, ease: 'power3' });
    window.addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); c.classList.add('is-on'); });
    document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor]');
      c.classList.toggle('is-label', !!t);
      c.classList.toggle('is-link', !t && !!e.target.closest('a, button, input'));
      if (t) label.textContent = t.dataset.cursor;
    });
  }

  function films() {
    // click a film → sound on (and every other film muted)
    $$('.film').forEach((f) => {
      f.addEventListener('click', () => {
        const v = $('video', f);
        if (!v) return;
        const turnOn = v.muted;
        $$('.film video').forEach((o) => { o.muted = true; });
        $$('.film').forEach((o) => { o.dataset.cursor = 'Sound'; });
        if (turnOn) { v.muted = false; f.dataset.cursor = 'Mute'; }
        if (v.paused) v.play().catch(() => {});
        $('.cursor__label').textContent = f.dataset.cursor;
      });
    });
  }

  function trackPreview() {
    if (!finePointer) return;
    const box = $('#trackPreview');
    const prev = $$('.preview', box);
    const x = gsap.quickTo(box, 'x', { duration: 0.5, ease: 'power3' });
    const y = gsap.quickTo(box, 'y', { duration: 0.5, ease: 'power3' });
    gsap.set(box, { autoAlpha: 0, scale: 0.8 });
    const list = $('#tracks');
    list.addEventListener('pointermove', (e) => { x(e.clientX + 36); y(e.clientY - box.offsetHeight / 2); });
    $$('.track', list).forEach((row) => {
      row.addEventListener('pointerenter', () => {
        prev.forEach((p, i) => p.classList.toggle('is-active', i === +row.dataset.i));
        gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
      });
      row.addEventListener('pointerleave', () => {
        gsap.to(box, { autoAlpha: 0, scale: 0.8, duration: 0.4, ease: 'power3.in', overwrite: 'auto' });
      });
    });
  }

  function signup() {
    const form = $('#signup'), msg = $('#signupMsg'), input = $('#email');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!input.checkValidity() || !input.value) { msg.textContent = 'Enter a valid email.'; return; }
      // TODO(signup): wire to Klaviyo / Mailchimp / Shopify customer form. Until then, don't fake success.
      msg.textContent = 'Signup isn’t connected yet — nothing was saved.';
    });
  }

  /* boot ----------------------------------------------------------- */
  (async function boot() {
    fillText();
    buildSocials();
    buildMarquee();
    buildTracks();
    await buildShop();
    const heroReady = window.MEDIA.init();         // placeholders + real files; resolves when hero media is decoded

    const closeMenu = menu();
    anchors(closeMenu);
    cursor();
    films();
    trackPreview();
    signup();

    if (!reduce) scrollMotion();

    if (skipIntro) {
      $('#intro').style.display = 'none';
      finish();
    } else {
      intro(heroReady).catch(finish);
    }
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  })();
})();
