// admin.js — Tokyo Table Admin Panel
// ────────────────────────────────────
// Handles: auth modal, Google sign-in, email/password sign-in,
// admin panel open/close, and full CRUD on Firestore `menuItems` collection.
// Depends on: firebase-config.js (db, auth, isAdmin, googleProvider)

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const navSignInBtn   = document.getElementById('navSignInBtn');
  const navAdminBtn    = document.getElementById('navAdminBtn');
  const navUserEmail   = document.getElementById('navUserEmail');

  const authModalEl    = document.getElementById('authModal');
  const authCloseBtn   = document.getElementById('authClose');
  const googleBtn      = document.getElementById('googleSignInBtn');
  const emailForm      = document.getElementById('emailAuthForm');
  const authEmailInput = document.getElementById('authEmail');
  const authPassInput  = document.getElementById('authPassword');
  const authError      = document.getElementById('authError');
  const authToggle     = document.getElementById('authToggleMode');
  const authModeLbl    = document.getElementById('authModeLabel');
  const authSubmitBtn  = document.getElementById('emailSubmitBtn');

  const adminPanelEl   = document.getElementById('adminPanel');
  const adminOverlay   = document.getElementById('adminOverlay');
  const adminCloseBtn  = document.getElementById('adminClose');
  const adminSignOut   = document.getElementById('adminSignOut');
  const adminUserLbl   = document.getElementById('adminUserEmail');

  const addForm        = document.getElementById('adminAddForm');
  const addFormTitle   = document.getElementById('addFormTitle');
  const addNameIn      = document.getElementById('addName');
  const addCatIn       = document.getElementById('addCategory');
  const addPriceIn     = document.getElementById('addPrice');
  const addIngIn       = document.getElementById('addIngredients');
  const addSubmitBtn   = document.getElementById('addSubmitBtn');
  const addCancelBtn   = document.getElementById('addCancelBtn');
  const editIdHidden   = document.getElementById('editItemId');

  const adminItemsList = document.getElementById('adminItemsList');
  const adminItemCount = document.getElementById('adminItemCount');
  const adminFilterBtns = document.querySelectorAll('.admin-tab-btn');
  const seedBtn        = document.getElementById('seedMenuBtn');
  const seedBanner     = document.getElementById('seedBanner');

  // ── Auth mode toggle (sign in / create account) ───────────────────────
  let authMode = 'signin'; // 'signin' | 'register'

  if (authToggle) {
    authToggle.addEventListener('click', () => {
      authMode = authMode === 'signin' ? 'register' : 'signin';
      authSubmitBtn.textContent  = authMode === 'signin' ? 'Sign In' : 'Create Account';
      authModeLbl.textContent    = authMode === 'signin'
        ? "Don't have an account? "
        : 'Already have an account? ';
      authToggle.textContent     = authMode === 'signin' ? 'Create account' : 'Sign in';
      authError.textContent      = '';
    });
  }

  // ── Auth modal open/close ─────────────────────────────────────────────
  function openAuthModal() {
    authModalEl.classList.add('open');
    authError.textContent = '';
    authEmailInput.value  = '';
    authPassInput.value   = '';
  }
  function closeAuthModal() {
    authModalEl.classList.remove('open');
  }

  navSignInBtn?.addEventListener('click', openAuthModal);
  authCloseBtn?.addEventListener('click', closeAuthModal);
  authModalEl?.addEventListener('click', e => { if (e.target === authModalEl) closeAuthModal(); });

  // ── Google sign-in ────────────────────────────────────────────────────
  googleBtn?.addEventListener('click', async () => {
    authError.textContent = '';
    try {
      await auth.signInWithPopup(googleProvider);
      closeAuthModal();
    } catch (err) {
      authError.textContent = err.message;
    }
  });

  // ── Email/password sign-in or register ────────────────────────────────
  emailForm?.addEventListener('submit', async e => {
    e.preventDefault();
    authError.textContent = '';
    const email = authEmailInput.value.trim();
    const pass  = authPassInput.value;
    try {
      if (authMode === 'signin') {
        await auth.signInWithEmailAndPassword(email, pass);
      } else {
        await auth.createUserWithEmailAndPassword(email, pass);
      }
      closeAuthModal();
    } catch (err) {
      authError.textContent = err.message;
    }
  });

  // ── Admin panel open/close ────────────────────────────────────────────
  function openAdminPanel() {
    adminPanelEl.classList.add('open');
    adminOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeAdminPanel() {
    adminPanelEl.classList.remove('open');
    adminOverlay.classList.remove('open');
    document.body.style.overflow = '';
    resetAddForm();
  }

  navAdminBtn?.addEventListener('click', openAdminPanel);
  adminCloseBtn?.addEventListener('click', closeAdminPanel);
  adminOverlay?.addEventListener('click', closeAdminPanel);

  // ── Sign out ──────────────────────────────────────────────────────────
  adminSignOut?.addEventListener('click', async () => {
    await auth.signOut();
    closeAdminPanel();
  });

  // ── Firebase Auth state listener ──────────────────────────────────────
  auth.onAuthStateChanged(user => {
    if (user && isAdmin(user.email)) {
      // Signed in as admin
      navSignInBtn.style.display  = 'none';
      navAdminBtn.style.display   = 'flex';
      navUserEmail.textContent    = user.displayName || user.email.split('@')[0];
      adminUserLbl.textContent    = user.email;
      subscribeAdminList();
    } else if (user && !isAdmin(user.email)) {
      // Signed in but NOT admin — sign them back out silently
      auth.signOut();
      navSignInBtn.style.display  = 'flex';
      navAdminBtn.style.display   = 'none';
    } else {
      // Signed out
      navSignInBtn.style.display  = 'flex';
      navAdminBtn.style.display   = 'none';
      navUserEmail.textContent    = '';
      if (adminListenerUnsubscribe) {
        adminListenerUnsubscribe();
        adminListenerUnsubscribe = null;
      }
    }
  });

  // ── Firestore real-time listener for admin list ───────────────────────
  let adminListenerUnsubscribe = null;
  let adminFilter = 'all';
  let adminItems  = [];

  function subscribeAdminList() {
    if (adminListenerUnsubscribe) return; // already subscribed
    adminListenerUnsubscribe = db.collection('menuItems')
      .orderBy('category')
      .onSnapshot(snap => {
        adminItems = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        renderAdminList();
        // Show/hide seed banner
        if (seedBanner) {
          seedBanner.style.display = adminItems.length === 0 ? 'flex' : 'none';
        }
        if (adminItemCount) adminItemCount.textContent = adminItems.length;
      }, err => {
        console.error('Admin list error:', err);
      });
  }

  // ── Admin list filter tabs ────────────────────────────────────────────
  adminFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      adminFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      adminFilter = btn.dataset.filter;
      renderAdminList();
    });
  });

  function renderAdminList() {
    if (!adminItemsList) return;
    const filtered = adminFilter === 'all'
      ? adminItems
      : adminItems.filter(i => i.category === adminFilter);

    if (filtered.length === 0) {
      adminItemsList.innerHTML = '<p class="admin-empty">No items in this category yet.</p>';
      return;
    }

    const catLabels = { udon: 'Udon', sides: 'Sides', drinks: 'Beverage', dessert: 'Dessert' };

    adminItemsList.innerHTML = filtered.map(item => `
      <div class="admin-item-row" data-id="${item.firestoreId}">
        <div class="admin-item-info">
          <span class="admin-item-cat">${catLabels[item.category] || item.category}</span>
          <span class="admin-item-name">${item.name}</span>
          <span class="admin-item-price">₹${item.price}</span>
        </div>
        <div class="admin-item-actions">
          <button class="admin-btn-edit" onclick="adminEditItem('${item.firestoreId}')">
            <i class="ph ph-pencil-simple"></i> Edit
          </button>
          <button class="admin-btn-delete" onclick="adminDeleteItem('${item.firestoreId}', '${item.name.replace(/'/g,"\\'")}')">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // ── Add / Edit form ───────────────────────────────────────────────────
  function resetAddForm() {
    if (!addForm) return;
    addForm.reset();
    editIdHidden.value   = '';
    addFormTitle.textContent  = 'Add New Item';
    addSubmitBtn.textContent  = 'Add Item';
    addCancelBtn.style.display = 'none';
  }

  addCancelBtn?.addEventListener('click', resetAddForm);

  addForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      name:        addNameIn.value.trim(),
      category:    addCatIn.value,
      price:       parseInt(addPriceIn.value, 10),
      ingredients: addIngIn.value.trim(),
    };

    if (!data.name || !data.category || isNaN(data.price)) return;

    addSubmitBtn.disabled    = true;
    addSubmitBtn.textContent = 'Saving…';

    try {
      const editId = editIdHidden.value;
      if (editId) {
        await db.collection('menuItems').doc(editId).update(data);
      } else {
        await db.collection('menuItems').add(data);
      }
      resetAddForm();
    } catch (err) {
      alert('Error saving item: ' + err.message);
    } finally {
      addSubmitBtn.disabled    = false;
      addSubmitBtn.textContent = editIdHidden.value ? 'Update Item' : 'Add Item';
    }
  });

  // ── Global: edit item (called from rendered HTML) ─────────────────────
  window.adminEditItem = function(firestoreId) {
    const item = adminItems.find(i => i.firestoreId === firestoreId);
    if (!item) return;
    addFormTitle.textContent   = 'Edit Item';
    addSubmitBtn.textContent   = 'Update Item';
    addCancelBtn.style.display = 'inline-flex';
    editIdHidden.value         = firestoreId;
    addNameIn.value            = item.name;
    addCatIn.value             = item.category;
    addPriceIn.value           = item.price;
    addIngIn.value             = item.ingredients;
    // Scroll to form
    addForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Global: delete item (called from rendered HTML) ───────────────────
  window.adminDeleteItem = async function(firestoreId, name) {
    if (!confirm(`Delete "${name}" from the menu? This cannot be undone.`)) return;
    try {
      await db.collection('menuItems').doc(firestoreId).delete();
    } catch (err) {
      alert('Error deleting item: ' + err.message);
    }
  };

  // ── Seed button: push hardcoded menuData to Firestore ─────────────────
  seedBtn?.addEventListener('click', async () => {
    if (!window.SEED_MENU_DATA) return;
    seedBtn.disabled    = true;
    seedBtn.textContent = 'Seeding…';
    try {
      const batch = db.batch();
      window.SEED_MENU_DATA.forEach(item => {
        const ref = db.collection('menuItems').doc();
        batch.set(ref, {
          name:        item.name,
          category:    item.category,
          price:       item.price,
          ingredients: item.ingredients,
        });
      });
      await batch.commit();
      seedBtn.textContent = 'Done!';
    } catch (err) {
      alert('Seed error: ' + err.message);
      seedBtn.textContent = 'Initialize Menu';
      seedBtn.disabled    = false;
    }
  });

});
