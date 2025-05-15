import express from "express";
import { createServer } from "http";
import protobuf from "protobufjs"; // Import default
import { EVENT_NAME } from "./src/constants.js";
import { Server } from "socket.io";
import { PriceSocketService } from "./src/price/index.js";
import { onValue, set } from "firebase/database";
import {
  bidAskRef,
  matchPriceRef,
  topStockGainerRef,
  topStockLoserRef,
  socketConfigRef,
  appConfigRef,
  reUpdatePriceRef,
  topStockGroupRef,
  indexRef,
  matchPriceBuyInRef,
  bidAskBuyInRef,
  marketStatusHNXRef,
  marketStatusHOSERef,
  marketStatusUPCOMRef,
  marketStatusDERIVATIVESRef,
  marketTopStockChangeRef,
} from "./src/firebase/firebase-config.js";
import './order-book.js'

const { load } = protobuf;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: "/ws/price/socket.io",
});

let connectedClientsMarketStatus = [];
let connectedClientsPrice = [];
let connectedClientsPriceBuyIn = [];
let connectedClientsBidAsk = [];
let connectedClientsBidAskBuyIn = [];
let connectedClientsAppConfig = [];
let connectedClientTopStockChange = [];
let connectedClientTopStockGroup = [];
let connectedClientIndex = [];
let connectedMarketDataTopStockPricesChange = [];

const priceInfoService = PriceSocketService();

let MatchPriceMessage;
let BidAskMessage;
let IndexMessage;
let PERCENT_ITEMS_RANDOM = 50;
let timeoutIdList = [];

const RANDOM_TIME_DEFAULT = {
  matchPrice: 500,
  bidAsk: 400,
  topStockGroupStreaming: 10000,
  topStockChangeStreaming: 15000,
};

let speed = 1;

function handleGetPrice() {
  priceInfoService.handleGetPrice();
}

handleGetPrice();

