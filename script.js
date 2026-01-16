// Simple site interactions: menu toggle and small helpers
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('open');
        });
    }

    // Inject modal HTML once for Sign In / Sign Up
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
    <div class="modal" data-modal-name="signin" aria-hidden="true">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="signin-title">
        <button class="modal-close" aria-label="Close">✕</button>
        <h3 id="signin-title">Sign In</h3>
        <form id="signinForm" class="modal-form">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <div class="modal-actions">
            <button type="submit" class="btn primary">Sign In</button>
            <button type="button" class="btn outline modal-switch" data-switch="signup">Create account</button>
          </div>
        </form>
      </div>
    </div>
    <div class="modal" data-modal-name="signup" aria-hidden="true">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="signup-title">
        <button class="modal-close" aria-label="Close">✕</button>
        <h3 id="signup-title">Sign Up</h3>
        <form id="signupForm" class="modal-form">
          <input name="name" type="text" placeholder="Full name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <div class="modal-actions">
            <button type="submit" class="btn primary">Create account</button>
            <button type="button" class="btn outline modal-switch" data-switch="signin">Have an account?</button>
          </div>
        </form>
      </div>
    </div>
    `;
    document.body.appendChild(modalContainer);

    // Modal open/close logic
    function openModal(name){
        const m = document.querySelector(`.modal[data-modal-name="${name}"]`);
        if(!m) return;
        m.classList.add('open');
        m.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }
    function closeModal(modal){
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
    }

    // global click handler
    document.body.addEventListener('click', (e)=>{
        const btn = e.target.closest('[data-modal]');
        if(btn){
            const name = btn.dataset.modal;
            openModal(name);
            return;
        }

        // close buttons
        if(e.target.closest('.modal-close')){
            const modal = e.target.closest('.modal');
            closeModal(modal);
            return;
        }

        // overlay click to close
        if(e.target.classList.contains('modal')){
            closeModal(e.target);
            return;
        }

        // switch between sign in / sign up
        const switchBtn = e.target.closest('.modal-switch');
        if(switchBtn){
            const target = switchBtn.dataset.switch;
            const currentModal = e.target.closest('.modal');
            if(currentModal) closeModal(currentModal);
            openModal(target);
            return;
        }
    });

    // handle simple form submits
    const signinForm = document.getElementById('signinForm');
    const signupForm = document.getElementById('signupForm');
    if(signinForm){
      signinForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const data = {
          email: signinForm.email.value,
          password: signinForm.password.value
        };
        const submitBtn = signinForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try{
          const res = await fetch('/api/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          const json = await res.json();
          if(json.success){
            showFormMessage(signinForm, 'Signed in successfully.', 'success');
            setTimeout(()=>{
              const modal = signinForm.closest('.modal');
              closeModal(modal);
            }, 700);
          } else {
            showFormMessage(signinForm, json.error || 'Sign in failed', 'error');
          }
        }catch(err){
          showFormMessage(signinForm, 'Network error', 'error');
        } finally { submitBtn.disabled = false; }
      });
    }
    if(signupForm){
      signupForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const data = {
          name: signupForm.name.value,
          email: signupForm.email.value,
          password: signupForm.password.value
        };
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try{
          const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          const json = await res.json();
          if(json.success){
            showFormMessage(signupForm, 'Account created.', 'success');
            setTimeout(()=>{
              const modal = signupForm.closest('.modal');
              closeModal(modal);
            }, 700);
          } else {
            showFormMessage(signupForm, json.error || 'Sign up failed', 'error');
          }
        }catch(err){
          showFormMessage(signupForm, 'Network error', 'error');
        } finally { submitBtn.disabled = false; }
      });
    }

    // helper to show a small message in the modal form
    function showFormMessage(form, message, type){
      let el = form.querySelector('.form-message');
      if(!el){
        el = document.createElement('div');
        el.className = 'form-message';
        el.style.marginTop = '6px';
        el.style.fontSize = '0.95rem';
        form.appendChild(el);
      }
      el.textContent = message;
      el.style.color = type === 'success' ? 'var(--accent)' : '#ff7474';
      setTimeout(()=>{ if(type === 'success') el.textContent = ''; }, 2500);
    }

    // Basic client-side validation helpers
    function isValidEmail(email){
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function setButtonLoading(btn, loading, text){
      if(!btn) return;
      if(loading){
        btn.dataset.orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" aria-hidden="true"></span>${text}`;
      } else {
        btn.disabled = false;
        if(btn.dataset.orig) btn.innerHTML = btn.dataset.orig;
      }
    }

    // Focus trap implementation for accessibility
    let lastFocused = null;
    let keydownHandler = null;
    function trapFocus(modal){
      lastFocused = document.activeElement;
      const focusable = modal.querySelectorAll('a, button, textarea, input, [tabindex]:not([tabindex="-1"])');
      if(focusable.length) focusable[0].focus();
      keydownHandler = function(e){
        if(e.key === 'Escape'){
          closeModal(modal);
        }
        if(e.key === 'Tab'){
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if(e.shiftKey){ // shift + tab
            if(document.activeElement === first){
              e.preventDefault(); last.focus();
            }
          } else { // tab
            if(document.activeElement === last){
              e.preventDefault(); first.focus();
            }
          }
        }
      };
      document.addEventListener('keydown', keydownHandler);
    }
    function releaseFocus(){
      if(keydownHandler) document.removeEventListener('keydown', keydownHandler);
      if(lastFocused) lastFocused.focus();
      lastFocused = null; keydownHandler = null;
    }

    // enhance open/close modal to trap focus
    const origOpen = openModal;
    const origClose = closeModal;
    openModal = function(name){
      origOpen(name);
      const modal = document.querySelector(`.modal[data-modal-name="${name}"]`);
      if(modal) trapFocus(modal);
    };
    closeModal = function(modal){
      origClose(modal);
      // modal param might be element or event; normalize
      let el = modal;
      if(typeof modal === 'string') el = document.querySelector(`.modal[data-modal-name="${modal}"]`);
      if(el) releaseFocus();
    };

    // Auth UI: persist user/token to localStorage and update navbar
    function saveAuth(json){
      try{ localStorage.setItem('cleo_token', json.token || ''); localStorage.setItem('cleo_user', JSON.stringify(json.user || {})); }catch(e){}
      updateAuthUI();
    }
    function clearAuth(){ localStorage.removeItem('cleo_token'); localStorage.removeItem('cleo_user'); updateAuthUI(); }

    function updateAuthUI(){
      const actions = document.querySelectorAll('.nav-actions');
      const user = JSON.parse(localStorage.getItem('cleo_user') || 'null');
      actions.forEach(container => {
        if(user && user.email){
          const displayName = escapeHtml(user.name || user.email.split('@')[0]);
          const initial = escapeHtml((user.name || user.email)[0] || 'U').toUpperCase();
          container.innerHTML = `
            <div class="profile">
              <button class="profile-btn" aria-haspopup="true" aria-expanded="false">
                <span class="avatar">${initial}</span>
                <span class="name">${displayName}</span>
              </button>
              <div class="profile-menu" role="menu" aria-hidden="true">
                <a href="profile.html" class="profile-item" role="menuitem">Profile</a>
                <a href="#" class="profile-item" role="menuitem">Settings</a>
                <button class="profile-item btn-signout" role="menuitem">Sign out</button>
              </div>
            </div>`;
        } else {
          container.innerHTML = `<button class="btn outline" data-modal="signin">Sign In</button> <button class="btn primary" data-modal="signup">Sign Up</button>`;
        }
      });
    }

    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }

    // watch for sign out clicks
    document.body.addEventListener('click', (e)=>{
      const so = e.target.closest('.btn-signout');
      if(so){ clearAuth(); }
    });

    // call updateAuthUI on load
    updateAuthUI();

    // Active link highlighting
    (function setActiveLink(){
      const name = (location.pathname.split('/').pop() || 'INDEX.html').toLowerCase();
      document.querySelectorAll('.nav-links a').forEach(a=>{
        const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
        if(href === name || (name === '' && href === 'index.html')) a.classList.add('active');
      });
    })();

    // Contact form handler (moved from inline in index.html)
    (function contactFormHandler(){
      const contactForm = document.getElementById('contactForm');
      if(!contactForm) return;
      const successMsg = contactForm.querySelector('.success');
      contactForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        // Basic client-side validation
        const name = contactForm.name.value && contactForm.name.value.trim();
        const email = contactForm.email.value && contactForm.email.value.trim();
        const service = contactForm.service.value || '';
        const message = contactForm.message.value && contactForm.message.value.trim();
        
        if(!name || !email || !message){
          if(successMsg){ successMsg.textContent = 'Please complete all fields.'; successMsg.style.display = 'block'; successMsg.style.color = '#ff7474'; }
          return;
        }
        
        if(!isValidEmail(email)){
          if(successMsg){ successMsg.textContent = 'Please enter a valid email.'; successMsg.style.display = 'block'; successMsg.style.color = '#ff7474'; }
          return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true, 'Sending...');
        
        try{
          const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, service, message })
          });
          const json = await res.json();
          if(json.success){
            if(successMsg){ successMsg.textContent = '✓ Message sent successfully! We\'ll get back to you soon.'; successMsg.style.display = 'block'; successMsg.style.color = 'var(--accent)'; }
            contactForm.reset();
            setTimeout(()=>{ if(successMsg) successMsg.textContent = ''; successMsg.style.display = 'none'; }, 3500);
          } else {
            if(successMsg){ successMsg.textContent = json.error || 'Failed to send message.'; successMsg.style.display = 'block'; successMsg.style.color = '#ff7474'; }
          }
        } catch(err){
          if(successMsg){ successMsg.textContent = 'Network error. Please try again.'; successMsg.style.display = 'block'; successMsg.style.color = '#ff7474'; }
          console.error('Contact form error:', err);
        } finally {
          setButtonLoading(submitBtn, false);
        }
      });
    })();

    // profile dropdown toggle (delegated)
    document.body.addEventListener('click', (e)=>{
      const btn = e.target.closest('.profile-btn');
      if(btn){
        const root = btn.closest('.profile');
        const menu = root.querySelector('.profile-menu');
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        if(expanded){
          menu.classList.remove('open'); btn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true');
        } else {
          // close any other open menus
          document.querySelectorAll('.profile-menu.open').forEach(m=>{ m.classList.remove('open'); m.previousElementSibling && m.previousElementSibling.setAttribute('aria-expanded','false'); m.setAttribute('aria-hidden','true'); });
          menu.classList.add('open'); btn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false');
        }
        return;
      }

      // close profile menu when clicking outside
      const openMenu = e.target.closest('.profile-menu.open');
      if(!openMenu){
        document.querySelectorAll('.profile-menu.open').forEach(m=>{ m.classList.remove('open'); if(m.previousElementSibling) m.previousElementSibling.setAttribute('aria-expanded','false'); m.setAttribute('aria-hidden','true'); });
      }
    });

    // keyboard: close profile menu on Escape
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape'){
        document.querySelectorAll('.profile-menu.open').forEach(m=>{ m.classList.remove('open'); if(m.previousElementSibling) m.previousElementSibling.setAttribute('aria-expanded','false'); m.setAttribute('aria-hidden','true'); });
      }
    });

    // Wrap fetch handlers with client-side validation + spinner
    if(signinForm){
      signinForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const email = signinForm.email.value.trim();
        const password = signinForm.password.value;
        if(!isValidEmail(email)) return showFormMessage(signinForm, 'Enter a valid email', 'error');
        if(!password || password.length < 4) return showFormMessage(signinForm, 'Password must be at least 4 characters', 'error');
        const submitBtn = signinForm.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true, 'Signing in...');
        try{
          const res = await fetch('/api/signin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
          const json = await res.json();
          if(json.success){
            showFormMessage(signinForm, 'Signed in successfully.', 'success');
            saveAuth(json);
            setTimeout(()=>{
              const modal = signinForm.closest('.modal');
              closeModal(modal);
            }, 700);
          } else {
            showFormMessage(signinForm, json.error || 'Sign in failed', 'error');
          }
        }catch(err){ showFormMessage(signinForm, 'Network error', 'error'); }
        finally{ setButtonLoading(submitBtn, false); }
      });
    }
    if(signupForm){
      signupForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const name = signupForm.name.value.trim();
        const email = signupForm.email.value.trim();
        const password = signupForm.password.value;
        if(!name) return showFormMessage(signupForm, 'Enter your full name', 'error');
        if(!isValidEmail(email)) return showFormMessage(signupForm, 'Enter a valid email', 'error');
        if(!password || password.length < 6) return showFormMessage(signupForm, 'Password must be at least 6 characters', 'error');
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true, 'Creating...');
        try{
          const res = await fetch('/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
          const json = await res.json();
          if(json.success){
            showFormMessage(signupForm, 'Account created.', 'success');
            saveAuth(json);
            setTimeout(()=>{
              const modal = signupForm.closest('.modal');
              closeModal(modal);
            }, 700);
          } else {
            showFormMessage(signupForm, json.error || 'Sign up failed', 'error');
          }
        }catch(err){ showFormMessage(signupForm, 'Network error', 'error'); }
        finally{ setButtonLoading(submitBtn, false); }
      });
    }
});
