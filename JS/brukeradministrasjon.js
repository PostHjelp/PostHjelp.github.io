import { db, getDocs, collection, deleteDoc, doc, addDoc, query, where } from './firebaseConfig.js';

// Hent form og input-feltet
const form = document.getElementById('add-worker-form');
const workerInput = document.getElementById('worker-input');

// Legg til event listener for å håndtere form submit
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Forhindre standard form submit

    const workerNumber = workerInput.value.trim(); // Hent og trim inputverdien

    try {
        // Sjekk om workerID allerede eksisterer
        const querySnapshot = await getDocs(query(collection(db, 'valid users'), where('ID', '==', workerNumber)));
        
        if (!querySnapshot.empty) {
            alert('Ansattnummeret eksisterer allerede.');
            return;
        }

        // Legg til et nytt dokument i 'valid users' samlingen
        await addDoc(collection(db, 'valid users'), {
            ID: workerNumber,
            available: true // Sett standard verdi for tilgjengelighet
        });
        
        fetchAndDraw();
        form.reset(); // Nullstill skjemaet
    } catch (error) {
        console.error('Feil ved lagring av ansattnummer: ', error);
        alert('Feil ved lagring av ansattnummer.');
    }
});

async function fetchAndDraw() {
    showSpinner();
    await fetchVikars();
    await fetchValidUsers();
    hideSpinnerAndShowContent();
}

async function fetchVikars() {
    const vikarsRef = collection(db, "users");
    //const vikarQuery = query(vikarsRef, where("role", "==", "vikar"));
    const querySnapshot = await getDocs(vikarsRef);

    const vikarsList = [];

    querySnapshot.forEach((doc) => {
        const id = doc.id;
        const fullName = doc.data().fullName;
        const workernumber = doc.data().ID;
        
        vikarsList.push({ fullName, workernumber, id });
    });

    updateVikarListHTML(vikarsList);
}

async function fetchValidUsers() {
    const usersRef = collection(db, "valid users");
    const querySnapshot = await getDocs(usersRef);

    const usersList = [];

    querySnapshot.forEach((doc) => {
        const id = doc.id;
        const available = doc.data().available;
        const workernumber = doc.data().ID;
        
        usersList.push({ available, workernumber, id });
    });

    drawWorkerIDList(usersList);
}
  
function updateVikarListHTML(vikars) {
    const section = document.getElementById('workers-container');
    let htmlContent = '';

    for(let i = 0; i < vikars.length; i++) {
        htmlContent += `
            <div class="vikarliste_element">
                <div class="vikarliste_element_navn_tlf_container">
                    <div class="vikarliste_element_navn">${vikars[i].fullName}</div>
                    <div class="vikarliste_element_tlf">${vikars[i].workernumber}</div>
                </div>
                <a class="vikarliste_element_status delete_btn_user_id" user-id="${vikars[i].id}" style="color: red">Slett</a>
            </div>
        `;
    }
    section.innerHTML = htmlContent;

    // Legg til event listeners for slett-knappene
    const deleteButtons = document.querySelectorAll('.delete_btn_user_id');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const id = event.target.getAttribute('user-id');
            const userName = event.target.closest('.vikarliste_element').querySelector('.vikarliste_element_navn').textContent;
            if (confirm(`Er du sikker på at du vil slette brukeren til ${userName}?`)) {
                await deleteDoc(doc(db, "users", id));
                fetchAndDraw(); // Oppdater listen etter sletting
            }
        });
    });
}

function drawWorkerIDList(users) {
    const section = document.getElementById('all-workernumbers');
    let htmlContent = '';
    
    for(let i = 0; i < users.length; i++) {
        let availability = "Ansattnummer er i bruk";
        let color = "green";

        if(users[i].available){
            availability = "Ansattnummer er ikke i bruk";
            color = "red";
        }
        
        htmlContent += `
            <div class="vikarliste_element">
                <div class="vikarliste_element_navn_tlf_container">
                    <div class="vikarliste_element_navn">${users[i].workernumber}</div>
                    <div class="vikarliste_element_tlf" style="color: ${color}">${availability}</div>
                </div>
                <a class="vikarliste_element_status delete_btn_worker_id" worker-id="${users[i].id}" style="color: red">Slett</a>
            </div>
        `;
    }
    
    section.innerHTML = htmlContent;

    // Legg til event listeners for slett-knappene
    const deleteButtons = document.querySelectorAll('.delete_btn_worker_id');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const id = event.target.getAttribute('worker-id');
            const workerNumber = event.target.closest('.vikarliste_element').querySelector('.vikarliste_element_navn').textContent;
            if (confirm(`Er du sikker på at du vil slette ansattnummer ${workerNumber}?`)) {
                await deleteDoc(doc(db, "valid users", id));
                fetchAndDraw(); // Oppdater listen etter sletting
            }
        });
    });
}

function hideSpinnerAndShowContent() {
    document.querySelector('.spinner-container').style.display = 'none';
    const section = document.getElementById('brukeradministration-content');
    section.style.display = "grid";
}

function showSpinner() {
    document.querySelector('.spinner-container').style.display = 'flex';
}

fetchAndDraw();