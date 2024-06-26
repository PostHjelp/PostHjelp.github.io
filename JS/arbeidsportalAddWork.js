import { db, updateDoc, doc, setDoc, arrayUnion } from './firebaseConfig.js';

export async function updateAvailabilityAndWorkDate(userId, userName, workId, workDate) {
    const userRef = doc(db, "users", userId);
    const workRef = doc(db, "work", workId);

    // Oppdater brukerens arbeidsdato
    await updateDoc(userRef, { workDates: arrayUnion(workDate) }, { merge: true });

    // Oppdater tilgjengelighetsstatusen for arbeidet
    await updateDoc(workRef, { available: false, user: userName, userId: userId });
}