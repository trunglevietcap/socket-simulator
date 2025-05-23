import express from "express";
import serverless from "serverless-http";

const app = express();

// Ví dụ route
app.get("/", (req, res) => {
  res.send("Hello from Serverless Express!");
});

// Export handler để Railway gọi khi có request
export const handler = serverless(app);