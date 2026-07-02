const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
  ? 'http://localhost:5000/api'
  : 'https://ug-bazaar-backend-production.up.railway.app/api';
window.API_BASE = API_BASE;
const getToken   = ()      => localStorage.getItem('ug_token');
const setToken   = (t)     => localStorage.setItem('ug_token', t);
const clearToken = ()      => localStorage.removeItem('ug_token');

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const config = {
    headers: { 'Content-Type':'application/json', ...(token && { Authorization:`Bearer ${token}` }), ...options.headers },
    ...options
  };
  const res  = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return { ...data, data: data };
}

const Auth = {
  async register(name, mobile, password, village='') {
    const d = await apiFetch('/auth/register',{ method:'POST', body:JSON.stringify({name,mobile,password,village}) });
    if(d.token){ setToken(d.token); localStorage.setItem('ug_user_name',d.user.name); localStorage.setItem('ug_user_id',d.user._id); localStorage.setItem('ug_user_role',d.user.role); }
    return d;
  },
  async login(mobile, password) {
    const d = await apiFetch('/auth/login',{ method:'POST', body:JSON.stringify({mobile,password}) });
    if(d.token){ setToken(d.token); localStorage.setItem('ug_user_name',d.user.name); localStorage.setItem('ug_user_id',d.user._id); localStorage.setItem('ug_user_role',d.user.role); }
    return d;
  },
  async sendOTP(mobile)          { return apiFetch('/auth/send-otp',{method:'POST',body:JSON.stringify({mobile})}); },
  async verifyOTP(mobile, otp) {
    const d = await apiFetch('/auth/verify-otp',{method:'POST',body:JSON.stringify({mobile,otp})});
    if(d.token){ setToken(d.token); localStorage.setItem('ug_user_name',d.user.name); localStorage.setItem('ug_user_id',d.user._id); localStorage.setItem('ug_user_role',d.user.role); }
    return d;
  },
  async forgotPassword(mobile)   { return apiFetch('/auth/forgot-password',{method:'POST',body:JSON.stringify({mobile})}); },
  async resetPassword(mobile,otp,newPassword) { return apiFetch('/auth/reset-password',{method:'POST',body:JSON.stringify({mobile,otp,newPassword})}); },
  async getMe()                  { return apiFetch('/auth/me'); },
  async updateProfile(data)      { return apiFetch('/auth/update-profile',{method:'PUT',body:JSON.stringify(data)}); },
  logout() { clearToken(); ['ug_user_name','ug_user_id','ug_user_role','ug_cart_count'].forEach(k=>localStorage.removeItem(k)); window.location.href='index.html'; },
  isLoggedIn: () => !!getToken(),
  isAdmin:    () => localStorage.getItem('ug_user_role')==='admin',
  getUserName:() => localStorage.getItem('ug_user_name')||''
};

const Products = {
  async getAll(filters={}) {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k,v])=>v&&p.set(k,v));
    return apiFetch(`/products?${p}`);
  },
  async search(q, filters={}) {
    const p = new URLSearchParams({q});
    Object.entries(filters).forEach(([k,v])=>v&&p.set(k,v));
    return apiFetch(`/products/search?${p}`);
  },
  async getById(id)         { return apiFetch(`/products/${id}`); },
  async create(data)        { return apiFetch('/products',{method:'POST',body:JSON.stringify(data)}); },
  async update(id, data)    { return apiFetch(`/products/${id}`,{method:'PUT',body:JSON.stringify(data)}); },
  async delete(id)          { return apiFetch(`/products/${id}`,{method:'DELETE'}); }
};

const staticIdToNameMap = {
  's1': 'Basmati Rice 5kg',
  's2': 'Toor Dal 1kg',
  's3': 'Sunflower Oil 1L',
  's4': 'Steel Hammer',
  's5': 'LED Bulb 9W',
  's6': 'Mobile Charger',
  's7': 'Wooden Chair',
  's8': 'Hybrid Seeds 500g',
  's9': 'DAP Fertilizer 5kg',
  's10': 'Electric Wire 10m',
  's11': 'Table Fan',
  's12': 'PVC Pipe 1m'
};

const combosMap = {
  'ghar ka rashan pack': [
    { name: 'Basmati Rice 5kg', qty: 1 },
    { name: 'Toor Dal 1kg', qty: 1 },
    { name: 'Sunflower Oil 1L', qty: 1 }
  ],
  'krushi starter kit': [
    { name: 'Hybrid Seeds 500g', qty: 1 },
    { name: 'DAP Fertilizer 5kg', qty: 1 }
  ],
  'ghar wiring kit': [
    { name: 'LED Bulb 9W', qty: 5 },
    { name: 'Electric Wire 10m', qty: 1 }
  ]
};

async function resolveProductToId(identifier) {
  if (!identifier) return null;
  if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
    return identifier;
  }
  let name = identifier;
  if (staticIdToNameMap[identifier]) {
    name = staticIdToNameMap[identifier];
  }
  try {
    const res = await Products.getAll({ limit: 100 });
    if (res.success && res.data && res.data.products) {
      const found = res.data.products.find(p => 
        p.name.toLowerCase() === name.toLowerCase() ||
        p.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (found) return found._id;
    }
  } catch (e) {
    console.error("Error resolving product identifier:", e);
  }
  return null;
}

const Cart = {
  get count() {
    return parseInt(localStorage.getItem('ug_cart_count') || '0', 10);
  },
  set count(val) {
    localStorage.setItem('ug_cart_count', val);
    this.updateBadge();
  },
  updateBadge() {
    const n = this.count;
    document.querySelectorAll('.cart-count-badge').forEach(b => b.textContent = n > 0 ? `(${n})` : '');
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      cartCountEl.textContent = `(${n})`;
    }
  },
  async add(productId, qty = 1) {
    return CartAPI.add(productId, qty);
  }
};
window.Cart = Cart;

const CartAPI = {
  async get()               { return apiFetch('/cart'); },
  async add(productId,qty=1){
    const comboKey = typeof productId === 'string' ? productId.toLowerCase() : '';
    if (combosMap[comboKey]) {
      let anySuccess = false;
      let lastRes = { success: false, error: 'Combo items not found' };
      for (const item of combosMap[comboKey]) {
        const dbId = await resolveProductToId(item.name);
        if (dbId) {
          const r = await apiFetch('/cart/add',{method:'POST',body:JSON.stringify({productId: dbId, qty: item.qty * qty})});
          if (r.success) {
            anySuccess = true;
            lastRes = r;
          }
        }
      }
      CartAPI.refreshCount();
      return anySuccess ? { success: true, ...lastRes } : lastRes;
    }

    const dbId = await resolveProductToId(productId);
    if (!dbId) {
      throw new Error(`Product "${productId}" not found in database.`);
    }

    const d=await apiFetch('/cart/add',{method:'POST',body:JSON.stringify({productId: dbId, qty})});
    CartAPI.refreshCount();
    return d;
  },
  async update(productId,qty){
    const dbId = await resolveProductToId(productId) || productId;
    const d=await apiFetch(`/cart/update/${dbId}`,{method:'PUT',body:JSON.stringify({qty})});
    CartAPI.refreshCount();
    return d;
  },
  async clear()             { localStorage.setItem('ug_cart_count','0'); document.querySelectorAll('.cart-count-badge').forEach(b=>b.textContent=''); return apiFetch('/cart/clear',{method:'DELETE'}); },
  async validateCoupon(code,orderTotal) { return Coupons.validate(code,orderTotal); },
  async refreshCount() {
    try {
      const {cart} = await CartAPI.get();
      const n = cart?.items?.reduce((s,i)=>s+i.qty,0)||0;
      localStorage.setItem('ug_cart_count',n);
      document.querySelectorAll('.cart-count-badge').forEach(b=>b.textContent=n>0?`(${n})`:'');
      const cartCountEl = document.getElementById('cart-count');
      if (cartCountEl) {
        cartCountEl.textContent = `(${n})`;
      }
    } catch(e){}
  }
};

const Orders = {
  async place(data)         { return apiFetch('/orders',{method:'POST',body:JSON.stringify(data)}); },
  async getMyOrders()       { return apiFetch('/orders/my-orders'); },
  async getById(id)         { return apiFetch(`/orders/${id}`); },
  async cancel(id)          { return apiFetch(`/orders/${id}/cancel`,{method:'PUT'}); },
  async adminGetAll(filters={}) { const p=new URLSearchParams(filters); return apiFetch(`/orders/admin/all?${p}`); },
  async adminUpdateStatus(id,status,note='') { return apiFetch(`/orders/admin/${id}/status`,{method:'PUT',body:JSON.stringify({status,note})}); }
};

