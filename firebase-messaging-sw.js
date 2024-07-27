importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyD-mUuXP2mLqXxGA8DU5U9FWYwKING9I00",
    authDomain: "posthjelp5068.firebaseapp.com",
    projectId: "posthjelp5068",
    storageBucket: "posthjelp5068.appspot.com",
    messagingSenderId: "990560594554",
    appId: "1:990560594554:web:ae0f1c33e1642daf8669c3",
    measurementId: "G-MF3W2QC9LJ"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Push event listener for handling notifications
self.addEventListener('push', function(event) {
  const data = event.data.json();
  console.log('[firebase-messaging-sw.js] Push received.', data);

  const notificationTitle = data.title || 'Default Title';
  const notificationOptions = {
    body: data.body || 'Default body text',
    icon: '/media/idfMm1ADA9_1717842206506.svg',
  };

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/media/idfMm1ADA9_1717842206506.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});