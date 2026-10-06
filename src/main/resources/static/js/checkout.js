document.addEventListener("DOMContentLoaded", () => {
    const paymentRadios = document.querySelectorAll('input[name="pagamento"]');
    const cardDetailsBox = document.getElementById("card-details-box");
    const cardInputs = cardDetailsBox.querySelectorAll("input");

    function togglePaymentFields() {
        // Troviamo il radio button attualmente selezionato
        const selectedPayment = document.querySelector('input[name="pagamento"]:checked').value;

        if (selectedPayment === "carta") {
            // Mostra la sezione carta e rende i campi obbligatori
            cardDetailsBox.style.display = "block";
            cardInputs.forEach(input => input.required = true);
        } else {
            // Nasconde la sezione carta e toglie l'obbligatorietà
            cardDetailsBox.style.display = "none";
            cardInputs.forEach(input => {
                input.required = false;
                input.value = ""; // Pulisce i campi se l'utente cambia idea
            });
        }
    }

    // Ascolto del cambio opzione sui radio button
    paymentRadios.forEach(radio => {
        radio.addEventListener("change", togglePaymentFields);
    });

    // Eseguiamo al caricamento per allineare lo stato iniziale
    togglePaymentFields();
});