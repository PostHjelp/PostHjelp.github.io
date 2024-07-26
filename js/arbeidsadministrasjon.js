import { db, addDoc, collection, getDocs } from './firebaseConfig.js'

// Funksjon for å sende varsling
async function sendNotification(title, body, tokens) {
    try {
      const response = await fetch('https://us-central1-posthjelp5068.cloudfunctions.net/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body, tokens })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Successfully sent message:', data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
}

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

            // Hent tokens fra databasen din
            const tokensSnapshot = await getDocs(collection(db, 'userTokens'));
            const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

            // Send varsel
            await sendNotification('Nytt arbeid!', `PiP ${pip} | ${postnummer} | ${workDate}`, tokens);
        }
        catch (error) {
            console.log(error);
        }
    });
});