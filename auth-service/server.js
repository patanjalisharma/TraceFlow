import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authController from "./controller/auth.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

// route
app.post("/auth", authController);
const shouldFail = (probability) => {
  return Math.random() < probability;
};
app.post("/login", (req, res) => {
  const traceId = req.headers["x-trace-id"];

  if (!req.body.username) {
    return res.status(400).json({
      status: "failure",
      message: "Username is required",
      traceId
    });
  }

  if (shouldFail(0.3)) {
    return res.status(401).json({
      status: "failure",
      message: "Authentication failed (simulated)",
      traceId
    });
  }

  res.json({
    status: "success",
    message: "User authenticated successfully",
    userId: Math.floor(Math.random() * 1000),
    traceId
  });
});
// health check
app.get("/health", (req, res) => {
  res.json({ service: "auth-service", status: "running" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Auth service running on ${PORT}`);
  await connectDB();
});