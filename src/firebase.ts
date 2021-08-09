import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

const debug = false;
let mediaPath = "https://swarmsource.io/media/";

const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const functions = firebase.functions();

if (debug) {
  mediaPath = "./media/";
  db.useEmulator("localhost", 8080);
  functions.useEmulator("localhost", 5001);

  functions
    .httpsCallable("createTestData")()
    .then((result) => {
      console.log(`createTestData function response: ${result.data}`);
    })
    .catch((error) => {
      console.log(
        `createTestData function error code: ${error.code}, message: ${error.message}, details: ${error.details}`
      );
    });
}

// TODO: ENABLE PERSISTENCE WITH HIGH VOLUME (TEST RESPONSE TIME)
// db.enablePersistence()
// .catch((err) => {
//     if (err.code === 'failed-precondition') {
//       console.log(`firestore enablePersistence: too many tabs open`);
//     } else if (err.code === 'unimplemented') {
//       console.log(`firestore enablePersistence: browser unsupported`);
//     }
// });

export { debug, mediaPath, firebaseApp, db, functions };
