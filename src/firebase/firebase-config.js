// firebase-config.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { ref } from "firebase/database";

export const FIREBASE_DB_NAME = {
  APP_CONFIG: 'APP_CONFIG',
  MARKET_STATUS: 'MARKET_STATUS',
  SOCKET_CONFIG: 'SOCKET_CONFIG',
  GAINER_LIST: 'GAINER_LIST',
  LOSER_LIST: 'LOSER_LIST',
  MATCH_PRICE: 'MATCH_PRICE',
  MATCH_PRICE_BUY_IN: 'MATCH_PRICE_BUY_IN',
  BID_ASK: 'BID_ASK',
  BID_ASK_BUY_IN: 'BID_ASK_BUY_IN',
  TOP_STOCK_GROUP: 'TOP_STOCK_GROUP',
  INDEX: 'INDEX'
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

export const socketConfigRef = ref(db, FIREBASE_DB_NAME.SOCKET_CONFIG);
export const topStockLoserRef = ref(db, FIREBASE_DB_NAME.LOSER_LIST);
export const topStockGainerRef = ref(db, FIREBASE_DB_NAME.GAINER_LIST);
export const topStockGroupRef = ref(db, FIREBASE_DB_NAME.TOP_STOCK_GROUP);
export const matchPriceRef = ref(db, FIREBASE_DB_NAME.MATCH_PRICE);
export const matchPriceBuyInRef = ref(db, FIREBASE_DB_NAME.MATCH_PRICE_BUY_IN);
export const bidAskRef = ref(db, FIREBASE_DB_NAME.BID_ASK);
export const bidAskBuyInRef = ref(db, FIREBASE_DB_NAME.BID_ASK_BUY_IN);
export const appConfigRef = ref(db, FIREBASE_DB_NAME.APP_CONFIG);
export const marketStatusRef = ref(db, FIREBASE_DB_NAME.MARKET_STATUS);
export const indexRef = ref(db, FIREBASE_DB_NAME.INDEX);
export const resetDataFirebaseRef = ref(
  db,
  `${FIREBASE_DB_NAME.SOCKET_CONFIG}/resetDataFirebase`
);

export const reUpdatePriceRef = ref(
  db,
  `${FIREBASE_DB_NAME.SOCKET_CONFIG}/reUpdatePrice`
);