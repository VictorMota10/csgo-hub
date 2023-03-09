import firebase from "firebase/compat/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDVjYYSyaSLRqKhwwPMcY7jypg13sJ-NYI",
  authDomain: "csgo-project-8ae6b.firebaseapp.com",
  databaseURL: "https://csgo-project-8ae6b-default-rtdb.firebaseio.com",
  projectId: "csgo-project-8ae6b",
  storageBucket: "csgo-project-8ae6b.appspot.com",
  messagingSenderId: "663980518153",
  appId: "1:663980518153:web:33124ac8a1490d842a41d8",
};

export const app = firebase.initializeApp(firebaseConfig);
export const firestore_db = getFirestore(app);
export const realtime_db = getDatabase(app);
export const auth = getAuth()
