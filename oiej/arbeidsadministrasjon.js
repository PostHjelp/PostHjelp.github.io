import { db, addDoc, collection } from './firebaseConfig.js'

document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Måneder er fra 0-11, så legg til 1
    const year = today.getFullYear();
    const dateStr = `${year}-${month}-${day}`;

    document.getElementById('workDate').setAttribute('min', dateStr);

    const form = document.getElementById('add-work-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const pip = document.getElementById('PiP').value;
        const workDate = document.getElementById('workDate').value;
        const baskets = document.getElementById('Baskets').value;
        let postnummer = document.getElementById('Postnummer').value;

        if (postnummer == "") {
            postnummer = "Hele ruten";
        }

        const confirmationContainer = document.getElementById('confirmation-container');
        const confirmationMessages = document.getElementById('confirmation-messages');

        try {
            const docRef = await addDoc(collection(db, "work"), {
                pip: pip,
                postal_code: postnummer,
                date: workDate,
                baskets: baskets,
                available: true
            });

            confirmationContainer.style.display = "grid";
            confirmationMessages.innerHTML += `
                <div class="confirmation-messages-element">
                    <div class="confirmation-messages-element-title">PiP ${pip}</div>
                    <div>${postnummer}</div>
                </div>
            `;
        }
        catch (error) {
            console.log(error);
        }
    });
});