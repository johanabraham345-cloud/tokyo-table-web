// app.js - Tokyo Table with Firebase menu admin

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const ADMIN_EMAILS = ["johanabraham345@gmail.com", "tokyotable50@gmail.com"];
const WHATSAPP_NUMBER = "917736696950";

const defaultMenu = [
    { id: "1", name: "Chicken Udon (Traditional)", category: "udon", price: 230, ingredients: "Hand-pulled udon, slow-simmered chicken broth, tender chicken slices, scallions, soy essence.", image: "" },
    { id: "2", name: "Beef Udon (Traditional)", category: "udon", price: 250, ingredients: "Thick udon noodles, rich beef broth, thinly sliced beef, delicate Japanese seasoning.", image: "" },
    { id: "3", name: "Vegetable Udon (Traditional)", category: "udon", price: 180, ingredients: "Clear umami vegetable broth, seasonal greens, mushrooms, soft tofu, hand-pulled udon.", image: "" },
    { id: "4", name: "Tomato Sauce Udon", category: "udon", price: 210, ingredients: "Udon noodles tossed in a rich, tangy Japanese-style tomato reduction with fresh basil.", image: "" },
    { id: "5", name: "Stir-fried Chicken Udon", category: "udon", price: 210, ingredients: "Wok-tossed udon with chicken breast chunks, cabbage, carrots, savory soy glaze.", image: "" },
    { id: "6", name: "Stir-fried Beef Udon", category: "udon", price: 240, ingredients: "Wok-tossed udon, savory beef strips, crisp vegetables, dark rich soy reduction.", image: "" },
    { id: "7", name: "Stir-fried Veg Udon", category: "udon", price: 170, ingredients: "Wok-tossed udon, crunchy vegetables, bean sprouts, house vegetarian sauce.", image: "" },
    { id: "8", name: "Karaage", category: "sides", price: 230, ingredients: "Crispy Japanese fried chicken marinated in soy, sake, ginger. Served with citrus mayonnaise.", image: "" },
    { id: "9", name: "Dynamite Tokyo Chicken", category: "sides", price: 250, ingredients: "Spicy crispy chicken coated in our signature creamy dynamite sauce.", image: "" },
    { id: "10", name: "Soy Glazed Beef", category: "sides", price: 210, ingredients: "Thinly sliced beef simmered in a sweet and savory soy, mirin, and sugar glaze.", image: "" },
    { id: "11", name: "Chicken Katsu", category: "sides", price: 210, ingredients: "Breaded, deep-fried golden chicken cutlet with tangy tonkatsu sauce.", image: "" },
    { id: "12", name: "Kakiage (Veg Tempura)", category: "sides", price: 45, ingredients: "Crispy lacy fritter of julienned vegetables in light tempura batter.", image: "" },
    { id: "13", name: "Clear Chicken Soup", category: "sides", price: 150, ingredients: "Comforting clear broth with mild seasonings and scallions.", image: "" },
    { id: "14", name: "Clear Beef Soup", category: "sides", price: 170, ingredients: "Robust clear soup infused with beef essence.", image: "" },
    { id: "15", name: "Sesame Salad", category: "sides", price: 70, ingredients: "Crisp mixed greens with light Japanese sesame dressing.", image: "" },
    { id: "16", name: "Tsukemono (Pickles)", category: "sides", price: 60, ingredients: "Traditional lightly pickled vegetables, crisp and refreshing.", image: "" },
    { id: "17", name: "Pour Over Black Coffee", category: "drinks", price: 80, ingredients: "Premium brewed black coffee from carefully sourced beans.", image: "" },
    { id: "18", name: "Ceremonial Matcha Latte", category: "drinks", price: 140, ingredients: "High-grade Uji matcha whisked with steamed milk.", image: "" },
    { id: "19", name: "Spiced Chai", category: "drinks", price: 25, ingredients: "Classic Indian spiced tea blended with milk.", image: "" },
    { id: "20", name: "Matcha Frappe", category: "drinks", price: 150, ingredients: "Chilled blend of premium matcha, milk, and sweet cream.", image: "" },
    { id: "21", name: "Iced Black Coffee", category: "drinks", price: 80, ingredients: "Refreshing chilled black coffee.", image: "" },
    { id: "22", name: "Iced Milk Coffee", category: "drinks", price: 80, ingredients: "Smooth iced coffee blended with cold milk.", image: "" },
    { id: "23", name: "Iced Milk Tea", category: "drinks", price: 70, ingredients: "Chilled brewed tea mixed with cold milk.", image: "" },
    { id: "24", name: "Classic Cold Coffee", category: "drinks", price: 120, ingredients: "Creamy blended cold coffee.", image: "" },
    { id: "25", name: "Chocolate Monster", category: "drinks", price: 130, ingredients: "Decadent chocolate cold beverage topped with cocoa dust.", image: "" },
    { id: "26", name: "Strawberry Monster", category: "drinks", price: 130, ingredients: "Vibrant strawberry cold beverage blended with fresh cream.", image: "" },
    { id: "27", name: "Shippu Mocktail", category: "drinks", price: 100, ingredients: "Signature refreshing citrus-based mocktail.", image: "" },
    { id: "28", name: "Tokyo Mocktail", category: "drinks", price: 80, ingredients: "House special fruit-infused mocktail.", image: "" },
    { id: "29", name: "Japanese Purin", category: "dessert", price: 80, ingredients: "Silky smooth custard pudding topped with dark caramel syrup.", image: "" }
];

