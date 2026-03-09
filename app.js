(() => {
  const qs = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

  const state = {
    meta: null,
    slides: [],
    currentIndex: 0,
    dotsBuilt: false,
    wheelLock: false
  };

  function setTopOffsetVar() {
    const nav = qs('#topNav');
    const h = nav ? nav.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--topOffset', `${Math.round(h)}px`);
  }

  function createEl(tag, opts={}) {
    const el = document.createElement(tag);
    if (opts.class) el.className = opts.class;
    if (opts.text) el.textContent = opts.text;
    if (opts.attr) for (const [k,v] of Object.entries(opts.attr)) el.setAttribute(k,v);
    return el;
  }

  function applyStagger(parent) {
    const anims = qsa('[data-animate]', parent);
    let d = 0;
    const step = 60;
    anims.forEach(el => { el.style.transitionDelay = `${d}ms`; d += step; });
  }

  function buildSlides(data) {
    const wrap = qs('#slides');
    if (!wrap) return;
    wrap.innerHTML = '';

    data.slides.forEach((s, i) => {
      const section = createEl('section', { class: `slide ${classForType(s.type)}` });
      section.setAttribute('data-index', String(i));
      section.style.setProperty('--textScale', '1');

      const inner = createEl('div', { class: 'slideInner' });

      // Header group
      if (s.type === 'title') {
        section.classList.add('titleSlide');
        const hg = createEl('div', { class: 'hGroup' });
        const h1 = createEl('h1', { text: s.headline || '' });
        h1.classList.add('grad');
        h1.setAttribute('data-animate','');
        hg.appendChild(h1);
        if (s.subheadline) {
          const p = createEl('p', { class: 'preamble', text: s.subheadline });
          p.setAttribute('data-animate','');
          hg.appendChild(p);
        }
        inner.appendChild(hg);
      } else if (s.type === 'section') {
        section.classList.add('sectionSlide');
        const hg = createEl('div', { class: 'hGroup' });
        const h2 = createEl('h1', { text: s.headline || '' });
        h2.classList.add('grad');
        h2.setAttribute('data-animate','');
        hg.appendChild(h2);
        if (s.subheadline) {
          const p = createEl('p', { class: 'preamble', text: s.subheadline });
          p.setAttribute('data-animate','');
          hg.appendChild(p);
        }
        inner.appendChild(hg);
        inner.appendChild(createEl('div', { class: 'hrSoft' }));
      } else if (s.type === 'beforeAfter') {
        if (s.headline) {
          const h2 = createEl('h2', { text: s.headline });
          h2.classList.add('grad');
          h2.setAttribute('data-animate','');
          inner.appendChild(h2);
        }
        const cols = createEl('div', { class: 'cols' });
        if (s.left) {
          const colL = createEl('div', {});
          const h3 = createEl('h3', { text: s.left.title || 'Before' });
          h3.setAttribute('data-animate','');
          colL.appendChild(h3);
          if (s.left.bullets && s.left.bullets.length) {
            const ul = createEl('ul', { class: 'bullets' });
            s.left.bullets.forEach(b => {
              const li = createEl('li', { text: b });
              li.setAttribute('data-animate','');
              ul.appendChild(li);
            });
            colL.appendChild(ul);
          }
          cols.appendChild(colL);
        }
        if (s.right) {
          const colR = createEl('div', {});
          const h3 = createEl('h3', { text: s.right.title || 'After' });
          h3.setAttribute('data-animate','');
          colR.appendChild(h3);
          if (s.right.bullets && s.right.bullets.length) {
            const ul = createEl('ul', { class: 'bullets' });
            s.right.bullets.forEach(b => {
              const li = createEl('li', { text: b });
              li.setAttribute('data-animate','');
              ul.appendChild(li);
            });
            colR.appendChild(ul);
          }
          cols.appendChild(colR);
        }
        inner.appendChild(cols);
      } else if (s.type === 'closing') {
        const hg = createEl('div', { class: 'hGroup' });
        const h1 = createEl('h1', { text: s.headline || '' });
        h1.classList.add('grad');
        h1.setAttribute('data-animate','');
        hg.appendChild(h1);
        if (s.subheadline) {
          const p = createEl('p', { class: 'preamble', text: s.subheadline });
          p.setAttribute('data-animate','');
          hg.appendChild(p);
        }
        inner.appendChild(hg);
      } else { // content
        if (s.headline) {
          const h2 = createEl('h2', { text: s.headline });
          h2.classList.add('grad');
          h2.setAttribute('data-animate','');
          inner.appendChild(h2);
        }
        const cols = createEl('div', { class: 'cols' });
        // Left/main content
        const main = createEl('div', { class: 'col-main' });
        if (s.bullets && s.bullets.length) {
          const ul = createEl('ul', { class: 'bullets' });
          s.bullets.forEach(b => {
            const li = createEl('li', { text: b });
            li.setAttribute('data-animate','');
            ul.appendChild(li);
          });
          main.appendChild(ul);
        }
        cols.appendChild(main);

        // Right/supporting content if provided
        if (s.right || s.note || s.subheadline) {
          const side = createEl('aside', { class: 'sideCard' });
          const label = createEl('div', { class: 'label', text: s.right?.title || 'Note' });
          side.appendChild(label);
          const big = createEl('div', { class: 'big grad', text: (s.subheadline || s.note || (s.right && s.right.bullets && s.right.bullets[0]) || '') });
          big.setAttribute('data-animate','');
          side.appendChild(big);
          if (s.right && s.right.bullets && s.right.bullets.length) {
            const ul2 = createEl('ul', { class: 'bullets' });
            s.right.bullets.forEach(b => {
              const li2 = createEl('li', { text: b });
              li2.setAttribute('data-animate','');
              ul2.appendChild(li2);
            });
            side.appendChild(ul2);
          }
          cols.appendChild(side);
        } else if (s.left) {
          // if left/right model used for content slide
          const side = createEl('aside', { class: 'sideCard' });
          if (s.left.title) side.appendChild(createEl('div', { class: 'label', text: s.left.title }));
          if (s.left.bullets && s.left.bullets.length) {
            const ulL = createEl('ul', { class: 'bullets' });
            s.left.bullets.forEach(b => { const liL = createEl('li', { text: b }); liL.setAttribute('data-animate',''); ulL.appendChild(liL); });
            side.appendChild(ulL);
          }
          cols.appendChild(side);
        }

        inner.appendChild(cols);
      }

      section.appendChild(inner);
      applyStagger(section);
      wrap.appendChild(section);
    });
  }

  function classForType(type) {
    switch(type) {
      case 'title': return 'titleSlide';
      case 'section': return 'sectionSlide';
      case 'beforeAfter': return 'beforeAfter';
      case 'closing': return 'closingSlide';
      default: return 'contentSlide';
    }
  }

  function updateActiveSlide(index) {
    const slides = qsa('.slide');
    if (!slides.length) return;
    state.currentIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((s, i) => {
      if (i === state.currentIndex) s.classList.add('is-active');
      else s.classList.remove('is-active');
    });
    updateNavState();
    updateProgress();
    fitTypographyForCurrent();
  }

  function updateNavState() {
    const prev = qs('#prevBtn');
    const next = qs('#nextBtn');
    if (prev) prev.disabled = state.currentIndex <= 0;
    if (next) next.disabled = state.currentIndex >= state.slides.length - 1;
  }

  function updateProgress() {
    const bar = qs('#topProgressBar');
    const dots = qsa('#sideDots button.dot');
    const total = state.slides.length;
    const idx = state.currentIndex;
    if (bar && total > 1) {
      const pct = (idx / (total - 1)) * 100;
      bar.style.width = pct + '%';
    }
    dots.forEach((d, i) => {
      d.setAttribute('aria-current', i === idx ? 'true' : 'false');
    });
  }

  function buildDots() {
    if (state.dotsBuilt) return;
    const cont = qs('#sideDots');
    if (!cont) return;
    cont.innerHTML = '';
    state.slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dot';
      btn.setAttribute('aria-label', `Go to slide ${i+1}`);
      const inner = document.createElement('span');
      inner.className = 'inner';
      btn.appendChild(inner);
      btn.addEventListener('click', () => goTo(i));
      cont.appendChild(btn);
    });
    state.dotsBuilt = true;
    updateProgress();
  }

  function goTo(i) { updateActiveSlide(i); }
  function next() { goTo(state.currentIndex + 1); }
  function prev() { goTo(state.currentIndex - 1); }

  function onKey(e) {
    const tag = (e.target && (e.target.tagName || '')).toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
    if (e.code === 'Space') { e.preventDefault(); if (e.shiftKey) prev(); else next(); }
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
  }

  function isScrollable(el) {
    if (!el) return false;
    const style = getComputedStyle(el);
    const canScrollY = /(auto|scroll)/.test(style.overflowY);
    return canScrollY && el.scrollHeight > el.clientHeight;
  }

  function findScrollableAncestor(start) {
    let el = start;
    while (el && el !== document.body) {
      if (isScrollable(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function onWheel(e) {
    // Allow scrolling inside inner scrollables first
    const scrollable = findScrollableAncestor(e.target);
    if (scrollable) {
      const atTop = scrollable.scrollTop <= 0;
      const atBottom = Math.ceil(scrollable.scrollTop + scrollable.clientHeight) >= scrollable.scrollHeight;
      if ((e.deltaY < 0 && !atTop) || (e.deltaY > 0 && !atBottom)) return; // let it scroll normally
    }
    e.preventDefault();
    if (state.wheelLock) return;
    state.wheelLock = true;
    if (e.deltaY > 0) next(); else if (e.deltaY < 0) prev();
    setTimeout(() => { state.wheelLock = false; }, 550);
  }

  // Typography fitting
  function fitTypographyForCurrent() {
    const slides = qsa('.slide');
    const slide = slides[state.currentIndex];
    if (!slide) return;
    fitTypography(slide);
  }

  function fitTypography(slideEl) {
    const inner = qs('.slideInner', slideEl);
    if (!inner) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { slideEl.style.setProperty('--textScale','1'); return; }

    // Start at current or 1
    let scale = parseFloat(getComputedStyle(slideEl).getPropertyValue('--textScale')) || 1;
    const minScaleMobile = 0.9;
    const minScaleDesktop = 0.92; // do not let bullets go below ~16px base
    const maxScale = 1.08;

    // Helper to enforce bullet minimum size
    const bullet = qs('.bullets li', inner);
    function bulletSizeOk(sc) {
      if (!bullet) return true;
      // Estimate: compute size at current, then scale ratio
      const style = getComputedStyle(bullet);
      const basePx = parseFloat(style.fontSize) / (parseFloat(getComputedStyle(slideEl).getPropertyValue('--textScale')) || 1);
      const newPx = basePx * sc;
      const isDesktop = window.innerWidth >= 768;
      return newPx >= (isDesktop ? 15.5 : 14);
    }

    // If overflowing, scale down; if lots of space, scale up a bit
    const maxIter = 30;
    let i = 0;
    function overflow() { return inner.scrollHeight - 2 > inner.clientHeight; }

    // First, shrink if overflow
    while (overflow() && i < maxIter) {
      const minAllowed = window.innerWidth >= 768 ? minScaleDesktop : minScaleMobile;
      const nextScale = Math.max(minAllowed, +(scale - 0.02).toFixed(3));
      if (nextScale === scale) break;
      if (!bulletSizeOk(nextScale)) break;
      scale = nextScale;
      slideEl.style.setProperty('--textScale', String(scale));
      i++;
    }

    // Then, gently grow if a lot of unused space
    let j = 0;
    while (!overflow() && j < 12) {
      const nextScale = Math.min(maxScale, +(scale + 0.02).toFixed(3));
      if (nextScale === scale) break;
      if (!bulletSizeOk(nextScale)) break;
      slideEl.style.setProperty('--textScale', String(nextScale));
      if (overflow()) { // revert if we just tipped over
        slideEl.style.setProperty('--textScale', String(scale));
        break;
      } else {
        scale = nextScale;
      }
      j++;
    }
  }

  function onResize() {
    setTopOffsetVar();
    fitTypographyForCurrent();
  }

  function setupNav() {
    const prevBtn = qs('#prevBtn');
    const nextBtn = qs('#nextBtn');
    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);
    document.addEventListener('keydown', onKey);
    // Wheel navigation (desktop)
    document.addEventListener('wheel', onWheel, { passive: false });
  }

  function setupObserver() {
    // If slides ever become scroll-snap based, keep this to sync index
    const slides = qsa('.slide');
    if (!slides.length) return;
    const io = new IntersectionObserver(entries => {
      // choose the most visible entry as active
      let topEntry = entries[0];
      entries.forEach(e => { if (e.intersectionRatio > topEntry.intersectionRatio) topEntry = e; });
      const idx = parseInt(topEntry.target.getAttribute('data-index') || '0', 10);
      if (!Number.isNaN(idx)) {
        state.currentIndex = idx;
        updateActiveSlide(idx);
      }
    }, { threshold: [0.6, 0.8, 1] });
    slides.forEach(s => io.observe(s));
  }

  async function setupPdfExport() {
    const btn = qs('#exportPdfBtn');
    if (!btn) return;

    async function loadScript(src) {
      return new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = src; s.async = true; s.onload = () => res(); s.onerror = () => rej(new Error('Failed '+src));
        document.head.appendChild(s);
      });
    }

    async function ensureLibs() {
      if (!window.html2canvas) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      if (!window.jspdf) await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }

    async function captureSlideToCanvas(stage, slideEl) {
      // Ensure backgrounds are present within stage
      // Clean stage
      stage.innerHTML = '';
      // Clone bg layers
      qsa('.bgLayer').forEach((bg) => { stage.appendChild(bg.cloneNode(true)); });
      // Clone slide
      const clone = slideEl.cloneNode(true);
      clone.classList.add('is-active');
      // Fit typography within 1920x1080 for clone
      stage.appendChild(clone);
      fitTypography(clone);
      const scale = Math.max(2, window.devicePixelRatio || 1);
      const canvas = await window.html2canvas(stage, {
        backgroundColor: '#050611',
        width: 1920,
        height: 1080,
        scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 1920,
        windowHeight: 1080
      });
      return canvas;
    }

    btn.addEventListener('click', async () => {
      try {
        btn.disabled = true; const original = btn.textContent; btn.textContent = 'Exporting…';
        document.body.classList.add('exportingPdf');
        await ensureLibs();
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920,1080] });

        const stage = qs('#pdfStage');
        if (!stage) throw new Error('PDF stage missing');

        // For each slide: inject into stage and capture
        const slides = qsa('.slide');
        for (let i = 0; i < slides.length; i++) {
          // Prepare stage with a single clone and bg; CSS handles size/padding
          const canvas = await captureSlideToCanvas(stage, slides[i]);
          const imgData = canvas.toDataURL('image/png');
          if (i > 0) pdf.addPage([1920,1080], 'landscape');
          pdf.addImage(imgData, 'PNG', 0, 0, 1920, 1080, undefined, 'FAST');
        }

        pdf.save('FlowPitch.pdf');
        document.body.classList.remove('exportingPdf');
        btn.disabled = false; btn.textContent = original;
        // Cleanup stage
        stage.innerHTML = '';
      } catch (err) {
        console.error(err);
        alert('Export failed. Please allow cdnjs.cloudflare.com or self-host html2canvas and jsPDF.');
        document.body.classList.remove('exportingPdf');
        const btn = qs('#exportPdfBtn'); if (btn) { btn.disabled = false; btn.textContent = 'Export PDF'; }
      }
    });
  }

  async function init() {
    try {
      setTopOffsetVar();
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);

      const res = await fetch('./content.json?ts=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      state.meta = data.meta; state.slides = data.slides || [];

      // Set title/brand
      if (state.meta) {
        document.title = state.meta.title || 'FlowPitch';
        const bt = qs('#brandTitle'); if (bt) bt.textContent = state.meta.title || 'FlowPitch';
        // Theme hook (if needed in future)
        document.documentElement.dataset.theme = (state.meta.theme || '').toLowerCase();
      }

      buildSlides(data);
      buildDots();
      setupNav();
      setupObserver();
      setupPdfExport();

      updateActiveSlide(0);
    } catch (e) {
      console.error('Failed to initialize deck', e);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
