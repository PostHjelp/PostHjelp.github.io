import {auth, db, onSnapshot, doc, onAuthStateChanged, updateDoc} from './firebaseConfig.js';
import { updateUI } from './cacheHandling.js';

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        onSnapshot(userRef, async (doc) => {
            if (doc.exists()) {
                const userId = doc.id;
                const userData = doc.data();
                const workDates = userData.workDates;
                
                let isWorking = false;
                if (Array.isArray(workDates)) {
                    const validWorkDates = filterValidWorkDates(userData.workDates);

                    // Oppdaterer databasen til å "fjerne" gamle datoer ved å endre hele dokumentet til det nye.
                    if (validWorkDates.length !== workDates.length) {
                        await updateDoc(userRef, { workDates: validWorkDates });
                    }

                    workDates.forEach(workDate => {
                        const date = new Date(workDate);
                        const today = new Date();
            
                        date.setHours(0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
            
                        if (date.getTime() === today.getTime()){
                            isWorking = true;
                        }
                    });
                }
                
                // Oppdatering av alle relevante data i localStorage
                localStorage.setItem('user', userId);
                localStorage.setItem('fullName', userData.fullName);
                localStorage.setItem('role', userData.role);
                localStorage.setItem('workDates', JSON.stringify(userData.workDates)); // Konverter array til string for lagring
                if (isWorking) {
                    localStorage.setItem('availability', 'Jobber');
                } else {
                    localStorage.setItem('availability', userData.availability);
                }

                // Oppdatering av brukergrensesnittet
                updateUI(localStorage.getItem('fullName'), localStorage.getItem('availability'), localStorage.getItem('role'));
            } else {
                console.log("Ingen brukerdata funnet.");
            }
        }, error => {
            console.error("Feil ved abonnement på brukerdata:", error);
        });
    } else {
        console.log("Ingen bruker logget inn.");
    }
});

function filterValidWorkDates(workDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Nullstill tid for å kun sammenligne dato

    return workDates.filter(workDate => {
        const date = new Date(workDate);
        date.setHours(0, 0, 0, 0);
        return date >= today;
    });
}