const categoryLabels = {
    udon: "Udon",
    sides: "Sides",
    drinks: "Beverage",
    dessert: "Dessert"
};

const categoryMarks = {
    udon: "麺",
    sides: "皿",
    drinks: "茶",
    dessert: "甘"
};

let auth;
let db;
let provider;
let currentUser = null;
let menuData = [...defaultMenu];
let cart = [];
let activeFilter = "all";
let visibleMenuCount = 12;

const app = initializeApp(firebaseConfig);
auth = getAuth(app);
db = getFirestore(app);
provider = new GoogleAuthProvider();

function $(selector) {
    return document.querySelector(selector);
}

function isAdmin(user = currentUser) {
    return !!user?.email && ADMIN_EMAILS.includes(user.email.trim().toLowerCase());
}

function asMenuItem(firebaseId, data) {
    return {
        firebaseId,
        id: data.id || firebaseId,
        name: data.name || "",
        category: data.category || "udon",
        price: Number(data.price) || 0,
        ingredients: data.ingredients || data.desc || "",
        image: data.image || data.photo || "",
        sort: Number(data.sort) || 0
    };
}

function getLoginErrorMessage(error) {
    const messages = {
        "auth/invalid-email": "Enter a valid email address.",
        "auth/missing-password": "Enter your password.",
        "auth/invalid-credential": "That email or password is incorrect.",
        "auth/user-not-found": "No account exists for that email yet.",
        "auth/wrong-password": "That password is incorrect.",
        "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
        "auth/operation-not-allowed": "Email/password login is not enabled in Firebase Authentication."
    };

    return messages[error?.code] || error?.message || "Login failed. Please try again.";
}

function readCoverImageFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            reject(new Error("Please choose an image file."));
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read the selected image."));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("Could not process the selected image."));
            image.onload = () => {
                const maxSize = 900;
                const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                const width = Math.max(1, Math.round(image.width * scale));
                const height = Math.max(1, Math.round(image.height * scale));
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.78));
            };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
}

async function loadMenu() {
    try {
        const menuQuery = query(collection(db, "menu"), orderBy("sort"));
        const snapshot = await getDocs(menuQuery);

        if (snapshot.empty) {
            await seedDefaultMenu();
            menuData = defaultMenu.map((item, index) => asMenuItem(item.id, { ...item, sort: index + 1 }));
        } else {
            menuData = snapshot.docs.map((menuDoc) => asMenuItem(menuDoc.id, menuDoc.data()));
        }
    } catch (error) {
        console.warn("Using static menu because Firebase menu could not load.", error);
        menuData = defaultMenu.map((item, index) => asMenuItem(item.id, { ...item, sort: index + 1 }));
    }

    renderMenu();
}

async function seedDefaultMenu() {
    await Promise.all(defaultMenu.map((item, index) => {
        return setDoc(doc(db, "menu", item.id), {
            ...item,
            sort: index + 1
        });
    }));
}

function initNavbar() {
    const navbar = $("#navbar");
    const mobileMenuBtn = $("#mobileMenuBtn");
    const navLinks = $("#navLinks");

    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 50);
    });

    mobileMenuBtn?.addEventListener("click", () => {
        navLinks?.classList.toggle("open");
    });

    navLinks?.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
}

function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;

    if (!slides.length) return;

    setInterval(() => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }, 5000);
}

function initReveal() {
    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach((el) => revealObserver.observe(el));
}

