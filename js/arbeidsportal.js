import { db, doc, updateDoc, arrayUnion, collection, getDocs, deleteDoc, query, orderBy, onSnapshot } from './firebaseConfig.js';
import { updateWorkForReview } from './arbeidsportalAddWork.js';
import { fetchAdminTokens } from './tokenHandling.js';

// Funksjon for å sende varsling
async function sendNotification(title, body, tokens) {
    try {
      const response = await fetch('https://us-central1-posthjelp5068.cloudfunctions.net/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, body, tokens })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('Successfully sent message:', data);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
}

// Globale variabler for å holde arbeidsdata
let workItems = [];
let myWorkItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    const addWorkBtn = document.getElementById("add-work-btn");
    const role = localStorage.getItem('role');

    const workContainer = document.getElementById('work-container');
    const myWorkContainer = document.getElementById('my-work-container');
    const workSortPlace = document.getElementById('work-sort-place');
    const workSort = document.getElementById('work-sort');
    const workSortPiP = document.getElementById('work-sort-pip');
    const workCollection = collection(db, "work");
    const main = document.getElementById('arbeidsportal-main');

    try {
        const q = query(workCollection, orderBy('available', 'desc'));

        // Bruk onSnapshot for sanntidsoppdateringer
        onSnapshot(q, (querySnapshot) => {
            workItems = [];
            myWorkItems = [];

            // Tøm containerne for å unngå duplikater
            workContainer.innerHTML = '';
            myWorkContainer.innerHTML = '';

            const uniquePlaces = new Set();
            const uniqueDates = new Set();
            const uniquePiPs = new Set();

            querySnapshot.forEach(async doc => {
                const data = doc.data();
                const workId = doc.id;

                const date = new Date(data.date);
                const today = new Date();

                date.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                if (date.getTime() < today.getTime()) {
                    // Slett dokumentet fra databasen hvis det er utdatert
                    await deleteDoc(doc.ref);
                    return;
                }

                let dateString = getDateString(date);

                if (data.userId === localStorage.getItem('user') && !data.available) {
                    myWorkItems.push({ id: workId, data, date });
                } else {
                    workItems.push({ id: workId, data, date });
                    if (data.place) {
                        uniquePlaces.add(data.place);
                    }
                    uniqueDates.add(date.getTime());
                    uniquePiPs.add(data.pip);
                }

                addWorkItemToDOM(data, workId, dateString, workContainer, myWorkContainer, false);
            });

            myWorkItems.sort((a, b) => a.date - b.date);
            myWorkItems.forEach(item => {
                const { id, data, date } = item;
                const dateString = getDateString(date);
                addWorkItemToDOM(data, id, dateString, workContainer, myWorkContainer, true);
            });

            const sortedPlaces = Array.from(uniquePlaces).sort((a, b) => a - b);
            const sortedDates = Array.from(uniqueDates).sort((a, b) => a - b);
            const sortedPiPs = Array.from(uniquePiPs).sort((a, b) => a - b);

            let workSortPlaceHTML = `<option value="all">Alle steder</option>`;
            sortedPlaces.forEach(place => {
                workSortPlaceHTML += `<option value="${place}">${place}</option>`;
            });
            workSortPlace.innerHTML = workSortPlaceHTML;

            let workSortHTML = `<option value="all">Alle datoer</option>`;
            sortedDates.forEach(dateTime => {
                const date = new Date(dateTime);
                let dateString = getDateString(date);
                workSortHTML += `<option value="${dateTime}">${dateString}</option>`;
            });
            workSort.innerHTML = workSortHTML;

            let workSortPiPHTML = `<option value="all">Alle ruter</option>`;
            sortedPiPs.forEach(pip => {
                workSortPiPHTML += `<option value="${pip}">PiP ${pip}</option>`;
            });
            workSortPiP.innerHTML = workSortPiPHTML;

            filterWorkItems('all', 'all', 'all', workItems, workContainer, myWorkContainer);
            bemannBtn();
            hideSpinner();
            main.style.display = "grid";
        });

        // Event listener for sortering etter sted
        workSortPlace.addEventListener('change', (event) => {
            const selectedDate = workSort.value;
            const selectedPiP = workSortPiP.value;
            const selectedPlace = event.target.value;
            filterWorkItems(selectedDate, selectedPiP, selectedPlace, workItems, workContainer, myWorkContainer);
            bemannBtn();
        });

        // Event listener for sortering etter dato
        workSort.addEventListener('change', (event) => {
            const selectedDate = event.target.value;
            const selectedPiP = workSortPiP.value;
            const selectedPlace = workSortPlace.value;
            filterWorkItems(selectedDate, selectedPiP, selectedPlace, workItems, workContainer, myWorkContainer);
            bemannBtn();
        });

        // Event listener for sortering etter PiP
        workSortPiP.addEventListener('change', (event) => {
            const selectedDate = workSort.value;
            const selectedPiP = event.target.value;
            const selectedPlace = workSortPlace.value;
            filterWorkItems(selectedDate, selectedPiP, selectedPlace, workItems, workContainer, myWorkContainer);
            bemannBtn();
        });

        // Event listener for "Mitt arbeid"-knappen
        const myWorkBtn = document.getElementById('my-work-btn');
        const myWorkContainer = document.getElementById('my-work-container');

        myWorkBtn.addEventListener('click', () => {
            if (myWorkContainer.style.display === 'none' || myWorkContainer.style.display === '') {
                myWorkContainer.style.display = 'grid';
            } else {
                myWorkContainer.style.display = 'none';
            }
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
});

function hideSpinner() {
    document.querySelector('.spinner-container').style.display = 'none';
}

function bemannBtn() {
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
                const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (timePattern.test(time)) {
                    await updateWorkForReview(userId, userName, workId, workDate, time);
                    const adminTokens = await fetchAdminTokens();
                    const notificationContent = `${userName} vil kjøre PiP ${workPiP} klokken ${time}`;
                    if (adminTokens.length > 0) {
                        await sendNotification('Bemanningsforespørsel', notificationContent, adminTokens);
                    }
                } else {
                    alert("Tidspunktet må være i formatet HH:MM, for eksempel 08:00 eller 15:00.");
                }
            } else {
                alert("Tidspunkt ble ikke oppgitt, registreringen avbrutt.");
            }
        });
    });
}

