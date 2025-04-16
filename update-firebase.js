import { ref, set, onValue } from "firebase/database";
import { db } from "./src/firebase/firebase-config.js";
import { APP_CONFIG } from "./src/data/app-config.js";
import { MARKET_STATUS_ALL } from "./src/data/market-status.js";
import { SOCKET_CONFIG } from "./src/data/socket-config.js";
export const FIREBASE_DB_NAME = {
  APP_CONFIG: 'APP_CONFIG',
  MARKET_STATUS: 'MARKET_STATUS',
  SOCKET_CONFIG: 'SOCKET_CONFIG'
}
const appConfigRef = ref(db, FIREBASE_DB_NAME.APP_CONFIG);
const marketStatusRef = ref(db, FIREBASE_DB_NAME.MARKET_STATUS);
const resetDataFirebaseRef = ref(db, `${FIREBASE_DB_NAME.SOCKET_CONFIG}/resetDataFirebase`);
const socketConfigRef = ref(db, `${FIREBASE_DB_NAME.SOCKET_CONFIG}`);
onValue(resetDataFirebaseRef, (snapshot) => {
  const resetDataFirebase = snapshot.val();
  if (resetDataFirebase) {
    saveFirebaseData();
  }
});

export const saveFirebaseData = async () => {
  try {
    await set(appConfigRef, APP_CONFIG);
    console.log("APP_CONFIG saved");

    await set(marketStatusRef, MARKET_STATUS_ALL);
    console.log("MARKET_STATUS saved");

    await set(socketConfigRef, SOCKET_CONFIG);
    console.log("SOCKET_CONFIG saved");
  } catch (error) {
    console.error("Error saving data to Firebase:", error);
  }
};

saveFirebaseData();
