(function(){
  if(window.__bp_site_loaded) return; window.__bp_site_loaded = true;
  function slugify(text){ return (text||'').toString().toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

  function getCart(){ try{ return JSON.parse(localStorage.getItem('bp_cart')||'[]')||[] }catch(e){ return []; } }
  function saveCart(arr){ localStorage.setItem('bp_cart', JSON.stringify(arr)); }
  function getCartCount(){ const arr = getCart(); return arr.reduce((s,i)=>s+(i.qty||1),0); }
  function updateCartBadge(){ const cnt = getCartCount(); const els = Array.from(document.querySelectorAll('#cart-badge-top, .cart-badge')); els.forEach(el=>el.textContent = cnt||0); }

  function findItemIndex(id){ const arr=getCart(); return arr.findIndex(i=>i.id===id); }
  function addToCart(item){ try{
    const arr = getCart();
    const id = item.id || slugify(item.name||'item');
    const idx = arr.findIndex(i=>i.id===id);
    if(idx>-1){ arr[idx].qty = (arr[idx].qty||1) + (item.qty||1); }
    else { arr.push(Object.assign({qty:1}, item, {id:id})); }
    saveCart(arr); updateCartBadge(); renderCartDrawer();
    return true;
  }catch(e){ console.error(e); return false; }}
  function setQty(id, qty){ const arr=getCart(); const idx = arr.findIndex(i=>i.id===id); if(idx>-1){ arr[idx].qty = qty>0?qty:0; if(arr[idx].qty===0) arr.splice(idx,1); saveCart(arr); updateCartBadge(); renderCartDrawer(); } }
  function removeItem(id){ const arr=getCart(); const idx = arr.findIndex(i=>i.id===id); if(idx>-1){ arr.splice(idx,1); saveCart(arr); updateCartBadge(); renderCartDrawer(); } }

  function calcTotals(){ const arr=getCart(); let subtotal=0; arr.forEach(i=>{ const p = (''+ (i.price||'')).replace(/[^0-9\.]/g,''); subtotal += (Number(p)||0) * (i.qty||1); }); const gst = Math.round(subtotal * 0.18); const delivery = subtotal>3000?0:120; const total = subtotal + gst + delivery; return {subtotal,gst,delivery,total,items:arr}; }

  // Cart drawer UI
  function renderCartDrawer(){ var root = document.getElementById('bp-cart-drawer'); if(!root){ root = document.createElement('div'); root.id='bp-cart-drawer'; root.style.position='fixed'; root.style.right='16px'; root.style.bottom='16px'; root.style.width='320px'; root.style.maxHeight='70vh'; root.style.overflow='auto'; root.style.background='#fff'; root.style.boxShadow='0 12px 40px rgba(0,0,0,0.15)'; root.style.borderRadius='12px'; root.style.padding='12px'; root.style.zIndex=9999; root.style.fontFamily='Noto Sans, sans-serif'; document.body.appendChild(root); }
    const t = calcTotals();
    if(!t.items.length){
      // If cart is empty, hide/remove the drawer instead of showing "Cart is empty" message
      root.style.display = 'none';
      return;
    }
    let html = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><strong>Cart</strong><button id="bp-cart-close" style="background:transparent;border:0;">✕</button></div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    t.items.forEach(it=>{
      html += '<div style="display:flex;align-items:center;gap:8px;border:1px solid #eee;padding:8px;border-radius:8px">';
      html += '<div style="flex:1"><div style="font-weight:600">'+escapeHtml(it.name)+'</div><div style="font-size:12px;color:#666">'+(it.price||'')+'</div></div>';
      html += '<div style="display:flex;flex-direction:column;gap:6px;align-items:center">';
      html += '<div style="display:flex;gap:6px;align-items:center">';
      html += '<button class="bp-qty" data-id="'+it.id+'" data-op="-" style="width:28px;height:28px">−</button>';
      html += '<div style="min-width:20px;text-align:center">'+(it.qty||1)+'</div>';
      html += '<button class="bp-qty" data-id="'+it.id+'" data-op="+" style="width:28px;height:28px">+</button>';
      html += '</div>';
      html += '<button class="bp-remove" data-id="'+it.id+'" style="background:transparent;border:0;color:#c33;margin-top:6px">Remove</button>';
      html += '</div></div>';
    });
    html += '</div>';
    html += '<div style="border-top:1px solid #eee;margin-top:10px;padding-top:10px">';
    html += '<div style="display:flex;justify-content:space-between"><span style="color:#666">Subtotal</span><strong>'+formatCurrency(t.subtotal)+'</strong></div>';
    html += '<div style="display:flex;justify-content:space-between"><span style="color:#666">GST (18%)</span><span>'+formatCurrency(t.gst)+'</span></div>';
    html += '<div style="display:flex;justify-content:space-between"><span style="color:#666">Delivery</span><span>'+(t.delivery?formatCurrency(t.delivery):'<span style="color:#40916C">FREE</span>')+'</span></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-top:8px"><strong>Total</strong><strong>'+formatCurrency(t.total)+'</strong></div>';
    html += '<div style="margin-top:12px;display:flex;gap:8px"><button id="bp-checkout" style="flex:1;background:#1B4332;color:#fff;border:0;padding:10px;border-radius:8px">Checkout</button><button id="bp-clear" style="background:#fff;border:1px solid #ddd;padding:10px;border-radius:8px">Clear</button></div>';
    html += '</div>';
    root.innerHTML = html;
    // attach events
    root.querySelectorAll('.bp-qty').forEach(b=>{ b.addEventListener('click', function(e){ const id=this.dataset.id; const op=this.dataset.op; const arr=getCart(); const idx=arr.findIndex(i=>i.id===id); if(idx>-1){ const newQty = (arr[idx].qty||1) + (op==='+'?1:-1); setQty(id, newQty); } }); });
    root.querySelectorAll('.bp-remove').forEach(b=> b.addEventListener('click', function(){ removeItem(this.dataset.id); }));
    const close = root.querySelector('#bp-cart-close'); if(close) close.addEventListener('click', ()=>{ root.style.display='none'; });
    const checkout = root.querySelector('#bp-checkout'); if(checkout) checkout.addEventListener('click', ()=>{ window.location.href='bhumiputra_otp_login_checkout.html'; });
    const clear = root.querySelector('#bp-clear'); if(clear) clear.addEventListener('click', ()=>{ saveCart([]); updateCartBadge(); renderCartDrawer(); });
  }

  function toggleCartDrawer(){ const root=document.getElementById('bp-cart-drawer'); if(root){ root.style.display = (root.style.display==='none'||!root.style.display)?'block':'none'; } else renderCartDrawer(); }

  // Modify toggle to do nothing when cart is empty
  (function(){
    var _origToggle = toggleCartDrawer;
    toggleCartDrawer = function(){ if(getCartCount()===0){ showToast('Your cart is empty.', {label:'Shop seats', href:'bhumiputra_catalog_truck_seats.html'}); return; } _origToggle(); };
  })();

  // show a small toast message
  function showToast(msg, timeout, action){
    try{
      if(typeof timeout === 'object'){ action = timeout; timeout = undefined; }
      timeout = timeout||3200;
      var id = 'bp-toast';
      var t = document.getElementById(id);
      if(!t){ t = document.createElement('div'); t.id = id; t.style.position='fixed'; t.style.right='16px'; t.style.bottom='96px'; t.style.background='rgba(27,67,50,0.95)'; t.style.color='#fff'; t.style.padding='12px 16px'; t.style.borderRadius='10px'; t.style.zIndex=10010; t.style.boxShadow='0 8px 24px rgba(0,0,0,0.2)'; t.style.fontSize='14px'; t.style.lineHeight='1.4'; t.style.maxWidth='300px'; t.style.wordBreak='break-word'; document.body.appendChild(t); }
      var html = escapeHtml(msg);
      if(action && action.href){
        html += ' <a href="'+escapeHtml(action.href)+'" style="color:#FFD166;text-decoration:underline;">'+escapeHtml(action.label||'Shop seats')+'</a>';
      }
      t.innerHTML = html;
      t.style.display = 'block';
      clearTimeout(t._to);
      t._to = setTimeout(function(){ t.style.display='none'; }, timeout);
    }catch(e){}
  }

  function formatCurrency(n){ if(typeof n !== 'number') n = Number(n)||0; return '₹'+n.toLocaleString('en-IN'); }
  function escapeHtml(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // add current product helper (for product detail pages)
  function addCurrentProductToCart(){ const titleEl = document.querySelector('.p-title') || document.querySelector('.product-name') || document.querySelector('.p-name') || document.querySelector('.product-title'); const title = titleEl? titleEl.textContent.trim() : 'Product'; const priceEl = document.querySelector('.price-factory') || document.querySelector('.price-main') || document.querySelector('.price'); const price = priceEl? priceEl.textContent.trim() : ''; addToCart({id:slugify(title),name:title,price:price,qty:1}); }

  // attach handlers
  function attachHandlers(){
    // cart open buttons
    document.querySelectorAll('#cart-btn-top, .cart-util, .cart-badge, .cart-toggle').forEach(el=>{ if(!el.dataset.bpCartAttached){ el.addEventListener('click', function(e){ e.preventDefault(); toggleCartDrawer(); }); el.dataset.bpCartAttached = '1'; } });
    // add to cart buttons
    document.querySelectorAll('.add-to-cart, .product-grid .btn-cart, .p-card .btn-cart, .btn-cart-main').forEach(b=>{
      if(b.dataset.bpAttached) return;
      if(b.id === 'auth-btn-top') return;
      if(b.closest('#auth-modal')) return;
      b.dataset.bpAttached = '1';
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); const name = this.dataset.name || (this.closest('.product-body')&& this.closest('.product-body').querySelector('.product-name')?.textContent) || this.dataset.title || this.textContent || 'Product'; const price = this.dataset.price || (this.closest('.product-body')&& this.closest('.product-body').querySelector('.price-factory, .price-main')?.textContent) || ''; const id = this.dataset.id || slugify(name); addToCart({id:id,name:name.trim(),price:price,qty:1}); });
    });
  }

  // checkout prefill
  function prefillCheckout(){ try{
    if(!/otp_login_checkout|checkout|otp_login_checkout/.test(location.pathname) && !location.href.includes('otp_login_checkout')) return;
    const root = document.querySelector('.order-summary'); if(!root) return; const t = calcTotals();
    let html=''; const arr=getCart(); if(!arr.length){ html='<div style="padding:12px;color:#666">No items in cart</div>'; root.innerHTML = html; return; }
    arr.forEach(it=>{ html += '<div class="summary-row"><span>'+escapeHtml(it.name)+' × '+(it.qty||1)+'</span><span>'+ (it.price||'') +'</span></div>'; });
    html += '<div class="summary-row"><span>Delivery</span><span style="color:#40916C;">'+(t.delivery?formatCurrency(t.delivery):'FREE')+'</span></div>';
    html += '<div class="summary-row"><span>GST (18%)</span><span>'+formatCurrency(t.gst)+'</span></div>';
    html += '<div class="summary-row total"><span>Total</span><span>'+formatCurrency(t.total)+'</span></div>';
    root.innerHTML = html;
    // update place order amount if present
    var amtEl = document.getElementById('place-order-amount'); if(amtEl) amtEl.textContent = formatCurrency(t.total);
    // prefill address fields from storage
    try{
      var addr = JSON.parse(localStorage.getItem('bp_address')||'{}')||{};
      if(addr.name) document.getElementById('addr_name').value = addr.name;
      if(addr.line) document.getElementById('addr_line').value = addr.line;
      if(addr.district) document.getElementById('addr_district').value = addr.district;
      if(addr.pincode) document.getElementById('addr_pincode').value = addr.pincode;
    }catch(e){/*ignore*/}
  }catch(e){ console.error(e); } }

  // persist address helper
  function saveAddressFromForm(){ try{
    var name = (document.getElementById('addr_name')||{}).value||'';
    var line = (document.getElementById('addr_line')||{}).value||'';
    var district = (document.getElementById('addr_district')||{}).value||'';
    var pincode = (document.getElementById('addr_pincode')||{}).value||'';
    var obj = { name:name.trim(), line:line.trim(), district:district.trim(), pincode:pincode.trim() };
    localStorage.setItem('bp_address', JSON.stringify(obj));
    return obj;
  }catch(e){ return {}; } }

  // place order -> build JSON payload, store mock order and show success
  function placeOrder(){
    try{
      // ensure cart not empty
      var items = getCart(); if(!items.length){ alert('Your cart is empty'); return; }
      // persist address
      var addr = saveAddressFromForm();
      var totals = calcTotals();
      var payMethod = document.querySelector('.pay-option.selected')? document.querySelector('.pay-option.selected').querySelector('.pay-label')?.textContent || 'COD' : 'COD';
      var phone = '';
      try{ var userData = JSON.parse(localStorage.getItem('bp_user')||'{}'); phone = (userData && userData.phone) ? userData.phone : (userData && userData.id ? userData.id : ''); }catch(e){ phone = ''; }
      var order = {
        id: 'BPT-'+Math.floor(100000+Math.random()*899999),
        created: new Date().toISOString(),
        customer: { name: addr.name||'Guest', phone: phone },
        address: addr,
        items: items,
        totals: totals,
        payment: { method: (payMethod||'COD').trim() }
      };
      // store last order for client-side retrieval
      localStorage.setItem('bp_last_order', JSON.stringify(order));
      // show success panel placeholders
      try{
        var cid = document.getElementById('order-id'); if(cid) cid.textContent = '#'+order.id;
        var cname = document.getElementById('order-customer'); if(cname) cname.textContent = order.customer.name;
        var itemsSummary = document.getElementById('order-items-summary'); if(itemsSummary) itemsSummary.textContent = items.map(i=>i.name+' × '+i.qty).join(', ');
        var camt = document.getElementById('order-amount'); if(camt) camt.textContent = formatCurrency(order.totals.total);
        var cpay = document.getElementById('order-paymethod'); if(cpay) cpay.textContent = order.payment.method;
        var ctrack = document.getElementById('order-track'); if(ctrack) ctrack.textContent = 'bhumiputra.com/track/'+order.id;
      }catch(e){}
      // clear cart
      saveCart([]); updateCartBadge(); renderCartDrawer();
      // navigate to panel5 success
      try{ if(typeof goTo==='function') goTo(5); else location.href = '#panel5'; }catch(e){}
      // also print JSON to console for debugging
      console.log('Order payload', order);
      // show payload modal if dev
      return order;
    }catch(e){ console.error(e); alert('Could not place order'); }
  }

  // initialize
  document.addEventListener('DOMContentLoaded', function(){ renderAuthModal(); updateCartBadge(); attachHandlers(); renderCartDrawer(); renderCartDrawer(); prefillCheckout(); updateAuthUI(); });

  // inject small cart toggle in header if missing
  document.addEventListener('DOMContentLoaded', function(){
    try{
      var header = document.querySelector('header') || document.querySelector('.site-header');
      if(header && !document.querySelector('.cart-toggle')){
        var btn = document.createElement('button'); btn.className='cart-toggle'; btn.setAttribute('aria-label','Open cart');
        btn.style.border='0'; btn.style.background='transparent'; btn.style.marginLeft='8px'; btn.style.cursor='pointer';
        btn.innerHTML = '<span style="position:relative;display:inline-block;font-size:18px">🛒<span id="cart-badge-top" style="position:absolute;top:-8px;right:-10px;background:#C53030;color:#fff;border-radius:999px;padding:2px 6px;font-size:11px">0</span></span>';
        // place in header's right side
        var target = header.querySelector('.header-right') || header.querySelector('.nav') || header;
        target.appendChild(btn);
        btn.addEventListener('click', function(e){ e.preventDefault(); toggleCartDrawer(); });
        updateCartBadge();
      }
    }catch(e){/*ignore*/}
  });

  // inject user/profile icon in header and profile editor
  document.addEventListener('DOMContentLoaded', function(){
    try{
      var header = document.querySelector('header') || document.querySelector('.site-header') || document.querySelector('.header');
      if(header && !document.querySelector('#user-btn-top')){
        var ub = document.createElement('button'); ub.id='user-btn-top'; ub.className='user-toggle'; ub.setAttribute('aria-label','Manage profile');
        ub.style.border='0'; ub.style.background='transparent'; ub.style.marginLeft='8px'; ub.style.cursor='pointer'; ub.style.fontSize='18px';
        ub.innerHTML = '<span style="position:relative;display:inline-block">👤</span>';
        var target = header.querySelector('.header-right') || header.querySelector('.nav') || header;
        target.appendChild(ub);
        ub.addEventListener('click', function(e){ e.preventDefault(); openProfileEditor(); });
      }
    }catch(e){/*ignore*/}
  });

  function renderProfileEditor(){
    if(document.getElementById('bp-profile-editor')) return;
    var root = document.createElement('div'); root.id = 'bp-profile-editor';
    root.style.position='fixed'; root.style.inset='0'; root.style.display='none'; root.style.alignItems='center'; root.style.justifyContent='center'; root.style.background='rgba(0,0,0,0.45)'; root.style.zIndex=10001;
    var card = document.createElement('div'); card.style.background='#fff'; card.style.width='420px'; card.style.maxWidth='92%'; card.style.borderRadius='12px'; card.style.padding='18px';
    card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><div style="font-weight:700;font-family:Rajdhani, sans-serif;color:#1B4332">Your profile</div><button id="bp-profile-close" style="background:transparent;border:0;font-size:18px">✕</button></div>'+
      '<div style="display:flex;flex-direction:column;gap:8px">'+
      '<input id="bp_prof_name" placeholder="Full name" style="padding:10px;border:1px solid #eee;border-radius:8px">'+
      '<input id="bp_prof_phone" placeholder="Phone (10 digits)" style="padding:10px;border:1px solid #eee;border-radius:8px">'+
      '<input id="bp_prof_email" placeholder="Email (optional)" style="padding:10px;border:1px solid #eee;border-radius:8px">'+
      '<textarea id="bp_prof_addr" placeholder="Address / Landmark" style="padding:10px;border:1px solid #eee;border-radius:8px"></textarea>'+
      '<div style="display:flex;gap:8px"><input id="bp_prof_district" placeholder="District" style="flex:1;padding:10px;border:1px solid #eee;border-radius:8px"><input id="bp_prof_pincode" placeholder="PIN code" maxlength="6" style="width:110px;padding:10px;border:1px solid #eee;border-radius:8px"></div>'+
      '<div style="display:flex;gap:8px;margin-top:8px"><button id="bp-profile-save" style="flex:1;background:#1B4332;color:#fff;border:0;padding:10px;border-radius:8px">Save</button><button id="bp-profile-cancel" style="flex:1;background:#fff;border:1px solid #ddd;padding:10px;border-radius:8px">Cancel</button></div>'+
      '</div>';
    root.appendChild(card); document.body.appendChild(root);
    document.getElementById('bp-profile-close').addEventListener('click', closeProfileEditor);
    document.getElementById('bp-profile-cancel').addEventListener('click', closeProfileEditor);
    document.getElementById('bp-profile-save').addEventListener('click', function(){
      var name = (document.getElementById('bp_prof_name')||{}).value||'';
      var phone = (document.getElementById('bp_prof_phone')||{}).value||'';
      var email = (document.getElementById('bp_prof_email')||{}).value||'';
      var line = (document.getElementById('bp_prof_addr')||{}).value||'';
      var district = (document.getElementById('bp_prof_district')||{}).value||'';
      var pincode = (document.getElementById('bp_prof_pincode')||{}).value||'';
      // validation: phone 10 digits, pincode numeric 5-6 digits
      var phoneNorm = phone.replace(/\D/g,'');
      if(phone && phoneNorm.length !== 10){ return showToast('Enter a 10-digit phone number'); }
      if(pincode && !/^[0-9]{5,6}$/.test(pincode)){ return showToast('Enter a valid PIN code'); }
      // persist
      try{ localStorage.setItem('bp_user', JSON.stringify({method:'profile', id: phone||email, name:name, phone:phoneNorm, email:email})); }catch(e){}
      try{ localStorage.setItem('bp_address', JSON.stringify({name:name, line:line, district:district, pincode:pincode})); }catch(e){}
      // update UI
      var btn = document.getElementById('auth-btn-top') || document.querySelector('.auth-btn'); if(btn){ btn.textContent = name || phoneNorm || 'My account'; }
      closeProfileEditor(); showToast('Profile saved');
    });
  }

  function openProfileEditor(){ renderProfileEditor(); try{
    var data = JSON.parse(localStorage.getItem('bp_user')||'{}')||{}; var addr = JSON.parse(localStorage.getItem('bp_address')||'{}')||{};
    document.getElementById('bp_prof_name').value = data.name || addr.name || '';
    document.getElementById('bp_prof_phone').value = data.phone || '';
    document.getElementById('bp_prof_email').value = data.email || '';
    document.getElementById('bp_prof_addr').value = addr.line || '';
    document.getElementById('bp_prof_district').value = addr.district || '';
    document.getElementById('bp_prof_pincode').value = addr.pincode || '';
  }catch(e){}
    document.getElementById('bp-profile-editor').style.display = 'flex'; document.getElementById('bp_prof_name').focus();
  }

  function closeProfileEditor(){ var r = document.getElementById('bp-profile-editor'); if(r) r.style.display='none'; }

  window.openProfileEditor = openProfileEditor;

  function renderAuthModal(){
    if(document.getElementById('auth-modal')) return;
    var root = document.createElement('div');
    root.id = 'auth-modal'; root.role='dialog'; root.setAttribute('aria-modal','true');
    root.style.position='fixed'; root.style.inset='0'; root.style.display='none'; root.style.alignItems='center'; root.style.justifyContent='center'; root.style.background='rgba(0,0,0,0.45)'; root.style.padding='20px'; root.style.zIndex=1200;
    root.innerHTML = `
      <div style="background:#fff;max-width:420px;width:100%;border-radius:10px;padding:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div style="font-weight:700;font-family:'Rajdhani',sans-serif;">Sign in or Sign up</div>
          <button data-auth-close aria-label="Close" style="background:transparent;border:none;font-size:18px;">✕</button>
        </div>
        <div id="auth-step-phone">
          <label style="display:block;font-size:13px;color:#444;margin-bottom:6px;">Phone number</label>
          <input id="auth-phone" type="tel" placeholder="e.g. 91XXXXXXXXXX" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <div style="display:flex;gap:8px;"><button data-auth-phone-send class="btn-primary" style="flex:1;">Send OTP</button><button data-auth-phone-show-email class="btn-secondary" style="flex:1;">Use email</button></div>
        </div>
        <div id="auth-step-verify" style="display:none;">
          <label style="display:block;font-size:13px;color:#444;margin-bottom:6px;">Enter OTP</label>
          <input id="auth-otp" type="text" placeholder="6-digit code" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <div style="display:flex;gap:8px;"><button data-auth-verify class="btn-primary" style="flex:1;">Verify</button><button data-auth-resend class="btn-secondary" style="flex:1;">Resend</button></div>
        </div>
        <div id="auth-step-email" style="display:none;">
          <label style="display:block;font-size:13px;color:#444;margin-bottom:6px;">Name</label>
          <input id="auth-name" type="text" placeholder="Your name" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <label style="display:block;font-size:13px;color:#444;margin-bottom:6px;">Email</label>
          <input id="auth-email" type="email" placeholder="you@example.com" style="width:100%;padding:10px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <div style="display:flex;gap:8px;"><button data-auth-email-signup class="btn-primary" style="flex:1;">Sign up / Sign in</button><button data-auth-email-show-phone class="btn-secondary" style="flex:1;">Use phone</button></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    root.querySelector('[data-auth-close]').addEventListener('click', hideAuth);
    root.querySelector('[data-auth-phone-send]').addEventListener('click', sendOTP);
    root.querySelector('[data-auth-phone-show-email]').addEventListener('click', showEmail);
    root.querySelector('[data-auth-verify]').addEventListener('click', verifyOTP);
    root.querySelector('[data-auth-resend]').addEventListener('click', resendOTP);
    root.querySelector('[data-auth-email-signup]').addEventListener('click', emailSignup);
    root.querySelector('[data-auth-email-show-phone]').addEventListener('click', showPhone);
  }

  // Auth modal helpers (centralized)
  function showAuth(){ var m=document.getElementById('auth-modal'); if(!m) return; m.style.display='flex'; var a=document.getElementById('auth-step-phone'), b=document.getElementById('auth-step-verify'), c=document.getElementById('auth-step-email'); if(a) a.style.display='block'; if(b) b.style.display='none'; if(c) c.style.display='none'; }
  function hideAuth(){ var m=document.getElementById('auth-modal'); if(!m) return; m.style.display='none'; }
  function showEmail(){ var a=document.getElementById('auth-step-phone'), c=document.getElementById('auth-step-email'); if(a) a.style.display='none'; if(c) c.style.display='block'; }
  function showPhone(){ var a=document.getElementById('auth-step-phone'), c=document.getElementById('auth-step-email'); if(a) a.style.display='block'; if(c) c.style.display='none'; }
  function sendOTP(){ var phone = (document.getElementById('auth-phone')||{}).value||''; phone = phone.replace(/\D/g,''); if(!phone || phone.length!==10) return showToast('Enter a 10-digit phone number'); var code = Math.floor(100000+Math.random()*900000).toString(); sessionStorage.setItem('bp_otp', code); sessionStorage.setItem('bp_otp_phone', phone); showToast('Mock OTP sent'); var a=document.getElementById('auth-step-phone'), b=document.getElementById('auth-step-verify'); if(a) a.style.display='none'; if(b) b.style.display='block'; }
  function resendOTP(){ sendOTP(); }
  function verifyOTP(){ var v=(document.getElementById('auth-otp')||{}).value||''; if(v===sessionStorage.getItem('bp_otp')){ var phone=sessionStorage.getItem('bp_otp_phone'); try{ localStorage.setItem('bp_user', JSON.stringify({method:'phone', id:phone, phone:phone})); }catch(e){} updateAuthUI(); hideAuth(); showToast('Signed in as '+phone); } else showToast('Incorrect OTP'); }
  function emailSignup(){ var email=(document.getElementById('auth-email')||{}).value||''; var name=(document.getElementById('auth-name')||{}).value||''; if(!email) return showToast('Enter email'); try{ localStorage.setItem('bp_user', JSON.stringify({method:'email', id:email, name:name, email:email})); }catch(e){} updateAuthUI(); hideAuth(); showToast('Signed in'); }
  function logout(){ localStorage.removeItem('bp_user'); updateAuthUI(); showToast('Logged out'); }
  function updateAuthUI(){ var btn=document.getElementById('auth-btn-top') || document.querySelector('.auth-btn'); if(!btn) return; var raw=localStorage.getItem('bp_user'); if(raw){ try{ var u=JSON.parse(raw); btn.textContent = u.name||u.id||'My account'; btn.onclick = function(){ showAuth(); }; if(!document.getElementById('auth-logout')){ var lo=document.createElement('button'); lo.id='auth-logout'; lo.textContent='Logout'; lo.style.marginLeft='8px'; lo.className='btn-secondary'; lo.onclick=logout; btn.parentNode.appendChild(lo); } }catch(e){ btn.textContent='Account'; } return; } btn.textContent='Login / Sign up'; if(document.getElementById('auth-logout')) document.getElementById('auth-logout').remove(); }

  // expose auth helpers
  window.showAuth = showAuth; window.hideAuth = hideAuth; window.sendOTP = sendOTP; window.verifyOTP = verifyOTP; window.emailSignup = emailSignup; window.logout = logout; window.updateAuthUI = updateAuthUI;

  // Chat assistant: keep popup hidden and toggle on button click (show/hide on subsequent clicks)
  document.addEventListener('DOMContentLoaded', function(){
    try{
      var cb = document.querySelector('.chatbot-bubble');
      if(!cb) return;
      var popup = cb.querySelector('.chat-popup');
      var fab = cb.querySelector('.chat-fab');
      if(popup) popup.style.display = 'none';
      if(fab){
        fab.setAttribute('aria-pressed','false');
        fab.addEventListener('click', function(e){
          e.preventDefault();
          if(!popup) return;
          var showing = popup.style.display !== 'none' && popup.style.display !== '';
          popup.style.display = showing ? 'none' : 'block';
          fab.setAttribute('aria-pressed', showing ? 'false' : 'true');
        });
      }
    }catch(e){/*ignore*/}
  });

  // expose
  window.addToCart = addToCart;
  window.addCurrentProductToCart = addCurrentProductToCart;
  window.placeOrder = placeOrder;
  window.bp_site = { addToCart, setQty, removeItem, getCart, getCartCount, renderCartDrawer, prefillCheckout, placeOrder };
})();
