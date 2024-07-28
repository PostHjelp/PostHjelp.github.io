import { db, messaging, getToken, onMessage, doc, updateDoc, getDoc } from './firebaseConfig.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
  .then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((err) => {
    console.log('Service Worker registration failed:', err);
  });
}

async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      const newToken = await getToken(messaging, { vapidKey: "BDxzmnzs0ebOgS3_dZeMkb4zWaSpOzgMHgrfJ8nJj3ucIpcDW5oTJZ3gBfY1oFb_QO-W4q40K05QnzrZpbQtHN0" });
      if (newToken) {
        console.log('FCM Token:', newToken);

        const userId = localStorage.getItem('user');
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const existingToken = userData.token;

          if (existingToken !== newToken) {
            // Oppdaterer brukerdokumentet med det nye tokenet
            await updateDoc(userDocRef, { token: newToken });
            alert('Varslinger nå aktivert');
          } else {
            alert('Varslinger er allerede aktivert');
          }
        } else {
          // Hvis brukerdokumentet ikke eksisterer, håndter det her
          console.log('User document does not exist.');
        }
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('An error occurred while requesting notification permission:', error);
  }
}

// Example: Call this function on a button click
document.getElementById('notify-button').addEventListener('click', requestPermission);

onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon
  };
  new Notification(notificationTitle, notificationOptions);
});
