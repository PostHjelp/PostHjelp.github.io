import { db, messaging, getToken, onMessage, doc, setDoc, getDoc } from './firebaseConfig.js';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('firebase-messaging-sw.js')
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
      const currentToken = await getToken(messaging, { vapidKey: "BDxzmnzs0ebOgS3_dZeMkb4zWaSpOzgMHgrfJ8nJj3ucIpcDW5oTJZ3gBfY1oFb_QO-W4q40K05QnzrZpbQtHN0" });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Check if token is already in Firestore
        const tokenDoc = await getDoc(doc(db, 'userTokens', currentToken));
        if (!tokenDoc.exists()) {
          // Save the new token to Firestore
          await setDoc(doc(db, 'userTokens', currentToken), { token: currentToken });
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
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };
  new Notification(notificationTitle, notificationOptions);
});
