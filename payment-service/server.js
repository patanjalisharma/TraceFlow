import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import paymentController from "./controller/payment.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/payment", paymentController);
const shouldFail = (probability) => {
  return Math.random() < probability;
};
app.post("/pay", (req, res) => {
  const traceId = req.headers["x-trace-id"];

  if (shouldFail(0.25)) {
    return res.status(402).json({
      status: "failure",
      message: "Payment failed (insufficient funds)",
      traceId
    });
  }

  res.json({
    status: "success",
    message: "Payment processed successfully",
    transactionId: Math.floor(Math.random() * 100000),
    traceId
  });
});
app.get("/health", (req, res) => {
  res.json({ service: "payment-service", status: "running" });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, async () => {
  console.log(`Payment service running on ${PORT}`);
  await connectDB();
});