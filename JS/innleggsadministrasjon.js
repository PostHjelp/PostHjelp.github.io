import { db, addDoc, collection } from './firebaseConfig.js'

document.addEventListener('DOMContentLoaded', function() {
    const now = new Date();

    const form = document.getElementById('add-post-form');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const innleggContent = document.getElementById('postfield').value;
        const username = localStorage.getItem('fullName');

        try {
            const docRef = await addDoc(collection(db, "posts"), {
                content: innleggContent,
                username: username,
                date: now
            });

            window.location.href = "../index.html";
        }
        catch (error) {
            console.log(error);
        }
    });
});