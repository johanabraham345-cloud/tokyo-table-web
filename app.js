// =════════════════════════════════════════════════════════════════════════
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// =════════════════════════════════════════════════════════════════════════
const firebaseConfig = {
    apiKey: "AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q", 
    authDomain: "tokyo-table-premium.firebaseapp.com",
    projectId: "tokyo-table-premium",
    storageBucket: "tokyo-table-premium.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:a1b2c3d4e5f6g7h8i9j0k1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =════════════════════════════════════════════════════════════════════════
// 2. STATE LOGIC
// =════════════════════════════════════════════════════════════════════════
let menuItems = [];
let cart = JSON.parse(localStorage.getItem('tokyoTableCart')) || [];
let activePublicFilter = 'all';
let activeAdminFilter = 'all';
let itemsLimit = 6;
let authMode = 'login'; // 'login' or 'signup'
let selectedModalItem = null;

// Built-in collection of 29 Masterpieces for database seeding
const backupMasterpieces = [
    { name: "Dry Beef Udon", category: "udon", price: 280, ingredients: "Thick hand-pulled udon tossed in a savory garlic-soy reduction, topped with tender slow-braised beef, spring onions, and a soft-boiled egg." },
    { name: "Soupy Beef Udon", category: "udon", price: 290, ingredients: "Traditional hot dashi broth with thick udon noodles, thinly sliced sukiyaki beef, narutomaki, and fresh scallions." },
    { name: "Fried Chicken Udon", category: "udon", price: 270, ingredients: "Crispy Japanese karaage served over a bed of steaming hot udon noodles in a rich, comforting umami dashi broth." },
    { name: "Chicken Noodles Udon", category: "udon", price: 260, ingredients: "Wok-tossed thick udon noodles with juicy chicken strips, crisp cabbage, carrots, and our signature dark savory sauce." },
    { name: "Kitsune Udon", category: "udon", price: 240, ingredients: "Classic hot udon soup topped with sweet seasoned fried tofu pouches (inari), tempura flakes, and scallions." },
    { name: "Tempura Udon", category: "udon", price: 310, ingredients: "Light, steaming dashi broth with hand-pulled noodles, served with a side of crispy jumbo prawn tempura." },
    { name: "Spicy Miso Chicken Udon", category: "udon", price: 280, ingredients: "Thick noodles in a rich, fiery red miso broth with minced chicken, chili oil, and fresh pak choi." },
    { name: "Curry Udon", category: "udon", price: 290, ingredients: "Thick, chewy udon noodles swimming in a rich, fragrant, and deeply comforting Japanese golden curry sauce." },
    { name: "Dynamite Chicken", category: "sides", price: 240, ingredients: "Perfectly crispy bite-sized chicken tossed in our legendary creamy, spicy dynamite sauce. A guest favorite!" },
    { name: "Classic Chicken Karaage", category: "sides", price: 220, ingredients: "Crispy, juicy Japanese-style fried chicken marinated in soy, ginger, and garlic, served with kewpie mayo." },
    { name: "Gyoza (Pan-Fried Chicken)", category: "sides", price: 190, ingredients: "Five pieces of delicate pan-fried dumplings filled with seasoned minced chicken and chives, served with soy-vinegar dip." },
    { name: "Takoyaki", category: "sides", price: 210, ingredients: "Six savory golden octopus balls drizzled with sweet takoyaki sauce, kewpie mayo, and topped with bonito flakes." },
    { name: "Prawn Tempura", category: "sides", price: 290, ingredients: "Four pieces of light, ultra-crisp battered prawns served with a warm, savory tentsuyu dipping sauce." },
    { name: "Edamame with Sea Salt", category: "sides", price: 140, ingredients: "Steamed whole soy pods tossed in flaky sea salt—a clean, classic Izakaya starter." },
    { name: "Spicy Garlic Edamame", category: "sides", price: 160, ingredients: "Steamed soy pods wok-tossed in a bold, savory chili garlic glaze and sesame seeds." },
    { name: "Rice Bowl with Fried Chicken", category: "sides", price: 250, ingredients: "A comforting bowl of fluffy Japanese rice topped with crispy chicken karaage, sweet soy glaze, and fresh herbs." },
    { name: "Ceremonial Matcha Latte", category: "drinks", price: 180, ingredients: "Whisked pure stone-ground Uji matcha combined with velvety steamed milk and a touch of sweetness." },
    { name: "Iced Matcha Lemonade", category: "drinks", price: 160, ingredients: "A refreshing, vibrant blend of earth matcha and crisp, sweet sparkling lemonade." },
    { name: "Tokyo Cold Brew Coffee", category: "drinks", price: 170, ingredients: "Smooth, slow-dripped single origin coffee served over artisanal ice blocks." },
    { name: "Kyoto Hojicha Milk Tea", category: "drinks", price: 180, ingredients: "Nutty, roasted green tea leaves brewed into a smooth, comforting milk tea with rich caramel notes." },
    { name: "Yuzu Sparkling Soda", category: "drinks", price: 150, ingredients: "An effervescent, citrusy cooler made with authentic aromatic Japanese yuzu juice and sparkling water." },
    { name: "Sakura Blossom Tea", category: "drinks", price: 140, ingredients: "An elegant, fragrant infusion of pickled cherry blossoms with a delicate floral aroma." },
    { name: "Oolong Tea", category: "drinks", price: 120, ingredients: "Traditionally brewed roasted Chinese oolong tea with a deep, complex, and refreshing profile." },
    { name: "Classic Matcha Mochi Ice Cream", category: "dessert", price: 160, ingredients: "Two sweet, chewy rice flour wrappers enveloping premium, bittersweet green tea ice cream." },
    { name: "Mango Mochi Ice Cream", category: "dessert", price: 150, ingredients: "Chewy mochi dough filled with vibrant, sweet tropical mango ice cream." },
    { name: "Japanese Souffle Pancakes", category: "dessert", price: 220, ingredients: "Two famously jiggly, ultra-fluffy pancakes served with a dollop of whipped cream and pure maple syrup." },
    { name: "Matcha Tiramisu", category: "dessert", price: 240, ingredients: "Layers of delicate ladyfingers soaked in green tea liqueur, sandwiched between rich, light matcha mascarpone cream." },
    { name: "Hojicha Roasted Tea Pudding", category: "dessert", price: 180, ingredients: "A silky, melt-in-your-mouth custard infused with smoky roasted green tea and topped with black sugar syrup." },
    { name: "Black Sesame Ice Cream", category: "dessert", price: 150, ingredients: "A rich, nutty, and savory-sweet artisanal ice cream made from deeply roasted black sesame paste." }
];

// =════════════════════════════════════════════════════════════════════════
// 3. CORE FRONTEND INITIALIZATION DOCK
// =════════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    initializeHeroSlider();
    setupNavbarScrollEffect();
    registerDOMEventHooks();
    bindRealtimeMenuListener();
    renderActiveCart();
});

