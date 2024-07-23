import { db, auth, doc, updateDoc } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const statusSelect = document.getElementById('availability-status');
    statusSelect.addEventListener('change', updateAvailability);
});

function updateAvailability() {
    const statusSelect = document.getElementById('availability-status');
    const status = statusSelect.value;
    
    updateDatabaseWithAvailability(status);
}

async function updateDatabaseWithAvailability(status) {
    if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
            await updateDoc(userRef, {
                availability: status
            });
        } catch (error) {
            console.error("Feil under oppdatering av status:", error);
        }
    } else {
        console.log("Ingen bruker logget inn.");
    }
}