load("price.proto", (err, root) => {
  if (err) throw err;
  MatchPriceMessage = root.lookupType("MatchPriceMessage");
  BidAskMessage = root.lookupType("BidAskMessage");
  IndexMessage = root.lookupType("IndexMessage");
});

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket simulator connected!");

  socket.on(EVENT_NAME.MARKET_STATUS, (msg) => {
    connectedClientsMarketStatus = connectedClientsMarketStatus.filter(
      (id) => id !== socket.id
    );
    connectedClientsMarketStatus.push(socket.id);
  });

  socket.on(EVENT_NAME.APP_CONFIG, (msg) => {
    connectedClientsAppConfig = connectedClientsAppConfig.filter(
      (id) => id !== socket.id
    );
    connectedClientsAppConfig.push(socket.id);
  });

  socket.on(EVENT_NAME.TOP_STOCK_CHANGE_STREAMING, (msg) => {
    connectedClientTopStockChange = connectedClientTopStockChange.filter(
      (id) => id !== socket.id
    );
    connectedClientTopStockChange.push(socket.id);
  });
  socket.on(EVENT_NAME.TOP_STOCK_GROUP_STREAMING, (msg) => {
    connectedClientTopStockGroup = connectedClientTopStockGroup.filter(
      (id) => id !== socket.id
    );
    connectedClientTopStockGroup.push(socket.id);
  });

  socket.on(EVENT_NAME.MARKET_DATA_TOP_STOCK_PRICES_CHANGE, (msg) => {
    connectedMarketDataTopStockPricesChange =
      connectedMarketDataTopStockPricesChange.filter((id) => id !== socket.id);
    connectedMarketDataTopStockPricesChange.push(socket.id);
  });

  socket.on(EVENT_NAME.MATCH_PRICE, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg);
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
        }
      } catch (error) {
        socket.emit("ERROR", "Message emit incorrect format");
      }
    } else {
      socket.emit("ERROR", "Message empty");
    }
  });
  socket.on(EVENT_NAME.MATCH_PRICE_BUY_IN, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg);
        if (Array.isArray(data?.symbols)) {
          connectedClientsPriceBuyIn = connectedClientsPriceBuyIn.filter(
            (item) => item.id !== socket.id
          );
          data?.symbols.length &&
            connectedClientsPriceBuyIn.push({
              id: socket.id,
              symbols: data?.symbols || [],
            });

          const symbolsObj = {};
          connectedClientsPriceBuyIn.forEach((item) => {
            item.symbols.forEach((s) => {
              symbolsObj[s] = true;
            });
          });
          priceInfoService.setSymbolsSubscriptionMatchPrice(
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
  socket.on(EVENT_NAME.INDEX, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg);
        if (Array.isArray(data?.symbols)) {
          connectedClientIndex = connectedClientIndex.filter(
            (item) => item.id !== socket.id
          );
          data?.symbols.length &&
            connectedClientIndex.push({
              id: socket.id,
              symbols: data?.symbols || [],
            });

          const symbolsObj = {};
          connectedClientIndex.forEach((item) => {
            item.symbols.forEach((s) => {
              symbolsObj[s] = true;
            });
          });
          console.log("user-connection", socket.id);
          priceInfoService.setSymbolsSubscriptionIndex(Object.keys(symbolsObj));
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

  socket.on(EVENT_NAME.BID_ASK_BUY_IN, (msg) => {
    connectedClientsBidAskBuyIn = connectedClientsBidAskBuyIn.filter(
      (item) => item.id !== socket.id
    );
    if (msg) {
      try {
        const data = JSON.parse(msg);
        if (Array.isArray(data?.symbols)) {
          data?.symbols.length &&
            connectedClientsBidAskBuyIn.push({
              id: socket.id,
              symbols: data?.symbols || [],
            });
          const symbolsObj = {};
          connectedClientsBidAskBuyIn.forEach((item) => {
            item.symbols.forEach((s) => {
              symbolsObj[s] = true;
            });
          });
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
      (item) => socket.id !== item.id
    );
    connectedClientTopStockChange = connectedClientTopStockChange.filter(
      (item) => socket.id !== item.id
    );
    connectedClientTopStockGroup = connectedClientTopStockGroup.filter(
      (item) => socket.id !== item.id
    );
    connectedClientIndex = connectedClientIndex.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
    connectedClientsMarketStatus = connectedClientsMarketStatus.filter(
      (item) => socket.id !== item.id
    );
    connectedMarketDataTopStockPricesChange = connectedMarketDataTopStockPricesChange.filter(
      (item) => socket.id !== item.id
    );
  });
});
server.listen(8081, () => {
  console.log("Server is listening");
});

// Firebase

onValue(appConfigRef, (snapshot) => {
  const configData = snapshot.val();
  connectedClientsAppConfig.forEach((clientId) => {
    io.to(clientId).emit(EVENT_NAME.APP_CONFIG, configData);
  });
});

onValue(bidAskRef, (snapshot) => {
  const bidAskData = snapshot.val();
  const message = BidAskMessage.create(bidAskData);
  const buffer = BidAskMessage.encode(message).finish();
  connectedClientsBidAsk.forEach((client) => {
    if (client.symbols?.includes(bidAskData.symbol)) {
      io.to(client.id).emit(EVENT_NAME.BID_ASK, buffer);
    }
  });
});

onValue(bidAskBuyInRef, (snapshot) => {
  const bidAskData = snapshot.val();
  const message = BidAskMessage.create(bidAskData);
  const buffer = BidAskMessage.encode(message).finish();
  connectedClientsBidAskBuyIn.forEach((client) => {
    if (client.symbols?.includes(bidAskData.symbol)) {
      io.to(client.id).emit(EVENT_NAME.BID_ASK_BUY_IN, buffer);
    }
  });
});

onValue(matchPriceRef, (snapshot) => {
  const matchPrice = snapshot.val();
  const message = MatchPriceMessage.create(matchPrice);
  const buffer = MatchPriceMessage.encode(message).finish();
  connectedClientsPrice.forEach((client) => {
    if (client.symbols?.includes(matchPrice.symbol)) {
      io.to(client.id).emit(EVENT_NAME.MATCH_PRICE, buffer);
    }
  });
});

onValue(matchPriceBuyInRef, (snapshot) => {
  const matchPrice = snapshot.val();
  const message = MatchPriceMessage.create(matchPrice);
  const buffer = MatchPriceMessage.encode(message).finish();
  connectedClientsPriceBuyIn.forEach((client) => {
    if (client.symbols?.includes(matchPrice.symbol)) {
      io.to(client.id).emit(EVENT_NAME.MATCH_PRICE_BUY_IN, buffer);
    }
  });
});

onValue(topStockGainerRef, (snapshot) => {
  const stopStockGainer = snapshot.val();
  connectedClientTopStockChange.forEach((clientId) => {
    io.to(clientId).emit(
      EVENT_NAME.TOP_STOCK_CHANGE_STREAMING,
      stopStockGainer
    );
  });
});

onValue(topStockLoserRef, (snapshot) => {
  const topStockLoser = snapshot.val();
  connectedClientTopStockChange.forEach((clientId) => {
    io.to(clientId).emit(EVENT_NAME.TOP_STOCK_CHANGE_STREAMING, topStockLoser);
  });
});

onValue(topStockGroupRef, (snapshot) => {
  const topStockGroup = snapshot.val();
  connectedClientTopStockGroup.forEach((clientId) => {
    io.to(clientId).emit(EVENT_NAME.TOP_STOCK_GROUP_STREAMING, topStockGroup);
  });
});

onValue(socketConfigRef, (snapshot) => {
  const configData = snapshot.val();
  speed = configData?.speedPrice || 1;
  const stop = configData?.stopPrice;
  stop ? handleStopSocketPrice() : handleUpdateSpeed();
});
onValue(marketTopStockChangeRef, (snapshot) => {
  const data = snapshot.val();
  connectedMarketDataTopStockPricesChange.forEach((clientId) => {
    io.to(clientId).emit(EVENT_NAME.MARKET_DATA_TOP_STOCK_PRICES_CHANGE, data);
  });
});

onValue(reUpdatePriceRef, async (snapshot) => {
  const reUpdatePrice = snapshot.val();
  if (reUpdatePrice) {
    set(reUpdatePriceRef, false);
    handleGetPrice();
  }
});

[
  marketStatusHOSERef,
  marketStatusHNXRef,
  marketStatusDERIVATIVESRef,
  marketStatusUPCOMRef,
].forEach((item) => {
  onValue(item, (snapshot) => {
    const marketStatusData = snapshot.val();
    connectedClientsMarketStatus.forEach((clientId) => {
      if (marketStatusData) {
        io.to(clientId).emit(EVENT_NAME.MARKET_STATUS, marketStatusData);
      }
    });
  });
});
onValue(indexRef, (snapshot) => {
  const indexData = snapshot.val();
  const message = IndexMessage.create(indexData);
  const buffer = IndexMessage.encode(message).finish();
  connectedClientIndex.forEach((client) => {
    if (client.symbols && client.symbols.includes(item.symbol)) {
      io.to(client.id).emit(EVENT_NAME.INDEX, buffer);
    }
  });
});

function handleStopSocketPrice() {
  timeoutIdList.forEach((id) => {
    clearInterval(id);
  });
}

handleUpdateSpeed();
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

    const topChangeIntervalID = setInterval(() => {
      const radomTopStockChange = priceInfoService.getRandomTopStockChange();
      if (radomTopStockChange) {
        connectedClientTopStockChange.forEach((clientId) => {
          io.to(clientId).emit(
            EVENT_NAME.TOP_STOCK_CHANGE_STREAMING,
            radomTopStockChange
          );
        });
      }
    }, RANDOM_TIME_DEFAULT.topStockChangeStreaming);

    const topGroupIntervalID = setInterval(() => {
      const radomTopStockGroup = priceInfoService.getRandomTopStockGroup();
      if (radomTopStockGroup) {
        connectedClientTopStockGroup.forEach((clientId) => {
          io.to(clientId).emit(
            EVENT_NAME.TOP_STOCK_GROUP_STREAMING,
            radomTopStockGroup
          );
        });
      }
    }, RANDOM_TIME_DEFAULT.topStockGroupStreaming);

    timeoutIdList = [
      ...timeoutIdList,
      priceIntervalID,
      bidAskIntervalID,
      topChangeIntervalID,
      topGroupIntervalID,
    ];
  }
}