function renderMenu(filter = activeFilter) {
    const menuGrid = $("#menuGrid");
    const seeMoreBtn = $("#seeMoreMenu");
    if (!menuGrid) return;

    activeFilter = filter;
    menuGrid.innerHTML = "";

    const filteredData = filter === "all"
        ? menuData
        : menuData.filter((item) => item.category === filter);

    filteredData.slice(0, visibleMenuCount).forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "menu-item";
        card.dataset.jp = categoryMarks[item.category] || "食";
        card.style.animationDelay = `${index * 0.05}s`;

        const imageMarkup = item.image
            ? `<img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.name)}" class="menu-item-photo">`
            : "";

        const adminMarkup = isAdmin()
            ? `<div class="admin-card-actions">
                    <button class="admin-icon-btn edit-item-btn" type="button" data-id="${escapeAttr(item.firebaseId)}" aria-label="Edit ${escapeAttr(item.name)}"><i class="ph ph-pencil-simple"></i></button>
                    <button class="admin-icon-btn delete-item-btn" type="button" data-id="${escapeAttr(item.firebaseId)}" aria-label="Delete ${escapeAttr(item.name)}"><i class="ph ph-trash"></i></button>
               </div>`
            : "";

        card.innerHTML = `
            ${adminMarkup}
            ${imageMarkup}
            <span class="item-cat">${categoryLabels[item.category] || "Menu"}</span>
            <h4 class="item-name">${escapeHtml(item.name)}</h4>
            <span class="item-price">₹${item.price}</span>
        `;

        card.addEventListener("click", (event) => {
            if (event.target.closest(".edit-item-btn")) {
                openMenuForm(item);
                return;
            }
            if (event.target.closest(".delete-item-btn")) {
                deleteMenuItem(item);
                return;
            }
            openItemModal(item);
        });

        menuGrid.appendChild(card);
    });

    if (seeMoreBtn) {
        const remaining = filteredData.length - visibleMenuCount;
        seeMoreBtn.style.display = remaining > 0 ? "inline-flex" : "none";
        seeMoreBtn.textContent = remaining > 12 ? "See More" : `See ${remaining} More`;
    }
}

function initMenuFilters() {
    const filterBtns = document.querySelectorAll(".tab-btn");
    const seeMoreBtn = $("#seeMoreMenu");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((button) => button.classList.remove("active"));
            btn.classList.add("active");
            visibleMenuCount = 12;
            renderMenu(btn.dataset.filter);
        });
    });

    seeMoreBtn?.addEventListener("click", () => {
        visibleMenuCount += 12;
        renderMenu(activeFilter);
    });
}

function updateAuthUI() {
    const adminCatalogActions = $("#adminCatalogActions");
    const ownerLoginOpen = $("#ownerLoginOpen");
    const ownerLoginForm = $("#ownerLoginForm");
    const ownerLogout = $("#ownerLogout");
    const loginStatus = $("#loginStatus");

    const admin = isAdmin();
    if (adminCatalogActions) adminCatalogActions.style.display = admin ? "block" : "none";
    if (ownerLoginOpen) ownerLoginOpen.textContent = currentUser ? (admin ? "Admin" : "Account") : "Login";

    if (loginStatus) {
        loginStatus.innerHTML = currentUser
            ? `${admin ? "Admin access" : "Signed in"}: <b>${escapeHtml(currentUser.email)}</b>`
            : "Sign in with Google or email.";
    }

    if (ownerLoginForm) ownerLoginForm.style.display = currentUser ? "none" : "block";
    if (ownerLogout) ownerLogout.style.display = currentUser ? "block" : "none";

    renderMenu();
}

function initAuth() {
    const ownerModal = $("#ownerModal");
    const ownerLoginOpen = $("#ownerLoginOpen");
    const ownerModalClose = $("#ownerModalClose");
    const googleLoginBtn = $("#googleLoginBtn");
    const ownerLoginForm = $("#ownerLoginForm");
    const ownerLogout = $("#ownerLogout");

    ownerLoginOpen?.addEventListener("click", () => {
        ownerModal.style.display = "block";
        updateAuthUI();
    });

    ownerModalClose?.addEventListener("click", () => {
        ownerModal.style.display = "none";
    });

    googleLoginBtn?.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            showLoginMessage(error.message, true);
        }
    });

    ownerLoginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = $("#ownerEmailInput").value.trim();
        const password = $("#ownerPasswordInput").value;
        const emailLoginBtn = $("#emailLoginBtn");

        try {
            if (emailLoginBtn) {
                emailLoginBtn.disabled = true;
                emailLoginBtn.textContent = "Signing in...";
            }
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (["auth/user-not-found", "auth/invalid-credential"].includes(error.code)) {
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                    return;
                } catch (createError) {
                    showLoginMessage(createError.code === "auth/email-already-in-use" ? getLoginErrorMessage(error) : getLoginErrorMessage(createError), true);
                    return;
                }
            }
            showLoginMessage(getLoginErrorMessage(error), true);
        } finally {
            if (emailLoginBtn) {
                emailLoginBtn.disabled = false;
                emailLoginBtn.textContent = "Login with Email";
            }
        }
    });

    ownerLogout?.addEventListener("click", async () => {
        await signOut(auth);
    });

    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateAuthUI();
    });
}

