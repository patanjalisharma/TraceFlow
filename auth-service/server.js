import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authController from "./controller/auth.controller.js";

dotenv.config();

const app = express();
app.use(express.json());

// route
app.post("/auth", authController);

// health check
app.get("/health", (req, res) => {
  res.json({ service: "auth-service", status: "running" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, async () => {
  console.log(`Auth service running on ${PORT}`);
  await connectDB();
});