import { auth, where, signInWithEmailAndPassword, collection, query, createUserWithEmailAndPassword, signOut, db, doc, getDocs, setDoc } from '../firebaseConfig.js';

// Logg inn bruker
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Bruker logget inn:", userCredential.user);
        window.location.href = '../../index.html'; // Eller annen dashboard side
    } catch (error) {
        console.error("Innloggingsfeil:", error);
        alert("Innloggingsfeil: " + error.message);
    }
}

// Registrer bruker med navn og tilgjenglighetsstatus
export async function registerUser(email, password, fullName, tlfNumber, jobID) {
    try {
        // Opprett en spørring for å finne dokumentet med riktig jobID
        const jobIDsRef = collection(db, "valid users");
        const q = query(jobIDsRef, where("ID", "==", jobID));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            alert("Job ID er ikke gyldig.");
            return;
        }

        let jobIDDoc = null;
        querySnapshot.forEach((doc) => {
            if (doc.data().available === true) {
                jobIDDoc = doc;
            }
        });

        if (!jobIDDoc) {
            alert("Job ID er allerede i bruk.");
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            fullName: fullName,
            ID: jobID,
            tlf_number: tlfNumber,
            availability: "Tilgjengelig", // Standard tilgjengelighetsstatus ved ny bruker
            role: "vikar" // Standard rolle ved ny bruker
        });

        // Oppdater jobb ID til utilgjengelig
        await setDoc(doc(db, "valid users", jobIDDoc.id), { available: false }, { merge: true });

        console.log("Bruker registrert og data lagret!");
        window.location.href = '/HTML/authentication/registrert_bruker.html'; // Omdirigerer etter vellykket registrering
    } catch (error) {
        console.error(error);
        handleRegistrationError(error);
    }
}

// Logg ut bruker
export function logoutUser() {
    signOut(auth).then(() => {
        console.log('Bruker logget ut');
        window.location.href = '/HTML/authentication/auth.html';
    }).catch((error) => {
        console.error('Feilmelding ', error);
    });
}

// Hjelpefunksjon
function handleRegistrationError(error) {
    let message = "Det oppstod en feil under registrering. Vennligst prøv igjen.";
    switch (error.code) {
        case 'auth/email-already-in-use':
            message = "E-postadressen er allerede i bruk. Vennligst bruk en annen e-postadresse.";
            break;
        case 'auth/invalid-email':
            message = "E-postadressen du oppga er ikke gyldig. Vennligst sjekk formatet og prøv igjen.";
            break;
        case 'auth/weak-password':
            message = "Passordet er for svakt. Vennligst bruk et passord som er minst 6 tegn langt.";
            break;
    }
    alert(message); // Viser en tilpasset feilmelding til brukeren
}