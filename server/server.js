const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Importer CORS-pakken

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Konfigurer CORS-innstillinger
const corsOptions = {
  origin: 'http://127.0.0.1:5500', // Erstatt med URL-en til din frontend-app
  optionsSuccessStatus: 200 // Noen eldre nettlesere (IE11, diverse SmartTV) kan ha problemer med 204
};

app.use(cors(corsOptions)); // Bruk CORS-innstillingene

// Sett opp Firebase Admin SDK med serviceAccountKey.json
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://posthjelp5068.firebaseio.com"
});

// Endepunkt for å slette brukere
app.post('/deleteUser', async (req, res) => {
  const { uid } = req.body;

  try {
    await admin.auth().deleteUser(uid);
    res.status(200).send(`Successfully deleted user with UID: ${uid}`);
  } catch (error) {
    res.status(500).send(`Error deleting user: ${error.message}`);
  }
});

// Endepunkt for å sende varsler
app.post('/sendNotification', async (req, res) => {
  const { title, body, tokens } = req.body;

  if (!tokens || tokens.length === 0) {
    res.status(400).send('No tokens provided');
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    tokens: tokens
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    res.status(200).send(`Successfully sent message: ${response}`);
  } catch (error) {
    res.status(500).send(`Error sending message: ${error.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});