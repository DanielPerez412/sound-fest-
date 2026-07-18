const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_CREDENTIALS || '../env/serviceAccountKey.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = db;