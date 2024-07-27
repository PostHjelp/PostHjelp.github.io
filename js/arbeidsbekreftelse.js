import { db, doc, updateDoc, arrayUnion, collection, getDocs, query, orderBy } from './firebaseConfig.js';

async function fetchAndDisplayCandidates() {
    const candidateContainer = document.getElementById('candidate-list');
    const workCollection = collection(db, "work");
    let groupedCandidates = {};

    try {
        const q = query(workCollection, orderBy('date', 'asc'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.candidates) {
                data.candidates.forEach(candidate => {
                    if (!groupedCandidates[data.pip]) {
                        groupedCandidates[data.pip] = {
                            pip: data.pip,
                            postcode: data.postal_code,
                            date: data.date,
                            candidates: []
                        };
                    }
                    groupedCandidates[data.pip].candidates.push({
                        userId: candidate.userId,
                        userName: candidate.userName,
                        time: candidate.time,
                        workId: doc.id,
                        workDate: data.date
                    });
                });
            }
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }

    candidateContainer.innerHTML = '';

    // Iterer over grupperte kandidater for å generere HTML-struktur
    for (const pip in groupedCandidates) {
        if (groupedCandidates.hasOwnProperty(pip)) {
            const workData = groupedCandidates[pip];
            const date = new Date(workData.date);
            const dateString = getDateString(date);
            
            const workElement = document.createElement('div');
            workElement.classList.add('work');
            workElement.innerHTML = `
                <h3>PiP ${workData.pip}</h3>
                <p>${workData.postcode}</p>
                <p>${dateString}</p>
            `;

            workData.candidates.forEach(candidate => {
                const candidateElement = document.createElement('div');
                candidateElement.classList.add('candidate');
                candidateElement.innerHTML = `
                    <p>Navn: ${candidate.userName}</p>
                    <p>Klokkeslett: ${candidate.time}</p>
                    <button class="select-button">Velg</button>
                `;

                const selectButton = candidateElement.querySelector('.select-button');
                selectButton.addEventListener('click', () => selectCandidate(candidate.workId, candidate.userId, candidate.userName, candidate.workDate, candidate.time));

                workElement.appendChild(candidateElement);
            });

            candidateContainer.appendChild(workElement);
        }
    }
}

async function selectCandidate(workId, userId, userName, workDate, time) {
    try {
        const workRef = doc(db, "work", workId);
        const userRef = doc(db, "users", userId);

        // Oppdater brukerens arbeidsdato
        await updateDoc(userRef, { workDates: arrayUnion(workDate) }, { merge: true });

        // Oppdater tilgjengelighetsstatusen for arbeidet
        await updateDoc(workRef, { 
            available: false, 
            user: userName, 
            userId: userId,
            time: time,
            candidates: [] // Fjern kandidater da en er valgt
        });

        // Oppdater visningen etter å ha valgt en kandidat
        fetchAndDisplayCandidates();
    } catch (error) {
        console.error("Error selecting candidate: ", error);
    }
}

function getDateString(date) {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Normaliser datoene for å ignorere tidskomponenten
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const normalizedTomorrow = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    let dateString = "";
    if (normalizedDate.getTime() === normalizedToday.getTime()) {
        dateString = "I dag";
    } else if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
        dateString = "I morgen";
    } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        dateString = day + "." + month;
    }
    return dateString;
}

// Kall funksjonen for å vise kandidatene når nødvendig
fetchAndDisplayCandidates();