import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC0TsWYNH9eVENnD8nLdNGfIXtLZcwnY2M",
    authDomain: "slugmart-a3525.firebaseapp.com",
    projectId: "slugmart-a3525",
    storageBucket: "slugmart-a3525.appspot.com",
    messagingSenderId: "800510357103",
    appId: "1:800510357103:web:b8ca94c0fc761e87fa279a",
    measurementId: "G-MGD2TK4F4T"
  };
  
const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
export const auth = getAuth(app);
export const db = getFirestore(app);