import { db, collection, query, onSnapshot } from './firebaseConfig.js';

function fetchUsers() {
    const usersRef = collection(db, "users");

    // Bruk onSnapshot for å få sanntidsoppdateringer
    onSnapshot(usersRef, (querySnapshot) => {
        const adminsList = [];
        const vikarsList = [];

        querySnapshot.forEach((doc) => {
            const role = doc.data().role;
            const workDates = doc.data().workDates;
            const fullName = doc.data().fullName;
            const availability = doc.data().availability;
            const tlfNumber = doc.data().tlf_number;

            let isWorking = false;
            if (Array.isArray(workDates)) {
                workDates.forEach(workDate => {
                    const date = new Date(workDate);
                    const today = new Date();

                    date.setHours(0, 0, 0, 0);
                    today.setHours(0, 0, 0, 0);

                    if (date.getTime() === today.getTime()) {
                        isWorking = true;
                    }
                });
            }

            const user = { fullName, availability: isWorking ? "Jobber" : availability, tlfNumber };

            if (role === "admin") {
                adminsList.push(user);
            } else if (role === "vikar") {
                vikarsList.push(user);
            }
        });

        const order = {
            'Tilgjengelig': 1,
            'Delvis tilgjengelig': 2,
            'Jobber': 3,
            'Ikke tilgjengelig': 4
        };

        const sortedAdmins = adminsList.sort((a, b) => order[a.availability] - order[b.availability]);
        const sortedVikars = vikarsList.sort((a, b) => order[a.availability] - order[b.availability]);

        updateVikarListHTML(sortedAdmins, sortedVikars);
    }, (error) => {
        console.error("Error fetching data: ", error);
    });
}

function updateVikarListHTML(admins, vikars) {
    const section = document.getElementById('vikarliste');
    let htmlContent = '';

    // Legg til adminer først
    for (let i = 0; i < admins.length; i++) {
        let color = getColorForAvailability(admins[i].availability);

        htmlContent += `
            <a href="sms:+47${admins[i].tlfNumber}" class="vikarliste_element_admin">
                <div class="vikarliste_element_navn_tlf_container">
                    <div class="vikarliste_element_navn">${admins[i].fullName}</div>
                    <div class="vikarliste_element_tlf">+47 ${admins[i].tlfNumber}</div>
                </div>
                <div class="vikarliste_element_status" style="color: ${color}">${admins[i].availability}</div>
            </a>
        `;
    }

    // Legg til vikarer etter adminer
    for (let i = 0; i < vikars.length; i++) {
        let color = getColorForAvailability(vikars[i].availability);

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

function getColorForAvailability(availability) {
    switch (availability) {
        case "Tilgjengelig":
            return "green";
        case "Delvis tilgjengelig":
        case "Jobber":
            return "orange";
        case "Ikke tilgjengelig":
            return "red";
        default:
            return "black";
    }
}

function hideSpinner() {
    document.querySelector('.spinner-container').style.display = 'none';
}

fetchUsers();