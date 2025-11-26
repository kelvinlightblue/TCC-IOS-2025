function formatPriceBR(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function getMyMenu() {
    return JSON.parse(localStorage.getItem('myMenu') || '[]');
}

function saveMyMenu(menu) {
    localStorage.setItem('myMenu', JSON.stringify(menu));
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderMyMenu() {
    const items = getMyMenu();
    const container = document.getElementById('mymenu-items');
    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = '<p>Seu cardápio está vazio. Adicione pratos na seção de destaques ou no cardápio.</p>';
        return;
    }

    items.forEach((item, idx) => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <img src="${item.img || ''}" alt="${item.title}">
            <div class="cart-item-details">
                <strong>${item.title}</strong>
                <div>${item.desc || ''}</div>
                <div class="cart-item-controls">
                    <button class="btn" data-action="addToCart" data-idx="${idx}">Adicionar ao carrinho</button>
                    <button class="btn" data-action="remove" data-idx="${idx}">Remover</button>
                </div>
            </div>
        `;
        container.appendChild(el);
    });

    container.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-idx'));
            const action = this.getAttribute('data-action');
            const menu = getMyMenu();
            if (action === 'remove') {
                menu.splice(idx, 1);
                saveMyMenu(menu);
                renderMyMenu();
            }
            if (action === 'addToCart') {
                const cart = getCart();
                const item = menu[idx];
                if (item) {
                    const existing = cart.find(i => i.title === item.title && i.price === item.price);
                    if (existing) existing.qty = (existing.qty || 1) + 1;
                    else cart.push(Object.assign({ qty: 1 }, item));
                    saveCart(cart);
                    // feedback rápido
                    this.textContent = 'Adicionado';
                    setTimeout(() => { this.textContent = 'Adicionar ao carrinho'; }, 800);
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    renderMyMenu();
});