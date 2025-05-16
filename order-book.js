import { Server } from "socket.io";
import { onValue } from "firebase/database";
import { orderBookRef } from "./src/firebase/firebase-config.js";
import { server } from "./index.js";

const io = new Server(server, {
  path: "/ws/order-service/socket.io",
});

let connectedOrderBook = [];

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket simulator connected!");
  connectedOrderBook = connectedOrderBook.filter((id) => id !== socket.id);
  connectedOrderBook.push(socket.id);

  socket.on("disconnect", () => {
    connectedOrderBook = connectedOrderBook.filter((id) => socket.id !== id);
  });
});

// Firebase

onValue(orderBookRef, (snapshot) => {
  const data = snapshot.val();
  connectedOrderBook.forEach((id) => {
    io.to(id).emit("order-book-streaming", data);
  });
});
