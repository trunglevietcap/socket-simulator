// firebase-config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const FIREBASE_DB_NAME = {
  APP_CONFIG: 'APP_CONFIG',
  MARKET_STATUS: 'MARKET_STATUS',
  SOCKET_CONFIG: 'SOCKET_CONFIG'
}

const firebaseConfig = {
  apiKey: "AIzaSyDGMaSD0fTo-Y9qziW7d_-4abAqxGAFElI",
  authDomain: "socket-14a79.firebaseapp.com",
  databaseURL: "https://socket-14a79-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "socket-14a79",
  storageBucket: "socket-14a79.firebasestorage.app",
  messagingSenderId: "300053149102",
  appId: "1:300053149102:web:e4b297fab6ea4d2a58043f",
  measurementId: "G-96XWRRMZMK"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { db };
