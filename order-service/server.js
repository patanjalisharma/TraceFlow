import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import orderController from "./controller/order.controller.js";

dotenv.config();

const app = express();
app.use(express.json());
const shouldFail = (probability) => {
  return Math.random() < probability;
};
app.post("/order", orderController);
app.post("/create", (req, res) => {
  const traceId = req.headers["x-trace-id"];

  if (shouldFail(0.2)) {
    return res.status(400).json({
      status: "failure",
      message: "Order creation failed (inventory issue)",
      traceId
    });
  }

  res.json({
    status: "success",
    message: "Order created successfully",
    orderId: Math.floor(Math.random() * 10000),
    traceId
  });
});
app.get("/health", (req, res) => {
  res.json({ service: "order-service", status: "running" });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`Order service running on ${PORT}`);
  await connectDB();
});