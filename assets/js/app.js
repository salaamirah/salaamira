(() => {
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

  // DOM
  const elGrid      = $('#grid');
  const elEmpty     = $('#empty');
  const elQ         = $('#q');
  const elCat       = $('#cat');
  const elSort      = $('#sort');

  const elCartBtn   = $('#cartBtn');
  const elCartBadge = $('#cartBadge');
  const elDrawer    = $('#drawer');
  const elScrim     = $('#drawer .scrim');
  const elCloseCart = $('#closeCart');
  const elCartLines = $('#cartLines');
  const elSubTotal  = $('#subTotal');
  const elTax       = $('#tax');
  const elShip      = $('#ship');
  const elGrand     = $('#grand');
  const elCheckoutBtn = $('#checkout');
  const ckDialog    = $('#checkoutDialog');
  const ckForm      = $('#checkoutForm');
  const ckCloseBtn  = $('#checkoutDialog .ck-close');
  const ckCancelBtn = $('#ckCancel');
  const ckItemsCount = $('#ckItemsCount');
  const ckSub        = $('#ckSub');
  const ckTax        = $('#ckTax');
  const ckTotal      = $('#ckTotal');
  const ckDiscountInput = $('#ckDiscount');
  const ckApplyBtn      = $('#ckApplyDiscount');
  const ckDiscountMsg   = $('#ckDiscountMsg');
  const ckShippingType  = $('#ckShippingType');
  const ckCountry       = $('#ckCountry');

  const CART_KEY     = 'minishop:cart';
  const DISCOUNT_KEY = 'minishop:discount';
  const TAX_RATE     = 0.00;
  const SHIP_RATES   = { domestic: 6.99, international: 64.99 };
  const DISCOUNTS = { 'SALAAM10': { type: 'percent', value: 10, label: '10% off' } };

  let PRODUCTS = [], FILTERED = [], currencySymbol = '$', APPLIED_DISCOUNT = null;

  const fmt = n => `${currencySymbol}${Number(n||0).toFixed(2)}`;
  const by = (k, dir=1, proj=x=>x[k]) => (a,b) => (proj(a)>proj(b)?1:proj(a)<proj(b)?-1:0)*dir;

  async function fetchJSON(url){ const res=await fetch(url); if(!res.ok) throw new Error(`Failed to fetch ${url}`); return res.json(); }

  function getCart(){ try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); }catch{return [];} }
  function setCart(arr){ localStorage.setItem(CART_KEY,JSON.stringify(arr)); updateCartBadge(); }
  function addToCart(item){ const cart=getCart(); const found=cart.find(x=>x.id===item.id); if(found) found.qty+=item.qty||1; else cart.push({...item, qty:item.qty||1}); setCart(cart); renderCartLines(); }
  function removeFromCart(id){ setCart(getCart().filter(x=>x.id!==id)); renderCartLines(); }
  function updateQty(id, qty){ const cart=getCart(); const line=cart.find(x=>x.id===id); if(!line) return; line.qty=Math.max(1, Number(qty)||1); setCart(cart); renderCartLines(); }
  function clearCart(){ setCart([]); setAppliedDiscount(null); renderCartLines(); }
  function updateCartBadge(){ elCartBadge.textContent = String(getCart().reduce((s,i)=>s+Number(i.qty),0)); }

  function totals(cart, applied, shippingType='domestic'){
    const subtotal = cart.reduce((s,i)=>s+Number(i.price)*Number(i.qty),0);
    let discount = 0;
    if(applied && applied.meta){
      const meta=applied.meta;
      if(!meta.minSubtotal || subtotal>=meta.minSubtotal){
        if(meta.type==='percent') discount=+(subtotal*(meta.value/100)).toFixed(2);
        else if(meta.type==='fixed') discount=+Number(meta.value).toFixed(2);
        discount=Math.min(discount, subtotal);
      }
    }
    const taxable = Math.max(0,subtotal-discount);
    const tax = TAX_RATE;
    const ship = SHIP_RATES[shippingType]||0;
    const grand = +(taxable+tax+ship).toFixed(2);
    return {subtotal, discount, tax, ship, grand};
  }

  function loadAppliedDiscount(){ try{ APPLIED_DISCOUNT=JSON.parse(localStorage.getItem(DISCOUNT_KEY)); }catch{ APPLIED_DISCOUNT=null; } }
  function persistAppliedDiscount(){ if(APPLIED_DISCOUNT) localStorage.setItem(DISCOUNT_KEY,JSON.stringify(APPLIED_DISCOUNT)); else localStorage.removeItem(DISCOUNT_KEY); }
  function setAppliedDiscount(obj){ APPLIED_DISCOUNT=obj; persistAppliedDiscount(); renderCartLines(); }
  function validateDiscount(code, subtotal){ if(!code) return {ok:false,reason:'Enter a code'}; const key=code.trim().toUpperCase(); const meta=DISCOUNTS[key]; if(!meta) return {ok:false,reason:'Invalid code'}; if(meta.minSubtotal && subtotal<meta.minSubtotal) return {ok:false,reason:`Requires minimum ${fmt(meta.minSubtotal)}`}; return {ok:true, code:key, meta}; }
  function applyDiscountCodeFromInput(){ const code=(ckDiscountInput?.value||'').trim().toUpperCase(); const cart=getCart(); const subtotal=cart.reduce((s,i)=>s+Number(i.price)*Number(i.qty),0); const res=validateDiscount(code,subtotal); if(!res.ok){ setAppliedDiscount({code,meta:null}); ckDiscountMsg.textContent=res.reason; renderCartLines(); return; } setAppliedDiscount({code:res.code, meta:res.meta}); ckDiscountMsg.textContent=`${res.code} applied — ${res.meta.label||''}`; renderCartLines(); }
  ckApplyBtn?.addEventListener('click', applyDiscountCodeFromInput);
  ckDiscountInput?.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); applyDiscountCodeFromInput(); } });
  elCartLines?.addEventListener('click', e=>{ if(e.target?.id==='removeDiscount'){ setAppliedDiscount(null); ckDiscountInput.value=''; ckDiscountMsg.textContent=''; } });

  function populateCategories(){
    const cats = Array.from(new Set(PRODUCTS.map(p=>p.category).filter(Boolean))).sort();
    elCat.innerHTML = `<option value="">All Categories</option>` + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }

  function applyFilters(){
    const q = (elQ?.value||'').toLowerCase();
    const cat = (elCat?.value||'');
    FILTERED = PRODUCTS.filter(p=>
      (!q || p.title.toLowerCase().includes(q)) &&
      (!cat || p.category===cat)
    );
    const sortVal = elSort?.value;
    if(sortVal==='price-asc') FILTERED.sort(by('price',1));
    else if(sortVal==='price-desc') FILTERED.sort(by('price',-1));
    else if(sortVal==='rating') FILTERED.sort(by('rating',-1));
    else if(sortVal==='new') FILTERED.sort(by('createdAt',-1));
    renderProducts(FILTERED);
  }

  function announceCount(){ elGrid.setAttribute('aria-label', `${FILTERED.length} products shown`); }

  function renderProducts(items){
    elGrid.innerHTML=''; elEmpty.hidden=false;
    if(!items.length) return;
    elEmpty.hidden=true;
    const frag = document.createDocumentFragment();
    items.forEach(p=>{
      const card=document.createElement('div'); card.className='card';
      card.innerHTML=`
        <a class="card-link" href="#/p/${encodeURIComponent(p.id)}" aria-label="Open ${p.title}">
          <div class="thumb">${p.badge?`<span class="pill">${p.badge}</span>`:''}${p.image?`<img src="${p.image}" alt="${p.title}">`:''}</div>
          <div class="body"><div class="title">${p.title}</div><div class="price-row"><div class="price">${fmt(p.price)}</div></div></div>
        </a>
        <div class="card-actions"><button class="btn primary add" aria-label="Add ${p.title} to cart">Add to Cart</button></div>
      `;
      $('.add',card).addEventListener('click',()=>addToCart({id:p.id,title:p.title,price:p.price,image:p.image,qty:1}));
      frag.appendChild(card);
    });
    elGrid.appendChild(frag);
  }

  function renderCartLines(){
    const cart=getCart();
    const shippingType = ckDialog?.open ? (ckShippingType?.value || 'domestic') : 'domestic';
    const {subtotal, discount, tax, ship, grand} = totals(cart, APPLIED_DISCOUNT, shippingType);

    elCartLines.innerHTML='';
    if(!cart.length) elCartLines.innerHTML=`<div class="empty">Your cart is empty.</div>`;
    else{
      const frag=document.createDocumentFragment();
      cart.forEach(line=>{
        const row=document.createElement('div'); row.className='line';
        row.innerHTML=`
          <div class="mini">${line.image?`<img src="${line.image}" alt="" style="max-width:70%; max-height:70%; object-fit:contain">`:''}</div>
          <div><div class="name">${line.title}</div><div class="desc">${fmt(line.price)} each</div>
            <div class="qty" aria-label="Quantity controls">
              <button type="button">−</button>
              <input type="number" min="1" value="${line.qty}">
              <button type="button">+</button>
            </div>
          </div>
          <div style="display:grid; gap:8px; justify-items:end">
            <div><strong>${fmt(line.price*line.qty)}</strong></div>
            <button class="btn" type="button">Remove</button>
          </div>
        `;
        const [dec, qty, inc] = $$('.qty button,.qty input', row);
        dec.addEventListener('click',()=>updateQty(line.id,line.qty-1));
        inc.addEventListener('click',()=>updateQty(line.id,line.qty+1));
        qty.addEventListener('change', e=>updateQty(line.id,e.target.value));
        $('.btn', row).addEventListener('click',()=>removeFromCart(line.id));
        frag.appendChild(row);
      });
      if(APPLIED_DISCOUNT && discount>0){
        const discRow=document.createElement('div'); discRow.className='line';
        discRow.innerHTML=`
          <div style="width:64px"></div>
          <div><div class="name">Discount: ${APPLIED_DISCOUNT.code}</div><div class="desc">${APPLIED_DISCOUNT.meta.label||''}</div></div>
          <div style="display:grid; gap:8px; justify-items:end"><div><strong>- ${fmt(discount)}</strong></div>
            <button class="btn" type="button" id="removeDiscount">Remove</button>
          </div>
        `;
        frag.appendChild(discRow);
      }
      elCartLines.appendChild(frag);
    }

    elSubTotal.textContent = fmt(subtotal);
    elTax.textContent = fmt(tax);
    elShip.textContent = fmt(ship);
    elGrand.textContent = fmt(grand);

    if(ckDialog?.open){
      ckItemsCount.textContent = String(cart.reduce((s,i)=>s+Number(i.qty),0));
      ckSub.textContent = fmt(subtotal);
      ckTax.textContent = fmt(tax);
      ckTotal.textContent = fmt(grand);
      if(APPLIED_DISCOUNT && discount>0) ckDiscountMsg.textContent = `${APPLIED_DISCOUNT.code} applied — saved ${fmt(discount)}`;
      else ckDiscountMsg.textContent='';
    }
  }

  function openDrawer(){ elDrawer.classList.add('open'); elDrawer.inert=false; elDrawer.setAttribute('aria-hidden','false'); renderCartLines(); trapFocus(elDrawer); }
  function closeDrawer(){ elDrawer.classList.remove('open'); elDrawer.inert=true; elDrawer.setAttribute('aria-hidden','true'); releaseFocusTrap(); }
  elCartBtn?.addEventListener('click', openDrawer);
  elCloseCart?.addEventListener('click', closeDrawer);
  elScrim?.addEventListener('click', closeDrawer);

  function openCheckout(){
    document.activeElement?.blur();
    const cart=getCart();
    const t=totals(cart,APPLIED_DISCOUNT, ckShippingType?.value || 'domestic');
    ckItemsCount.textContent = String(cart.reduce((s,i)=>s+Number(i.qty),0));
    ckSub.textContent = fmt(t.subtotal);
    ckTax.textContent = fmt(t.tax);
    ckTotal.textContent = fmt(t.grand);
    if(APPLIED_DISCOUNT && t.discount>0) ckDiscountMsg.textContent = `${APPLIED_DISCOUNT.code} applied — saved ${fmt(t.discount)}`;
    else if(APPLIED_DISCOUNT) ckDiscountMsg.textContent = `Code ${APPLIED_DISCOUNT.code} not applicable`;
    else ckDiscountMsg.textContent='';
    if(ckDialog?.showModal) { ckDialog.showModal(); trapFocus(ckDialog); }
  }
  function closeCheckout(){ try{ ckDialog?.close(); }catch{} releaseFocusTrap(); }
  elCheckoutBtn?.addEventListener('click', e=>{ e.preventDefault(); openCheckout(); });
  ckCloseBtn?.addEventListener('click', closeCheckout);
  ckCancelBtn?.addEventListener('click', closeCheckout);

  // Auto shipping by country
  ckCountry?.addEventListener('change', () => {
    const country = (ckCountry.value || '').trim().toLowerCase();
    ckShippingType.value = (country==='usa'||country==='united states'||country==='us') ? 'domestic' : 'international';
    renderCartLines();
  });
  ckCountry?.addEventListener('blur', ()=>ckCountry.dispatchEvent(new Event('change')));

  let focusTrapContainer=null;
  function trapFocus(container){ focusTrapContainer=container; const focusable=[...container.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]; if(focusable.length) focusable[0].focus(); window.addEventListener('keydown',handleFocusTrap); }
  function releaseFocusTrap(){ window.removeEventListener('keydown',handleFocusTrap); focusTrapContainer=null; }
  function handleFocusTrap(e){ if(!focusTrapContainer||e.key!=='Tab') return; const focusable=[...focusTrapContainer.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]; if(!focusable.length) return; const first=focusable[0],last=focusable[focusable.length-1]; if(e.shiftKey){ if(document.activeElement===first){ e.preventDefault(); last.focus(); } } else { if(document.activeElement===last){ e.preventDefault(); first.focus(); } } }

  elQ?.addEventListener('input',()=>{ applyFilters(); announceCount(); });
  elCat?.addEventListener('change',()=>{ applyFilters(); announceCount(); });
  elSort?.addEventListener('change',()=>{ applyFilters(); announceCount(); });

  function go(route){ location.hash=route; }
  function currentRoute(){ return location.hash.replace(/^#/,'')||'/'; }
  function findProduct(id){ return PRODUCTS.find(p=>String(p.id)===String(id)); }
  function showList(){ if(document.querySelector('main')) document.querySelector('main').hidden=false; if($('#productPage')) $('#productPage').hidden=true; }
  function showProduct(id){ /* Product page omitted */ }
  function handleRoute(){ const route=currentRoute(); const m=route.match(/^\/?p\/(.+)$/); if(m) showProduct(decodeURIComponent(m[1])); else { document.title='MiniShop'; showList(); } }
  window.addEventListener('hashchange', handleRoute);

  (async function init(){
    try{
      loadAppliedDiscount();
      const data=await fetchJSON('./products.json');
      const raw=Array.isArray(data)?data:(data.products||[]);
      const code=(Array.isArray(data)?null:data.currency)||'USD';
      const map={USD:'$',EUR:'€',GBP:'£',CAD:'$',AUD:'$',JPY:'¥'};
      currencySymbol=map[String(code).toUpperCase()]||'$';
      const updatedAt=Array.isArray(data)?new Date().toISOString():(data.updatedAt||new Date().toISOString());
      PRODUCTS=raw.map(p=>({ ...p, id:p.id, title:p.title??p.name??'Untitled', description:p.description??'', category:p.category??'', price:Number(p.price), rating:Number(p.rating||0), reviews:Number(p.reviews||0), featured:Boolean(p.featured), image:p.image??'', badge:p.badge??(p.new?'New':''), createdAt:p.createdAt??updatedAt }));
      populateCategories();
      applyFilters();
      updateCartBadge();
      renderCartLines();
      announceCount();
      handleRoute();
    }catch(err){ console.error('Init error:',err); if(elGrid) elGrid.innerHTML=`<div class="empty">Could not load products.</div>`; elEmpty.hidden=true; }
  })();
})();
