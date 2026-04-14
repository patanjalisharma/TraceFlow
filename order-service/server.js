import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import orderController from "./controller/order.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/order", orderController);

app.get("/health", (req, res) => {
  res.json({ service: "order-service", status: "running" });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
  console.log(`Order service running on ${PORT}`);
  await connectDB();
});