// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  path: "/ws/price/socket.io",
});

let connectedClients = [];
const MARKET_STATUS_INTERVAL = 10000;
io.on("connection", (socket) => {
  // gui cho 1 user
  socket.emit("message", "HELLO WOLD - socket simulator connected!");

  socket.on("market-status", (msg) => {
    connectedClients.push(socket.id);
  });

  setInterval(() => {
    connectedClients.forEach((clientId) => {
      const marketStatus = getRandomMarketStatus();
      io.to(clientId).emit("market-status", marketStatus);
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
  const indexBoardRandom = (Math.random() * 1000) % boards.length;
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
