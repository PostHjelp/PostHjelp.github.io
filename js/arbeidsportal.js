import { db, getDocs, collection, query, orderBy, deleteDoc } from './firebaseConfig.js';
import { updateAvailabilityAndWorkDate, updateWorkForReview } from './arbeidsportalAddWork.js';

document.addEventListener('DOMContentLoaded', async () => {
    const addWorkBtn = document.getElementById("add-work-btn");
    const role = localStorage.getItem('role');

    const workContainer = document.getElementById('work-container');
    const myWorkContainer = document.getElementById('my-work-container');
    const workSort = document.getElementById('work-sort');
    const workSortPiP = document.getElementById('work-sort-pip');
    const workCollection = collection(db, "work");
    const main = document.getElementById('arbeidsportal-main');

    try {
        const q = query(workCollection, orderBy('available', 'desc', orderBy('date', 'asc')));
        const querySnapshot = await getDocs(q);

        const myWorkItems = [];
        const workItems = [];
        const uniqueDates = new Set();
        const uniquePiPs = new Set();

        querySnapshot.forEach(async (doc) => {
            const data = doc.data();
            const workId = doc.id;

            const date = new Date(data.date);
            const today = new Date();
            const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

            // Nullstill tid på begge datoene for å kun sammenligne året, måneden og dagen
            date.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            tomorrow.setHours(0, 0, 0, 0);

            if (date.getTime() < today.getTime()) {
                await deleteDoc(doc.ref);
                return; // Fortsett til neste dokument uten å legge til dette i DOM
            }

            let dateString = getDateString(date);

            if (data.userId === localStorage.getItem('user') && !data.available) {
                myWorkItems.push({ id: workId, data, date });
            } else {
                workItems.push({ id: workId, data, date });
                uniqueDates.add(date.getTime());
                uniquePiPs.add(data.pip); // Samle unike PiP-verdier
            }

            // Fortsetter med å legge til elementene i DOM-en
            addWorkItemToDOM(data, workId, dateString, workContainer, myWorkContainer, false);
        });

        // Sorter mine jobber kronologisk
        myWorkItems.sort((a, b) => a.date - b.date);
        myWorkItems.forEach(item => {
            const { id, data, date } = item;
            const dateString = getDateString(date);
            addWorkItemToDOM(data, id, dateString, workContainer, myWorkContainer, true);
        });

        const sortedDates = Array.from(uniqueDates).sort((a, b) => a - b); // Sorterer datoene kronologisk
        const sortedPiPs = Array.from(uniquePiPs).sort((a, b) => a - b); // Sorter PiP-verdiene kronologisk

        // Bygg opp sorteringsalternativene for dato
        let workSortHTML = `<option value="all">Alle datoer</option>`;
        sortedDates.forEach(dateTime => {
            const date = new Date(dateTime);
            let dateString = getDateString(date);
            workSortHTML += `<option value="${dateTime}">${dateString}</option>`;
        });
        workSort.innerHTML = workSortHTML;

        // Bygg opp sorteringsalternativene for PiP
        let workSortPiPHTML = `<option value="all">Alle ruter</option>`;
        sortedPiPs.forEach(pip => {
            workSortPiPHTML += `<option value="${pip}">PiP ${pip}</option>`;
        });
        workSortPiP.innerHTML = workSortPiPHTML;

        // Initial kall til filterWorkItems for å vise alle elementer
        filterWorkItems('all', 'all', workItems, workContainer, myWorkContainer);

        // Kall bemannButton etter at alle elementer er lagt til DOM-en
        bemannBtn();

        // Event listener for sortering etter dato
        workSort.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            const selectedPiP = workSortPiP.value;
            filterWorkItems(selectedDate, selectedPiP, workItems, workContainer, myWorkContainer);
            bemannBtn(); // Kall bemannButton etter filtrering
        });

        // Event listener for sortering etter PiP
        workSortPiP.addEventListener('change', (event) => {
            const selectedDate = workSort.value;
            const selectedPiP = event.target.value;
            filterWorkItems(selectedDate, selectedPiP, workItems, workContainer, myWorkContainer);
            bemannBtn(); // Kall bemannButton etter filtrering
        });

        hideSpinner();
        main.style.display = "grid";
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
});

function hideSpinner() {
    document.querySelector('.spinner-container').style.display = 'none';
}

function bemannBtn() {
    // Legg til event listeners for "Bemann"-knappene
    const bemannButtons = document.querySelectorAll('.work-btn');
    bemannButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const userId = localStorage.getItem('user');
            const userName = localStorage.getItem('fullName');
            const workId = event.target.getAttribute('data-work-id');
            const workPiP = event.target.getAttribute('data-work-pip');
            const workDate = event.target.getAttribute('data-work-date');

            let time = prompt("Vennligst oppgi et tidspunkt du kan komme inn:", "08:00");
            if (time) {
                await updateWorkForReview(userId, userName, workId, workDate, time);
                window.location.href = "arbeidsportal.html";
            } else {
                alert("Tidspunkt ble ikke oppgitt, registreringen avbrutt.");
            }
        });
    });
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

function addWorkItemToDOM(data, workId, dateString, workContainer, myWorkContainer, isMyWork) {
    if (isMyWork) {
        if (myWorkContainer.style.display = "none") {
            myWorkContainer.style.display = "grid";
        }
        const myDiv = createWorkSection(data, dateString, 'my-work-header', true);
        myWorkContainer.appendChild(myDiv);
    } else if (!data.available) {
        const div = createWorkSection(data, dateString, 'work-header taken-work-header', false, data.user);
        workContainer.appendChild(div);
    } else {
        const div = createWorkSection(data, dateString, 'work-header not-my-work-header', false, data.user);
        const button = document.createElement('button');
        button.className = "work-btn";
        button.dataset.workId = workId;
        button.dataset.workDate = data.date;
        button.dataset.workPip = data.pip;
        button.textContent = "Bemann";
        div.appendChild(button);
        workContainer.appendChild(div);
    }
}

function createWorkSection(data, dateString, headerClass, isMyWork, user = '') {
    const section = document.createElement('section');
    section.className = "work-element";
    section.innerHTML = `
        <div class="work-header ${headerClass}">PiP ${data.pip}</div>
        <div class="work-underheader">${data.postal_code}</div>
        ${data.baskets ? `<div class="work-baskets">${data.baskets} kasser</div>` : ''}
        <div class="work-underheader" ${isMyWork ? `style="margin-bottom: 1rem;` : ''}">${dateString}${data.time ? ` - ${data.time}` : ''}</div>
        ${!data.available && !isMyWork ? `<div class="work-unavailable-txt">Bemannet av <br> ${user}</div><div class="overlay"></div>` : ''}
    `;
    return section;
}

function filterWorkItems(selectedDate, selectedPiP, workItems, workContainer, myWorkContainer) {
    workContainer.innerHTML = '';
    const filteredItems = workItems.filter(item => {
        const matchesDate = selectedDate === 'all' || item.date.getTime() == selectedDate;
        const matchesPiP = selectedPiP === 'all' || item.data.pip == selectedPiP;
        return matchesDate && matchesPiP;
    });
    filteredItems.forEach(item => {
        const { id, data, date } = item;
        const dateString = getDateString(date);
        addWorkItemToDOM(data, id, dateString, workContainer, myWorkContainer, false);
    });
}