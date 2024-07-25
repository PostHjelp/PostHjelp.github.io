// Importer Firebase moduler
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore, doc, arrayUnion, setDoc, getDoc, addDoc, deleteDoc, getDocs, updateDoc, collection, where, query, onSnapshot, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging.js';

// Firebase konfigurasjon
const firebaseConfig = {
    apiKey: "AIzaSyD-mUuXP2mLqXxGA8DU5U9FWYwKING9I00",
    authDomain: "posthjelp5068.firebaseapp.com",
    projectId: "posthjelp5068",
    storageBucket: "posthjelp5068.appspot.com",
    messagingSenderId: "990560594554",
    appId: "1:990560594554:web:ae0f1c33e1642daf8669c3",
    measurementId: "G-MF3W2QC9LJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { auth, orderBy, messaging, getToken, onMessage, deleteDoc, arrayUnion, addDoc, onSnapshot, collection, where, query, updateDoc, getDocs, onAuthStateChanged, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setDoc, doc, getDoc };