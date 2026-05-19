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
    inbox:      { id:'inbox',      name:'Inbox',      group:'Natural',      tagline:'The one that looks like nothing — and everything.',  image:'assets/images/products/lash-inbox.png',      card:'assets/images/products/lash-inbox-card.jpg',      drama:1, eyeType:'All eye types',              length:'10.5mm',              curl:'45° B+', design:'V-weave airy fibre',          price:'RM 79'  },
    minutes:    { id:'minutes',    name:'Minutes',    group:'Natural',      tagline:'Your lashes, but better.',                           image:'assets/images/products/lash-minutes.png',    card:'assets/images/products/lash-minutes-card.jpg',    drama:1, eyeType:'Monolid / Inner double lid', length:'10.5mm',              curl:'50° C',  design:'True-to-lash simulation',    price:'RM 85'  },
    kickoff:    { id:'kickoff',    name:'Kickoff',    group:'Natural',      tagline:'Fresh air energy. Younger-looking.',                  image:'assets/images/products/lash-kickoff.png',    card:'assets/images/products/lash-kickoff-card.jpg',    drama:2, eyeType:'All eye types',              length:'10–11mm',             curl:'50° C',  design:'Korean strand-by-strand',    price:'RM 79'  },
    boardroom:  { id:'boardroom',  name:'Boardroom',  group:'Light makeup', tagline:'The one that never gets it wrong.',                   image:'assets/images/products/lash-boardroom.png',  card:'assets/images/products/lash-boardroom-card.jpg',  drama:3, eyeType:'All eye types',              length:'10–11mm',             curl:'50° C',  design:'Classic soft volume',        price:'RM 95'  },
    pitch:      { id:'pitch',      name:'Pitch',      group:'Light makeup', tagline:'Refuse to droop. Stay sharp.',                        image:'assets/images/products/lash-pitch.png',      card:'assets/images/products/lash-pitch-card.jpg',      drama:3, eyeType:'Monolid / Inner double lid', length:'10–11mm',             curl:'70° L',  design:'High-lift 70° L arc',        price:'RM 89'  },
    memo:       { id:'memo',       name:'Memo',       group:'Light makeup', tagline:'Sweet, wide-eyed, unforgettable.',                    image:'assets/images/products/lash-memo.png',       card:'assets/images/products/lash-memo-card.jpg',       drama:3, eyeType:'All eye types',              length:'12mm',                curl:'50° C',  design:'7-cluster fairy burst',      price:'RM 95'  },
    afterhours: { id:'afterhours', name:'Afterhours', group:'Heavy makeup', tagline:'The night queen, no apologies.',                      image:'assets/images/products/lash-afterhours.png', card:'assets/images/products/lash-afterhours-card.jpg', drama:5, eyeType:'Double lid',                 length:'10–11mm',             curl:'50° C',  design:'Sunflower triangle cluster', price:'RM 105' },
    twilight:   { id:'twilight',   name:'Twilight',   group:'Heavy makeup', tagline:'The hour between work and magic.',                    image:'assets/images/products/lash-twilight.jpg',   card:'assets/images/products/lash-twilight-card.jpg',   drama:5, eyeType:'All eye types',              length:'10–11mm',             curl:'50° C',  design:'Volumised natural',          price:'RM 89'  },
    nightshift: { id:'nightshift', name:'Nightshift', group:'Heavy makeup', tagline:'Mysterious. Fatal. Irresistible.',                    image:'assets/images/products/lash-nightshift.jpg', card:'assets/images/products/lash-nightshift-card.jpg', drama:5, eyeType:'Monolid / Double lid',       length:'10–12mm + 13mm outer', curl:'50° C', design:'Fox-eye upswept',            price:'RM 95'  },
    vip:        { id:'vip',        name:'VIP Access', group:'Heavy makeup', tagline:'You were born for the front row.',                    image:'assets/images/products/lash-vip.jpg',        card:'assets/images/products/lash-vip-card.jpg',        drama:5, eyeType:'All eye types',              length:'11–12mm',             curl:'50° C',  design:'Statement volume',           price:'RM 105' }
  };
  /* Accessories — real SKUs, also surface as gifts when lash-tier unlocked */
  var ACCESSORIES = {
    cleanser: { id:'cleanser', name:'Foam Cleanser',  tagline:'Daily lash + lid wash.',  price:'RM 29', image:'assets/images/products/lash-inbox-card.jpg' },
    curler:   { id:'curler',   name:'Thermo Curler',  tagline:'Pre-application set.',    price:'RM 39', image:'assets/images/products/lash-pitch-card.jpg' }
  };

  /* Gift tiers — buy N lashes, get matching accessory free */
  var GIFT_TIERS = [
    { count: 2, giftId: 'cleanser', label: 'Free Foam Cleanser' },
    { count: 3, giftId: 'curler',   label: 'Free Thermo Curler' }
  ];
  var GIFT_TARGET = 3;

  var cart = [];

  function priceToNumber(p) {
    var m = String(p).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : 0;
  }
  function formatRM(n) { return 'RM ' + n.toFixed(0); }

  function lashCount() {
    return cart.reduce(function (s, it) {
      return it.category === 'lash' ? s + (it.qty || 1) : s;
    }, 0);
  }

  /* Sync auto-gift line items to the current lash count */
  function reconcileGifts() {
    cart = cart.filter(function (it) { return it.category !== 'gift'; });
    var lc = lashCount();
    GIFT_TIERS.forEach(function (tier) {
      if (lc >= tier.count) {
        var acc = ACCESSORIES[tier.giftId];
        cart.push({
          id: 'gift-' + acc.id,
          name: acc.name,
          variant: 'Gift with purchase',
          price: 'RM 0',
          originalPrice: acc.price,
          image: acc.image,
          category: 'gift',
          qty: 1
        });
      }
    });
  }

  function totalSavings() {
    return cart.reduce(function (s, it) {
      return it.category === 'gift' ? s + priceToNumber(it.originalPrice) : s;
    }, 0);
  }

  function renderCartItem(it, idx) {
    var img = it.image
      ? '<div class="cart-item__image"><img src="' + it.image + '" alt=""></div>'
      : '<div class="cart-item__image cart-item__image--placeholder"></div>';

    var priceBlock, qtyBlock, removeBtn;
    if (it.category === 'gift') {
      priceBlock = '<div class="cart-item__price"><s class="cart-item__price-was">' + it.originalPrice + '</s> <span class="cart-item__price-free">FREE</span></div>';
      qtyBlock = '<div class="cart-item__gift-pill">Gift</div>';
      removeBtn = '';
    } else {
      var lineTotal = priceToNumber(it.price) * (it.qty || 1);
      priceBlock = '<div class="cart-item__price">' + formatRM(lineTotal) + '</div>';
      qtyBlock = ''
        + '<div class="qty-stepper" role="group" aria-label="Quantity">'
        + '  <button type="button" class="qty-stepper__btn" data-cart-qty="' + idx + '" data-delta="-1" aria-label="Decrease">−</button>'
        + '  <span class="qty-stepper__count tnum">' + (it.qty || 1) + '</span>'
        + '  <button type="button" class="qty-stepper__btn" data-cart-qty="' + idx + '" data-delta="1" aria-label="Increase">+</button>'
        + '</div>';
      removeBtn = '<button type="button" class="cart-item__remove" data-cart-remove="' + idx + '">Remove</button>';
    }

    return ''
      + '<div class="cart-item' + (it.category === 'gift' ? ' cart-item--gift' : '') + '">'
      +   img
      + '  <div class="cart-item__info">'
      + '    <h3 class="cart-item__name">' + it.name + '</h3>'
      +      (it.variant ? '<div class="cart-item__variant">' + it.variant + '</div>' : '')
      +      removeBtn
      + '  </div>'
      + '  <div class="cart-item__right">'
      +      qtyBlock
      +      priceBlock
      + '  </div>'
      + '</div>';
  }

  function renderUpsells(rowEl) {
    if (!rowEl) return;
    var inCart = {};
    cart.forEach(function (it) { if (it.category === 'lash') inCart[it.id] = true; });
    var picks = [];
    for (var key in LASH_STYLES) {
      if (picks.length >= 4) break;
      if (!inCart[key]) picks.push(LASH_STYLES[key]);
    }
    rowEl.innerHTML = picks.map(function (s) {
      return ''
        + '<div class="upsell-card">'
        + '  <div class="upsell-card__image"><img src="' + (s.card || s.image) + '" alt=""></div>'
        + '  <div class="upsell-card__name">' + s.name + '</div>'
        + '  <div class="upsell-card__price">' + s.price + '</div>'
        + '  <button type="button" class="upsell-card__add"'
        + '    data-add-to-cart'
        + '    data-product-id="' + s.id + '"'
        + '    data-product-name="' + s.name + '"'
        + '    data-product-price="' + s.price + '"'
        + '    aria-label="Add ' + s.name + ' to bag">+ Add</button>'
        + '</div>';
    }).join('');
  }

  function renderProgress(drawer) {
    var msgEl = drawer.querySelector('[data-progress-msg]');
    var fillEl = drawer.querySelector('[data-progress-fill]');
    var milestones = drawer.querySelectorAll('[data-milestone]');
    var lc = lashCount();
    var pct = Math.min(100, (lc / GIFT_TARGET) * 100);
    if (fillEl) fillEl.style.width = pct + '%';
    milestones.forEach(function (m) {
      var th = parseInt(m.getAttribute('data-milestone'), 10);
      m.classList.toggle('is-reached', lc >= th);
    });
    if (msgEl) {
      if (lc >= 3) {
        msgEl.innerHTML = '<span class="cart-progress__check">✓</span> All gifts unlocked — you saved ' + formatRM(totalSavings()) + '.';
      } else if (lc === 2) {
        msgEl.innerHTML = '<span class="cart-progress__check">✓</span> Cleanser unlocked. Add <strong>1 more lash</strong> for a free Thermo Curler.';
      } else if (lc === 1) {
        msgEl.innerHTML = 'Add <strong>1 more lash</strong> for a free Foam Cleanser.';
      } else {
        msgEl.innerHTML = 'Add <strong>2 lashes</strong> to unlock a free Foam Cleanser.';
      }
    }
  }

  function renderCart() {
    var drawer = document.querySelector('[data-cart-drawer]');
    var countEl = document.querySelector('[data-cart-count]');
    var totalQty = cart.reduce(function (s, it) {
      return it.category === 'gift' ? s : s + (it.qty || 1);
    }, 0);
    if (countEl) {
      countEl.textContent = totalQty;
      countEl.style.display = totalQty > 0 ? '' : 'none';
    }
    if (!drawer) return;

    var itemsEl = drawer.querySelector('[data-cart-items]');
    var emptyEl = drawer.querySelector('[data-cart-empty]');
    var totalEl = drawer.querySelector('[data-cart-total]');
    var footEl  = drawer.querySelector('[data-cart-foot]');
    var progressEl = drawer.querySelector('[data-cart-progress]');
    var savingsEl = drawer.querySelector('[data-cart-savings]');
    var savingsAmountEl = drawer.querySelector('[data-cart-savings-amount]');
    var countInlineEl = drawer.querySelector('[data-cart-count-inline]');
    var upsellsEl = drawer.querySelector('[data-cart-upsells]');
    var upsellsRowEl = drawer.querySelector('[data-upsells-row]');

    if (countInlineEl) countInlineEl.textContent = totalQty;

    var subtotal = cart.reduce(function (s, it) {
      return it.category === 'gift' ? s : s + (priceToNumber(it.price) * (it.qty || 1));
    }, 0);

    if (totalQty === 0) {
      if (emptyEl) emptyEl.style.display = '';
      if (itemsEl) itemsEl.innerHTML = '';
      if (footEl) footEl.style.display = 'none';
      if (progressEl) progressEl.style.display = 'none';
      if (upsellsEl) upsellsEl.style.display = 'none';
      if (savingsEl) savingsEl.style.display = 'none';
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (footEl)  footEl.style.display = '';
    if (progressEl) progressEl.style.display = '';
    if (upsellsEl) upsellsEl.style.display = '';
    if (totalEl) totalEl.textContent = formatRM(subtotal);

    var savings = totalSavings();
    if (savingsEl) {
      if (savings > 0) {
        savingsEl.style.display = '';
        if (savingsAmountEl) savingsAmountEl.textContent = formatRM(savings);
      } else {
        savingsEl.style.display = 'none';
      }
    }

    if (itemsEl) itemsEl.innerHTML = cart.map(renderCartItem).join('');
    renderProgress(drawer);
    renderUpsells(upsellsRowEl);
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
    if (!product.category) {
      if (LASH_STYLES[product.id]) product.category = 'lash';
      else if (ACCESSORIES[product.id]) product.category = 'accessory';
      else product.category = 'other';
    }
    var key = product.id + '|' + (product.variant || '');
    var existing = cart.filter(function (it) {
      return it.category !== 'gift' && (it.id + '|' + (it.variant || '')) === key;
    })[0];
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      product.qty = 1;
      cart.push(product);
    }
    reconcileGifts();
    renderCart();
    showToast('Added. One step closer to effortless.');
    setTimeout(openCart, 400);
  }

  function changeQty(idx, delta) {
    var item = cart[idx];
    if (!item || item.category === 'gift') return;
    item.qty = (item.qty || 1) + delta;
    if (item.qty <= 0) cart.splice(idx, 1);
    reconcileGifts();
    renderCart();
  }

  function removeItem(idx) {
    var item = cart[idx];
    if (!item || item.category === 'gift') return;
    cart.splice(idx, 1);
    reconcileGifts();
    renderCart();
  }

  function initCart() {
    var openers = document.querySelectorAll('[data-cart-open]');
    openers.forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); openCart(); });
    });
    var closers = document.querySelectorAll('[data-cart-close]');
    closers.forEach(function (b) { b.addEventListener('click', closeCart); });

    document.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add-to-cart]');
      if (add) {
        e.preventDefault();
        var pid = add.getAttribute('data-product-id');
        var product = {
          id: pid,
          name: add.getAttribute('data-product-name'),
          variant: add.getAttribute('data-product-variant') || '',
          price: add.getAttribute('data-product-price'),
          image: add.getAttribute('data-product-image') || ''
        };
        if (LASH_STYLES[pid]) {
          product.category = 'lash';
          if (!product.image) product.image = LASH_STYLES[pid].card || LASH_STYLES[pid].image;
        } else if (ACCESSORIES[pid]) {
          product.category = 'accessory';
          if (!product.image) product.image = ACCESSORIES[pid].image;
        }
        addToCart(product);
        return;
      }
      var remove = e.target.closest('[data-cart-remove]');
      if (remove) {
        removeItem(parseInt(remove.getAttribute('data-cart-remove'), 10));
        return;
      }
      var qty = e.target.closest('[data-cart-qty]');
      if (qty) {
        changeQty(
          parseInt(qty.getAttribute('data-cart-qty'), 10),
          parseInt(qty.getAttribute('data-delta'), 10)
        );
        return;
      }
      var apply = e.target.closest('[data-discount-apply]');
      if (apply) {
        e.preventDefault();
        var input = document.querySelector('[data-discount-input]');
        var code = input ? input.value.trim() : '';
        if (!code) return;
        showToast('No discount code matches "' + code + '".');
      }
    });

    renderCart();
  }

  /* -------------------- Newsletter popup ------------------------------- */
  function initNewsletterPopup() {
    var popup = document.querySelector('[data-newsletter-popup]');
    if (!popup) return;
    try {
      if (localStorage.getItem('santai-newsletter-dismissed') === '1') return;
    } catch (e) { /* localStorage blocked — show anyway */ }

    var openTimer = setTimeout(function () {
      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      var firstInput = popup.querySelector('input');
      if (firstInput) try { firstInput.focus(); } catch (e) {}
    }, 5000);

    function dismiss() {
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
      try { localStorage.setItem('santai-newsletter-dismissed', '1'); } catch (e) {}
      clearTimeout(openTimer);
    }

    popup.querySelectorAll('[data-newsletter-close]').forEach(function (el) {
      el.addEventListener('click', dismiss);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && popup.classList.contains('is-open')) dismiss();
    });

    var form = popup.querySelector('[data-newsletter-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        dismiss();
        showToast('Welcome to the list. Watch your inbox.');
      });
    }
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

  /* -------------------- Search results page ---------------------------- */
  function initSearch() {
    var resultsEl = document.querySelector('[data-search-results]');
    if (!resultsEl) return;

    var countEl = document.querySelector('[data-search-count]');
    var emptyEl = document.querySelector('[data-search-empty]');
    var queryEl = document.querySelector('[data-search-query]');
    var input   = document.querySelector('[data-search-input]');

    /* Build searchable corpus from existing data */
    var corpus = [];
    for (var sid in LASH_STYLES) {
      var s = LASH_STYLES[sid];
      corpus.push({
        type: 'lash',
        name: s.name,
        price: s.price,
        image: s.card || s.image || 'assets/images/products/lash-1-inbox.jpg',
        variant: s.group,
        url: 'product.html?style=' + sid,
        text: [s.name, s.group, s.eyeType, s.tagline, s.design, sid].join(' ').toLowerCase()
      });
    }
    for (var aid in ACCESSORIES) {
      var a = ACCESSORIES[aid];
      corpus.push({
        type: 'accessory',
        name: a.name,
        price: a.price,
        image: a.image,
        variant: 'Accessory',
        url: 'product-' + aid + '.html',
        text: [a.name, 'accessory', a.tagline].join(' ').toLowerCase()
      });
    }

    function search(query) {
      query = String(query || '').trim().toLowerCase();
      if (!query) return [];
      var words = query.split(/\s+/);
      return corpus.filter(function (item) {
        return words.every(function (w) { return item.text.indexOf(w) !== -1; });
      });
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
      });
    }

    function render(results, query) {
      var safeQuery = escapeHtml(query);
      if (queryEl) queryEl.textContent = query;

      if (!query) {
        resultsEl.innerHTML = '';
        if (countEl) countEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'none';
        return;
      }

      if (results.length === 0) {
        resultsEl.innerHTML = '';
        if (countEl) countEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = '';
        return;
      }

      if (countEl) {
        countEl.style.display = '';
        countEl.innerHTML = results.length + ' result' + (results.length === 1 ? '' : 's')
          + ' for <strong>"' + safeQuery + '"</strong>';
      }
      if (emptyEl) emptyEl.style.display = 'none';

      resultsEl.innerHTML = results.map(function (r) {
        return ''
          + '<a class="product-card" href="' + r.url + '">'
          + '  <div class="product-card__image">'
          + '    <img class="product-card__photo" src="' + r.image + '" alt="' + escapeHtml(r.name) + '" loading="lazy">'
          + '    <span class="product-card__hover-cue" aria-hidden="true">→</span>'
          + '  </div>'
          + '  <div class="product-card__title">' + escapeHtml(r.name) + '</div>'
          + '  <div class="product-card__variant">' + escapeHtml(r.variant || '') + '</div>'
          + '  <div class="product-card__price tnum">' + escapeHtml(r.price) + '</div>'
          + '</a>';
      }).join('');
    }

    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get('q') || '';
    if (input && initialQuery) input.value = initialQuery;

    render(search(initialQuery), initialQuery);
  }

  /* -------------------- Collection filter chips ------------------------ */
  function initCollectionFilter() {
    var grid = document.querySelector('[data-filter-grid]');
    var chips = document.querySelectorAll('[data-filter-chip]');
    if (!grid || !chips.length) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
    var countEl = document.querySelector('[data-result-count]');
    var totalCards = cards.length;

    function applyFilter(key, value) {
      var visible = 0;
      cards.forEach(function (card) {
        var show = false;
        if (!key || key === 'all') {
          show = true;
        } else if (key === 'makeup') {
          show = card.getAttribute('data-makeup') === value;
        } else if (key === 'eye') {
          var eye = card.getAttribute('data-eye') || '';
          show = eye.split(/\s+/).indexOf(value) !== -1;
        }
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      chips.forEach(function (c) {
        var ck = c.getAttribute('data-filter-key');
        var cv = c.getAttribute('data-filter-value') || '';
        var match = (key === 'all' && ck === 'all') || (ck === key && cv === value);
        c.classList.toggle('is-active', match);
      });

      if (countEl) {
        countEl.textContent = 'Showing ' + visible + ' of ' + totalCards + ' styles';
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        applyFilter(chip.getAttribute('data-filter-key'), chip.getAttribute('data-filter-value') || '');
      });
    });

    /* Initial state from URL: ?makeup=natural or ?eye=monolid */
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('makeup')) {
      applyFilter('makeup', urlParams.get('makeup'));
    } else if (urlParams.has('eye')) {
      applyFilter('eye', urlParams.get('eye'));
    }
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
      { key: 'Light makeup', styles: ['boardroom', 'pitch', 'memo'] },
      { key: 'Heavy makeup', styles: ['afterhours', 'twilight', 'nightshift', 'vip'] }
    ];

    var GROUP_SLUG = {
      'Natural':      'natural',
      'Light makeup': 'light-makeup',
      'Heavy makeup': 'heavy-makeup'
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

      // Preserve the selector element and replace everything else
      var selectorEl = container.querySelector('.compare-col__selector');
      var selectorHTML = selectorEl ? selectorEl.outerHTML : '';
      var content = document.createElement('div');
      content.innerHTML = selectorHTML + html;
      container.innerHTML = '';
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
          closeModal();
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
    initNewsletterPopup();
    initLashFinder();
    initSearch();
    initCollectionFilter();
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
