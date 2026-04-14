import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/db.js";
import { Log } from "./src/models/Log.js";
import { traceMiddleware } from "./src/middlewares/trace.middlware.js";
import fs from "fs";
const services = JSON.parse(
  fs.readFileSync(new URL("./services.json", import.meta.url)),
);
import axios from "axios";
dotenv.config();
const app = express();
const logsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    status: "failure",
    message: "Too many requests, try again later",
  },
});
app.use(express.json());
app.use(traceMiddleware);
app.use(express.static("public"));
app.get("/health", (req, res) => {
  res.json("Everything is fine");
});
const port = process.env.PORT || 3000;
const limiters = {
  auth: rateLimit({ windowMs: 60 * 1000, max: 3 }),
  order: rateLimit({ windowMs: 60 * 1000, max: 5 }),
  payment: rateLimit({ windowMs: 60 * 1000, max: 2 }),
};
app.use("/:service", (req, res, next) => {
  const limiter = limiters[req.params.service];
  if (limiter) return limiter(req, res, next);
  next();
});
const gatewayHandler = async (req, res) => {
  const service = req.params.service;
  const baseURL = services[service];

  if (!baseURL) {
    return res.status(404).json({ error: "Service not found" });
  }

  const path = req.originalUrl.replace(`/${service}`, "");

  try {
    const response = await axios({
      method: req.method,
      url: baseURL + path,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        "x-trace-id": req.traceId,
      },
      validateStatus: () => true,
    });

    await Log.create({
      traceId: req.traceId,
      service,
      endpoint: path,
      method: req.method,
      status: response.data?.status === "failure" ? "failure" : "success",
      latency: Date.now() - req.startTime,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Service error",
      message: error.message,
    });
  }
};
app.get("/logs/:traceId", logsLimiter, async (req, res) => {
  const { traceId } = req.params;

  try {
    const logs = await Log.find({ traceId }).sort({ createdAt: 1 });
    if (logs.length === 0) {
      return res.status(404).json({
        message: "No logs found for this traceId",
      });
    }

    const steps = logs.map((log) => ({
      service: log.service,
      status: log.status,
    }));

    let failedAt = null;
    for (let log of logs) {
      if (log.status === "failure") {
        failedAt = log.service;
        break;
      }
    }

    const overallStatus = failedAt ? "failure" : "success";
    return res.json({
      traceId,
      status: overallStatus,
      failedAt,
      steps,
    });

    // return res.json({ logs });
  } catch (error) {
    return res.status(500).json({
      traceId,
      status: "failure",
      message: error.message,
    });
  }
});
app.use("/:service", gatewayHandler);

app.listen(port, () => {
  console.log(`Server running on ${port}`);
  connectDB();
});
