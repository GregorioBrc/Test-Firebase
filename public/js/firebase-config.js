// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAsOcG6VM3Bw7JPrVHdDVNqp7kBgDu596E",
    authDomain: "despliegue-prueba1.firebaseapp.com",
    databaseURL: "https://despliegue-prueba1-default-rtdb.firebaseio.com",
    projectId: "despliegue-prueba1",
    storageBucket: "despliegue-prueba1.firebasestorage.app",
    messagingSenderId: "189120907388",
    appId: "1:189120907388:web:0f5d409e254ed535d121f9"
  };

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);