// Automated Seamless Hero Crossfade Slider
function initializeHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    if (slides.length === 0) return;
    let index = 0;
    setInterval(() => {
        slides[index].classList.remove("active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("active");
    }, 5000);
}

// Transparent-to-Glass Navbar Blur Controller
function setupNavbarScrollEffect() {
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

// =════════════════════════════════════════════════════════════════════════
// 4. FIRESTORE DATABASE RUNTIME INTEGRATION
// =════════════════════════════════════════════════════════════════════════
function bindRealtimeMenuListener() {
    db.collection("menu").onSnapshot((snapshot) => {
        menuItems = [];
        snapshot.forEach((doc) => {
            menuItems.push({ id: doc.id, ...doc.data() });
        });
        
        // Show database initialization helper if zero entries exist
        const seedBanner = document.getElementById("seedBanner");
        if (menuItems.length === 0 && auth.currentUser) {
            if (seedBanner) seedBanner.style.display = "flex";
        } else {
            if (seedBanner) seedBanner.style.display = "none";
        }
        
        renderPublicMenuGrid();
        renderAdminControlList();
    }, (error) => {
        console.error("Firestore synchronisation failure:", error);
    });
}

// =════════════════════════════════════════════════════════════════════════
// 5. PUBLIC UI DISPLAY RENDERING
// =════════════════════════════════════════════════════════════════════════
function renderPublicMenuGrid() {
    const grid = document.getElementById("menuGrid");
    if (!grid) return;

    const filtered = menuItems.filter(item => 
        activePublicFilter === 'all' || item.category === activePublicFilter
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-menu-notice">Preparing fresh menu items. Please stand by...</div>`;
        document.getElementById("seeMoreMenu").style.display = "none";
        return;
    }

    const sliced = filtered.slice(0, itemsLimit);
    grid.innerHTML = sliced.map(item => `
        <div class="menu-item-card" onclick="openItemDetailModal('${item.id}')">
            <div class="card-glow"></div>
            <div class="menu-item-info">
                <span class="item-tag">${item.category.toUpperCase()}</span>
                <h3 class="item-name">${escapeHTML(item.name)}</h3>
                <p class="item-ingredients">${escapeHTML(item.ingredients)}</p>
                <div class="item-footer">
                    <span class="item-price">₹${item.price}</span>
                    <button class="card-add-btn" onclick="event.stopPropagation(); addDirectToCart('${item.id}')">
                        <i class="ph ph-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    const seeMoreBtn = document.getElementById("seeMoreMenu");
    if (filtered.length > itemsLimit) {
        seeMoreBtn.style.display = "inline-block";
    } else {
        seeMoreBtn.style.display = "none";
    }
}

// Item detail modal manager
window.openItemDetailModal = function(id) {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    selectedModalItem = item;

    document.getElementById("modalCat").innerText = item.category.toUpperCase();
    document.getElementById("modalTitle").innerText = item.name;
    document.getElementById("modalPrice").innerText = `₹${item.price}`;
    document.getElementById("modalIng").innerText = item.ingredients;
    
    document.getElementById("itemModal").classList.add("active");
};

// =════════════════════════════════════════════════════════════════════════
// 6. TRANSACTIONS & WHATSAPP CART ARCHITECTURE
// =════════════════════════════════════════════════════════════════════════
window.addDirectToCart = function(id) {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;
    executeCartInsertion(item);
};

document.getElementById("modalAddBtn").addEventListener("click", () => {
    if (selectedModalItem) {
        executeCartInsertion(selectedModalItem);
        document.getElementById("itemModal").classList.remove("active");
    }
});

function executeCartInsertion(item) {
    const target = cart.find(c => c.id === item.id);
    if (target) {
        target.quantity += 1;
    } else {
        cart.push({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 });
    }
    commitCartUpdate();
}

window.alterCartQty = function(id, delta) {
    const target = cart.find(c => c.id === id);
    if (!target) return;
    target.quantity += delta;
    if (target.quantity <= 0) {
        cart = cart.filter(c => c.id !== id);
    }
    commitCartUpdate();
};

function commitCartUpdate() {
    localStorage.setItem('tokyoTableCart', JSON.stringify(cart));
    renderActiveCart();
}

function renderActiveCart() {
    const container = document.getElementById("cart-items");
    const checkoutSubmit = document.getElementById("submit-order");
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="empty-cart-msg">Your table is waiting. Choose a masterpiece from the menu.</div>`;
        document.getElementById("total-amount").innerText = "₹0";
        if (checkoutSubmit) checkoutSubmit.disabled = true;
        return;
    }

    let computationTotal = 0;
    container.innerHTML = cart.map(item => {
        const rowCost = item.price * item.quantity;
        computationTotal += rowCost;
        return `
            <div class="cart-item-row">
                <div class="cart-item-details">
                    <h4>${escapeHTML(item.name)}</h4>
                    <span>₹${item.price} each</span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-adjust" onclick="alterCartQty('${item.id}', -1)"><i class="ph ph-minus"></i></button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-adjust" onclick="alterCartQty('${item.id}', 1)"><i class="ph ph-plus"></i></button>
                    <span class="item-row-total">₹${rowCost}</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById("total-amount").innerText = `₹${computationTotal}`;
    if (checkoutSubmit) checkoutSubmit.disabled = false;
}

// WhatsApp Order Formatting
document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const fullName = document.getElementById("cust-name").value.trim();
    const phoneNo = document.getElementById("cust-phone").value.trim();
    const fullAddress = document.getElementById("cust-address").value.trim();

    let textPayload = `*🔴 TOKYO TABLE - NEW ORDER* 🔴\n`;
    textPayload += `=========================\n`;
    textPayload += `*GUEST DETAILS*\n`;
    textPayload += `👤 Name: ${fullName}\n`;
    textPayload += `📞 Phone: ${phoneNo}\n`;
    textPayload += `📍 Address: ${fullAddress}\n`;
    textPayload += `=========================\n\n`;
    textPayload += `*ORDER SELECTIONS*\n`;

    let runningTotal = 0;
    cart.forEach((item, index) => {
        const itemCost = item.price * item.quantity;
        runningTotal += itemCost;
        textPayload += `${index + 1}. ${item.name} x ${item.quantity} [₹${itemCost}]\n`;
    });

    textPayload += `\n=========================\n`;
    textPayload += `💰 *TOTAL AMOUNT: ₹${runningTotal}*\n`;
    textPayload += `=========================\n`;
    textPayload += `_Sent automatically via Tokyo Table Web App Engine._`;

    const targetedWhatsAppGateway = `https://wa.me/917736696950?text=${encodeURIComponent(textPayload)}`;
    
    document.getElementById("order-success").style.display = "block";
    document.getElementById("checkout-form").reset();
    cart = [];
    commitCartUpdate();

    setTimeout(() => {
        window.open(targetedWhatsAppGateway, '_blank');
        document.getElementById("order-success").style.display = "none";
    }, 1500);
});

// =════════════════════════════════════════════════════════════════════════
// 7. SECURE ADMINISTRATIVE PRIVILEGES & AUTH CONSOLE
// =════════════════════════════════════════════════════════════════════════
auth.onAuthStateChanged((user) => {
    const navSignBtn = document.getElementById("navSignInBtn");
    const navAdminBtn = document.getElementById("navAdminBtn");
    const navUserEmail = document.getElementById("navUserEmail");
    const adminUserEmailDisplay = document.getElementById("adminUserEmailDisplay");

    if (user) {
        if (navSignBtn) navSignBtn.style.display = "none";
        if (navAdminBtn) {
            navAdminBtn.style.display = "flex";
            if (navUserEmail) navUserEmail.innerText = user.email.split('@')[0];
        }
        if (adminUserEmailDisplay) adminUserEmailDisplay.innerText = user.email;
    } else {
        if (navSignBtn) navSignBtn.style.display = "flex";
        if (navAdminBtn) navAdminBtn.style.display = "none";
        closeAdminControlDrawer();
    }
});

// Authentication submission workflow handles both logins and registration toggles
document.getElementById("emailAuthForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const errorLog = document.getElementById("authError");
    errorLog.innerText = "";

    if (authMode === 'login') {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => dismissAuthDialog())
            .catch(err => errorLog.innerText = err.message);
    } else {
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => dismissAuthDialog())
            .catch(err => errorLog.innerText = err.message);
    }
});

// Continue with Google Authentication Single Sign-On
document.getElementById("googleSignInBtn").addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => dismissAuthDialog())
        .catch(err => document.getElementById("authError").innerText = err.message);
});

document.getElementById("adminSignOut").addEventListener("click", () => {
    auth.signOut().then(() => closeAdminControlDrawer());
});

function dismissAuthDialog() {
    document.getElementById("authModal").classList.remove("active");
    document.getElementById("emailAuthForm").reset();
}

// =════════════════════════════════════════════════════════════════════════
// 8. BACKEND ADMINISTRATIVE PANEL OPERATIONS
// =════════════════════════════════════════════════════════════════════════
document.getElementById("adminAddForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const targetId = document.getElementById("editItemId").value;
    const packet = {
        name: document.getElementById("addName").value.trim(),
        category: document.getElementById("addCategory").value,
        price: Number(document.getElementById("addPrice").value),
        ingredients: document.getElementById("addIngredients").value.trim()
    };

    if (targetId) {
        db.collection("menu").doc(targetId).update(packet)
            .then(() => abortFormEditMode())
            .catch(err => alert("Operation error: " + err.message));
    } else {
        db.collection("menu").add(packet)
            .then(() => document.getElementById("adminAddForm").reset())
            .catch(err => alert("Operation error: " + err.message));
    }
});

