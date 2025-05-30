import { Server } from "socket.io";
import { onValue } from "firebase/database";
import { socketChartConfigRef } from "../firebase/firebase-config.js";
import { server } from "../server.js";
import protobuf from "protobufjs";
import { ChartSocketService } from "../chart/index.js";

const { load } = protobuf;
const chartSocketService = ChartSocketService();
chartSocketService.getDataIndex();
const EVENT_NAME = {
  SLOW_GAP_CHART: "slow-gap-chart",
};

let ChartMessage;
let socketChartConfig;
onValue(socketChartConfigRef, (snapshot) => {
  const data = snapshot.val();
  socketChartConfig = data;
});
load("./chart.proto", (err, root) => {
  if (err) throw err;
  ChartMessage = root.lookupType("ChartMessage");
});

const io = new Server(server, {
  path: "/ws/chart/socket.io",
});

let connectedChart = [];

io.on("connection", (socket) => {
  socket.emit("SUCCESS", "HELLO WOLD - socket chart connected!");

  socket.on(EVENT_NAME.SLOW_GAP_CHART, (msg) => {
    const data = JSON.parse(msg);
    connectedChart = connectedChart.filter((client) => client.id !== socket.id);
    connectedChart.push({
      id: socket.id,
      message: data,
    });
  });
  socket.on("disconnect", () => {
    connectedChart = connectedChart.filter((client) => socket.id !== client.id);
  });
});

// Firebase

chartSocketService.randomSocketIndex((data) => {
  // console.log(data)
  connectedChart.forEach((client) => {
    const message = ChartMessage.create(data);
    const buffer = ChartMessage.encode(message).finish();
    const isListen = client.message?.some(item=>item.symbol === data.symbol)
    if (isListen) {
      io.to(client.id).emit(EVENT_NAME.SLOW_GAP_CHART, buffer);
    }
  });
});
