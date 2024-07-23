import { db, getDocs, collection, where, query } from './firebaseConfig.js';

async function fetchVikars() {
    const vikarsRef = collection(db, "users");
    const vikarQuery = query(vikarsRef, where("role", "==", "vikar"));
    const querySnapshot = await getDocs(vikarQuery);

    const vikarsList = [];

    querySnapshot.forEach((doc) => {
        const workDates = doc.data().workDates;
        const fullName = doc.data().fullName;
        const availability = doc.data().availability;
        const tlfNumber = doc.data().tlf_number;

        let isWorking = false;
        if (Array.isArray(workDates)) {
            workDates.forEach(workDate => {
                const date = new Date(workDate);
                const today = new Date();

                // Nullstill tid på begge datoene for å kun sammenligne året, måneden og dagen
                date.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (date.getTime() === today.getTime()) {
                    isWorking = true;
                }
            });
        }
        
        if (isWorking) {
            vikarsList.push({ fullName, availability: "Jobber", tlfNumber });
        } else {
            vikarsList.push({ fullName, availability, tlfNumber });
        }
    });

    // Sorter brukerdata basert på availability-status
    const order = {
        'Tilgjengelig': 1,
        'Delvis tilgjengelig': 2,
        'Jobber': 3,
        'Ikke tilgjengelig': 4
    };

    const sortedUsers = vikarsList.sort((a, b) => order[a.availability] - order[b.availability]);

    updateVikarListHTML(sortedUsers);
}
  
function updateVikarListHTML(vikars) {
    const section = document.getElementById('vikarliste');
    let htmlContent = '';

    for(let i = 0; i < vikars.length; i++) {
        let color = "green"; // Setter defaultfarge til grønn (tilgjengelig)

        if (vikars[i].availability === "Delvis tilgjengelig" || vikars[i].availability === "Jobber") {
            color = "orange";
        } else if (vikars[i].availability === "Ikke tilgjengelig") {
            color = "red";
        }

        htmlContent += `
            <a href="sms:+47${vikars[i].tlfNumber}" class="vikarliste_element">
                <div class="vikarliste_element_navn_tlf_container">
                    <div class="vikarliste_element_navn">${vikars[i].fullName}</div>
                    <div class="vikarliste_element_tlf">+47 ${vikars[i].tlfNumber}</div>
                </div>
                <div class="vikarliste_element_status" style="color: ${color}">${vikars[i].availability}</div>
            </a>
        `;
    }
    hideSpinner();
    section.innerHTML = htmlContent;
    section.style.display = "grid";
}

function hideSpinner() {
    document.querySelector('.spinner-container').style.display = 'none';
}

fetchVikars();