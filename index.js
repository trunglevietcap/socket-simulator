import express from "express";
import { createServer } from "http";
import protobuf from "protobufjs"; // Import default
import { EVENT_NAME } from "./src/constants.js";
import { Server } from "socket.io";
import { PriceSocketService } from "./src/price/index.js";
import { MarketStatusSocketService } from "./src/market-status/index.js";
import { db } from "./src/firebase/firebase-config.js";
import { ref, onValue, set } from "firebase/database";
import { FIREBASE_DB_NAME } from "./src/firebase/firebase-config.js";
import { spawn } from "child_process";
import process from "process";

const { load } = protobuf;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: "/ws/price/socket.io",
});

let connectedClientsMarketStatus = [];
let connectedClientsPrice = [];
let connectedClientsBidAsk = [];
let connectedClientsAppConfig = [];

const priceInfoService = PriceSocketService();
const marketStatusService = MarketStatusSocketService();
// priceInfoService.handleGetPrice();

let MatchPriceMessage;
let BidAskMessage;
let PERCENT_ITEMS_RANDOM = 50;
let timeoutIdList = [];

const RANDOM_TIME_DEFAULT = {
  matchPrice: 50,
  bidAsk: 50,
  marketStatus: 60_000,
};

let speed = 1;

load("price.proto", (err, root) => {
  if (err) throw err;
  MatchPriceMessage = root.lookupType("MatchPriceMessage");
  BidAskMessage = root.lookupType("BidAskMessage");
});

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket simulator connected!");

  socket.on(EVENT_NAME.MARKET_STATUS, (msg) => {
    connectedClientsMarketStatus.push(socket.id);
  });

  socket.on(EVENT_NAME.APP_CONFIG, (msg) => {
    connectedClientsAppConfig.push(socket.id);
  });

  socket.on(EVENT_NAME.MATCH_PRICE, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg);

        // console.log('id', socket.id)
        if (Array.isArray(data?.symbols)) {
          connectedClientsPrice = connectedClientsPrice.filter(
            (item) => item.id !== socket.id
          );
          data?.symbols.length &&
            connectedClientsPrice.push({
              id: socket.id,
              symbols: data?.symbols || [],
            });

          const symbolsObj = {};
          connectedClientsPrice.forEach((item) => {
            item.symbols.forEach((s) => {
              symbolsObj[s] = true;
            });
          });
          priceInfoService.setSymbolsSubscriptionMatchPrice(
            Object.keys(symbolsObj)
          );

          // console.log('--------------------------')
          // console.log(socket.id, connectedClientsPrice)
        }
      } catch (error) {
        socket.emit("ERROR", "Message emit incorrect format");
      }
    } else {
      socket.emit("ERROR", "Message empty");
    }
  });

  socket.on(EVENT_NAME.BID_ASK, (msg) => {
    connectedClientsBidAsk = connectedClientsBidAsk.filter(
      (item) => item.id !== socket.id
    );
    if (msg) {
      try {
        const data = JSON.parse(msg);
        if (Array.isArray(data?.symbols)) {
          data?.symbols.length &&
            connectedClientsBidAsk.push({
              id: socket.id,
              symbols: data?.symbols || [],
            });
          const symbolsObj = {};
          connectedClientsBidAsk.forEach((item) => {
            item.symbols.forEach((s) => {
              symbolsObj[s] = true;
            });
          });
          console.log("connectedClientsBidAsk", connectedClientsBidAsk.length);
          priceInfoService.setSymbolsSubscriptionBidAsk(
            Object.keys(symbolsObj)
          );
        }
      } catch (error) {
        socket.emit("ERROR", "Message emit incorrect format");
      }
    } else {
      socket.emit("ERROR", "Message empty");
    }
  });

  socket.on("disconnect", () => {
    connectedClientsMarketStatus = connectedClientsMarketStatus.filter(
      (id) => socket.id !== id
    );
    connectedClientsPrice = connectedClientsPrice.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
    connectedClientsBidAsk = connectedClientsBidAsk.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
    connectedClientsAppConfig = connectedClientsAppConfig.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
  });
});
server.listen(8080, () => {
  console.log("Server is listening");
});

// firebase - db realtime
const appConfigRef = ref(db, FIREBASE_DB_NAME.APP_CONFIG);
const socketConfigRef = ref(db, FIREBASE_DB_NAME.SOCKET_CONFIG);
const marketStatusRef = ref(db, FIREBASE_DB_NAME.MARKET_STATUS);
onValue(appConfigRef, (snapshot) => {
  const configData = snapshot.val();
  connectedClientsAppConfig.forEach((clientId) => {
    io.to(clientId).emit(EVENT_NAME.APP_CONFIG, configData);
  });
});

onValue(socketConfigRef, (snapshot) => {
  const configData = snapshot.val();
  speed = configData?.speedPrice || 1;
  const stop = configData?.stopPrice;
  const restart = configData?.restart;
  if (restart) {
    set(socketConfigRef, { ...configData, restart: false });
    restartApp();
  }
  stop ? handleStopSocketPrice() : handleUpdateSpeed();
});

onValue(marketStatusRef, (snapshot) => {
  const configData = snapshot.val();
  connectedClientsMarketStatus.forEach((clientId) => {
    if (configData) {
      Object.values(configData).forEach((ms) => {
        io.to(clientId).emit(EVENT_NAME.MARKET_STATUS, ms);
      });
    }
  });
});

function handleStopSocketPrice() {
  timeoutIdList.forEach((id) => {
    clearInterval(id);
  });
}
function handleUpdateSpeed() {
  timeoutIdList.forEach((id) => {
    clearInterval(id);
  });
  timeoutIdList = [];

  for (let index = 0; index < speed; index++) {
    const priceIntervalID = setInterval(() => {
      const listPrice = priceInfoService.getRandomPrice(PERCENT_ITEMS_RANDOM);

      if (listPrice) {
        listPrice.forEach((item) => {
          if ((MatchPriceMessage, item)) {
            const message = MatchPriceMessage.create(item);
            const buffer = MatchPriceMessage.encode(message).finish();
            connectedClientsPrice.forEach((client) => {
              if (client.symbols && client.symbols.includes(item.symbol)) {
                io.to(client.id).emit(EVENT_NAME.MATCH_PRICE, buffer);
              }
            });
          }
        });
      }
    }, RANDOM_TIME_DEFAULT.matchPrice);

    const bidAskIntervalID = setInterval(() => {
      const listBidAsk = priceInfoService.getRandomBidAsk(PERCENT_ITEMS_RANDOM);
      if (listBidAsk) {
        listBidAsk.forEach((item) => {
          if ((BidAskMessage, item)) {
            const message = BidAskMessage.create(item);
            const buffer = BidAskMessage.encode(message).finish();
            connectedClientsBidAsk.forEach((client) => {
              if (client.symbols && client.symbols.includes(item.symbol)) {
                io.to(client.id).emit(EVENT_NAME.BID_ASK, buffer);
              }
            });
          }
        });
      }
    }, RANDOM_TIME_DEFAULT.bidAsk);

    timeoutIdList = [...timeoutIdList, priceIntervalID, bidAskIntervalID];
  }
}

function restartApp() {
  timeoutIdList.forEach((id) => clearInterval(id));
  timeoutIdList = [];

  server.close(() => {
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000);
}
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    process.exit(1);
  } else {
    throw err;
  }
});
