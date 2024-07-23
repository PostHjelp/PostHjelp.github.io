import { db, addDoc, collection, getDocs } from './firebaseConfig.js';

// Funksjon for å sende varsling
async function sendNotification(title, body, tokens) {
    try {
        const response = await fetch('https://posthjelp.github.io/sendNotification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body, tokens })
        });

        console.log('Tokens: ', tokens);
        
        if (response.ok) {
            console.log('Notification sent successfully.');
        } else {
            console.error('Failed to send notification.');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();

    const form = document.getElementById('add-post-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const innleggContent = document.getElementById('postfield').value;
        const username = localStorage.getItem('fullName');

        try {
            const docRef = await addDoc(collection(db, "posts"), {
                content: innleggContent,
                username: username,
                date: now
            });

            // Hent tokens fra databasen din
            const tokensSnapshot = await getDocs(collection(db, 'userTokens'));
            const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

            // Send varsel
            await sendNotification('Nytt innlegg publisert!', innleggContent, tokens);

            //window.location.href = "../index.html";
        }
        catch (error) {
            console.log(error);
        }
    });
});