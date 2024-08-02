// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCS7wpE4HkDOpGDMoOEP1wcykF2laBjWbk",
  authDomain: "inventoryappp.firebaseapp.com",
  projectId: "inventoryappp",
  storageBucket: "inventoryappp.appspot.com",
  messagingSenderId: "650539230957",
  appId: "1:650539230957:web:00bc95711332c264c44ee4",
  measurementId: "G-DCYZFVLX6N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore};