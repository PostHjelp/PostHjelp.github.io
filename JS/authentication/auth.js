import { auth, onAuthStateChanged } from '../firebaseConfig.js';

// Autentiseringsstatus sjekk
onAuthStateChanged(auth, user => {
  if (!user) {
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
    localStorage.removeItem('workDates');
    localStorage.removeItem('availability');
    localStorage.removeItem('role');
    window.location.href = '/html/authentication/auth.html'; // Omdirigerer til innlogging hvis ikke innlogget
  }
});