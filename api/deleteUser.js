const admin = require('firebase-admin');
const cors = require('cors');
const express = require('express');

// Sett opp Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://posthjelp5068.firebaseio.com"
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/deleteUser', async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().deleteUser(uid);
    res.status(200).send(`Successfully deleted user with UID: ${uid}`);
  } catch (error) {
    res.status(500).send(`Error deleting user: ${error.message}`);
  }
});

module.exports = app;