function getDateString(date) {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
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
        const myDiv = createWorkSection(data, dateString, 'my-work-header', true);
        myWorkContainer.appendChild(myDiv);
    } else if (!data.available) {
        const div = createWorkSection(data, dateString, 'work-header taken-work-header', false, data.user);
        workContainer.appendChild(div);
    } else {
        const div = createWorkSection(data, dateString, 'work-header not-my-work-header', false, data.user);
        const userId = localStorage.getItem('user');
        const isCandidate = data.candidates && data.candidates.some(candidate => candidate.userId === userId);
        const button = document.createElement('button');
        button.className = "work-btn";
        button.dataset.workId = workId;
        button.dataset.workDate = data.date;
        button.dataset.workPip = data.pip;

        if (isCandidate) {
            button.className = "pending-work";
            button.textContent = "Venter på behandling";
            button.disabled = true;
        } else {
            button.textContent = "Ta vakt";
        }

        div.appendChild(button);
        workContainer.appendChild(div);
    }
}

function createWorkSection(data, dateString, headerClass, isMyWork, user = '') {
    const section = document.createElement('section');
    section.className = "work-element";
    section.innerHTML = `
        <div class="work-header ${headerClass}">PiP ${data.pip}</div>
        ${data.place ? `<div class="work-underheader work-underheader-place">${data.place}</div>` : ''}
        <div class="work-underheader">${data.postal_code}</div>
        ${data.baskets ? `<div class="work-underheader">${data.baskets} kasser</div>` : ''}
        <div class="work-underheader" ${isMyWork ? `style="margin-bottom: 1rem;` : ''}">${dateString}${data.time ? `, ${data.time}` : ''}</div>
        ${!data.available && !isMyWork ? `<div class="work-unavailable-txt">Bemannet av <br> ${user}</div><div class="overlay"></div>` : ''}
    `;
    return section;
}

function filterWorkItems(selectedDate, selectedPiP, selectedPlace, workItems, workContainer, myWorkContainer) {
    workContainer.innerHTML = '';
    const filteredItems = workItems.filter(item => {
        const matchesPlace = selectedPlace === 'all' || item.data.place === selectedPlace; // Nytt filter
        const matchesDate = selectedDate === 'all' || item.date.getTime() == selectedDate;
        const matchesPiP = selectedPiP === 'all' || item.data.pip == selectedPiP;
        return matchesDate && matchesPiP && matchesPlace;
    });
    filteredItems.forEach(item => {
        const { id, data, date } = item;
        const dateString = getDateString(date);
        addWorkItemToDOM(data, id, dateString, workContainer, myWorkContainer, false);
    });
}