function renderAdminControlList() {
    const container = document.getElementById("adminItemsList");
    if (!container) return;

    const filtered = menuItems.filter(item => 
        activeAdminFilter === 'all' || item.category === activeAdminFilter
    );

    document.getElementById("adminItemCount").innerText = filtered.length;

    if (filtered.length === 0) {
        container.innerHTML = `<p class="admin-empty">No workspace database entries found matching filter.</p>`;
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="admin-item-card">
            <div class="admin-item-details">
                <strong>${escapeHTML(item.name)}</strong>
                <span>₹${item.price} · ${item.category.toUpperCase()}</span>
            </div>
            <div class="admin-card-actions">
                <button onclick="triggerInlineEdit('${item.id}')" title="Edit Item" class="admin-action-edit"><i class="ph ph-pencil"></i></button>
                <button onclick="triggerDatabaseDeletion('${item.id}')" title="Delete Item" class="admin-action-delete"><i class="ph ph-trash"></i></button>
            </div>
        </div>
    `).join('');
}

window.triggerInlineEdit = function(id) {
    const item = menuItems.find(m => m.id === id);
    if (!item) return;

    document.getElementById("editItemId").value = item.id;
    document.getElementById("addName").value = item.name;
    document.getElementById("addCategory").value = item.category;
    document.getElementById("addPrice").value = item.price;
    document.getElementById("addIngredients").value = item.ingredients;

    document.getElementById("addFormTitle").innerHTML = `<i class="ph ph-pencil-line"></i> Editing Item`;
    document.getElementById("addSubmitBtn").innerText = "Update Masterpiece";
    document.getElementById("addCancelBtn").style.display = "inline-block";
};

window.triggerDatabaseDeletion = function(id) {
    if (confirm("Are you absolutely certain you wish to discard this item from the active menu?")) {
        db.collection("menu").doc(id).delete()
            .then(() => {
                if (document.getElementById("editItemId").value === id) {
                    abortFormEditMode();
                }
            });
    }
};

function abortFormEditMode() {
    document.getElementById("editItemId").value = "";
    document.getElementById("adminAddForm").reset();
    document.getElementById("addFormTitle").innerText = "Add New Item";
    document.getElementById("addSubmitBtn").innerText = "Add Item";
    document.getElementById("addCancelBtn").style.display = "none";
}

// 29-item Batch Initialization Hook
document.getElementById("seedMenuBtn").addEventListener("click", () => {
    const button = document.getElementById("seedMenuBtn");
    button.disabled = true;
    button.innerText = "Seeding Database...";
    
    const batch = db.batch();
    backupMasterpieces.forEach(item => {
        const uniqueReference = db.collection("menu").doc();
        batch.set(uniqueReference, item);
    });

    batch.commit()
        .then(() => {
            document.getElementById("seedBanner").style.display = "none";
        })
        .catch(err => {
            alert("Database initialisation failure: " + err.message);
            button.disabled = false;
            button.innerText = "Initialize Menu";
        });
});

// =════════════════════════════════════════════════════════════════════════
// 9. EVENT REGISTRATION INTERACTION HANDLERS
// =════════════════════════════════════════════════════════════════════════
function registerDOMEventHooks() {
    // Public category tabs
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            activePublicFilter = e.target.getAttribute("data-filter");
            itemsLimit = 6; // reset pagination view state
            renderPublicMenuGrid();
        });
    });

    // Admin panel filtering tabs
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".admin-tab-btn").forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            activeAdminFilter = e.target.getAttribute("data-filter");
            renderAdminControlList();
        });
    });

    // See More Pagination trigger
    document.getElementById("seeMoreMenu").addEventListener("click", () => {
        itemsLimit += 6;
        renderPublicMenuGrid();
    });

    // Auth Interface toggles
    document.getElementById("navSignInBtn").addEventListener("click", () => {
        document.getElementById("authModal").classList.add("active");
    });
    document.getElementById("authClose").addEventListener("click", () => {
        dismissAuthDialog();
    });
    document.getElementById("authToggleMode").addEventListener("click", () => {
        const formLabel = document.getElementById("authModeLabel");
        const submitBtn = document.getElementById("emailSubmitBtn");
        if (authMode === 'login') {
            authMode = 'signup';
            formLabel.innerText = "Already have an account? ";
            this.innerText = "Sign In";
            submitBtn.innerText = "Create Admin Account";
        } else {
            authMode = 'login';
            formLabel.innerText = "Don't have an account? ";
            this.innerText = "Create account";
            submitBtn.innerText = "Sign In";
        }
    });

    // Sidebar panel triggers
    document.getElementById("navAdminBtn").addEventListener("click", () => {
        document.getElementById("adminOverlay").classList.add("active");
        document.getElementById("adminPanel").classList.add("active");
    });
    const hideAdminPanel = () => {
        closeAdminControlDrawer();
    };
    document.getElementById("adminClose").addEventListener("click", hideAdminPanel);
    document.getElementById("adminOverlay").addEventListener("click", hideAdminPanel);
    document.getElementById("addCancelBtn").addEventListener("click", abortFormEditMode);
    document.getElementById("modalClose").addEventListener("click", () => {
        document.getElementById("itemModal").classList.remove("active");
    });

    // Mobile Navigation burger action layout links
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const navLinks = document.getElementById("navLinks");
    mobileBtn.addEventListener("click", () => {
        mobileBtn.classList.toggle("active");
        navLinks.classList.toggle("active");
    });
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            mobileBtn.classList.remove("active");
            navLinks.classList.remove("active");
        });
    });
}

function closeAdminControlDrawer() {
    document.getElementById("adminOverlay").classList.remove("active");
    const panel = document.getElementById("adminPanel");
    if (panel) panel.classList.remove("active");
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
