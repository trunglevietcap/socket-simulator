import { set, onValue } from "firebase/database";
import {
  bidAskRef,
  matchPriceRef,
  topStockGainerRef,
  topStockLoserRef,
  socketConfigRef,
  resetDataFirebaseRef,
  marketStatusRef,
  appConfigRef,
  indexRef,
} from "./src/firebase/firebase-config.js";
import { APP_CONFIG } from "./src/data/app-config.js";
import { MARKET_STATUS_ALL } from "./src/data/market-status.js";
import { SOCKET_CONFIG } from "./src/data/socket-config.js";
import { GAINER_LIST, LOSER_LIST } from "./src/data/top-stock.js";
import { MATCH_PRICE, BID_ASK } from "./src/data/price-bid-ask.js";
import { INDEX } from "./src/data/index.js";
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

    await set(topStockLoserRef, LOSER_LIST);
    console.log("LOSER_LIST saved");

    await set(topStockGainerRef, GAINER_LIST);
    console.log("MATCH_PRICE saved");

    await set(matchPriceRef, MATCH_PRICE);
    console.log("MATCH_PRICE saved");

    await set(bidAskRef, BID_ASK);
    console.log("BID_ASK saved");
    
    await set(indexRef, INDEX);
    console.log("INDEX saved");
  } catch (error) {
    console.error("Error saving data to Firebase:", error);
  }
};

saveFirebaseData();
