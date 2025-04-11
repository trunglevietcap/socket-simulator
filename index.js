import express from "express";
import { createServer } from "http";
import protobuf from "protobufjs"; // Import default
import { PRICE_SOCKET_SAMPLE } from "./src/price.socket.js";
import {
  EVENT_NAME,
  MESSAGE_ALL_CLIENT_SEND,
  BOARD,
  MARKET_STATUS_INTERVAL,
} from "./src/constants.js";
import { Server } from "socket.io";
import { getRandomMarketStatus } from "./src/helpers.js";
import { PriceSocketService } from "./src/price/index.js";
const { load } = protobuf;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  path: "/ws/price/socket.io",
});
let connectedClientsMarketStatus = [];
let connectedClientsPrice = [];
let indexMarketStatus = 0;
let intervalMarketStatus = null;
let intervalPrice = null;
const boards = Object.values(BOARD);
const priceInfoService = PriceSocketService();

let Message;

let priceInfo = {};
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

  if (intervalMarketStatus) {
    clearInterval(intervalMarketStatus);
    intervalMarketStatus = null;
  }
  if (intervalPrice) {
    clearInterval(intervalPrice);
    intervalPrice = null;
  }

  // intervalMarketStatus = setInterval(() => {
  //   if (indexMarketStatus >= boards.length) {
  //     indexMarketStatus = 0;
  //   }
  //   boards.forEach((board) => {
  //     const marketStatus = getRandomMarketStatus(board, indexMarketStatus);
  //     io.emit(EVENT_NAME.MARKET_STATUS, marketStatus);
  //   });
  //   indexMarketStatus++;
  // }, MARKET_STATUS_INTERVAL);

  intervalPrice = setInterval(() => {
    const priceRandom = priceInfoService.getRandomPrice();
    if ((Message, priceRandom)) {
      const message = Message.create(priceRandom);
      const buffer = Message.encode(message).finish();
      connectedClientsPrice.forEach((client) => {
        if (!client?.symbols?.length) {
          connectedClientsPrice.splice(index, 1);
        } else if ( client.symbols && client.symbols.includes(priceRandom.symbol)) {
          io.to(client.id).emit(EVENT_NAME.MATCH_PRICE, buffer);
        }
      });
    }
  }, 8);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    connectedClientsMarketStatus = connectedClientsMarketStatus.filter(
      (id) => socket.id !== id
    );
    connectedClientsPrice = connectedClientsPrice.filter(
      (item) => socket.id !== item.id
    );
  });
});

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
