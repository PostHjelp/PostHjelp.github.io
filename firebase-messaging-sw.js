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

// Function to check if the message ID has already been processed
function isDuplicateMessage(messageId) {
  // Retrieve stored message IDs from local storage
  let processedIds = JSON.parse(localStorage.getItem('processedMessageIds')) || [];
  if (processedIds.includes(messageId)) {
    return true; // Duplicate found
  }

  // Store the new message ID
  processedIds.push(messageId);
  localStorage.setItem('processedMessageIds', JSON.stringify(processedIds));

  return false;
}

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Check if the message ID is already processed
  const messageId = payload.messageId || payload.data.messageId;
  if (isDuplicateMessage(messageId)) {
    console.log('Duplicate message, skipping notification.');
    return; // Skip duplicate notification
  }

  // Show notification
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/media/idfMm1ADA9_1717842206506.svg',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});