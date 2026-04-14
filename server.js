import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { connectDB } from "./src/config/db.js";
import { Log } from "./src/models/Log.js";
import { traceMiddleware } from "./src/middlewares/trace.middlware.js";
import axios from "axios";
// import { authService } from "./src/services/auth.service.js";
 //import { orderService } from "./src/services/order.service.js";
 //import { paymentService } from "./src/services/payment.service.js";
dotenv.config();
const app = express();
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 15, 
//   message: {
//     status: "failure",
//     message: "Too many requests, try again later",
//   },
// });


const simulateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    status: "failure",
     message: "Too many requests, try again later",
  },
}); 

const logsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    status: "failure",
     message: "Too many requests, try again later",
  },
});

app.use(express.json());
//app.use(limiter);
app.use(traceMiddleware);
app.use(express.static("public"))
app.get("/health", (req, res) => {
  res.json("Everything is fine");
});

const port = process.env.PORT || 3000;

// app.post("/test", (req, res) => {
//     Log.create({
//         traceId: "12345",
//         service: "test-service",
//         status: "success",
//         message: "Test log entry",
//         latency: 100
//     })
//     res.json("Log entry created")
//     })

app.post("/simulate",simulateLimiter, async (req, res) => {
  const traceId = req.traceId;

  try {
    const authResponse = await axios.post(
  "http://localhost:3001/auth",
  {},
  {
    headers: {
      "x-trace-id": traceId,
    },
    validateStatus: () => true, // important
  }
);

const authResult = authResponse.data;
    if (!authResult.success) {
      return res.status(401).json({
        traceId,
        failedAt: "auth-service",
        status: "failure",
      });
    }
    const headers = {
  "x-trace-id": traceId,
};

// ORDER SERVICE
const orderResponse = await axios.post(
  "http://localhost:3002/order",
  {},
  {
    headers,
    validateStatus: () => true,
  }
);

if (!orderResponse.data.success) {
  return res.status(400).json({
    traceId,
    failedAt: "order-service",
    status: "failure",
  });
}

// PAYMENT SERVICE
const paymentResponse = await axios.post(
  "http://localhost:3003/payment",
  {},
  {
    headers,
    validateStatus: () => true,
  }
);

if (!paymentResponse.data.success) {
  return res.status(402).json({
    traceId,
    failedAt: "payment-service",
    status: "failure",
  });
}

    return res.json({
      traceId,
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      traceId,
      status: "failure",
      message: error.message,
    });
  }
});




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

app.listen(port, () => {
  console.log(`Server running on ${port}`);
  connectDB();
});
