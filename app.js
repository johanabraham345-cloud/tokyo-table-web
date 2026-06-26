// app.js - Tokyo Table Premium
// ─────────────────────────────────────────────────────────────────────────────
// Menu data loads live from Firestore (menuItems collection).
// SEED_MENU_DATA is used as fallback if Firestore is empty.

const menuData = [
    // Udon
    { id: 1, name: 'Chicken Udon (Traditional)', category: 'udon', price: 230, ingredients: 'Hand-pulled udon, slow-simmered chicken broth, tender chicken slices, scallions, soy essence.' },
    { id: 2, name: 'Beef Udon (Traditional)', category: 'udon', price: 250, ingredients: 'Thick udon noodles, rich beef broth, thinly sliced beef, delicate Japanese seasoning.' },
    { id: 3, name: 'Vegetable Udon (Traditional)', category: 'udon', price: 180, ingredients: 'Clear umami vegetable broth, seasonal greens, mushrooms, soft tofu, hand-pulled udon.' },
    { id: 4, name: 'Tomato Sauce Udon', category: 'udon', price: 210, ingredients: 'Udon noodles tossed in a rich, tangy Japanese-style tomato reduction with fresh basil.' },
    { id: 5, name: 'Stir-fried Chicken Udon', category: 'udon', price: 210, ingredients: 'Wok-tossed udon with chicken breast chunks, cabbage, carrots, savory soy glaze.' },
    { id: 6, name: 'Stir-fried Beef Udon', category: 'udon', price: 240, ingredients: 'Wok-tossed udon, savory beef strips, crisp vegetables, dark rich soy reduction.' },
    { id: 7, name: 'Stir-fried Veg Udon', category: 'udon', price: 170, ingredients: 'Wok-tossed udon, crunchy vegetables, bean sprouts, house vegetarian sauce.' },
    // Sides
    { id: 8, name: 'Karaage', category: 'sides', price: 230, ingredients: 'Crispy Japanese fried chicken marinated in soy, sake, ginger. Served with citrus mayonnaise.' },
    { id: 9, name: 'Dynamite Tokyo Chicken', category: 'sides', price: 250, ingredients: 'Spicy crispy chicken coated in our signature creamy dynamite sauce.' },
    { id: 10, name: 'Soy Glazed Beef', category: 'sides', price: 210, ingredients: 'Thinly sliced beef simmered in a sweet and savory soy, mirin, and sugar glaze.' },
    { id: 11, name: 'Chicken Katsu', category: 'sides', price: 210, ingredients: 'Breaded, deep-fried golden chicken cutlet with tangy tonkatsu sauce.' },
    { id: 12, name: 'Kakiage (Veg Tempura)', category: 'sides', price: 45, ingredients: 'Crispy lacy fritter of julienned vegetables in light tempura batter.' },
    { id: 13, name: 'Clear Chicken Soup', category: 'sides', price: 150, ingredients: 'Comforting clear broth with mild seasonings and scallions.' },
    { id: 14, name: 'Clear Beef Soup', category: 'sides', price: 170, ingredients: 'Robust clear soup infused with beef essence.' },
    { id: 15, name: 'Sesame Salad', category: 'sides', price: 70, ingredients: 'Crisp mixed greens with light Japanese sesame dressing.' },
    { id: 16, name: 'Tsukemono (Pickles)', category: 'sides', price: 60, ingredients: 'Traditional lightly pickled vegetables, crisp and refreshing.' },
    // Beverages
    { id: 17, name: 'Pour Over Black Coffee', category: 'drinks', price: 80, ingredients: 'Premium brewed black coffee from carefully sourced beans.' },
    { id: 18, name: 'Ceremonial Matcha Latte', category: 'drinks', price: 140, ingredients: 'High-grade Uji matcha whisked with steamed milk.' },
    { id: 19, name: 'Spiced Chai', category: 'drinks', price: 25, ingredients: 'Classic Indian spiced tea blended with milk.' },
    { id: 20, name: 'Matcha Frappé', category: 'drinks', price: 150, ingredients: 'Chilled blend of premium matcha, milk, and sweet cream.' },
    { id: 21, name: 'Iced Black Coffee', category: 'drinks', price: 80, ingredients: 'Refreshing chilled black coffee.' },
    { id: 22, name: 'Iced Milk Coffee', category: 'drinks', price: 80, ingredients: 'Smooth iced coffee blended with cold milk.' },
    { id: 23, name: 'Iced Milk Tea', category: 'drinks', price: 70, ingredients: 'Chilled brewed tea mixed with cold milk.' },
    { id: 24, name: 'Classic Cold Coffee', category: 'drinks', price: 120, ingredients: 'Creamy blended cold coffee.' },
    { id: 25, name: 'Chocolate Monster', category: 'drinks', price: 130, ingredients: 'Decadent chocolate cold beverage topped with cocoa dust.' },
    { id: 26, name: 'Strawberry Monster', category: 'drinks', price: 130, ingredients: 'Vibrant strawberry cold beverage blended with fresh cream.' },
    { id: 27, name: 'Shippu Mocktail', category: 'drinks', price: 100, ingredients: 'Signature refreshing citrus-based mocktail.' },
    { id: 28, name: 'Tokyo Mocktail', category: 'drinks', price: 80, ingredients: 'House special fruit-infused mocktail.' },
    // Dessert
    { id: 29, name: 'Japanese Purin', category: 'dessert', price: 80, ingredients: 'Silky smooth custard pudding topped with dark caramel syrup.' }
];

