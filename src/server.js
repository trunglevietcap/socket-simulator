import express from "express";
import { createServer } from "http";

const app = express();
export const server = createServer(app);
server.listen(8080, () => {
    console.log("Server is listening");
  });