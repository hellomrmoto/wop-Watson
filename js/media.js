/* ------------------------------------------------------------------
   MEDIA — placeholder-first media slots.

   <div class="media" data-type="image|video|ph" data-id="4" data-ratio="4/5">
   builds a labelled placeholder, then tries to load the real file from
   SITE.media (or data-src). File missing / fails = placeholder stays.
   File loads = it fades in over the placeholder.
------------------------------------------------------------------- */
(function () {
  const S = window.SITE;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');
  const videos = [];

  function tag(name, cls, text) {
    const n = document.createElement(name);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  // one observer: lazy-load sources near the viewport, play/pause videos in view
  const loadIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      loadIO.unobserve(e.target);
      e.target.__load();
    });
  }, { rootMargin: '900px 0px' });

  const playIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting && !reduceMotion) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.25 });

  function build(el) {
    const type = el.dataset.type || 'image';
    const id = +el.dataset.id || 0;
    const tone = el.dataset.tone || String((id % 4) + 1);
    const label = (type === 'video' ? 'VIDEO ' : type === 'image' ? 'IMG ' : 'PRODUCT ') + (id ? pad(id) : '');

    el.dataset.tone = tone;
    el.classList.add('media--' + type);
    if (el.dataset.ratio) el.style.aspectRatio = el.dataset.ratio;

    const inner = tag('div', 'media__inner');
    const ph = tag('div', 'ph');
    ph.append(tag('span', 'ph__tag', label.trim()), tag('span', 'ph__spec', el.dataset.spec || ''));
    inner.append(ph);
    el.append(inner);

    const cfg = (S.media[type] && S.media[type][id]) || {};
    const src = el.dataset.src || cfg.src;
    if (!src || type === 'ph') return null;

    const done = new Promise((resolve) => {
      let node;
      if (type === 'video') {
        node = document.createElement('video');
        node.muted = true; node.loop = true; node.playsInline = true;
        node.setAttribute('muted', ''); node.setAttribute('playsinline', '');
        node.preload = 'metadata';
        if (cfg.poster) node.poster = cfg.poster;
        node.addEventListener('loadeddata', () => { el.classList.add('is-loaded'); resolve(true); });
        videos.push(node);
        playIO.observe(node);
      } else {
        node = new Image();
        node.alt = '';
        node.decoding = 'async';
        node.addEventListener('load', () => { el.classList.add('is-loaded'); resolve(true); });
      }
      node.addEventListener('error', () => { node.remove(); resolve(false); });  // missing file → keep placeholder

      node.__load = () => { node.src = src; };
      inner.append(node);

      const eager = el.closest('.hero') || el.hasAttribute('data-eager');
      if (eager) node.__load();
      else { loadIO.observe(node); }
    });
    return done;
  }

  function init(root) {
    const pending = [];
    (root || document).querySelectorAll('.media:not([data-built])').forEach((el) => {
      el.dataset.built = '1';
      const p = build(el);
      if (p && el.closest('.hero')) pending.push(p);
    });
    return Promise.all(pending);
  }

  window.MEDIA = { init, videos };
})();
