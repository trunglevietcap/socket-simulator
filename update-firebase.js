import { ref, set, onValue } from "firebase/database";
import { db } from "./src/firebase/firebase-config.js";
import { APP_CONFIG } from "./src/data/app-config.js";
import { MARKET_STATUS_ALL } from "./src/data/market-status.js";
import { SOCKET_CONFIG } from "./src/data/socket-config.js";
import { FIREBASE_DB_NAME } from "./src/firebase/firebase-config.js";

const appConfigRef = ref(db, FIREBASE_DB_NAME.APP_CONFIG);
const marketStatusRef = ref(db, FIREBASE_DB_NAME.MARKET_STATUS);
const socketConfigRef = ref(db, FIREBASE_DB_NAME.SOCKET_CONFIG);
onValue(socketConfigRef, (snapshot) => {
  const configData = snapshot.val();
  const resetDataFirebase = configData?.resetDataFirebase;
  if (resetDataFirebase) {
    saveFirebaseData();
  }
});

export const saveFirebaseData = async () => {
  set(appConfigRef, APP_CONFIG);
  set(marketStatusRef, MARKET_STATUS_ALL);
  set(socketConfigRef, SOCKET_CONFIG);
};

saveFirebaseData();
