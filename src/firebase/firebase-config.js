// firebase-config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export const FIREBASE_DB_NAME = {
  APP_CONFIG: 'APP_CONFIG',
  MARKET_STATUS: 'MARKET_STATUS',
  SOCKET_CONFIG: 'SOCKET_CONFIG'
}

const firebaseConfig = {
  apiKey: "AIzaSyCFU96Vits90jzlDXBVGH6J7IqnowIoV9k",
  authDomain: "console-socket-simulator.firebaseapp.com",
  projectId: "console-socket-simulator",
  storageBucket: "console-socket-simulator.firebasestorage.app",
  messagingSenderId: "451793869580",
  appId: "1:451793869580:web:663397fac19bece4b2c729",
  measurementId: "G-TV13HVSXNP",
  databaseURL: "https://console-socket-simulator-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
