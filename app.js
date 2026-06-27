// app.js - Tokyo Table Premium

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBVX3pGP02hJTO0zDanZPhIrEp6lq_cw0s",
    authDomain: "tokyo-table-df75d.firebaseapp.com",
    projectId: "tokyo-table-df75d",
    storageBucket: "tokyo-table-df75d.firebasestorage.app",
    messagingSenderId: "166498379593",
    appId: "1:166498379593:web:8e9ddbac59a82999129c98"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const ADMIN_EMAILS = ["johanabraham345@gmail.com", "xxx@gmail.com"];
let loggedInEmail = localStorage.getItem("tokyoTableOwnerEmail") || "";
function isOwner() {
    return ADMIN_EMAILS.includes(loggedInEmail.trim().toLowerCase());
}

let menuData = [];

const defaultMenuToSeed = [
    // Udon
    { id: "1", name: 'Chicken Udon (Traditional)', category: 'udon', price: 230, ingredients: 'Hand-pulled udon, slow-simmered chicken broth, tender chicken slices, scallions, soy essence.' },
    { id: "2", name: 'Beef Udon (Traditional)', category: 'udon', price: 250, ingredients: 'Thick udon noodles, rich beef broth, thinly sliced beef, delicate Japanese seasoning.' },
    { id: "3", name: 'Vegetable Udon (Traditional)', category: 'udon', price: 180, ingredients: 'Clear umami vegetable broth, seasonal greens, mushrooms, soft tofu, hand-pulled udon.' },
    { id: "4", name: 'Tomato Sauce Udon', category: 'udon', price: 210, ingredients: 'Udon noodles tossed in a rich, tangy Japanese-style tomato reduction with fresh basil.' },
    { id: "5", name: 'Stir-fried Chicken Udon', category: 'udon', price: 210, ingredients: 'Wok-tossed udon with chicken breast chunks, cabbage, carrots, savory soy glaze.' },
    { id: "6", name: 'Stir-fried Beef Udon', category: 'udon', price: 240, ingredients: 'Wok-tossed udon, savory beef strips, crisp vegetables, dark rich soy reduction.' },
    { id: "7", name: 'Stir-fried Veg Udon', category: 'udon', price: 170, ingredients: 'Wok-tossed udon, crunchy vegetables, bean sprouts, house vegetarian sauce.' },
    
    // Sides
    { id: "8", name: 'Karaage', category: 'sides', price: 230, ingredients: 'Crispy Japanese fried chicken marinated in soy, sake, ginger. Served with citrus mayonnaise.' },
    { id: "9", name: 'Dynamite Tokyo Chicken', category: 'sides', price: 250, ingredients: 'Spicy crispy chicken coated in our signature creamy dynamite sauce.' },
    { id: "10", name: 'Soy Glazed Beef', category: 'sides', price: 210, ingredients: 'Thinly sliced beef simmered in a sweet and savory soy, mirin, and sugar glaze.' },
    { id: "11", name: 'Chicken Katsu', category: 'sides', price: 210, ingredients: 'Breaded, deep-fried golden chicken cutlet with tangy tonkatsu sauce.' },
    { id: "12", name: 'Kakiage (Veg Tempura)', category: 'sides', price: 45, ingredients: 'Crispy lacy fritter of julienned vegetables in light tempura batter.' },
    { id: "13", name: 'Clear Chicken Soup', category: 'sides', price: 150, ingredients: 'Comforting clear broth with mild seasonings and scallions.' },
    { id: "14", name: 'Clear Beef Soup', category: 'sides', price: 170, ingredients: 'Robust clear soup infused with beef essence.' },
    { id: "15", name: 'Sesame Salad', category: 'sides', price: 70, ingredients: 'Crisp mixed greens with light Japanese sesame dressing.' },
    { id: "16", name: 'Tsukemono (Pickles)', category: 'sides', price: 60, ingredients: 'Traditional lightly pickled vegetables, crisp and refreshing.' },

    // Beverages
    { id: "17", name: 'Pour Over Black Coffee', category: 'drinks', price: 80, ingredients: 'Premium brewed black coffee from carefully sourced beans.' },
    { id: "18", name: 'Ceremonial Matcha Latte', category: 'drinks', price: 140, ingredients: 'High-grade Uji matcha whisked with steamed milk.' },
    { id: "19", name: 'Spiced Chai', category: 'drinks', price: 25, ingredients: 'Classic Indian spiced tea blended with milk.' },
    { id: "20", name: 'Matcha Frappé', category: 'drinks', price: 150, ingredients: 'Chilled blend of premium matcha, milk, and sweet cream.' },
    { id: "21", name: 'Iced Black Coffee', category: 'drinks', price: 80, ingredients: 'Refreshing chilled black coffee.' },
    { id: "22", name: 'Iced Milk Coffee', category: 'drinks', price: 80, ingredients: 'Smooth iced coffee blended with cold milk.' },
    { id: "23", name: 'Iced Milk Tea', category: 'drinks', price: 70, ingredients: 'Chilled brewed tea mixed with cold milk.' },
    { id: "24", name: 'Classic Cold Coffee', category: 'drinks', price: 120, ingredients: 'Creamy blended cold coffee.' },
    { id: "25", name: 'Chocolate Monster', category: 'drinks', price: 130, ingredients: 'Decadent chocolate cold beverage topped with cocoa dust.' },
    { id: "26", name: 'Strawberry Monster', category: 'drinks', price: 130, ingredients: 'Vibrant strawberry cold beverage blended with fresh cream.' },
    { id: "27", name: 'Shippu Mocktail', category: 'drinks', price: 100, ingredients: 'Signature refreshing citrus-based mocktail.' },
    { id: "28", name: 'Tokyo Mocktail', category: 'drinks', price: 80, ingredients: 'House special fruit-infused mocktail.' },

    // Dessert
    { id: "29", name: 'Japanese Purin', category: 'dessert', price: 80, ingredients: 'Silky smooth custard pudding topped with dark caramel syrup.' }
];

