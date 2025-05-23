import { Server } from "socket.io";
import { onValue } from "firebase/database";
import { orderBookRef } from "./src/firebase/firebase-config.js";
import { server } from "./server.js";

const io = new Server(server, {
  path: "/ws/order-service/socket.io",
});
const ioDerivative = new Server(server, {
  path: "/ws/derivative-order-book/socket.io",
});

let connectedOrderBook = [];
let connectedOrderBookDerivative = [];

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket order book connected!");
  connectedOrderBook = connectedOrderBook.filter((id) => id !== socket.id);
  connectedOrderBook.push(socket.id);

  socket.on("disconnect", () => {
    connectedOrderBook = connectedOrderBook.filter((id) => socket.id !== id);
  });
});

ioDerivative.on("connection", (socket) => {
  socket.emit(
    "SUCCESS",
    "HELLO WOLD - socket order book derivative connected!"
  );
  connectedOrderBookDerivative = connectedOrderBookDerivative.filter((id) => id !== socket.id);
  connectedOrderBookDerivative.push(socket.id);

  socket.on("disconnect", () => {
    connectedOrderBookDerivative = connectedOrderBookDerivative.filter((id) => socket.id !== id);
  });
});
// Firebase

onValue(orderBookRef, (snapshot) => {
  const data = snapshot.val();
  connectedOrderBook.forEach((id) => {
    io.to(id).emit("order-book-streaming", data);
  });
});

onValue(orderBookRef, (snapshot) => {
  const data = snapshot.val();
  connectedOrderBookDerivative.forEach((id) => {
    io.to(id).emit("order-book-streaming", data);
  });
});
