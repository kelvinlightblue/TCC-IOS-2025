// Menu mobile
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // Fecha o menu mobile quando o usuário clica fora dele
    document.addEventListener('click', function (e) {
        const mobileIcon = document.querySelector('.mobile-menu-icon');
        const mobileMenuEl = document.querySelector('.mobile-menu');
        if (!mobileMenuEl || !mobileIcon) return;

        const isOpen = mobileMenuEl.classList.contains('open') || mobileMenuEl.classList.contains('active');
        if (!isOpen) return;

        // se o clique não ocorreu dentro do menu nem no ícone, fecha
        if (!mobileMenuEl.contains(e.target) && !mobileIcon.contains(e.target)) {
            mobileMenuEl.classList.remove('open');
            mobileMenuEl.classList.remove('active');
            navLinks.classList.remove('active');
            const iconImg = document.querySelector('.mobile-menu-icon .icon') || document.querySelector('.icon');
            if (iconImg) iconImg.src = 'assets/icon/menu_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg';
        }
    });

    // Filtro do cardápio
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove a classe active de todos os botões
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Adiciona a classe active ao botão clicado
            this.classList.add('active');

            const category = this.getAttribute('data-category');

            // Filtra os itens do menu
            menuItems.forEach(item => {
                if (category === 'todos' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // O tratamento do formulário de reserva foi movido para a página específica
    // `reserva.html` onde existe um script que mostra confirmação visível.
    // Evita conflito de múltiplos handlers para o mesmo formulário.

    // Animação de scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Fecha o menu mobile se estiver aberto
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    mobileMenu.classList.remove('active');
                }
            }
        });
    });

    // Adiciona classe de destaque ao item do menu ativo durante a rolagem
    window.addEventListener('scroll', function () {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');

        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Adiciona data mínima para o campo de data (hoje)
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Efeito de parallax no header
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('header');

        if (header) {
            header.style.transform = `translateY(${scrolled * 0.065}px)`;
        }
    });

    /* ====== Carousel automático e controles ====== */
    const track = document.querySelector('.carousel-track');
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (track) {
        const items = Array.from(track.children);
        let currentIndex = 0;

        // cria dots
        items.forEach((_, i) => {
            const btn = document.createElement('button');
            if (i === 0) btn.classList.add('active');
            btn.addEventListener('click', () => {
                goToSlide(i);
            });
            dotsContainer.appendChild(btn);
        });

        function updateTrack() {
            const firstItem = items[0];
            const itemWidth = firstItem.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
            track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
            const dots = Array.from(dotsContainer.children);
            dots.forEach(d => d.classList.remove('active'));
            if (dots[currentIndex]) dots[currentIndex].classList.add('active');
        }

        function goToSlide(index) {
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;
            currentIndex = index;
            updateTrack();
        }

        if (nextButton) nextButton.addEventListener('click', () => goToSlide(currentIndex + 1));
        if (prevButton) prevButton.addEventListener('click', () => goToSlide(currentIndex - 1));

        // autoplay
        let autoplay = setInterval(() => goToSlide(currentIndex + 1), 3500);

        // Pause on hover
        track.addEventListener('mouseenter', () => clearInterval(autoplay));
        track.addEventListener('mouseleave', () => { autoplay = setInterval(() => goToSlide(currentIndex + 1), 3500); });

        // Atualiza o track no resize
        window.addEventListener('resize', updateTrack);

        // Inicializa
        setTimeout(updateTrack, 100);
    }

    /* ====== Painel de ação ao clicar no card (Adicionar ao cardápio / ao carrinho) ====== */
    let myMenu = JSON.parse(localStorage.getItem('myMenu') || '[]');

    function saveMyMenu() {
        localStorage.setItem('myMenu', JSON.stringify(myMenu));
    }

    function addToMyMenu(item) {
        if (myMenu.some(i => i.title === item.title)) return false;
        myMenu.push(item);
        saveMyMenu();
        return true;
    }

    function closeOpenPanels() {
        document.querySelectorAll('.action-panel').forEach(p => p.remove());
    }

    // Evento delegado: abre painel ao clicar no card; trata cliques nos botões do painel
    document.addEventListener('click', function (e) {
        // clique em botão do painel
        const panelBtn = e.target.closest('.action-panel button');
        if (panelBtn) {
            const itemEl = panelBtn.closest('.menu-item') || panelBtn.closest('.carousel-item');
            if (!itemEl) return;

            const title = itemEl.querySelector('h3') ? itemEl.querySelector('h3').textContent.trim() : 'Prato';
            const desc = itemEl.querySelector('p') ? itemEl.querySelector('p').textContent.trim() : '';
            const price = itemEl.querySelector('.price') ? parsePrice(itemEl.querySelector('.price').textContent) : 0;
            const img = itemEl.querySelector('img') ? itemEl.querySelector('img').getAttribute('src') : '';
            const category = itemEl.getAttribute('data-category') || '';

            if (panelBtn.classList.contains('add-to-menu-panel')) {
                const added = addToMyMenu({ title, desc, price, img, category });
                panelBtn.textContent = added ? 'Adicionado' : 'Já no cardápio';
                setTimeout(() => closeOpenPanels(), 800);
                return;
            }

            if (panelBtn.classList.contains('add-to-cart-panel')) {
                addToCartItem({ title, desc, price, img, category });
                panelBtn.textContent = 'No carrinho';
                setTimeout(() => closeOpenPanels(), 600);
                return;
            }
            return;
        }

        // clique em card (abre/fecha painel)
        const item = e.target.closest('.menu-item') || e.target.closest('.carousel-item');
        if (!item) {
            closeOpenPanels();
            return;
        }

        // se clicou dentro do painel atual, não faz nada (já tratado)
        if (e.target.closest('.action-panel')) return;

        const existing = item.querySelector('.action-panel');
        if (existing) {
            existing.remove();
            return;
        }

        // Fecha quaisquer painéis abertos. Painel de ação removido para não exibir botões ao clicar nos cards.
        closeOpenPanels();
    });

    /* ====== Carrinho (localStorage) ====== */
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const el = document.querySelector('.cart-count');
        const totalQty = cart.reduce((s, it) => s + (it.qty || 0), 0);
        if (el) el.textContent = totalQty;
    }

    function parsePrice(text) {
        if (!text) return 0;
        // remove currency and spaces, convert comma to dot
        const num = text.replace(/[R$\s]/g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
        return parseFloat(num) || 0;
    }

    function addToCartItem(item) {
        const existing = cart.find(i => i.title === item.title && i.price === item.price);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            cart.push(Object.assign({ qty: 1 }, item));
        }
        saveCart();
    }

    // small UI helpers: toast and cart button pop
    function showToast(message) {
        const t = document.createElement('div');
        t.className = 'toast';
        t.textContent = message;
        document.body.appendChild(t);
        // force reflow
        void t.offsetWidth;
        t.classList.add('show');
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => t.remove(), 300);
        }, 1600);
    }

    function popCartButton() {
        const cb = document.querySelector('.cart-button');
        if (!cb) return;
        cb.classList.add('pop');
        setTimeout(() => cb.classList.remove('pop'), 600);
    }

    // bind clicks on visible "Adicionar ao carrinho" buttons (delegated)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;
        e.stopPropagation();
        const itemEl = btn.closest('.menu-item') || btn.closest('.carousel-item');
        if (!itemEl) return;
        const title = itemEl.querySelector('h3') ? itemEl.querySelector('h3').textContent.trim() : 'Prato';
        const desc = itemEl.querySelector('p') ? itemEl.querySelector('p').textContent.trim() : '';
        const price = itemEl.querySelector('.price') ? parsePrice(itemEl.querySelector('.price').textContent) : 0;
        const img = itemEl.querySelector('img') ? itemEl.querySelector('img').getAttribute('src') : '';
        const category = itemEl.getAttribute('data-category') || '';
        addToCartItem({ title, desc, price, img, category });
        updateCartCount();
        showToast('Adicionado ao carrinho');
        popCartButton();
        // feedback no botão
        const prevText = btn.textContent;
        btn.textContent = 'No carrinho';
        setTimeout(() => { btn.textContent = prevText; }, 900);
    });

    // floating cart button
    const cartButton = document.createElement('a');
    cartButton.className = 'cart-button';
    cartButton.href = 'carrinho.html';
    cartButton.innerHTML = `Carrinho (<span class="cart-count">0</span>)`;
    document.body.appendChild(cartButton);
    updateCartCount();

    // evento para adicionar ao carrinho: agora tratado pelo painel de ação
});


function menuShow() {
    let menuMobile = document.querySelector('.mobile-menu');
    if (menuMobile.classList.contains('open')) {
        menuMobile.classList.remove('open');
        document.querySelector('.icon').src = "assets/icon/menu_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
    } else {
        menuMobile.classList.add('open');
        document.querySelector('.icon').src = "assets/icon/close_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
    }
}