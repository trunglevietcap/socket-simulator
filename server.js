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

let Message;
load("price.proto", (err, root) => {
  if (err) throw err;
  Message = root.lookupType("MatchPriceMessage");
  // const message = Message.create(PRICE_SOCKET_SAMPLE);
  // const buffer = Message.encode(message).finish();
  // socket.emit(EVENT_NAME.MARKET_STATUS, buffer);
});

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket simulator connected!");

  load("price.proto", (err, root) => {
    if (err) throw err;
    const Message = root.lookupType("MatchPriceMessage");
    const message = Message.create(PRICE_SOCKET_SAMPLE);
    const buffer = Message.encode(message).finish();
    socket.emit(EVENT_NAME.MARKET_STATUS, buffer);
  });

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

  intervalMarketStatus = setInterval(() => {
    if (indexMarketStatus >= boards.length) {
      indexMarketStatus = 0;
    }
    boards.forEach((board) => {
      const marketStatus = getRandomMarketStatus(board, indexMarketStatus);
      io.emit(EVENT_NAME.MARKET_STATUS, marketStatus);
    });
    indexMarketStatus++;
  }, MARKET_STATUS_INTERVAL);

  intervalPrice = setInterval(() => {
    if (Message) {
      let random = +(Math.random() * 100).toFixed(0);
      random = random % 2 === 0 ? random : -random;
      const price = {
        ...PRICE_SOCKET_SAMPLE,
        matchPrice: PRICE_SOCKET_SAMPLE.matchPrice + random,
      };
      const message = Message.create(price);
      const buffer = Message.encode(message).finish();
      connectedClientsPrice.forEach((client) => {
        if (!client?.symbols?.length) {
          connectedClientsPrice.splice(index, 1);
        } else if (client.symbols.includes(price.symbol)) {
          io.to(client.id).emit(EVENT_NAME.MATCH_PRICE, buffer);
        }
      });
    }
  }, 1000);

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

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});

// http://localhost:5000/
