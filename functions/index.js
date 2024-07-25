const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

admin.initializeApp();

exports.sendNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {title, body, tokens} = req.body;

    if (!tokens || tokens.length === 0) {
      res.status(400).json({error: "No tokens provided"});
      return;
    }

    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      res.status(200).json({message: "Successfully sent message", response});
    } catch (error) {
      res.status(500).json({error: `Error sending message: ${error.message}`});
    }
  });
});
