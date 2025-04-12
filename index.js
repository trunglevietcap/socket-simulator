import express from "express";
import { createServer } from "http";
import protobuf from "protobufjs"; // Import default
import { EVENT_NAME, MESSAGE_ALL_CLIENT_SEND } from "./src/constants.js";
import { Server } from "socket.io";
import { PriceSocketService } from "./src/price/index.js";
import { MarketStatusSocketService } from "./src/market-status/index.js";
const { load } = protobuf;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: "/ws/price/socket.io",
});
let connectedClientsMarketStatus = [];
let connectedClientsPrice = [];
let connectedClientsBidAsk = [];
let intervalMarketStatus = null;
let intervalPrice = null;
const priceInfoService = PriceSocketService();
const marketStatusService = MarketStatusSocketService();
let MatchPriceMessage;
let BidAskMessage;
let TIME_OUT_UPDATE_SPEED = 10_000;

const RANDOM_TIME_DEFAULT = {
  matchPrice: 100,
  bidAsk: 100,
  marketStatus: 20_000,
};

const SPEED_PRICE_DEFAULT = {
  matchPrice: 100,
  bidAsk: 100,
  marketStatus: 100,
};

let speedPrice = {
  matchPrice: SPEED_PRICE_DEFAULT.matchPrice,
  bidAsk: SPEED_PRICE_DEFAULT.bidAsk,
  marketStatus: SPEED_PRICE_DEFAULT.marketStatus,
};
let marketStatusIntervalID = null;
let priceIntervalID = null;
let bidAskIntervalID = null;

load("price.proto", (err, root) => {
  if (err) throw err;
  MatchPriceMessage = root.lookupType("MatchPriceMessage");
  BidAskMessage = root.lookupType("BidAskMessage");
});

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket simulator connected!");

  socket.on(EVENT_NAME.MARKET_STATUS, (msg) => {
    if (MESSAGE_ALL_CLIENT_SEND === msg) {
      connectedClientsMarketStatus.push(socket.id);
    } else {
      socket.emit("ERROR", "Message emit incorrect format");
    }
  });

  socket.on(EVENT_NAME.MATCH_PRICE, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg);
        if (data?.symbols?.length && Array.isArray(data?.symbols)) {
          priceInfoService.handleGetPrice(data?.symbols);
          connectedClientsPrice.push({
            id: socket.id,
            symbols: data?.symbols || [],
          });
        }
      } catch (error) {
        socket.emit("ERROR", "Message emit incorrect format");
      }
    } else {
      socket.emit("ERROR", "Message empty");
    }
  });

  socket.on(EVENT_NAME.BID_ASK, (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg);
        if (data?.symbols?.length && Array.isArray(data?.symbols)) {
          connectedClientsBidAsk.push({
            id: socket.id,
            symbols: data?.symbols || [],
          });
        }
      } catch (error) {
        socket.emit("ERROR", "Message emit incorrect format");
      }
    } else {
      socket.emit("ERROR", "Message empty");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    connectedClientsMarketStatus = connectedClientsMarketStatus.filter(
      (id) => socket.id !== id
    );
    connectedClientsPrice = connectedClientsPrice.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
    connectedClientsBidAsk = connectedClientsBidAsk.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
  });
});
server.listen(8080, () => {
  console.log("Server is listening");
});

setInterval(() => {
  const randomNumber = +(Math.random() * 10000).toFixed(0) % 100;
  const random3 = +(Math.random() * 10000).toFixed(0) % 3;
  if (random3 === 0) {
    speedPrice = {
      matchPrice: 2,
      bidAsk: 2,
      marketStatus: 100,
    };
  } else {
    speedPrice = {
      matchPrice: randomNumber,
      bidAsk: randomNumber,
      marketStatus: 100,
    };
  }
  setIntervalSocket(speedPrice);
}, TIME_OUT_UPDATE_SPEED);

setIntervalSocket(speedPrice);
function setIntervalSocket(speedPrice) {
  clearInterval(priceIntervalID);
  clearInterval(bidAskIntervalID);
  clearInterval(marketStatusIntervalID);
  priceIntervalID = setInterval(() => {
    const listPrice = priceInfoService.getRandomPrice(speedPrice.matchPrice);
    if (listPrice) {
      listPrice.forEach((item) => {
        if ((MatchPriceMessage, item)) {
          const message = MatchPriceMessage.create(item);
          const buffer = MatchPriceMessage.encode(message).finish();
          connectedClientsPrice.forEach((client) => {
            if (client.symbols && client.symbols.includes(item.symbol)) {
              setTimeout(() => {
                io.to(client.id).emit(EVENT_NAME.MATCH_PRICE, buffer);
              }, Math.random() * 500);
            }
          });
        }
      });
    }
  }, RANDOM_TIME_DEFAULT.matchPrice);

  bidAskIntervalID = setInterval(() => {
    const listBidAsk = priceInfoService.getRandomBidAsk(speedPrice.bidAsk);
    if (listBidAsk) {
      listBidAsk.forEach((item) => {
        if ((BidAskMessage, item)) {
          const message = BidAskMessage.create(item);
          const buffer = BidAskMessage.encode(message).finish();
          connectedClientsBidAsk.forEach((client) => {
            if (client.symbols && client.symbols.includes(item.symbol)) {
              setTimeout(() => {
                io.to(client.id).emit(EVENT_NAME.BID_ASK, buffer);
              }, Math.random() * 500);
            }
          });
        }
      });
    }
  }, RANDOM_TIME_DEFAULT.bidAsk);

  marketStatusIntervalID = setInterval(() => {
    const radomMarketStatusList = marketStatusService.getRandomMarketStatus();
    radomMarketStatusList.forEach((marketStatus) => {
      io.emit(EVENT_NAME.MARKET_STATUS, marketStatus);
    });
  }, RANDOM_TIME_DEFAULT.marketStatus);
}
