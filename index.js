import express from "express";
import { createServer } from "http";
import protobuf from "protobufjs"; // Import default
import { PRICE_SOCKET_SAMPLE } from "./src/price.socket.js";
import {
  EVENT_NAME,
  MESSAGE_ALL_CLIENT_SEND,
  BOARD,
} from "./src/constants.js";
import { Server } from "socket.io";
import { PriceSocketService } from "./src/price/index.js";
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
const boards = Object.values(BOARD);
const priceInfoService = PriceSocketService();
let Message;
const MARKET_STATUS_INTERVAL = 20000;

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
    const listPrice = priceInfoService.getRandomPrice(20);
    if(listPrice) {
      listPrice.forEach(item=>{
        if ((Message, item)) {
          const message = Message.create(item);
          const buffer = Message.encode(message).finish();
          connectedClientsPrice.forEach((client) => {
            if (!client?.symbols?.length) {
              connectedClientsPrice.splice(index, 1);
            } else if ( client.symbols && client.symbols.includes(item.symbol)) {
              setTimeout(()=>{

                io.to(client.id).emit(EVENT_NAME.MATCH_PRICE, buffer);
              }, Math.random() * 1000)
            }
          });
        }
      })
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

server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
