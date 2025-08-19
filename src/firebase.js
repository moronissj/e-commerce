import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBgmeFX0nDE7xvneltvjFHeta1lC8AmuC0",
  authDomain: "crudherramientas.firebaseapp.com",
  databaseURL: "https://crudherramientas-default-rtdb.firebaseio.com",
  projectId: "crudherramientas",
  // IMPORTANTÍSIMO: usa el bucket .appspot.com (no .firebasestorage.app)
  storageBucket: "crudherramientas.firebasestorage.app",
  messagingSenderId: "171956379057",
  appId: "1:171956379057:web:c9722a9c6f757b5d62f190"
};

// Evita "Firebase App named '[DEFAULT]' already exists..."
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export default app;
