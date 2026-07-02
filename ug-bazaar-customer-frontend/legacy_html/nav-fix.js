// ── SHARED CART STATE ──
const Cart = {
  get count() { return parseInt(localStorage.getItem('ug_cart_count') || '0'); },
  set count(n) { localStorage.setItem('ug_cart_count', n); Cart.updateBadge(); },
  add(name) { Cart.count = Cart.count + 1; return Cart.count; },
  updateBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => b.textContent = Cart.count > 0 ? `(${Cart.count})` : '');
  }
};

// ── SHARED USER STATE ──
const User = {
  get name() { return localStorage.getItem('ug_user_name') || ''; },
  get loggedIn() { return !!localStorage.getItem('ug_user_name'); },
  get role() { return localStorage.getItem('ug_user_role') || 'customer'; },
  get isAdmin() { return this.role === 'admin'; },
  login(name, role = 'customer') {
    localStorage.setItem('ug_user_name', name);
    localStorage.setItem('ug_user_role', role);
    User.updateNav();
  },
  logout() {
    ['ug_user_name', 'ug_user_role', 'ug_user_id', 'ug_cart_count'].forEach(k => localStorage.removeItem(k));
    User.updateNav();
  },
  updateNav() {
    const loginLinks = document.querySelectorAll('.nav-login-link');
    loginLinks.forEach(el => {
      if(User.loggedIn) {
        el.textContent = `👤 ${User.name.split(' ')[0]}`;
        el.href = 'profile.html';
      } else {
        el.textContent = '👤 Login';
        el.href = 'auth.html';
      }
    });

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

    if (User.loggedIn && User.isAdmin) {
      document.querySelectorAll('.nav-admin-item').forEach(el => el.style.display = 'none');
      loginLinks.forEach(el => {
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
              a.onclick = (typeof openAdminVerifyModal !== 'undefined') ? openAdminVerifyModal : (e) => { e.preventDefault(); window.location.href='admin.html'; };
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
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  User.updateNav();
});
