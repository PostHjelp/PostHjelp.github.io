import { db, getDocs, collection, query, orderBy, deleteDoc } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', async () => {
    const addPostBtn = document.getElementById("add-post-btn");
    const main = document.getElementById("posts-main");

    const role = localStorage.getItem('role');

    const postsContainer = document.getElementById('posts-container');
    const postsCollection = collection(db, "posts");

    try {
        const q = query(postsCollection, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (doc) => {
            const data = doc.data();

            const date = data.date.toDate();
            const today = new Date();
            const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Måneder er fra 0-11, så legg til 1
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            // Nullstill tid på begge datoene for å kun sammenligne året, måneden og dagen
            date.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            yesterday.setHours(0, 0, 0, 0);

            let dateStr = "";
            if (date.getTime() === today.getTime()) {
                dateStr = "I dag";
            } else if (date.getTime() === yesterday.getTime()) {
                dateStr = "I går";
            } else {
                // Returnerer datoen i formatet dd.mm.yyyy
                dateStr = `${day}.${month}.${year}`;
            }

            const timeStr = `${hours}:${minutes}`;

            const div = document.createElement('div');
            div.className = "posts-element";
            div.innerHTML = `
                <div class="post-user">${data.username}</div>
                <div class="post-content">${data.content}</div>
                <div class="post-date" style="margin-bottom: 1rem;">${dateStr}, ${timeStr}</div>
            `;

            postsContainer.appendChild(div);
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