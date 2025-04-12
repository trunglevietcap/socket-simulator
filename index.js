import express from "express";
import { createServer } from "http";
import protobuf from "protobufjs"; // Import default
import { EVENT_NAME, MESSAGE_ALL_CLIENT_SEND } from "./src/constants.js";
import { Server } from "socket.io";
import { PriceSocketService } from "./src/price/index.js";
import {
  MarketStatusSocketService,
  MARKET_STATUS_INTERVAL,
} from "./src/market-status/index.js";
const { load } = protobuf;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: "/ws/price/socket.io",
});
let connectedClientsMarketStatus = [];
let connectedClientsPrice = [];
let intervalMarketStatus = null;
let intervalPrice = null;
const priceInfoService = PriceSocketService();
const marketStatusService = MarketStatusSocketService();
let Message;

load("price.proto", (err, root) => {
  if (err) throw err;
  Message = root.lookupType("MatchPriceMessage");
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
    // console.log(msg)
  });

  if (intervalMarketStatus) {
    clearInterval(intervalMarketStatus);
    intervalMarketStatus = null;
  }
  if (intervalPrice) {
    clearInterval(intervalPrice);
    intervalPrice = null;
  }

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    connectedClientsMarketStatus = connectedClientsMarketStatus.filter(
      (id) => socket.id !== id
    );
    connectedClientsPrice = connectedClientsPrice.filter(
      (item) => socket.id !== item.id && !item?.symbols?.length
    );
  });
});

setInterval(() => {
  const listPrice = priceInfoService.getRandomPrice(20);
  if (listPrice) {
    listPrice.forEach((item) => {
      if ((Message, item)) {
        const message = Message.create(item);
        const buffer = Message.encode(message).finish();
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
}, 1000);

setInterval(() => {
  const radomMarketStatusList = marketStatusService.getRandomMarketStatus();
  radomMarketStatusList.forEach((marketStatus) => {
    io.emit(EVENT_NAME.MARKET_STATUS, marketStatus);
  });
}, MARKET_STATUS_INTERVAL);

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
