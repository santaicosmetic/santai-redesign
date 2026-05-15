/* ==========================================================================
   Santai theme.js — vanilla JS for interactive UI.
   Each module is independent — wire only what each page needs.
   For Shopify port: cart logic should be replaced with /cart.js Ajax API calls
   and product/variant data from Liquid {{ product | json }}.
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------- Utility bar message rotator -------------------- */
  function initUtilityBar() {
    var bar = document.querySelector('[data-utility-bar]');
    if (!bar) return;
    var msgs = JSON.parse(bar.getAttribute('data-messages') || '[]');
    if (!msgs.length) return;
    var slot = bar.querySelector('.utility-bar__msg');
    var i = 0;
    setInterval(function () {
      i = (i + 1) % msgs.length;
      slot.textContent = msgs[i];
      slot.style.animation = 'none';
      slot.offsetHeight; /* reflow */
      slot.style.animation = '';
    }, 4500);
  }

  /* -------------------- Sticky header scroll state --------------------- */
  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* -------------------- Mobile nav toggle ------------------------------ */
  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-nav-toggle]');
    var close = document.querySelector('[data-mobile-nav-close]');
    var nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'site-nav');
    if (!nav.id) nav.id = 'site-nav';

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    if (close) close.addEventListener('click', function () { setOpen(false); });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });
  }

  /* -------------------- Cart drawer + add-to-cart ---------------------- */
  var LASH_STYLES = {
    inbox:      { id:'inbox',      name:'Inbox',      group:'Natural',      tagline:'The one that looks like nothing — and everything.',  image:'assets/images/products/lash-inbox.png',      card:'assets/images/products/lash-inbox-card.jpg',      drama:1, eyeType:'All types, esp. fine lashes',  length:'10.5mm',              curl:'45° B+', design:'V-weave airy fibre',          price:'RM 79'  },
    minutes:    { id:'minutes',    name:'Minutes',    group:'Natural',      tagline:'Your lashes, but better.',                           image:'assets/images/products/lash-minutes.png',    card:'assets/images/products/lash-minutes-card.jpg',    drama:1, eyeType:'Monolid / Hooded',           length:'10.5mm',              curl:'50° C',  design:'True-to-lash simulation',    price:'RM 85'  },
    kickoff:    { id:'kickoff',    name:'Kickoff',    group:'Natural',      tagline:'Fresh air energy. Younger-looking.',                  image:'assets/images/products/lash-kickoff.png',    card:'assets/images/products/lash-kickoff-card.jpg',    drama:2, eyeType:'All eye types',              length:'10–11mm',             curl:'50° C',  design:'Korean strand-by-strand',    price:'RM 79'  },
    boardroom:  { id:'boardroom',  name:'Boardroom',  group:'Light Makeup', tagline:'The one that never gets it wrong.',                   image:'assets/images/products/lash-boardroom.png',  card:'assets/images/products/lash-boardroom-card.jpg',  drama:3, eyeType:'All eye types',              length:'10–11mm',             curl:'50° C',  design:'Classic soft volume',        price:'RM 95'  },
    pitch:      { id:'pitch',      name:'Pitch',      group:'Light Makeup', tagline:'Refuse to droop. Stay sharp.',                        image:'assets/images/products/lash-pitch.png',      card:'assets/images/products/lash-pitch-card.jpg',      drama:3, eyeType:'Hooded / Monolid fave',     length:'10–11mm',             curl:'70° L',  design:'High-lift 70° L arc',        price:'RM 89'  },
    memo:       { id:'memo',       name:'Memo',       group:'Light Makeup', tagline:'Sweet, wide-eyed, unforgettable.',                    image:'assets/images/products/lash-memo.png',       card:'assets/images/products/lash-memo-card.jpg',       drama:3, eyeType:'Round eyes, all types',     length:'12mm',                curl:'50° C',  design:'7-cluster fairy burst',      price:'RM 95'  },
    afterhours: { id:'afterhours', name:'Afterhours', group:'Full Glam',    tagline:'The night queen, no apologies.',                      image:'assets/images/products/lash-afterhours.png', card:'assets/images/products/lash-afterhours-card.jpg', drama:5, eyeType:'Double lid / Long eyes',   length:'10–11mm',             curl:'50° C',  design:'Sunflower triangle cluster', price:'RM 105' },
    twilight:   { id:'twilight',   name:'Twilight',   group:'Full Glam',    tagline:'The hour between work and magic.',                    image:'assets/images/products/lash-twilight.jpg',   card:'assets/images/products/lash-twilight-card.jpg',   drama:5, eyeType:'All eye types',              length:'10–11mm',             curl:'50° C',  design:'Volumised natural',          price:'RM 89'  },
    nightshift: { id:'nightshift', name:'Nightshift', group:'Full Glam',    tagline:'Mysterious. Fatal. Irresistible.',                    image:'assets/images/products/lash-nightshift.jpg', card:'assets/images/products/lash-nightshift-card.jpg', drama:5, eyeType:'Monolid / Downturned',      length:'10–12mm + 13mm outer', curl:'50° C', design:'Fox-eye upswept',            price:'RM 95'  },
    vip:        { id:'vip',        name:'VIP Access', group:'Full Glam',    tagline:'You were born for the front row.',                    image:'assets/images/products/lash-vip.jpg',        card:'assets/images/products/lash-vip-card.jpg',        drama:5, eyeType:'All eye types',              length:'11–12mm',             curl:'50° C',  design:'Statement volume',           price:'RM 105' }
  };
  var cart = [];
  var FREE_SHIPPING_THRESHOLD = 150;

  function priceToNumber(p) {
    var m = String(p).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  function formatRM(n) { return 'RM ' + n.toFixed(0); }

  function renderCart() {
    var drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;
    var itemsEl = drawer.querySelector('[data-cart-items]');
    var emptyEl = drawer.querySelector('[data-cart-empty]');
    var totalEl = drawer.querySelector('[data-cart-total]');
    var footEl  = drawer.querySelector('[data-cart-foot]');
    var nudgeEl = drawer.querySelector('[data-cart-nudge]');
    var nudgeMsg = drawer.querySelector('[data-cart-nudge-msg]');
    var nudgeFill = drawer.querySelector('[data-cart-nudge-fill]');
    var countEl = document.querySelector('[data-cart-count]');

    var subtotal = cart.reduce(function (s, it) { return s + priceToNumber(it.price); }, 0);

    if (countEl) {
      countEl.textContent = cart.length;
      countEl.style.display = cart.length > 0 ? '' : 'none';
    }

    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (itemsEl) itemsEl.innerHTML = '';
      if (nudgeEl) nudgeEl.style.display = 'none';
      if (footEl)  footEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footEl)  footEl.style.display = '';
    if (totalEl) totalEl.textContent = formatRM(subtotal);
    if (nudgeEl) {
      nudgeEl.style.display = '';
      var pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
      if (nudgeFill) nudgeFill.style.width = pct + '%';
      if (nudgeMsg) {
        if (subtotal >= FREE_SHIPPING_THRESHOLD) {
          nudgeMsg.textContent = "You've unlocked free shipping.";
        } else {
          nudgeMsg.textContent = formatRM(FREE_SHIPPING_THRESHOLD - subtotal) + ' away from free shipping.';
        }
      }
    }
    if (itemsEl) {
      itemsEl.innerHTML = cart.map(function (it, idx) {
        return ''
          + '<div class="cart-item">'
          + '  <div class="cart-item__image" style="background:' + (it.bg || 'var(--bg-card)') + '">'
          + '    <span class="lash-glyph" style="width:60%;height:3px"></span>'
          + '  </div>'
          + '  <div class="cart-item__info">'
          + '    <h3>' + it.name + '</h3>'
          + '    <div class="cart-item__variant">' + (it.variant || '') + '</div>'
          + '    <div class="cart-item__price">' + it.price + '</div>'
          + '    <button class="cart-item__remove" data-cart-remove="' + idx + '">Remove</button>'
          + '  </div>'
          + '</div>';
      }).join('');
    }
  }

  function openCart() {
    var drawer = document.querySelector('[data-cart-drawer]');
    var overlay = document.querySelector('[data-cart-overlay]');
    if (drawer) drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    var drawer = document.querySelector('[data-cart-drawer]');
    var overlay = document.querySelector('[data-cart-overlay]');
    if (drawer) drawer.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function showToast(msg) {
    var t = document.querySelector('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(t._tm);
    t._tm = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }
  function addToCart(product) {
    cart.push(product);
    renderCart();
    showToast('Added. One step closer to effortless.');
    setTimeout(openCart, 400);
  }

  function initCart() {
    var openers = document.querySelectorAll('[data-cart-open]');
    openers.forEach(function (b) { b.addEventListener('click', openCart); });
    var closers = document.querySelectorAll('[data-cart-close]');
    closers.forEach(function (b) { b.addEventListener('click', closeCart); });

    document.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add-to-cart]');
      if (add) {
        e.preventDefault();
        var product = {
          id: add.getAttribute('data-product-id'),
          name: add.getAttribute('data-product-name'),
          variant: add.getAttribute('data-product-variant'),
          price: add.getAttribute('data-product-price'),
          bg: add.getAttribute('data-product-bg'),
        };
        addToCart(product);
      }
      var remove = e.target.closest('[data-cart-remove]');
      if (remove) {
        var idx = parseInt(remove.getAttribute('data-cart-remove'), 10);
        cart.splice(idx, 1);
        renderCart();
      }
    });

    renderCart();
  }

  /* -------------------- Lash Finder modal ------------------------------ */
  function initLashFinder() {
    var finder = document.querySelector('[data-finder]');
    if (!finder) return;
    var bar = finder.querySelector('[data-finder-bar]');
    var steps = finder.querySelectorAll('[data-finder-step]');
    var state = { eye: null, look: null, freq: null, flags: [] };
    var currentStep = 0;

    function show(stepIdx) {
      currentStep = stepIdx;
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === stepIdx); });
      if (bar) bar.style.width = ((stepIdx + 1) / steps.length * 100) + '%';
    }

    function open() {
      finder.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      state = { eye: null, look: null, freq: null, flags: [] };
      show(0);
      finder.querySelectorAll('.finder-flag').forEach(function (f) { f.classList.remove('is-on'); });
    }
    function close() {
      finder.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-finder-open]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
    finder.querySelectorAll('[data-finder-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    finder.querySelectorAll('[data-finder-back]').forEach(function (b) {
      b.addEventListener('click', function () { if (currentStep > 0) show(currentStep - 1); });
    });

    finder.querySelectorAll('[data-finder-pick="eye"]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.eye = b.getAttribute('data-value');
        show(1);
      });
    });
    finder.querySelectorAll('[data-finder-pick="look"]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.look = b.getAttribute('data-value');
        show(2);
      });
    });
    finder.querySelectorAll('[data-finder-pick="freq"]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.freq = b.getAttribute('data-value');
        show(3);
      });
    });
    finder.querySelectorAll('[data-finder-flag]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-value');
        b.classList.toggle('is-on');
        if (b.classList.contains('is-on')) {
          if (state.flags.indexOf(v) === -1) state.flags.push(v);
        } else {
          state.flags = state.flags.filter(function (x) { return x !== v; });
        }
      });
    });
    var doneBtn = finder.querySelector('[data-finder-done]');
    if (doneBtn) doneBtn.addEventListener('click', function () { show(4); });
  }

  /* -------------------- PDP — variant selector + accordion ------------- */
  function initPDP() {
    var variants = document.querySelectorAll('[data-pdp-variant]');
    if (variants.length) {
      variants.forEach(function (b) {
        b.addEventListener('click', function () {
          variants.forEach(function (x) { x.classList.remove('is-active'); });
          b.classList.add('is-active');
          var sku = b.getAttribute('data-sku');
          var skuEl = document.querySelector('[data-pdp-sku]');
          if (skuEl && sku) skuEl.textContent = sku;
        });
      });
    }

    var thumbs = document.querySelectorAll('[data-pdp-thumb]');
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        thumbs.forEach(function (x) { x.classList.remove('is-active'); });
        t.classList.add('is-active');
      });
    });

    document.querySelectorAll('[data-accordion]').forEach(function (a) {
      var head = a.querySelector('[data-accordion-head]');
      if (!head) return;
      head.addEventListener('click', function () {
        var open = a.classList.toggle('is-open');
        var icon = head.querySelector('[data-accordion-icon]');
        if (icon) icon.textContent = open ? '−' : '+';
      });
    });
  }

  /* -------------------- Collection tabs (homepage discovery) ----------- */
  function initCollectionTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (root) {
      var tabs = root.querySelectorAll('.collection-tab');
      var panels = root.querySelectorAll('.collection-panel');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute('data-tab');
          tabs.forEach(function (t) {
            var active = t === tab;
            t.classList.toggle('is-active', active);
            t.setAttribute('aria-selected', active ? 'true' : 'false');
          });
          panels.forEach(function (p) {
            p.classList.toggle('is-active', p.getAttribute('data-panel') === target);
          });
        });
      });
    });
  }

  /* -------------------- Hero slider (3 slides, auto-advance) ----------- */
  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    var track = slider.querySelector('.hero-slider__track');
    var slides = track.querySelectorAll('.hero-slider__slide');
    var dotsContainer = slider.querySelector('.hero-slider__dots');
    if (!track || slides.length < 2 || !dotsContainer) return;

    var current = 0;
    var interval;
    var dots = [];

    for (var i = 0; i < slides.length; i++) {
      var dot = document.createElement('button');
      dot.className = 'hero-slider__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.setAttribute('type', 'button');
      (function (idx) { dot.addEventListener('click', function () { goTo(idx); resetInterval(); }); })(i);
      dotsContainer.appendChild(dot);
      dots.push(dot);
    }

    function goTo(idx) {
      current = idx;
      track.scrollTo({ left: track.clientWidth * idx, behavior: 'smooth' });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }
    function next() { goTo((current + 1) % slides.length); }
    function resetInterval() {
      clearInterval(interval);
      interval = setInterval(next, 5000);
    }
    resetInterval();
    slider.addEventListener('mouseenter', function () { clearInterval(interval); });
    slider.addEventListener('mouseleave', resetInterval);

    // Sync dots if user manually swipes
    var scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        var idx = Math.round(track.scrollLeft / track.clientWidth);
        if (idx !== current) {
          current = idx;
          dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
        }
      }, 100);
    });
  }

  /* -------------------- UGC slider (prev/next buttons) ----------------- */
  function initUgcSlider() {
    var slider = document.querySelector('[data-ugc-slider]');
    if (!slider) return;
    var track = slider.querySelector('.ugc-slider__track');
    var prev = slider.querySelector('[data-ugc-prev]');
    var next = slider.querySelector('[data-ugc-next]');
    if (!track) return;

    function step(dir) {
      var firstCard = track.querySelector('.ugc-card');
      if (!firstCard) return;
      var cardW = firstCard.getBoundingClientRect().width + 12;
      track.scrollBy({ left: cardW * dir, behavior: 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  }

  /* ==================== COMPARE STYLES ==================== */

  function initCompare() {
    var modal = document.getElementById('compareModal');
    var picker = document.getElementById('comparePicker');
    var pickerContent = document.getElementById('comparePickerContent');
    var colLeft = document.getElementById('compareColLeft');
    var colRight = document.getElementById('compareColRight');
    var emptyState = document.getElementById('compareEmpty');

    if (!modal) return; // Not on product page

    var currentStyleId = null;
    var compareStyleId = null;

    var GROUPS = [
      { key: 'Natural',      styles: ['inbox', 'minutes', 'kickoff'] },
      { key: 'Light Makeup', styles: ['boardroom', 'pitch', 'memo'] },
      { key: 'Full Glam',    styles: ['afterhours', 'twilight', 'nightshift', 'vip'] }
    ];

    var GROUP_SLUG = {
      'Natural':      'natural',
      'Light Makeup': 'light-makeup',
      'Full Glam':    'full-glam'
    };

    /* --- Open / close modal --- */
    function openModal(styleId) {
      currentStyleId = styleId;
      renderLeft(styleId);
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      modal.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    /* --- Open / close picker --- */
    function openPicker() {
      renderPicker();
      picker.classList.add('is-open');
      var btn = colRight.querySelector('[data-open-picker]');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }

    function closePicker() {
      picker.classList.remove('is-open');
      var btn = colRight.querySelector('[data-open-picker]');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }

    /* --- Drama dots helper --- */
    function dramaDots(level) {
      var html = '<span class="compare-drama">';
      for (var i = 1; i <= 5; i++) {
        if (i <= level) {
          html += '<span class="compare-drama__dot compare-drama__dot--filled" aria-hidden="true">&#9679;</span>';
        } else {
          html += '<span class="compare-drama__dot" aria-hidden="true">&#9675;</span>';
        }
      }
      html += '</span>';
      return html;
    }

    /* --- Render a product column --- */
    function renderCol(container, styleId) {
      var s = LASH_STYLES[styleId];
      if (!s) return;

      var badgeClass = 'style-badge--' + GROUP_SLUG[s.group];

      var html = '<img class="compare-col__photo" src="' + s.image + '" alt="' + s.name + ' lash style on eye" loading="lazy">';
      html += '<p class="compare-col__name">' + s.name + '</p>';
      html += '<p class="compare-col__tagline">' + s.tagline + '</p>';
      html += '<span class="style-badge ' + badgeClass + '">' + s.group + '</span>';
      html += '<div class="compare-col__attrs">';
      html += '<div class="compare-attr"><span class="compare-attr__label">Drama</span><span class="compare-attr__value">' + dramaDots(s.drama) + '</span></div>';
      html += '<div class="compare-attr"><span class="compare-attr__label">Eye type</span><span class="compare-attr__value">' + s.eyeType + '</span></div>';
      html += '<div class="compare-attr"><span class="compare-attr__label">Length</span><span class="compare-attr__value">' + s.length + '</span></div>';
      html += '<div class="compare-attr"><span class="compare-attr__label">Curl</span><span class="compare-attr__value">' + s.curl + '</span></div>';
      html += '<div class="compare-attr"><span class="compare-attr__label">Design</span><span class="compare-attr__value">' + s.design + '</span></div>';
      html += '</div>';
      html += '<p class="compare-col__price">' + s.price + '</p>';
      html += '<button class="compare-col__atb" data-add-style="' + styleId + '">Add to bag</button>';

      // Append to container (keep selector, replace rest)
      var selector = container.querySelector('.compare-col__selector');
      container.innerHTML = '';
      if (selector) container.appendChild(selector);
      var content = document.createElement('div');
      content.innerHTML = html;
      while (content.firstChild) {
        container.appendChild(content.firstChild);
      }
    }

    /* --- Render left column --- */
    function renderLeft(styleId) {
      renderCol(colLeft, styleId);
    }

    /* --- Render right column --- */
    function renderRight(styleId) {
      if (emptyState) emptyState.style.display = 'none';
      renderCol(colRight, styleId);
    }

    /* --- Render style picker content --- */
    function renderPicker() {
      var html = '';
      for (var g = 0; g < GROUPS.length; g++) {
        var group = GROUPS[g];
        html += '<p class="compare-picker__group-label">' + group.key + '</p>';
        html += '<div class="compare-picker__grid">';
        for (var i = 0; i < group.styles.length; i++) {
          var sid = group.styles[i];
          var s = LASH_STYLES[sid];
          var isCurrent = (sid === currentStyleId);
          var isSelected = (sid === compareStyleId);
          var cardClass = 'compare-picker__card';
          if (isCurrent) cardClass += ' is-current';
          if (isSelected) cardClass += ' is-selected';

          html += '<button class="' + cardClass + '" data-pick-style="' + sid + '"' + (isCurrent ? ' disabled aria-disabled="true"' : '') + '>';
          html += '<img class="compare-picker__thumb" src="' + s.card + '" alt="' + s.name + '" loading="lazy">';
          html += '<span class="compare-picker__card-name">' + s.name + '</span>';
          if (isCurrent) {
            html += '<span class="compare-picker__current-badge">Current</span>';
          }
          html += '<span class="compare-picker__tick" aria-hidden="true">&#10003;</span>';
          html += '</button>';
        }
        html += '</div>';
      }
      pickerContent.innerHTML = html;
    }

    /* --- Event: open modal from trigger button --- */
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-compare-trigger]');
      if (trigger) {
        var styleId = trigger.getAttribute('data-style-id') || 'pitch';
        openModal(styleId);
      }
    });

    /* --- Event: close modal --- */
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-compare-close]')) {
        closeModal();
      }
    });

    /* --- Event: open picker --- */
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-open-picker]')) {
        openPicker();
      }
    });

    /* --- Event: close picker --- */
    document.addEventListener('click', function(e) {
      if (e.target.closest('[data-picker-close]')) {
        closePicker();
      }
    });

    /* --- Event: pick a style --- */
    document.addEventListener('click', function(e) {
      var card = e.target.closest('[data-pick-style]');
      if (card && pickerContent.contains(card)) {
        compareStyleId = card.getAttribute('data-pick-style');
        renderRight(compareStyleId);
        closePicker();
      }
    });

    /* --- Event: add to bag from compare column --- */
    document.addEventListener('click', function(e) {
      var atbBtn = e.target.closest('[data-add-style]');
      if (atbBtn && modal.contains(atbBtn)) {
        var sid = atbBtn.getAttribute('data-add-style');
        var s = LASH_STYLES[sid];
        if (s) {
          addToCart({ id: sid, name: s.name, price: s.price, image: s.image });
        }
      }
    });

    /* --- Keyboard: Escape closes modals --- */
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (picker.classList.contains('is-open')) {
          closePicker();
        } else if (modal.classList.contains('is-open')) {
          closeModal();
        }
      }
    });
  }

  /* -------------------- Init on DOM ready ------------------------------ */
  function init() {
    initUtilityBar();
    initStickyHeader();
    initMobileNav();
    initCart();
    initLashFinder();
    initPDP();
    initCollectionTabs();
    initHeroSlider();
    initUgcSlider();
    initCompare();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
