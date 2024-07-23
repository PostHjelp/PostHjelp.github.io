const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json'); // Tilpass stien hvis nødvendig

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = async (req, res) => {
  const { title, body, tokens } = req.body;

  if (!tokens || tokens.length === 0) {
    return res.status(400).send('No tokens provided');
  }

  const message = {
    notification: {
      title: title,
      body: body
    },
    tokens: tokens
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    res.status(200).send(`Successfully sent message: ${response}`);
  } catch (error) {
    res.status(500).send(`Error sending message: ${error.message}`);
  }
};