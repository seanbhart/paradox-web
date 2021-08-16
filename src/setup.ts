import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

const debug = false;
let mediaPath = "https://swarmsource.io/media/";

const firebaseApp = firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// const functions = firebase.functions();

const etherscanTxUrl: string = "https://kovan.etherscan.io/tx/";
const etherscanTokenUrl: string = "https://kovan.etherscan.io/token/";
let tokenFactoryAddress: string = "0xa6AB32d541e8368caDe2f71038f3334AafBb75DA";
let doxAddress: string = "0x59cfc18BCF6960870c73505b5b454BF174E7Bc4B";

if (debug) {
  mediaPath = "./media/";
  // db.useEmulator("localhost", 8080);
  // functions.useEmulator("localhost", 5001);

  // functions
  //   .httpsCallable("createTestData")()
  //   .then((result) => {
  //     console.log(`createTestData function response: ${result.data}`);
  //   })
  //   .catch((error) => {
  //     console.log(
  //       `createTestData function error code: ${error.code}, message: ${error.message}, details: ${error.details}`
  //     );
  //   });

  tokenFactoryAddress = "0x06b3244b086cecC40F1e5A826f736Ded68068a0F";
  doxAddress = "0xAD2935E147b61175D5dc3A9e7bDa93B0975A43BA";
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

export { debug, mediaPath, firebaseApp };
export { etherscanTxUrl, etherscanTokenUrl };
export { tokenFactoryAddress, doxAddress };
