import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import paymentController from "./controller/payment.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/payment", paymentController);

app.get("/health", (req, res) => {
  res.json({ service: "payment-service", status: "running" });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, async () => {
  console.log(`Payment service running on ${PORT}`);
  await connectDB();
});