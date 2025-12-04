// cart.js - renderiza o carrinho a partir do localStorage

function formatPriceBR(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    // atualiza contador na página de origem se existir
    try { window.opener && window.opener.updateCartCount && window.opener.updateCartCount(); } catch(e){}
}

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    if (!cart.length) {
        container.innerHTML = '<p>Seu carrinho está vazio. Volte ao <a href="index.html">cardápio</a> para adicionar pratos.</p>';
        updateSummary();
        return;
    }

    cart.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <img src="${item.img || ''}" alt="${item.title}">
            <div class="cart-item-details">
                <strong>${item.title}</strong>
                <div>${item.desc || ''}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" data-action="decrease" data-index="${idx}">-</button>
                    <span class="qty">${item.qty}</span>
                    <button class="qty-btn" data-action="increase" data-index="${idx}">+</button>
                    <span style="margin-left:12px">${formatPriceBR(item.price)}</span>
                    <button class="remove-btn" data-action="remove" data-index="${idx}">Remover</button>
                </div>
            </div>
        `;
        container.appendChild(itemEl);
    });

    // listeners para controles
    container.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            const action = this.getAttribute('data-action');
            const cart = getCart();
            if (action === 'increase') cart[idx].qty = (cart[idx].qty || 1) + 1;
            if (action === 'decrease') cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
            saveCart(cart);
            renderCart();
        });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const idx = parseInt(this.getAttribute('data-index'));
            const cart = getCart();
            cart.splice(idx, 1);
            saveCart(cart);
            renderCart();
        });
    });

    updateSummary();
}

function updateSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
    const fee = 0; // sem taxa por enquanto
    const total = subtotal + fee;
    document.getElementById('subtotal').textContent = formatPriceBR(subtotal);
    document.getElementById('fee').textContent = formatPriceBR(fee);
    document.getElementById('total').textContent = formatPriceBR(total);
}

function renderPaymentFields() {
    const cont = document.getElementById('payment-details');
    const selected = document.querySelector('input[name="payment"]:checked').value;
    cont.innerHTML = '';

    if (selected === 'pix') {
        cont.innerHTML = `
            <p>Chave PIX: <strong>pix@cozinhadehistorias.com</strong></p>
            <label>Nome do pagador (opcional)</label>
            <input class="payment-input" id="payer-name" placeholder="Nome no comprovante">
        `;
    } else {
        cont.innerHTML = `
            <label>Número do cartão</label>
            <input class="payment-input" id="card-number" placeholder="0000 0000 0000 0000">
            <label>Nome no cartão</label>
            <input class="payment-input" id="card-name" placeholder="Nome impresso no cartão">
            <label>Validade</label>
            <input class="payment-input" id="card-exp" placeholder="MM/AA">
            <label>CVV</label>
            <input class="payment-input" id="card-cvv" placeholder="123">
            <label>Endereço</label>
            <input class="payment-input" id="card-end" placeholder="Endereço">
        `;
    }
}

// Finalizar compra (simulação)
function finalizePurchase() {
    const cart = getCart();
    if (!cart.length) { alert('Carrinho vazio.'); return; }

    const payment = document.querySelector('input[name="payment"]:checked').value;
    if (!payment) { alert('Selecione uma forma de pagamento.'); return; }

    if (payment === 'card') {
        const number = document.getElementById('card-number').value || '';
        const name = document.getElementById('card-name').value || '';
        const exp = document.getElementById('card-exp').value || '';
        const cvv = document.getElementById('card-cvv').value || '';
        if (number.length < 12 || !name || !exp || cvv.length < 3) {
            alert('Preencha os dados do cartão corretamente (este é um formulário de teste).');
            return;
        }
    }

    // Simula processamento
    const orderId = 'PED-' + Date.now();
    const conf = document.getElementById('confirmation');
    conf.innerHTML = `
        <div class="order-confirmation" role="status" aria-live="polite">
            <svg class="check" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
            </svg>
            <div class="order-text"><strong>Compra concluída!</strong><br>Pedido <strong>${orderId}</strong>. Obrigado pela preferência.</div>
        </div>
    `;
    // remove a confirmação depois de um tempo (mostra animação curta)
    setTimeout(() => { conf.innerHTML = ''; }, 3400);

    // limpa carrinho
    saveCart([]);
    // atualiza view
    setTimeout(() => { renderCart(); }, 800);

    // Após exibir confirmação, voltar para a página inicial
    // setTimeout(() => { window.location.href = 'index.html'; }, 3000);
}

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    renderCart();
    document.querySelectorAll('input[name="payment"]').forEach(r => r.addEventListener('change', renderPaymentFields));
    renderPaymentFields();
    document.getElementById('finalize-btn').addEventListener('click', finalizePurchase);
});
