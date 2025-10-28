/* === Discount-enabled MiniShop (drop into your app.js) === */
(() => {
  // ====== DOM ======
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  const elGrid      = $('#grid');
  const elEmpty     = $('#empty');
  const elQ         = $('#q');
  const elCat       = $('#cat');
  const elSort      = $('#sort');

  const elCartBtn   = $('#cartBtn');
  const elCartBadge = $('#cartBadge');
  const elDrawer    = $('#drawer');
  const elScrim     = $('#drawer .scrim');
  const elPanel     = $('#drawer .panel');
  const elCloseCart = $('#closeCart');
  const elCartLines = $('#cartLines');

  const elSubTotal  = $('#subTotal');
  const elTax       = $('#tax');   // note: HTML labels are swapped; we keep DOM ids as-is but write correct values
  const elShip      = $('#ship');  // tax label uses id="ship" in HTML
  const elGrand     = $('#grand');

  const elDemoAdd   = $('#demoAdd');

  const elCheckoutBtn = $('#checkout');
  const ckDialog    = $('#checkoutDialog');
  const ckForm      = $('#checkoutForm');
  const ckCloseBtn  = $('#checkoutDialog .ck-close');
  const ckCancelBtn = $('#ckCancel');

  const ckItemsCount = $('#ckItemsCount');
  const ckSub        = $('#ckSub');
  const ckTax        = $('#ckTax');
  const ckTotal      = $('#ckTotal');

  // Discount elements (we inserted these in HTML)
  const ckDiscountInput = $('#ckDiscount');
  const ckApplyBtn = $('#ckApplyDiscount');
  const ckDiscountMsg = $('#ckDiscountMsg');

  // Country input (checkout)
  const ckCountry = $('#ckCountry');

  // New: containers for list vs. product page
  const elMain      = document.querySelector('main');
  const elProductPage = document.getElementById('productPage');

  // ====== Config (add shipping config here) ======
  const CART_KEY     = 'minishop:cart';
  const DISCOUNT_KEY = 'minishop:discount';
  const TAX_RATE     = 0.00; // NOTE: this is a fixed tax amount in your app (keeps original behavior)

  // Shipping (adjust amounts as you like)
  const SHIPPING_DOMESTIC = 6.99;
  const SHIPPING_INTERNATIONAL = 64.99;
  const SHIP_LABEL   = '$0.00';

  // ====== Discount table (edit / extend as needed) ======
  // type: 'percent' or 'fixed' (fixed is same currency as your shop)
  // optional minSubtotal: required minimum subtotal before discount applies
  const DISCOUNTS = {
    'SALAAM10': { type: 'percent', value: 10, label: '10% off' }
  };

  // ====== State ======
  let PRODUCTS = [];
  let FILTERED = [];
  let currencySymbol = '$';
  let APPLIED_DISCOUNT = null; // { code: 'SAVE10', meta: {..}, amount: 5.00 }

  // ====== Utils ======
  const fmt = (n) => `${currencySymbol}${Number(n || 0).toFixed(2)}`;
  const by = (k, dir = 1, proj = (x)=>x[k]) => (a,b) => (proj(a) > proj(b) ? 1 : proj(a) < proj(b) ? -1 : 0) * dir;

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    return res.json();
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  }

  function setCart(arr) {
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
    updateCartBadge();
  }

  function addToCart(item) {
    const cart = getCart();
    const found = cart.find(x => x.id === item.id);
    if (found) found.qty += item.qty || 1;
    else cart.push({ id: item.id, title: item.title, price: Number(item.price), qty: item.qty || 1, image: item.image || '' });
    setCart(cart);
    renderCartLines();
  }

  function removeFromCart(id) {
    setCart(getCart().filter(x => x.id !== id));
    renderCartLines();
  }

  function updateQty(id, qty) {
    const cart = getCart();
    const line = cart.find(x => x.id === id);
    if (!line) return;
    line.qty = Math.max(1, Number(qty) || 1);
    setCart(cart);
    renderCartLines();
  }

  function clearCart() {
    setCart([]);
    // also clear applied discount since nothing to apply to
    setAppliedDiscount(null);
    renderCartLines();
  }

  // ====== Shipping helpers ======
  function normalizeCountry(c) {
    return String(c || '').trim().toLowerCase();
  }
  function isDomesticCountry(country) {
    if (!country) return true; // treat empty as domestic by default
    const n = normalizeCountry(country);
    return ['united states', 'usa', 'us'].includes(n);
  }
  function computeShippingForCountry(country) {
    return isDomesticCountry(country) ? SHIPPING_DOMESTIC : SHIPPING_INTERNATIONAL;
  }

  function getCurrentShipping() {
    const countryVal = ckCountry?.value || '';
    return computeShippingForCountry(countryVal);
  }

  // ====== Totals (now accepts shipping param and returns shipping) ======
  function totals(cart, applied, shipping = 0) {
    const subtotal = cart.reduce((s,i) => s + Number(i.price) * Number(i.qty), 0);

    // compute discount amount
    let discount = 0;
    if (applied && applied.meta) {
      const meta = applied.meta;
      if (!meta.minSubtotal || subtotal >= (meta.minSubtotal || 0)) {
        if (meta.type === 'percent') discount = +(subtotal * (meta.value / 100)).toFixed(2);
        else if (meta.type === 'fixed') discount = +Number(meta.value).toFixed(2);
        discount = Math.min(discount, subtotal);
      } else discount = 0;
    }

    const taxable = Math.max(0, subtotal - discount);
    const tax = TAX_RATE; // retained fixed tax behavior
    const grand = +(taxable + shipping + tax).toFixed(2);

    return { subtotal, discount, tax, shipping, grand };
  }

  function updateCartBadge() {
    const count = getCart().reduce((s,i)=>s+Number(i.qty),0);
    elCartBadge.textContent = String(count);
  }

  // ====== Catalog ======
  function renderProducts(items) {
    elGrid.innerHTML = '';
    if (!items.length) {
      elEmpty.hidden = false;
      return;
    }
    elEmpty.hidden = true;

    const frag = document.createDocumentFragment();
    items.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <a class="card-link" href="#/p/${encodeURIComponent(p.id)}" aria-label="Open ${p.title}">
          <div class="thumb">
            ${p.badge ? `<span class="pill">${p.badge}</span>` : ''}
            ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
          </div>
          <div class="body">
            <div class="title">${p.title}</div>
            <div class="price-row">
              <div class="price">${fmt(p.price)}</div>
            </div>
          </div>
        </a>
        <div class="card-actions">
          <button class="btn primary add" aria-label="Add ${p.title} to cart">Add to Cart</button>
        </div>
      `;
      // prevent navigation when adding to cart from card
      $('.add', card).addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({ id:p.id, title:p.title, price:p.price, qty:1, image:p.image });
      });
      frag.appendChild(card);
    });
    elGrid.appendChild(frag);
  }

  function applyFilters() {
    const q = (elQ.value || '').trim().toLowerCase();
    const cat = elCat.value || '';
    let arr = PRODUCTS.slice();

    if (q) {
      arr = arr.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
      );
    }
    if (cat) {
      arr = arr.filter(p => String(p.category) === cat);
    }

    switch (elSort.value) {
      case 'price-asc':  arr.sort(by('price', +1, x=>Number(x.price))); break;
      case 'price-desc': arr.sort(by('price', -1, x=>Number(x.price))); break;
      case 'rating':     arr.sort(by('rating', -1, x=>Number(x.rating || 0))); break;
      case 'new':        arr.sort(by('createdAt', -1, x=>new Date(x.createdAt||0).getTime())); break;
      default:           arr.sort(by('featured', -1, x=>(x.featured?1:0))); break;
    }

    FILTERED = arr;
    renderProducts(FILTERED);
  }

  function populateCategories() {
    const cats = [...new Set(PRODUCTS.map(p => String(p.category || '')))].filter(Boolean).sort();
    elCat.innerHTML = `<option value="">All categories</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  // ====== Drawer (Cart) ======
  function openDrawer() {
    elDrawer.classList.add('open');
    elDrawer.setAttribute('aria-hidden', 'false');
    renderCartLines();
  }
  function closeDrawer() {
    elDrawer.classList.remove('open');
    elDrawer.setAttribute('aria-hidden', 'true');
  }

  // ====== Discount helpers ======
  function loadAppliedDiscount() {
    try {
      const raw = localStorage.getItem(DISCOUNT_KEY);
      if (!raw) { APPLIED_DISCOUNT = null; return; }
      APPLIED_DISCOUNT = JSON.parse(raw);
    } catch {
      APPLIED_DISCOUNT = null;
    }
  }
  function persistAppliedDiscount() {
    if (APPLIED_DISCOUNT) localStorage.setItem(DISCOUNT_KEY, JSON.stringify(APPLIED_DISCOUNT));
    else localStorage.removeItem(DISCOUNT_KEY);
  }
  function setAppliedDiscount(obj) {
    APPLIED_DISCOUNT = obj;
    persistAppliedDiscount();
    renderCartLines();
  }

  function validateDiscount(code, subtotal) {
    if (!code) return { ok:false, reason: 'Enter a code' };
    const key = String(code || '').trim().toUpperCase();
    const meta = DISCOUNTS[key];
    if (!meta) return { ok:false, reason: 'Invalid code' };
    if (meta.minSubtotal && subtotal < meta.minSubtotal) {
      return { ok:false, reason: `Requires minimum ${fmt(meta.minSubtotal)}` };
    }
    return { ok:true, code:key, meta };
  }

  // ====== Drawer rendering (now shows discount row if applied) ======
  function renderCartLines() {
    const cart = getCart();
    const currentShipping = getCurrentShipping();
    const { subtotal, discount, tax, shipping, grand } = totals(cart, APPLIED_DISCOUNT, currentShipping);

    elCartLines.innerHTML = '';

    if (!cart.length) {
      elCartLines.innerHTML = `<div class="empty">Your cart is empty.</div>`;
    } else {
      const frag = document.createDocumentFragment();
      cart.forEach(line => {
        const row = document.createElement('div');
        row.className = 'line';
        row.innerHTML = `
          <div class="mini">${line.image ? `<img src="${line.image}" alt="" style="max-width:70%; max-height:70%; object-fit:contain">` : ''}</div>
          <div>
            <div class="name">${line.title}</div>
            <div class="desc">${fmt(line.price)} each</div>
            <div class="qty" aria-label="Quantity controls">
              <button type="button" aria-label="Decrease">−</button>
              <input type="number" min="1" value="${line.qty}">
              <button type="button" aria-label="Increase">+</button>
            </div>
          </div>
          <div style="display:grid; gap:8px; justify-items:end">
            <div><strong>${fmt(line.price * line.qty)}</strong></div>
            <button class="btn" type="button">Remove</button>
          </div>
        `;
        const [decBtn, qtyInput, incBtn] = $$('.qty button, .qty input', row);
        decBtn.addEventListener('click', () => updateQty(line.id, line.qty - 1));
        incBtn.addEventListener('click', () => updateQty(line.id, line.qty + 1));
        qtyInput.addEventListener('change', (e) => updateQty(line.id, e.target.value));
        $('.btn', row).addEventListener('click', () => removeFromCart(line.id));
        frag.appendChild(row);
      });

      // If discount applied, show a small line summarizing it
      if (APPLIED_DISCOUNT && (discount > 0)) {
        const discRow = document.createElement('div');
        discRow.className = 'line';
        discRow.innerHTML = `
          <div style="width:64px"></div>
          <div>
            <div class="name">Discount: ${APPLIED_DISCOUNT.code}</div>
            <div class="desc">${APPLIED_DISCOUNT.meta.label || ''}</div>
          </div>
          <div style="display:grid; gap:8px; justify-items:end">
            <div><strong>- ${fmt(discount)}</strong></div>
            <button class="btn" type="button" id="removeDiscount">Remove</button>
          </div>
        `;
        frag.appendChild(discRow);
      }

      elCartLines.appendChild(frag);
    }

    elSubTotal.textContent = fmt(subtotal);
    // NOTE: your HTML labels are arranged as: Shipping has id="tax", Tax has id="ship".
    // We will write shipping into elTax (id="tax") and tax into elShip (id="ship") so labels are correct.
    elTax.textContent      = fmt(shipping);  // shows shipping amount next to "Shipping" label
    elShip.textContent     = fmt(tax);       // shows tax amount next to "Tax" label
    elGrand.textContent    = fmt(grand);

    // update checkout dialog totals if open
    if (ckDialog?.open) {
      ckItemsCount.textContent = String(cart.reduce((s,i)=>s+Number(i.qty),0));
      ckSub.textContent   = fmt(subtotal);
      // keep ckTax as tax only (checkout UI has its own small fields)
      ckTax.textContent   = fmt(tax);
      ckTotal.textContent = fmt(grand);

      // reflect discount message in checkout UI
      if (APPLIED_DISCOUNT && APPLIED_DISCOUNT.meta && totals(cart, APPLIED_DISCOUNT, currentShipping).discount > 0) {
        ckDiscountMsg.textContent = `${APPLIED_DISCOUNT.code} applied — saved ${fmt(totals(cart, APPLIED_DISCOUNT, currentShipping).discount)}`;
      } else {
        ckDiscountMsg.textContent = APPLIED_DISCOUNT ? 'Code not applicable to current subtotal' : '';
      }
    }
  }

  // ====== Checkout (FormSubmit wiring; native POST) ======
  const COPY_ME = ''; // e.g. 'orders@yourdomain.com' or leave empty

  const FORMSUBMIT_ACTION = 'https://formsubmit.co/salaamirah@yahoo.com'; // enforced
  if (ckForm) {
    const currentAction = ckForm.getAttribute('action') || '';
    if (!/^https:\/\/formsubmit\.co\//i.test(currentAction)) {
      ckForm.setAttribute('action', FORMSUBMIT_ACTION);
    }
    ckForm.setAttribute('method', 'POST');
  }

  function ensureHidden(name, value) {
    let input = ckForm.querySelector(`input[name="${name}"]`);
    if (!input) {
      input = document.createElement('input'); input.type = 'hidden'; input.name = name; ckForm.appendChild(input);
    }
    input.value = value;
  }

  function cartToText(items) {
    if (!items.length) return '(no items)';
    return items.map(i => `${i.title} × ${i.qty} — ${fmt(Number(i.price) * Number(i.qty))}`).join('\n');
  }

  function cartToJSON(items, t) {
    return JSON.stringify({
      items: items.map(i => ({
        id: i.id, title: i.title, qty: Number(i.qty),
        price: Number(i.price),
        lineTotal: +(Number(i.price) * Number(i.qty)).toFixed(2)
      })),
      totals: {
        subtotal: +t.subtotal.toFixed(2),
        discount: +t.discount.toFixed(2),
        tax: +t.tax.toFixed(2),
        shipping: +t.shipping.toFixed(2),
        total: +t.grand.toFixed(2),
        currency: 'USD'
      },
      discountCode: APPLIED_DISCOUNT ? APPLIED_DISCOUNT.code : null,
      createdAt: new Date().toISOString()
    });
  }

  function openCheckout() {
    const cart = getCart();
    const currentShipping = getCurrentShipping();
    const t = totals(cart, APPLIED_DISCOUNT, currentShipping);
    ckItemsCount.textContent = String(cart.reduce((s,i)=>s+Number(i.qty),0));
    ckSub.textContent   = fmt(t.subtotal);
    ckTax.textContent   = fmt(t.tax);
    ckTotal.textContent = fmt(t.grand);

    // show discount message if any
    if (APPLIED_DISCOUNT && t.discount > 0) {
      ckDiscountMsg.textContent = `${APPLIED_DISCOUNT.code} applied — saved ${fmt(t.discount)}`;
    } else if (APPLIED_DISCOUNT && t.discount === 0) {
      ckDiscountMsg.textContent = `Code ${APPLIED_DISCOUNT.code} not applicable`;
    } else {
      ckDiscountMsg.textContent = '';
    }

    if (ckDialog && typeof ckDialog.showModal === 'function') ckDialog.showModal();
  }
  function closeCheckout() { try { ckDialog?.close(); } catch {} }

  // Single submit listener (includes shipping)
  ckForm?.addEventListener('submit', (ev) => {
    const cart = getCart();
    const currentShipping = getCurrentShipping();
    const t = totals(cart, APPLIED_DISCOUNT, currentShipping);
    ensureHidden('order_items', cartToText(cart));
    ensureHidden('order_json',  cartToJSON(cart, t));
    ensureHidden('subtotal',    t.subtotal.toFixed(2));
    ensureHidden('discount',    t.discount.toFixed(2));
    ensureHidden('tax',         t.tax.toFixed(2));
    ensureHidden('shipping',    t.shipping.toFixed(2));
    ensureHidden('total',       t.grand.toFixed(2));
    ensureHidden('discount_code', APPLIED_DISCOUNT ? APPLIED_DISCOUNT.code : '');
    if (COPY_ME) ensureHidden('_cc', COPY_ME);
    const emailField = ckForm.querySelector('input[name="email"]');
    if (emailField?.value) ensureHidden('_replyto', emailField.value);

    // NOTE: clear the cart only after successful final submit — we remove it here to mirror original behavior:
    localStorage.removeItem(CART_KEY);
    // keep discount saved across sessions until removed or cart cleared
  });

  // ====== Discount UI wiring ======
  function applyDiscountCodeFromInput() {
    const code = (ckDiscountInput?.value || '').trim().toUpperCase();
    const cart = getCart();
    const subtotal = cart.reduce((s,i) => s + Number(i.price) * Number(i.qty), 0);
    const res = validateDiscount(code, subtotal);
    if (!res.ok) {
      setAppliedDiscount({ code: code, meta: null });
      ckDiscountMsg.textContent = res.reason;
      renderCartLines();
      return;
    }
    // success
    setAppliedDiscount({ code: res.code, meta: res.meta });
    ckDiscountMsg.textContent = `${res.code} applied — ${res.meta.label || ''}`;
    // re-render totals
    renderCartLines();
  }

  ckApplyBtn?.addEventListener('click', () => applyDiscountCodeFromInput());

  // allow Enter key inside discount input to apply
  ckDiscountInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyDiscountCodeFromInput(); }
  });

  // remove discount button in drawer (delegated)
  elCartLines?.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'removeDiscount') {
      setAppliedDiscount(null);
      ckDiscountInput.value = '';
      ckDiscountMsg.textContent = '';
    }
  });

  // Live update when user changes country on checkout
  ckCountry?.addEventListener('input', () => {
    // re-render drawer and checkout totals live
    renderCartLines();
    if (ckDialog?.open) {
      // reflect shipping in checkout summary
      const cart = getCart();
      const currentShipping = getCurrentShipping();
      const t = totals(cart, APPLIED_DISCOUNT, currentShipping);
      ckSub.textContent = fmt(t.subtotal);
      ckTax.textContent = fmt(t.tax);
      ckTotal.textContent = fmt(t.grand);
      if (APPLIED_DISCOUNT && t.discount > 0) ckDiscountMsg.textContent = `${APPLIED_DISCOUNT.code} applied — saved ${fmt(t.discount)}`;
      else if (APPLIED_DISCOUNT) ckDiscountMsg.textContent = `Code ${APPLIED_DISCOUNT.code} not applicable`;
      else ckDiscountMsg.textContent = '';
    }
  });

  // ====== Events / Wiring ======
  elQ?.addEventListener('input', () => { applyFilters(); announceCount(); });
  elCat?.addEventListener('change', () => { applyFilters(); announceCount(); });
  elSort?.addEventListener('change', () => { applyFilters(); announceCount(); });

  elCartBtn?.addEventListener('click', openDrawer);
  elCloseCart?.addEventListener('click', closeDrawer);
  elScrim?.addEventListener('click', closeDrawer);

  $('#clearCart')?.addEventListener('click', clearCart);
  elCheckoutBtn?.addEventListener('click', (e) => { e.preventDefault(); openCheckout(); });
  ckCloseBtn?.addEventListener('click', closeCheckout);
  ckCancelBtn?.addEventListener('click', closeCheckout);

  elDemoAdd?.addEventListener('click', async () => {
    if (!FILTERED.length) return;
    const picks = FILTERED.slice(0, Math.min(3, FILTERED.length));
    picks.forEach(p => addToCart({ id:p.id, title:p.title, price:p.price, qty:1, image:p.image }));
    openDrawer();
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); elQ?.focus(); elQ?.select(); }
    if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'c') {
      const isOpen = elDrawer.classList.contains('open'); isOpen ? closeDrawer() : openDrawer();
    }
  });

  // ====== Simple Hash Router for Product Page ======
  function go(route) { location.hash = route; }
  function currentRoute() { return location.hash.replace(/^#/, '') || '/'; }
  function findProduct(id) { return PRODUCTS.find(p => String(p.id) === String(id)); }

  function showList() {
    if (elMain) elMain.hidden = false;
    if (elProductPage) elProductPage.hidden = true;
  }

  function showProduct(id) {
    const p = findProduct(id);
    if (!elProductPage) return;

    if (!p) {
      elProductPage.innerHTML = `<div class="empty">Product not found.</div>`;
    } else {
      elProductPage.innerHTML = `
        <div class="pp-wrap">
          <nav class="pp-breadcrumb">
            <a href="#/" class="pp-back" aria-label="Back to products">← Back</a>
          </nav>
          <article class="pp-card">
            <div class="pp-media">
              ${p.image ? `<img src="${p.image}" alt="${p.title}">` : `<div class="pp-placeholder">No image</div>`}
              ${p.badge ? `<span class="pill">${p.badge}</span>` : ''}
            </div>
            <div class="pp-body">
              <h1 class="pp-title">${p.title}</h1>
              <div class="pp-meta">
                <span class="pp-price">${fmt(p.price)}</span>
              </div>
              ${p.category ? `<div class="pp-cat">Category: <strong>${p.category}</strong></div>` : ''}
              <p class="pp-desc">${p.description || ''}</p>
              <div class="pp-actions">
                <button class="btn primary" id="ppAdd">Add to Cart</button>
                <button class="btn" id="ppBuy">Buy Now</button>
              </div>
            </div>
          </article>
        </div>
      `;

      elProductPage.querySelector('#ppAdd')?.addEventListener('click', () => {
        addToCart({ id: p.id, title: p.title, price: p.price, qty: 1, image: p.image });
      });
      elProductPage.querySelector('#ppBuy')?.addEventListener('click', () => {
        addToCart({ id: p.id, title: p.title, price: p.price, qty: 1, image: p.image });
        openDrawer();
      });
    }

    if (elMain) elMain.hidden = true;
    elProductPage.hidden = false;
    document.title = p ? `${p.title} — MiniShop` : 'MiniShop';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function handleRoute() {
    const route = currentRoute();
    const m = route.match(/^\/?p\/(.+)$/);
    if (m) showProduct(decodeURIComponent(m[1]));
    else { document.title = 'MiniShop'; showList(); }
  }

  window.addEventListener('hashchange', handleRoute);

  // ====== Accessibility helper ======
  function announceCount(){
    const c = FILTERED.length;
    elGrid?.setAttribute('aria-label', `${c} product${c===1?'':'s'} shown`);
  }

  // ====== Init ======
  (async function init() {
    try {
      loadAppliedDiscount();

      const data = await fetchJSON('./products.json');
      const raw = Array.isArray(data) ? data : (data.products || []);

      const code = (Array.isArray(data) ? null : data.currency) || 'USD';
      const map = { USD:'$', EUR:'€', GBP:'£', CAD:'$', AUD:'$', JPY:'¥' };
      currencySymbol = map[String(code).toUpperCase()] || '$';

      const updatedAt = Array.isArray(data) ? new Date().toISOString() : (data.updatedAt || new Date().toISOString());
      PRODUCTS = raw.map(p => ({
        ...p,
        id: p.id,
        title: p.title ?? p.name ?? 'Untitled',
        description: p.description ?? '',
        category: p.category ?? '',
        price: Number(p.price),
        rating: Number(p.rating || 0),
        reviews: Number(p.reviews || 0),
        featured: Boolean(p.featured),
        image: p.image ?? '',
        badge: p.badge ?? (p.new ? 'New' : ''),
        createdAt: p.createdAt ?? updatedAt
      }));

      populateCategories();
      applyFilters();
      updateCartBadge();
      renderCartLines();
      announceCount();

      // route after products are ready (supports deep-link)
      handleRoute();

    } catch (err) {
      console.error('Init error:', err);
      if (elGrid) elGrid.innerHTML = `<div class="empty">Could not load products.</div>`;
      elEmpty.hidden = true;
    }
  })();
})();
