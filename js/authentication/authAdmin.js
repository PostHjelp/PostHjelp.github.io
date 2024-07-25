import { db, doc, getDoc, auth, onAuthStateChanged } from '../firebaseConfig.js';

// Autentiseringsstatus sjekk
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    localStorage.removeItem('user');
    localStorage.removeItem('fullName');
    localStorage.removeItem('workDates');
    localStorage.removeItem('availability');
    localStorage.removeItem('role');
    window.location.href = '/html/authentication/auth.html'; // Omdirigerer til innlogging hvis ikke innlogget
  } else {
    if (localStorage.getItem('role') === 'admin') {
        // Fortsett som normalt hvis brukeren er admin
        hideSpinner();
        document.getElementById('admin-only-form').style.display = "grid";
        // Legg til eventuelle admin-spesifikke logikker her
      } else {
        window.location.href = '/index.html';
    }
  }
});

function hideSpinner() {
  document.querySelector('.spinner-container').style.display = 'none';
}