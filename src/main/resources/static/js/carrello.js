document.addEventListener("DOMContentLoaded", () => {
    const cartItems = document.querySelectorAll(".cart-item");
    const totalItemsSpan = document.getElementById("total-items");
    const cartTotalSpan = document.getElementById("cart-total");

    function updateCart() {
        let totalQty = 0;
        let grandTotal = 0.0;

        cartItems.forEach((item) => {
            // Prezzo unitario letto dal dataset
            const unitPrice = parseFloat(item.dataset.price);

            // Quantità inserita nell'input
            const qtyInput = item.querySelector(".item-qty");
            let qty = parseInt(qtyInput.value, 10);

            // Controllo di sicurezza: se vuoto o < 1, forziamo almeno 1
            if (isNaN(qty) || qty < 1) {
                qty = 1;
                qtyInput.value = 1;
            }

            // Calcolo subtotale riga
            const subtotal = unitPrice * qty;
            const subtotalSpan = item.querySelector(".subtotal-val");
            subtotalSpan.textContent = subtotal.toFixed(2);

            // Aggiornamento totali complessivi
            totalQty += qty;
            grandTotal += subtotal;
        });

        // Scrittura dei valori nella sidebar destra
        totalItemsSpan.textContent = totalQty;
        cartTotalSpan.textContent = grandTotal.toFixed(2);
    }

    // Ascolto dell'evento 'input' su ogni casella di quantità
    cartItems.forEach((item) => {
        const qtyInput = item.querySelector(".item-qty");
        qtyInput.addEventListener("input", updateCart);
    });

    // Eseguiamo il ricalcolo una prima volta al caricamento
    updateCart();
});