document.addEventListener("DOMContentLoaded", function () {
    // --- 1. STATO DELL'APPLICAZIONE (Carrello e Preferiti persistenti) ---
    const savedCart = localStorage.getItem("cart");
    const cart = savedCart ? JSON.parse(savedCart) : [];

    const savedFavoritesData = localStorage.getItem("favorites");
    const favorites = savedFavoritesData ? JSON.parse(savedFavoritesData) : [];

    let currentModalProductId = null;

    // --- 2. RIFERIMENTI DOM (Vanilla & jQuery) ---
    const productsContainer = document.getElementById("products");
    const $products = $(productsContainer); // Memorizzato in cache per evitare duplicazioni
    const cartContainer = document.getElementById("cart-items-container");
    const cartTotalAmount = document.getElementById("cart-total-amount");
    const btnCartCheckout = document.getElementById("btn-cart-checkout");

    // Filtri e ricerca
    const $searchForm = $("#search-form");
    const $searchInput = $("#search-input");
    const $categoryFilter = $("#category-filter");
    const $sortFilter = $("#sort-filter");
    const $favoritesToggle = $("#favorites-toggle");
    const btnResetFilters = document.getElementById("btn-reset-filters");

    // Modale Dettagli
    const modalInfo = document.getElementById("modal-info");
    const modalInfoTitle = document.getElementById("modal-info-title");
    const modalInfoImg = document.getElementById("modal-info-img");
    const modalInfoDesc = document.getElementById("modal-info-desc");
    const modalInfoPrice = document.getElementById("modal-info-price");
    const $modalInfoStock = $("#modal-info-stock");
    const $btnModalAdd = $("#btn-modal-add");
    const btnCloseInfo = document.getElementById("btn-close-info");

    // Modale Notifica Carrello
    const modalCart = document.getElementById("modal-cart");
    const $modalCartMsg = $("#modal-cart-msg");
    const btnCloseCart = document.getElementById("btn-close-cart");

    // ==========================================================================
    // 3. PERSISTENZA LOCALSTORAGE
    // ==========================================================================

    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    function saveFavorites() {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    // ==========================================================================
    // 4. GESTIONE CARRELLO
    // ==========================================================================

    function addToCart(productId) {
        const product = products.find(function (p) {
            return p.id === productId;
        });
        if (!product) return;

        const cartItem = cart.find(function (item) {
            return item.productId === productId;
        });

        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({
                productId: productId,
                quantity: 1
            });
        }

        saveCart();
        renderCart();

        const currentQty = cartItem ? cartItem.quantity : 1;
        $modalCartMsg.text('"' + product.name + '" e\' stato aggiunto al carrello (Quantità: ' + currentQty + ').');
        modalCart.showModal();
    }

    function removeFromCart(productId) {
        const itemIndex = cart.findIndex(function (item) {
            return item.productId === productId;
        });
        if (itemIndex !== -1) {
            cart.splice(itemIndex, 1);
            saveCart();
            renderCart();
        }
    }

    function changeQuantity(productId, amount) {
        const cartItem = cart.find(function (item) {
            return item.productId === productId;
        });
        if (!cartItem) return;

        cartItem.quantity += amount;

        if (cartItem.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }

    function renderCart() {
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = '<p class="cart-empty-msg">Il carrello e\' vuoto.</p>';
            cartTotalAmount.textContent = "0.00";
            btnCartCheckout.disabled = true;
            return;
        }

        let total = 0;

        cart.forEach(function (item) {
            const product = products.find(function (p) {
                return p.id === item.productId;
            });
            if (!product) return;

            const subtotal = product.price * item.quantity;
            total += subtotal;

            const row = document.createElement("div");
            row.className = "cart-row";
            row.innerHTML =
                '<div class="cart-row-header">' +
                '<span class="cart-row-title">' + product.name + '</span>' +
                '<button type="button" class="cart-row-remove" title="Rimuovi" data-id="' + item.productId + '">✕</button>' +
                '</div>' +
                '<div class="cart-row-meta">Prezzo: € ' + product.price.toFixed(2) + '</div>' +
                '<div class="cart-row-controls">' +
                '<div class="qty-stepper">' +
                '<button type="button" class="btn-qty-minus" data-id="' + item.productId + '">-</button>' +
                '<span>' + item.quantity + '</span>' +
                '<button type="button" class="btn-qty-plus" data-id="' + item.productId + '">+</button>' +
                '</div>' +
                '<span class="cart-row-subtotal">€ ' + subtotal.toFixed(2) + '</span>' +
                '</div>';

            cartContainer.appendChild(row);
        });

        cartTotalAmount.textContent = total.toFixed(2);
        btnCartCheckout.disabled = false;

        attachCartEvents();
    }

    function attachCartEvents() {
        cartContainer.querySelectorAll(".btn-qty-plus").forEach(function (btn) {
            btn.addEventListener("click", function () {
                changeQuantity(parseInt(btn.dataset.id, 10), 1);
            });
        });

        cartContainer.querySelectorAll(".btn-qty-minus").forEach(function (btn) {
            btn.addEventListener("click", function () {
                changeQuantity(parseInt(btn.dataset.id, 10), -1);
            });
        });

        cartContainer.querySelectorAll(".cart-row-remove").forEach(function (btn) {
            btn.addEventListener("click", function () {
                removeFromCart(parseInt(btn.dataset.id, 10));
            });
        });
    }

    // ==========================================================================
    // 5. GESTIONE PREFERITI
    // ==========================================================================

    function toggleFavorite(productId) {
        const index = favorites.indexOf(productId);
        if (index === -1) {
            favorites.push(productId);
        } else {
            favorites.splice(index, 1);
        }
        saveFavorites();
        filterProducts();
    }

    // ==========================================================================
    // 6. CATALOGO, RICERCA, FILTRI E MODALE INFO
    // ==========================================================================

    function renderProducts(items) {
        productsContainer.innerHTML = "";

        if (!items || items.length === 0) {
            productsContainer.innerHTML =
                '<div class="no-results">' +
                '<h4>Nessun prodotto trovato</h4>' +
                '<p>Nessun articolo corrisponde ai filtri impostati.</p>' +
                '</div>';
            return;
        }

        let productsHtml = "";
        items.forEach(function (item) {
            const isFav = favorites.includes(item.id);
            const favClass = isFav ? "btn-fav is-favorite" : "btn-fav";
            const favText = isFav ? "❤ Nei Preferiti" : "♡ Preferito";

            productsHtml += '<article class="product-card" data-id="' + item.id + '">' +
                '<img src="' + item.image + '" alt="' + item.name + '" class="clickable-detail">' +
                '<h4 class="clickable-detail">' + item.name + '</h4>' +
                '<p class="desc">' + item.description + '</p>' +
                '<p class="price">€ ' + item.price.toFixed(2) + '</p>' +
                '<p class="stock"><small>Disponibilità: ' + item.stock + ' pz | Cat: ' + item.category + '</small></p>' +
                '<div class="card-actions">' +
                '<button type="button" class="' + favClass + '">' + favText + '</button>' +
                '<button type="button" class="btn-add">Aggiungi al carrello</button>' +
                '</div>' +
                '</article>';
        });

        productsContainer.innerHTML = productsHtml;
        attachProductCardEvents();
    }

    function filterProducts() {
        const searchTerm = $searchInput.val().trim().toLowerCase();
        const selectedCategory = $categoryFilter.val();
        const onlyFavorites = $favoritesToggle.is(":checked");
        const sortCriteria = $sortFilter.val();

        let result = products.filter(function (product) {
            const matchesName = product.name.toLowerCase().indexOf(searchTerm) !== -1;
            const matchesCategory = (selectedCategory === "all") || (product.category.toLowerCase() === selectedCategory.toLowerCase());
            const matchesFav = !onlyFavorites || favorites.includes(product.id);

            return matchesName && matchesCategory && matchesFav;
        });

        if (sortCriteria === "price-asc") {
            result.sort(function (a, b) { return a.price - b.price; });
        } else if (sortCriteria === "price-desc") {
            result.sort(function (a, b) { return b.price - a.price; });
        } else if (sortCriteria === "name-asc") {
            result.sort(function (a, b) { return a.name.localeCompare(b.name); });
        }

        renderProducts(result);
    }

    function resetFilters() {
        $searchInput.val("");
        $categoryFilter.val("all");
        $sortFilter.val("default");
        $favoritesToggle.prop("checked", false);
        filterProducts();
    }

    function showProductInfo(product) {
        if (!product) return;
        currentModalProductId = product.id;
        modalInfoTitle.textContent = product.name;
        modalInfoImg.src = product.image;
        modalInfoDesc.textContent = product.description;
        modalInfoPrice.textContent = "€ " + product.price.toFixed(2);
        $modalInfoStock.text(product.stock);
        modalInfo.showModal();
    }

    function attachProductCardEvents() {
        // Clic su Titolo o Immagine per dettagli
        $products.find(".clickable-detail").on("click", function () {
            const card = $(this).closest(".product-card");
            const productId = parseInt(card.data("id"), 10);
            const product = products.find(p => p.id === productId);
            showProductInfo(product);
        });

        // Tasto Preferiti
        $products.find(".btn-fav").on("click", function () {
            const card = $(this).closest(".product-card");
            const productId = parseInt(card.data("id"), 10);
            toggleFavorite(productId);
        });

        // Aggiungi al carrello da card
        $products.find(".btn-add").on("click", function () {
            const card = $(this).closest(".product-card");
            const productId = parseInt(card.data("id"), 10);
            addToCart(productId);
        });
    }

    // ==========================================================================
    // 7. ASSEGNAZIONE EVENTI E LISTENERS
    // ==========================================================================

    // Ricerca e filtri
    $searchInput.on("input", filterProducts);
    $searchForm.on("submit", function (e) {
        e.preventDefault();
        filterProducts();
    });
    $categoryFilter.on("change", filterProducts);
    $sortFilter.on("change", filterProducts);
    $favoritesToggle.on("change", filterProducts);
    btnResetFilters.addEventListener("click", resetFilters);

    // Azioni Modale Info
    $btnModalAdd.on("click", function () {
        if (currentModalProductId !== null) {
            addToCart(currentModalProductId);
            modalInfo.close();
        }
    });

    btnCloseInfo.addEventListener("click", function () {
        modalInfo.close();
    });

    // Chiusura al clic esterno su modalInfo (backdrop)
    modalInfo.addEventListener("click", function (event) {
        const rect = modalInfo.getBoundingClientRect();
        const isInDialog = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
            modalInfo.close();
        }
    });

    // Azioni Modale Cart
    btnCloseCart.addEventListener("click", function () {
        modalCart.close();
    });

    // ==========================================================================
    // 8. AVVIO APPLICAZIONE
    // ==========================================================================
    filterProducts(); // usa filterProducts() al posto di renderProducts(products) così applica fin da subito eventuali checkbox o select preimpostate
    renderCart();
});