function showLoginMessage(message, isError = false) {
    const loginStatus = $("#loginStatus");
    if (!loginStatus) return;
    loginStatus.textContent = message;
    loginStatus.classList.toggle("error-text", isError);
}

function initAdminForms() {
    const addMenuOpen = $("#addMenuOpen");
    const addMenuClose = $("#addMenuClose");
    const menuForm = $("#menuForm");
    const addMenuModal = $("#addMenuModal");
    const menuFormImageFile = $("#menuFormImageFile");
    const menuImagePreview = $("#menuImagePreview");

    addMenuOpen?.addEventListener("click", () => openMenuForm());
    addMenuClose?.addEventListener("click", () => {
        addMenuModal.style.display = "none";
    });

    menuFormImageFile?.addEventListener("change", () => {
        const file = menuFormImageFile.files?.[0];
        if (!menuImagePreview) return;

        if (!file) {
            menuImagePreview.removeAttribute("src");
            menuImagePreview.style.display = "none";
            return;
        }

        menuImagePreview.src = URL.createObjectURL(file);
        menuImagePreview.style.display = "block";
    });

    menuForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!isAdmin()) return;

        const firebaseId = $("#menuFormId").value.trim();
        try {
            const selectedImageFile = $("#menuFormImageFile")?.files?.[0];
            const savedImage = $("#menuFormImage").value.trim();
            const image = selectedImageFile ? await readCoverImageFile(selectedImageFile) : savedImage;
            const itemData = {
                name: $("#menuFormName").value.trim(),
                image,
                category: $("#menuFormCategory").value,
                price: Number($("#menuFormPrice").value),
                ingredients: $("#menuFormIngredients").value.trim(),
                sort: firebaseId ? (menuData.find((item) => item.firebaseId === firebaseId)?.sort || 999) : Date.now()
            };

            if (firebaseId) {
                await updateDoc(doc(db, "menu", firebaseId), itemData);
            } else {
                await addDoc(collection(db, "menu"), itemData);
            }
            addMenuModal.style.display = "none";
            await loadMenu();
        } catch (error) {
            alert(`Menu save failed: ${error.message}`);
        }
    });
}

function openMenuForm(item = null) {
    if (!isAdmin()) return;

    $("#menuFormTitle").textContent = item ? "Edit Menu Item" : "Add Menu Item";
    $("#menuFormId").value = item?.firebaseId || "";
    $("#menuFormName").value = item?.name || "";
    $("#menuFormImage").value = item?.image || "";
    if ($("#menuFormImageFile")) $("#menuFormImageFile").value = "";
    if ($("#menuImagePreview")) {
        $("#menuImagePreview").src = item?.image || "";
        $("#menuImagePreview").style.display = item?.image ? "block" : "none";
    }
    $("#menuFormCategory").value = item?.category || "udon";
    $("#menuFormPrice").value = item?.price || "";
    $("#menuFormIngredients").value = item?.ingredients || "";
    $("#addMenuModal").style.display = "block";
}

async function deleteMenuItem(item) {
    if (!isAdmin()) return;
    if (!confirm(`Delete ${item.name}?`)) return;

    try {
        await deleteDoc(doc(db, "menu", item.firebaseId));
        menuData = menuData.filter((menuItem) => menuItem.firebaseId !== item.firebaseId);
        renderMenu();
    } catch (error) {
        alert(`Delete failed: ${error.message}`);
    }
}