const Payment = {
  async createOrder(amount,orderId) { return apiFetch('/payment/create-order',{method:'POST',body:JSON.stringify({amount,orderId})}); },
  async openRazorpay({amount,orderId,userName,userMobile,onSuccess,onFailure}) {
    const od = await Payment.createOrder(amount,orderId);
    if(!window.Razorpay) await new Promise((res,rej)=>{ const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js'; s.onload=res; s.onerror=rej; document.body.appendChild(s); });
    new window.Razorpay({
      key:od.key, amount:od.amount, currency:'INR',
      name:'UG Bazaar', description:`Order ${orderId}`, order_id:od.orderId,
      prefill:{name:userName,contact:userMobile},
      theme:{color:'#F47820'},
      handler: async(r)=>{ try{ await apiFetch('/payment/verify',{method:'POST',body:JSON.stringify({razorpay_order_id:r.razorpay_order_id,razorpay_payment_id:r.razorpay_payment_id,razorpay_signature:r.razorpay_signature,orderId})}); if(onSuccess)onSuccess(r); }catch(e){ if(onFailure)onFailure(e); } },
      modal:{ondismiss:()=>{ if(onFailure)onFailure(new Error('cancelled')); }}
    }).open();
  }
};

const Coupons = {
  async validate(code,orderTotal) { return apiFetch('/coupons/validate',{method:'POST',body:JSON.stringify({code,orderTotal})}); },
  async getAll()   { return apiFetch('/coupons'); },
  async create(d)  { return apiFetch('/coupons',{method:'POST',body:JSON.stringify(d)}); },
  async delete(id) { return apiFetch('/coupons/'+id,{method:'DELETE'}); }
};

const Reviews = {
  async getByProduct(productId) { return apiFetch(`/reviews/${productId}`); },
  async submit(data) { return apiFetch('/reviews',{method:'POST',body:JSON.stringify(data)}); }
};

const Notifications = {
  async getAll()    { return apiFetch('/notifications'); },
  async markRead(id){ return apiFetch(`/notifications/${id}/read`,{method:'PUT'}); },
  async markAllRead(){ return apiFetch('/notifications/mark-all-read',{method:'PUT'}); }
};

const Admin = {
  async getDashboard()  { return apiFetch('/admin/dashboard'); },
  async getCustomers()  { return apiFetch('/admin/customers'); }
};

function initPage() {
  document.querySelectorAll('.nav-login-link').forEach(el=>{
    if(Auth.isLoggedIn()){
      el.textContent=`👤 ${Auth.getUserName().split(' ')[0]}`;
      el.href='profile.html';
    }
    else{ el.textContent='👤 Login'; el.href='auth.html'; }
  });
  if(Auth.isLoggedIn()) CartAPI.refreshCount();
  if(window.location.pathname.includes('admin')&&!Auth.isAdmin()) window.location.href='auth.html';
  
  if (!document.getElementById('nav-admin-toggle-styles')) {
    const style = document.createElement('style');
    style.id = 'nav-admin-toggle-styles';
    style.textContent = `
      .nav-admin-toggle {
        background: #F47820 !important;
        color: #fff !important;
        padding: 0.35rem 0.8rem !important;
        border-radius: 20px !important;
        font-weight: 700 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 0.3rem !important;
        font-size: 0.8rem !important;
        text-decoration: none !important;
        transition: opacity 0.2s !important;
        font-family: 'Baloo 2', sans-serif !important;
      }
      .nav-admin-toggle:hover {
        opacity: 0.9 !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (Auth.isLoggedIn() && Auth.isAdmin()) {
    document.querySelectorAll('.nav-admin-item').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-login-link').forEach(el => {
      const parent = el.parentElement;
      if (parent) {
        const navContainer = el.closest('nav') || parent;
        if (!navContainer.querySelector('.nav-admin-toggle')) {
          if (parent.tagName === 'UL' || el.tagName === 'LI') {
            const li = document.createElement('li');
            li.className = 'dynamic-admin-link';
            li.innerHTML = '<a href="#" onclick="openAdminVerifyModal(event)" class="nav-admin-toggle">🔄 Switch to Admin</a>';
            el.after(li);
          } else {
            const a = document.createElement('a');
            a.className = 'nav-admin-toggle dynamic-admin-link';
            a.href = '#';
            a.onclick = openAdminVerifyModal;
            a.textContent = '🔄 Switch to Admin';
            a.style.marginRight = '0.5rem';
            el.before(a);
          }
        }
      }
    });
  } else {
    document.querySelectorAll('.dynamic-admin-link').forEach(el => el.remove());
  }
}

function openAdminVerifyModal(event) {
  if (event) event.preventDefault();
  
  let modal = document.getElementById('admin-verify-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-verify-modal';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      font-family: 'Baloo 2', sans-serif;
    `;
    
    modal.innerHTML = `
      <div style="background: #fff; border-radius: 16px; width: 100%; max-width: 400px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; animation: modalPop 0.3s ease;">
        <div style="background: linear-gradient(135deg, #0D3A6E, #1A5FB4); padding: 1.2rem; color: #fff; display: flex; align-items: center; justify-content: space-between;">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800;">🔒 Admin Verification</h3>
          <button id="admin-verify-close" style="background: none; border: none; color: #fff; font-size: 1.2rem; cursor: pointer;">✕</button>
        </div>
        <div style="padding: 1.5rem;">
          <p style="font-size: 0.85rem; color: #4B5563; margin-top: 0; margin-bottom: 1.2rem;">Please enter Admin credentials and verification code to switch panels.</p>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #1A1A2E; margin-bottom: 0.4rem;">Admin Mobile / Username</label>
            <input type="tel" id="admin-verify-mobile" placeholder="e.g. 10-digit mobile" maxlength="10" style="width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 0.9rem; outline: none; background: #F4F6FB;">
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #1A1A2E; margin-bottom: 0.4rem;">Password</label>
            <input type="password" id="admin-verify-password" placeholder="Enter password" style="width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 0.9rem; outline: none; background: #F4F6FB;">
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #1A1A2E; margin-bottom: 0.4rem;">Verification Code (Demo: 1234)</label>
            <input type="text" id="admin-verify-code" placeholder="Enter 4-digit code" maxlength="4" style="width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid #E2E8F0; border-radius: 9px; font-size: 0.9rem; outline: none; background: #F4F6FB; text-align: center; font-weight: 700; letter-spacing: 2px;">
          </div>
          
          <button id="admin-verify-submit" style="width: 100%; padding: 0.8rem; border: none; border-radius: 10px; background: #F47820; color: #fff; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: background 0.2s; font-family: 'Baloo 2', sans-serif;">Verify & Open Dashboard →</button>
        </div>
      </div>
      <style>
        @keyframes modalPop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('admin-verify-close').onclick = () => {
      modal.style.display = 'none';
    };
    
    document.getElementById('admin-verify-submit').onclick = async () => {
      const mobile = document.getElementById('admin-verify-mobile').value.trim();
      const password = document.getElementById('admin-verify-password').value;
      const code = document.getElementById('admin-verify-code').value.trim();
      
      if (!mobile || !password || !code) {
        alert('❌ Please fill in all verification fields!');
        return;
      }
      
      if (code !== '1234') {
        alert('❌ Invalid verification code! Use Demo code: 1234');
        return;
      }
      
      try {
        const d = await Auth.login(mobile, password);
        if (d.success && d.user && d.user.role === 'admin') {
          modal.style.display = 'none';
          window.location.href = 'admin.html';
        } else {
          alert('❌ Access denied. Account is not an Admin!');
        }
      } catch (err) {
        alert('❌ Verification failed: ' + err.message);
      }
    };
  }
  
  modal.style.display = 'flex';
  document.getElementById('admin-verify-mobile').focus();
}
window.openAdminVerifyModal = openAdminVerifyModal;

document.addEventListener('DOMContentLoaded', initPage);

// ── COMPATIBILITY ALIASES ──
window.AuthAPI = Auth;
window.ProductAPI = Products;
window.OrderAPI = Orders;
window.PaymentAPI = Payment;
window.CouponAPI = Coupons;
window.ReviewAPI = Reviews;
window.NotifAPI = Notifications;
window.AdminAPI = Admin;

window.goToProduct = function(id) {
  if (!id) return;
  if (window.location.protocol === 'file:') {
    window.location.href = `product.html?id=${id}`;
  } else {
    window.location.href = `product?id=${id}`;
  }
};

