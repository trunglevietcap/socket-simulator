// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  path: "/ws/price/socket.io",
});

const EVENT_NAME = {
  BID_ASK: "bid-ask",
  MATCH_PRICE: "match-price",
  ODD_LOT_BID_ASK: "odd-lot-bid-ask",
  ODD_LOT_MATCH_PRICE: "odd-lot-match-price",
  INDEX: "index",
  PUT_THROUGH: "put-through",
  ADVERTISE: "advertise",
  BATCH_JOB_STREAMING: "batch-job-streaming",
  HNX_BOND_PRICE: "hnx-price-new-streaming",
  MARKET_STATUS: "market-status",
  APP_CONFIG: "app-config",
};

const MESSAGE_ALL_CLIENT_SEND = '[{"type":"all"}]';

let connectedClients = [];
const MARKET_STATUS_INTERVAL = 10000;
io.on("connection", (socket) => {
  // gui cho 1 user
  socket.emit("SUCCESS", "HELLO WOLD - socket simulator connected!");

  socket.on(EVENT_NAME.MARKET_STATUS, (msg) => {
    if (MESSAGE_ALL_CLIENT_SEND === msg) {
      connectedClients.push(socket.id);
    } else {
      socket.emit("ERROR", "Message emit incorrect format");
    }
  });

  setInterval(() => {
    connectedClients.forEach((clientId) => {
      const marketStatus = getRandomMarketStatus();
      console.log(EVENT_NAME.MARKET_STATUS, marketStatus);
      io.to(clientId).emit(EVENT_NAME.MARKET_STATUS, marketStatus);
    });
  }, MARKET_STATUS_INTERVAL);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 9000");
});

const MARKET_STATUS = {
  STARTED: "STARTED",
  ATO: "ATO",
  LO_MORNING: "LO_MORNING",
  LUNCH_BREAK: "LUNCH_BREAK",
  LO_AFTERNOON: "LO_AFTERNOON",
  ATC: "ATC",
  ENDED: "ENDED",
  EXTEND_HOUR: "EXTEND_HOUR",
  CLOSED: "CLOSED",
};

const BOARD = {
  HOSE: "HOSE",
  HNX: "HNX",
  UPCOM: "UPCOM",
  DERIVATIVE: "DERIVATIVE",
  BOND: "BOND",
};

function getRandomMarketStatus() {
  const boards = Object.values(BOARD);
  const indexBoardRandom = +(Math.random() * 10000).toFixed(0) % boards.length;
  const boardRandom = boards[indexBoardRandom];
  const marketStatusBoard = getMarketStatus(boardRandom);
  const indexMarketStatus = Date.now() % marketStatusBoard.length;
  return marketStatusBoard[indexMarketStatus];
}

function getMarketStatus(board) {
  return Object.values(MARKET_STATUS).map((status) => ({
    marketCode: board,
    messageType: "SC",
    receivedTime: new Date().toString(),
    status,
  }));
}
