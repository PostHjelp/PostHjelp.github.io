import { db, addDoc, collection, getDocs } from './firebaseConfig.js';
import { fetchUserTokens } from './tokenHandling.js';

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
      const tokens = await fetchUserTokens();

      // Send varsel
      await sendNotification('Nytt innlegg publisert!', innleggContent, tokens);

      //window.location.href = "../index.html";
    } catch (error) {
      console.log(error);
    }
  });
});