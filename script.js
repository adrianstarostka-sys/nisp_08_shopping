// --- BAZA DANYCH (Przykładowe produkty) ---
const products = [
    { id: 1, name: "Laptop Pro", price: 4500.00 },
    { id: 2, name: "Smartfon X", price: 2999.99 },
    { id: 3, name: "Słuchawki Bezprzewodowe", price: 499.00 },
    { id: 4, name: "Zegarek Smart", price: 850.00 }
];

// --- FUNKCJE POMOCNICZE (Wspólne) ---
function getCart() {
    return JSON.parse(localStorage.getItem('shoppingCart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => el.textContent = count);
}

// ==========================================
// ZADANIA STUDENTA A
// ==========================================

// 1. Logika JS odpowiedzialna za wyświetlanie produktów
function renderProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return; // Zabezpieczenie, gdy elementu nie ma na danej podstronie

    productList.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.price.toFixed(2)} PLN</p>
            <button class="btn btn-primary" style="margin-top: 15px;" onclick="addToCart(${product.id})">Dodaj do koszyka</button>
        `;
        productList.appendChild(div);
    });
}

// 2. Logika JS odpowiedzialna za zapisywanie wybranych do localStorage
window.addToCart = function(id) {
    const cart = getCart();
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    
    // Opcjonalne odświeżenie widoku koszyka (dla widoku SPA)
    renderCart(); 
};

// 3. Logika JS podsumowania i czyszczenia koszyka (Zamówienie)
function renderCheckout() {
    const orderDetails = document.getElementById('order-details');
    if (!orderDetails) return;

    const cart = getCart();
    if (cart.length === 0) {
        orderDetails.innerHTML = '<p class="empty-msg">Brak produktów do zamówienia.</p>';
        return;
    }

    let html = '<ul style="list-style: none; padding: 0;">';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <li style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                <span>${item.name} (x${item.quantity})</span>
                <strong>${itemTotal.toFixed(2)} PLN</strong>
            </li>`;
    });
    html += '</ul>';
    html += `<h3 style="text-align: right; margin-top: 20px;">Suma do zapłaty: ${total.toFixed(2)} PLN</h3>`;
    
    orderDetails.innerHTML = html;
}

function confirmOrder() {
    if(getCart().length === 0) {
        alert('Koszyk jest pusty!');
        return;
    }
    
    // Czyszczenie koszyka w localStorage
    localStorage.removeItem('shoppingCart');
    updateCartCount();
    
    alert('Dziękujemy za złożenie zamówienia!');
    
    // Powrót do strony głównej / widoku produktów
    if(document.querySelector('.view.hidden')) {
        showView('products'); // Dla wersji SPA
    } else {
        window.location.href = 'index.html'; // Dla wersji z wieloma plikami HTML
    }
}


// ==========================================
// ZADANIA STUDENTA B
// ==========================================

// 1. Logika JS odpowiedzialna za odczyt z localStorage i wyświetlanie w koszyku
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('total-price');
    if (!cartItemsContainer || !totalPriceEl) return;

    const cart = getCart();
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Twój koszyk jest pusty. Czas na zakupy!</p>';
        totalPriceEl.textContent = '0.00 PLN';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal; // Wyliczanie sumy całkowitej do zapłaty
        
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '15px 0';
        div.style.borderBottom = '1px solid #eee';

        div.innerHTML = `
            <div>
                <strong style="font-size: 1.1rem;">${item.name}</strong> 
                <span style="color: var(--secondary);">x${item.quantity}</span>
                <div style="font-size: 0.9rem; color: var(--secondary);">${item.price.toFixed(2)} PLN / szt.</div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <strong>${itemTotal.toFixed(2)} PLN</strong>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="removeFromCart(${item.id})">Usuń</button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    // 2. Wyliczanie i aktualizacja sumy całkowitej do zapłaty
    totalPriceEl.textContent = `${total.toFixed(2)} PLN`;
}

// 3. Możliwość usuwania produktów z koszyka
window.removeFromCart = function(id) {
    let cart = getCart();
    // Usuwamy produkt po ID i zapisujemy nową tablicę do localStorage
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    
    // Aktualizacja widoków po usunięciu
    renderCart();
    renderCheckout();
}


// ==========================================
// OBSŁUGA NAWIGACJI (Dla wariantu SPA z index.html)
// ==========================================
function showView(targetId) {
    // Ukryj wszystkie widoki
    document.querySelectorAll('.view').forEach(view => view.classList.add('hidden'));
    
    // Pokaż docelowy widok
    const targetView = document.getElementById(targetId);
    if (targetView) targetView.classList.remove('hidden');

    // Aktualizuj klasy 'active' w nawigacji
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-target') === targetId) {
            link.classList.add('active');
        }
    });

    // Odśwież dane przed pokazaniem
    if (targetId === 'cart') renderCart();
    if (targetId === 'checkout') renderCheckout();
}

function setupNavigation() {
    // Nawigacja SPA
    document.querySelectorAll('[data-target]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Zapobiegaj przeładowaniu tylko jeśli href="#" (dla wersji SPA)
            if(link.getAttribute('href') === '#') {
                e.preventDefault();
                showView(link.getAttribute('data-target'));
            }
        });
    });

    // Podpięcie przycisku "Przejdź do podsumowania" dla SPA
    const goToCheckoutBtn = document.getElementById('go-to-checkout');
    if (goToCheckoutBtn && goToCheckoutBtn.tagName === 'BUTTON') {
        goToCheckoutBtn.addEventListener('click', () => showView('checkout'));
    }

    // Podpięcie przycisku potwierdzenia zamówienia
    const confirmBtn = document.getElementById('confirm-order');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmOrder);
    }
}

// ==========================================
// INICJALIZACJA APLIKACJI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderProducts();
    renderCart();
    renderCheckout();
    setupNavigation();
});