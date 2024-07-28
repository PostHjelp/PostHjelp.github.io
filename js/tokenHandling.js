import { getDocs, collection, db } from './firebaseConfig.js';

export async function fetchAdminTokens() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const adminTokens = usersSnapshot.docs
        .filter(doc => doc.data().role === 'admin' && doc.data().availability !== 'Ikke tilgjengelig') // Filtrer etter rolle
        .map(doc => doc.data().token)
        .filter(token => token); // Filtrer ut eventuelle undefined eller null tokens
      
      return adminTokens;
    } catch (error) {
      console.error('Error fetching admin tokens:', error);
      return [];
    }
}

// Funksjon for å hente tokens fra bruker-dokumenter
export async function fetchUserTokens() {
    try {
      // Hent alle brukerdokumentene fra 'users'-samlingen
      const usersSnapshot = await getDocs(collection(db, 'users'));
      // Map over dokumentene og hent ut 'token' for hver bruker
      const tokens = usersSnapshot.docs
        .filter(doc => doc.data().availability !== 'Ikke tilgjengelig')
        .map(doc => doc.data().token)
        .filter(token => token); // Filtrer ut eventuelle undefined eller null tokens
  
      return tokens;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      return [];
    }
  }