document.addEventListener('DOMContentLoaded', async () => {

    // --- Navbar Scroll ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
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
        }, 5000); // 5 seconds per slide
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

    // --- Firebase Fetch ---
    async function fetchMenuData() {
        try {
            const querySnapshot = await getDocs(collection(db, "menu"));
            menuData = querySnapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
            
            if (menuData.length === 0) {
                console.log("Seeding default menu...");
                for (const item of defaultMenuToSeed) {
                    await setDoc(doc(db, "menu", item.id), item);
                    menuData.push({ firebaseId: item.id, ...item });
                }
            }
            renderMenu();
        } catch (err) {
            console.error("Failed to load menu", err);
        }
    }
    await fetchMenuData();

    // --- Admin state update ---
    const adminCatalogActions = document.getElementById('adminCatalogActions');
    const ownerLoginOpen = document.getElementById('ownerLoginOpen');
    const ownerLogout = document.getElementById('ownerLogout');
    const loginStatus = document.getElementById('loginStatus');
    const ownerLoginForm = document.getElementById('ownerLoginForm');
    
    function updateOwnerUI() {
        if (isOwner()) {
            adminCatalogActions.classList.remove('hidden');
            ownerLoginOpen.textContent = 'Admin Dashboard';
            loginStatus.innerHTML = `Logged in as Admin (<b>${loggedInEmail}</b>)`;
            ownerLoginForm.classList.add('hidden');
            ownerLogout.classList.remove('hidden');
        } else {
            adminCatalogActions.classList.add('hidden');
            ownerLoginOpen.textContent = 'Account';
            if (loggedInEmail) {
                loginStatus.innerHTML = `Logged in as <b>${loggedInEmail}</b>`;
                ownerLoginForm.classList.add('hidden');
                ownerLogout.classList.remove('hidden');
            } else {
                ownerLoginOpen.textContent = 'Login';
                loginStatus.innerHTML = `Please log in to your account.`;
                ownerLoginForm.classList.remove('hidden');
                ownerLogout.classList.add('hidden');
            }
        }
        renderMenu();
    }
    updateOwnerUI();

    // --- Menu Rendering ---
    const menuGrid = document.getElementById('menuGrid');
    const filterBtns = document.querySelectorAll('.tab-btn');
    const seeMoreBtn = document.getElementById('seeMoreMenu');
    const menuBatchSize = 12;
    let activeFilter = 'all';
    let visibleMenuCount = menuBatchSize;

    const categoryLabels = {
        udon: 'Udon',
        sides: 'Sides',
        drinks: 'Beverage',
        dessert: 'Dessert'
    };
    const categoryMarks = {
        udon: '麺',
        sides: '皿',
        drinks: '茶',
        dessert: '甘'
    };

    function renderMenu(filter = activeFilter) {
        menuGrid.innerHTML = '';
        activeFilter = filter;
        
        const filteredData = filter === 'all' 
            ? menuData 
            : menuData.filter(item => item.category === filter);

        filteredData.slice(0, visibleMenuCount).forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'menu-item';
            el.dataset.jp = categoryMarks[item.category] || '食';
            el.style.animationDelay = `${index * 0.05}s`;
            el.style.position = 'relative'; // Ensure absolute admin buttons stay inside

            let adminTools = '';
            if (isOwner()) {
                adminTools = `
                    <div style="position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; gap: 5px;">
                        <button class="btn btn-outline edit-item-btn" style="padding: 5px; min-width: auto;" data-id="${item.firebaseId}"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-primary delete-item-btn" style="padding: 5px; min-width: auto; background: red; border-color: red;" data-id="${item.firebaseId}"><i class="ph ph-trash"></i></button>
                    </div>
                `;
            }

            const imgHTML = item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; display: block;">` : '';
            el.innerHTML = `
                ${adminTools}
                ${imgHTML}
                <span class="item-cat">${categoryLabels[item.category]}</span>
                <h4 class="item-name">${item.name}</h4>
                <span class="item-price">₹${item.price}</span>
            `;

            el.addEventListener('click', (e) => {
                const btnEdit = e.target.closest('.edit-item-btn');
                const btnDel = e.target.closest('.delete-item-btn');
                if (btnEdit) {
                    openAddMenuModal(item);
                } else if (btnDel) {
                    deleteMenuItem(item.firebaseId);
                } else {
                    openModal(item);
                }
            });
            menuGrid.appendChild(el);
        });

        if (seeMoreBtn) {
            const remaining = filteredData.length - visibleMenuCount;
            seeMoreBtn.style.display = remaining > 0 ? 'inline-flex' : 'none';
            seeMoreBtn.textContent = remaining > menuBatchSize ? 'See More' : `See ${remaining} More`;
        }
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

    // --- Admin Logins ---
    const ownerModal = document.getElementById('ownerModal');
    document.getElementById('ownerLoginOpen').addEventListener('click', () => {
        ownerModal.style.display = 'block';
        updateOwnerUI();
    });
    document.getElementById('ownerModalClose').addEventListener('click', () => {
        ownerModal.style.display = 'none';
    });

    document.getElementById('googleLoginBtn').addEventListener('click', async () => {
        try {
            const userCred = await signInWithPopup(auth, provider);
            loggedInEmail = userCred.user.email;
            localStorage.setItem("tokyoTableOwnerEmail", loggedInEmail);
            updateOwnerUI();
        } catch (err) {
            alert('Google login failed: ' + err.message);
        }
    });

    ownerLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('ownerEmailInput').value;
        const pass = document.getElementById('ownerPasswordInput').value;
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, pass);
            loggedInEmail = userCred.user.email;
            localStorage.setItem("tokyoTableOwnerEmail", loggedInEmail);
            updateOwnerUI();
        } catch (err) {
            alert('Email login failed: ' + err.message);
        }
    });

    ownerLogout.addEventListener('click', async () => {
        await signOut(auth);
        loggedInEmail = "";
        localStorage.removeItem("tokyoTableOwnerEmail");
        updateOwnerUI();
    });

    // --- Admin Add/Edit Menu Items ---
    const addMenuModal = document.getElementById('addMenuModal');
    const menuForm = document.getElementById('menuForm');
    
    document.getElementById('addMenuOpen').addEventListener('click', () => {
        openAddMenuModal();
    });
    document.getElementById('addMenuClose').addEventListener('click', () => {
        addMenuModal.style.display = 'none';
    });

    function openAddMenuModal(item = null) {
        if (!isOwner()) return;
        if (item) {
            document.getElementById('menuFormTitle').textContent = 'Edit Menu Item';
            document.getElementById('menuFormId').value = item.firebaseId;
            document.getElementById('menuFormName').value = item.name;
            document.getElementById('menuFormCategory').value = item.category;
            document.getElementById('menuFormPrice').value = item.price;
            document.getElementById('menuFormIngredients').value = item.ingredients;
            document.getElementById('menuFormImage').value = item.image || '';
        } else {
            document.getElementById('menuFormTitle').textContent = 'Add Menu Item';
            menuForm.reset();
            document.getElementById('menuFormId').value = "";
            document.getElementById('menuFormImage').value = "";
        }
        addMenuModal.style.display = 'block';
    }

    menuForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('menuFormId').value;
        const newItem = {
            name: document.getElementById('menuFormName').value.trim(),
            category: document.getElementById('menuFormCategory').value,
            price: Number(document.getElementById('menuFormPrice').value),
            ingredients: document.getElementById('menuFormIngredients').value.trim(),
            image: document.getElementById('menuFormImage').value.trim()
        };

        try {
            if (id) {
                // Edit
                await updateDoc(doc(db, "menu", id), newItem);
                const index = menuData.findIndex(x => x.firebaseId === id);
                if (index > -1) menuData[index] = { firebaseId: id, ...newItem };
            } else {
                // Add
                const newRef = await addDoc(collection(db, "menu"), newItem);
                menuData.unshift({ firebaseId: newRef.id, ...newItem });
            }
            addMenuModal.style.display = 'none';
            renderMenu();
        } catch (err) {
            alert("Failed to save menu item: " + err.message);
        }
    });

    async function deleteMenuItem(id) {
        if (!isOwner() || !confirm("Delete this menu item?")) return;
        try {
            await deleteDoc(doc(db, "menu", id));
            menuData = menuData.filter(x => x.firebaseId !== id);
            renderMenu();
        } catch (err) {
            alert("Failed to delete item: " + err.message);
        }
    }


    // --- Item Details Modal Logic ---
    const modal = document.getElementById('itemModal');
    const modalClose = document.getElementById('modalClose');
    const modalTitle = document.getElementById('modalTitle');
    const modalCat = document.getElementById('modalCat');
    const modalPrice = document.getElementById('modalPrice');
    const modalIng = document.getElementById('modalIng');
    const modalAddBtn = document.getElementById('modalAddBtn');

    let currentItem = null;

    function openModal(item) {
        currentItem = item;
        const categoryLabels = { udon: 'Udon', sides: 'Sides', drinks: 'Beverage', dessert: 'Dessert' };
        
        modalTitle.textContent = item.name;
        modalCat.textContent = categoryLabels[item.category];
        modalPrice.textContent = `₹${item.price}`;
        modalIng.textContent = item.ingredients;
        
        const imgCol = modal.querySelector('.modal-image-col');
        if (item.image) {
            imgCol.style.backgroundImage = `url('${item.image}')`;
            imgCol.style.backgroundSize = 'cover';
            imgCol.style.backgroundPosition = 'center';
            imgCol.innerHTML = '';
        } else {
            imgCol.style.backgroundImage = 'none';
            imgCol.innerHTML = '<span class="modal-jp">いただきます</span><i class="ph ph-bowl-food"></i><p>Prepared fresh to order</p>';
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        currentItem = null;
    }

    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal || e.target === ownerModal || e.target === addMenuModal) {
            if (e.target === modal) closeModal();
            if (e.target === ownerModal) ownerModal.style.display = 'none';
            if (e.target === addMenuModal) addMenuModal.style.display = 'none';
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            ownerModal.style.display = 'none';
            addMenuModal.style.display = 'none';
        }
    });

    // --- Cart & Order Logic ---
    let cart = [];
    const cartContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const totalAmountEl = document.getElementById('total-amount');
    const submitOrderBtn = document.getElementById('submit-order');

    modalAddBtn.addEventListener('click', () => {
        if (currentItem) {
            addToCart(currentItem);
            closeModal();
            document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
        }
    });

    function addToCart(item) {
        const existing = cart.find(c => c.firebaseId === item.firebaseId);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        updateCartUI();
    }

    window.removeFromCart = function(id) {
        cart = cart.filter(c => c.firebaseId !== id);
        updateCartUI();
    }

    function updateCartUI() {
        if (cart.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart-msg">Your table is waiting. Choose a masterpiece from the menu.</div>';
            cartTotalContainer.style.display = 'none';
            submitOrderBtn.disabled = true;
            return;
        }

        submitOrderBtn.disabled = false;
        cartTotalContainer.style.display = 'flex';
        
        let html = '';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span>Qty: ${item.quantity}</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="cart-item-price">₹${itemTotal}</span>
                        <button class="cart-item-remove" onclick="removeFromCart('${item.firebaseId}')"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `;
        });

        cartContainer.innerHTML = html;
        totalAmountEl.textContent = `₹${total}`;
    }

    // Checkout Form Submit
    const checkoutForm = document.getElementById('checkout-form');
    const orderSuccessMsg = document.getElementById('order-success');
    const whatsappNumber = '917736696950';

    function buildWhatsAppOrderMessage() {
        const name = document.getElementById('cust-name').value.trim();
        const phone = document.getElementById('cust-phone').value.trim();
        const address = document.getElementById('cust-address').value.trim();
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const lines = cart.map(item => `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join('\n');

        return `Hello Tokyo Table, I would like to place an order.\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nOrder:\n${lines}\n\nTotal: ₹${total}`;
    }

    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cart.length === 0) return;

        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(buildWhatsAppOrderMessage())}`;
        window.open(whatsappUrl, '_blank');

        submitOrderBtn.innerHTML = '<i class="ph ph-whatsapp-logo"></i> Sent to WhatsApp';
        orderSuccessMsg.classList.add('active');

        setTimeout(() => {
            orderSuccessMsg.classList.remove('active');
            submitOrderBtn.innerHTML = '<i class="ph ph-whatsapp-logo"></i> Send on WhatsApp';
            updateCartUI();
        }, 3500);
    });
});
