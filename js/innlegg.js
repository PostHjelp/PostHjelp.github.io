import { db, collection, query, orderBy, onSnapshot } from './firebaseConfig.js';

document.addEventListener('DOMContentLoaded', () => {
    const addPostBtn = document.getElementById("add-post-btn");
    const main = document.getElementById("posts-main");

    const role = localStorage.getItem('role');

    const postsContainer = document.getElementById('posts-container');
    const postsCollection = collection(db, "posts");

    try {
        const q = query(postsCollection, orderBy('date', 'desc'));

        // Bruk onSnapshot for sanntidsoppdateringer
        onSnapshot(q, (querySnapshot) => {
            postsContainer.innerHTML = ''; // Tøm innholdet før vi legger til nye innlegg
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.date.toDate();
                const today = new Date();
                const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');

                date.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);
                yesterday.setHours(0, 0, 0, 0);

                let dateStr = "";
                if (date.getTime() === today.getTime()) {
                    dateStr = "I dag";
                } else if (date.getTime() === yesterday.getTime()) {
                    dateStr = "I går";
                } else {
                    dateStr = `${day}.${month}.${year}`;
                }

                const timeStr = `${hours}:${minutes}`;

                const div = document.createElement('div');
                div.className = "posts-element";
                div.innerHTML = `
                    <div class="post-user">${data.username}</div>
                    <div class="post-content">${data.content}</div>
                    <div class="post-date">${dateStr}, ${timeStr}</div>
                `;

                postsContainer.appendChild(div);
            });

            hideSpinner();
            main.style.display = "grid";
        });
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
});

function hideSpinner() {
    document.querySelector('.spinner-container').style.display = 'none';
}