function initItemModal() {
    const modal = $("#itemModal");
    const modalClose = $("#modalClose");
    const modalAddBtn = $("#modalAddBtn");

    modalClose?.addEventListener("click", closeItemModal);
    modalAddBtn?.addEventListener("click", () => {
        const item = modalAddBtn._currentItem;
        if (!item) return;
        addToCart(item);
        closeItemModal();
        $("#order")?.scrollIntoView({ behavior: "smooth" });
    });

    window.addEventListener("click", (event) => {
        if (event.target === $("#itemModal")) closeItemModal();
        if (event.target === $("#ownerModal")) $("#ownerModal").style.display = "none";
        if (event.target === $("#addMenuModal")) $("#addMenuModal").style.display = "none";
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        closeItemModal();
        if ($("#ownerModal")) $("#ownerModal").style.display = "none";
        if ($("#addMenuModal")) $("#addMenuModal").style.display = "none";
    });
}

function openItemModal(item) {
    const modal = $("#itemModal");
    const imageColumn = modal.querySelector(".modal-image-col");

    $("#modalCat").textContent = categoryLabels[item.category] || "Menu";
    $("#modalTitle").textContent = item.name;
    $("#modalPrice").textContent = `₹${item.price}`;
    $("#modalIng").textContent = item.ingredients;
    $("#modalAddBtn")._currentItem = item;

    if (item.image) {
        imageColumn.style.backgroundImage = `linear-gradient(rgba(9,16,25,0.2), rgba(9,16,25,0.2)), url("${item.image}")`;
        imageColumn.style.backgroundSize = "cover";
        imageColumn.style.backgroundPosition = "center";
        imageColumn.innerHTML = "";
    } else {
        imageColumn.style.backgroundImage = "";
        imageColumn.innerHTML = '<span class="modal-jp">いただきます</span><i class="ph ph-bowl-food"></i><p>Prepared fresh to order</p>';
    }

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeItemModal() {
    const modal = $("#itemModal");
    if (!modal) return;
    modal.style.display = "none";
    document.body.style.overflow = "";
    if ($("#modalAddBtn")) $("#modalAddBtn")._currentItem = null;
}

function addToCart(item) {
    const existing = cart.find((cartItem) => cartItem.firebaseId === item.firebaseId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    updateCartUI();
}

window.removeFromCart = function removeFromCart(firebaseId) {
    cart = cart.filter((cartItem) => cartItem.firebaseId !== firebaseId);
    updateCartUI();
};

function updateCartUI() {
    const cartContainer = $("#cart-items");
    const cartTotalContainer = $("#cart-total");
    const totalAmountEl = $("#total-amount");
    const submitOrderBtn = $("#submit-order");

    if (!cart.length) {
        cartContainer.innerHTML = '<div class="empty-cart-msg">Your table is waiting. Choose a masterpiece from the menu.</div>';
        cartTotalContainer.style.display = "none";
        submitOrderBtn.disabled = true;
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${escapeHtml(item.name)}</h4>
                    <span>Qty: ${item.quantity}</span>
                </div>
                <div class="cart-item-actions">
                    <span class="cart-item-price">₹${itemTotal}</span>
                    <button class="cart-item-remove" onclick="removeFromCart('${escapeAttr(item.firebaseId)}')" aria-label="Remove ${escapeAttr(item.name)}"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `;
    }).join("");

    totalAmountEl.textContent = `₹${total}`;
    cartTotalContainer.style.display = "flex";
    submitOrderBtn.disabled = false;
}

function initCheckout() {
    const checkoutForm = $("#checkout-form");
    const submitOrderBtn = $("#submit-order");
    const orderSuccessMsg = $("#order-success");

    checkoutForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!cart.length) return;

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppOrderMessage())}`;
        window.open(whatsappUrl, "_blank");

        submitOrderBtn.innerHTML = '<i class="ph ph-whatsapp-logo"></i> Sent to WhatsApp';
        orderSuccessMsg.classList.add("active");

        setTimeout(() => {
            orderSuccessMsg.classList.remove("active");
            submitOrderBtn.innerHTML = '<i class="ph ph-whatsapp-logo"></i> Send on WhatsApp';
        }, 3500);
    });
}

function buildWhatsAppOrderMessage() {
    const name = $("#cust-name").value.trim();
    const phone = $("#cust-phone").value.trim();
    const address = $("#cust-address").value.trim();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const lines = cart.map((item) => `- ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`).join("\n");

    return `Hello Tokyo Table, I would like to place an order.\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nOrder:\n${lines}\n\nTotal: ₹${total}`;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    }[char]));
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
}

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initHeroSlider();
    initReveal();
    initMenuFilters();
    initAuth();
    initAdminForms();
    initItemModal();
    initCheckout();
    updateCartUI();
    renderMenu();
    loadMenu();
});
