document.addEventListener("DOMContentLoaded", () => {
    // Riferimenti modale "Maggiori informazioni"
    const modalInfo = document.getElementById("modal-info");
    const modalInfoTitle = document.getElementById("modal-info-title");
    const modalInfoImg = document.getElementById("modal-info-img");
    const modalInfoDesc = document.getElementById("modal-info-desc");
    const modalInfoPrice = document.getElementById("modal-info-price");
    const btnCloseInfo = document.getElementById("btn-close-info");

    // Riferimenti modale "Aggiunto al carrello"
    const modalCart = document.getElementById("modal-cart");
    const modalCartMsg = document.getElementById("modal-cart-msg");
    const btnCloseCart = document.getElementById("btn-close-cart");

    // Click su "Maggiori informazioni"
    document.querySelectorAll(".btn-info").forEach((button) => {
        button.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");

            modalInfoTitle.textContent = card.dataset.title;
            modalInfoImg.src = card.dataset.img;
            modalInfoDesc.textContent = card.dataset.desc;
            modalInfoPrice.textContent = "€ " + card.dataset.price;

            modalInfo.showModal();
        });
    });

    // Chiusura modale info
    btnCloseInfo.addEventListener("click", () => {
        modalInfo.close();
    });

    // Click su "Aggiungi al carrello"
    document.querySelectorAll(".btn-add").forEach((button) => {
        button.addEventListener("click", (e) => {
            const card = e.target.closest(".product-card");
            modalCartMsg.textContent = `"${card.dataset.title}" è stato aggiunto al carrello con successo.`;
            modalCart.showModal();
        });
    });

    // Chiusura modale carrello
    btnCloseCart.addEventListener("click", () => {
        modalCart.close();
    });
});