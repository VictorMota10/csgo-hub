import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDVjYYSyaSLRqKhwwPMcY7jypg13sJ-NYI",
  authDomain: "csgo-project-8ae6b.firebaseapp.com",
  projectId: "csgo-project-8ae6b",
  storageBucket: "csgo-project-8ae6b.appspot.com",
  messagingSenderId: "663980518153",
  appId: "1:663980518153:web:33124ac8a1490d842a41d8"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);