// Expose for admin.js seed function
window.SEED_MENU_DATA = menuData;

// Live data variable — gets filled from Firestore; falls back to menuData
let liveMenuData = [...menuData];

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar Scroll ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Mobile Menu ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('open'));
        });
    }

    // --- Hero Background Slider ---
    const slides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 5000);
    }

    // --- Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Menu Rendering ---
    const menuGrid    = document.getElementById('menuGrid');
    const filterBtns  = document.querySelectorAll('.tab-btn');
    const seeMoreBtn  = document.getElementById('seeMoreMenu');
    const menuBatchSize = 12;
    let activeFilter  = 'all';
    let visibleMenuCount = menuBatchSize;

    const categoryLabels = { udon: 'Udon', sides: 'Sides', drinks: 'Beverage', dessert: 'Dessert' };
    const categoryMarks  = { udon: '麺', sides: '皿', drinks: '茶', dessert: '甘' };

    function renderMenu(filter = activeFilter) {
        menuGrid.innerHTML = '';
        activeFilter = filter;

        const filteredData = filter === 'all'
            ? liveMenuData
            : liveMenuData.filter(item => item.category === filter);

        filteredData.slice(0, visibleMenuCount).forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'menu-item';
            el.dataset.jp = categoryMarks[item.category] || '食';
            el.style.animationDelay = `${index * 0.05}s`;
            el.innerHTML = `
                <span class="item-cat">${categoryLabels[item.category] || item.category}</span>
                <h4 class="item-name">${item.name}</h4>
                <span class="item-price">₹${item.price}</span>
            `;
            el.addEventListener('click', () => openModal(item));
            menuGrid.appendChild(el);
        });

        if (seeMoreBtn) {
            const remaining = filteredData.length - visibleMenuCount;
            seeMoreBtn.style.display = remaining > 0 ? 'inline-flex' : 'none';
            seeMoreBtn.textContent   = remaining > menuBatchSize ? 'See More' : `See ${remaining} More`;
        }
    }

    // ── Firestore live listener ──────────────────────────────────────────
    // Subscribes to the menuItems collection; re-renders the public menu
    // whenever an admin makes a change.
    if (typeof db !== 'undefined') {
        db.collection('menuItems').onSnapshot(snap => {
            if (!snap.empty) {
                liveMenuData = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
            } else {
                // Firestore empty — fall back to built-in seed data
                liveMenuData = [...menuData];
            }
            renderMenu(activeFilter);
        }, err => {
            console.warn('Firestore not available, using local menu data.', err.message);
            liveMenuData = [...menuData];
            renderMenu(activeFilter);
        });
    } else {
        renderMenu(); // no Firebase — use local data immediately
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            visibleMenuCount = menuBatchSize;
            renderMenu(btn.getAttribute('data-filter'));
        });
    });

    if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', () => {
            visibleMenuCount += menuBatchSize;
            renderMenu(activeFilter);
        });
    }

    // --- Modal Logic ---
    const modal        = document.getElementById('itemModal');
    const modalClose   = document.getElementById('modalClose');
    const modalTitle   = document.getElementById('modalTitle');
    const modalCat     = document.getElementById('modalCat');
    const modalPrice   = document.getElementById('modalPrice');
    const modalIng     = document.getElementById('modalIng');
    const modalAddBtn  = document.getElementById('modalAddBtn');
    let currentItem    = null;

    function openModal(item) {
        currentItem = item;
        modalTitle.textContent = item.name;
        modalCat.textContent   = categoryLabels[item.category] || item.category;
        modalPrice.textContent = `₹${item.price}`;
        modalIng.textContent   = item.ingredients;
        modal.style.display    = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display    = 'none';
        document.body.style.overflow = '';
        currentItem = null;
    }

    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    // --- Cart & Order Logic ---
    let cart = [];
    const cartContainer      = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const totalAmountEl      = document.getElementById('total-amount');
    const submitOrderBtn     = document.getElementById('submit-order');

    modalAddBtn.addEventListener('click', () => {
        if (currentItem) {
            addToCart(currentItem);
            closeModal();
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        }
    });

    function addToCart(item) {
        const existing = cart.find(c => c.id === item.id || c.firestoreId === item.firestoreId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCartUI();
    }

    window.removeFromCart = function(id) {
        cart = cart.filter(c => c.id !== id && c.firestoreId !== id);
        updateCartUI();
    };

    function updateCartUI() {
        if (cart.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart-msg">Your table is waiting. Choose a masterpiece from the menu.</div>';
            cartTotalContainer.style.display = 'none';
            submitOrderBtn.disabled = true;
            return;
        }

        submitOrderBtn.disabled = false;
        cartTotalContainer.style.display = 'flex';

        let html = '', total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const removeId = item.firestoreId || item.id;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <span class="cart-item-price">₹${itemTotal}</span>
                        <button class="cart-item-remove" onclick="removeFromCart('${removeId}')"><i class="ph ph-trash"></i></button>
                    </div>
                </div>`;
        });

        cartContainer.innerHTML = html;
        totalAmountEl.textContent = `₹${total}`;
    }

    // --- WhatsApp Checkout ---
    const checkoutForm    = document.getElementById('checkout-form');
    const orderSuccessMsg = document.getElementById('order-success');
    const whatsappNumber  = '917736696950';

    function buildWhatsAppOrderMessage() {
        const name    = document.getElementById('cust-name').value.trim();
        const phone   = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        const total   = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const lines   = cart.map(item => `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join('\n');
        return `Hello Tokyo Table, I would like to place an order.\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nOrder:\n${lines}\n\nTotal: ₹${total}`;
    }

    checkoutForm.addEventListener('submit', e => {
        e.preventDefault();
        if (cart.length === 0) return;
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppOrderMessage())}`;
        window.open(url, '_blank');
        submitOrderBtn.innerHTML = '<i class="ph ph-whatsapp-logo"></i> Sent to WhatsApp';
        orderSuccessMsg.classList.add('active');
        setTimeout(() => {
            orderSuccessMsg.classList.remove('active');
            checkoutForm.reset();
            submitOrderBtn.innerHTML = '<i class="ph ph-whatsapp-logo"></i> Send on WhatsApp';
            updateCartUI();
        }, 3500);
    });
});
