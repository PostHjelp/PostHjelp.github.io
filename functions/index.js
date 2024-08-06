const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
const {DateTime} = require("luxon");

admin.initializeApp();

exports.sendNotification = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {title, body, tokens} = req.body;

    console.log("tokens: ", tokens);

    if (!tokens || tokens.length === 0) {
      res.status(400).json({error: "No tokens provided"});
      return;
    }

    const message = {
      data: {
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

exports.deleteUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const {uid} = req.body;

    if (!uid) {
      res.status(400).json({error: "No UID provided"});
      return;
    }

    try {
      await admin.auth().deleteUser(uid);
      res.status(200).json({message: `Successfully deleted user: ${uid}`});
    } catch (error) {
      res.status(500).json({error: `Error deleting user: ${error.message}`});
    }
  });
});

exports.deleteOldWorkItems = functions.pubsub.schedule("0 0 * * *")
    .timeZone("Europe/Oslo")
    .onRun(async (context) => {
      const db = admin.firestore();
      const workCollection = db.collection("work");
      // Set 'today' to the start of the current day in Oslo time
      const today = DateTime.now().setZone("Europe/Oslo")
          .startOf("day")
          .toISODate();

      try {
        // Konverter 'date' feltet fra streng til Date-objekt i
        // Firestore-forespørselen
        const querySnapshot = await workCollection
            .where("date", "<", today)
            .get();

        console.log(`Fant ${querySnapshot.size} dokumenter for sletting.`);

        const batch = db.batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log("Slettet gamle dokumenter fra work-samlingen.");
      } catch (error) {
        console.error("Feil under sletting av gamle dokumenter: ", error);
      }

      return null;
    });
