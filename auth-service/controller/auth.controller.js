import { Log } from "../models/Log.js";

function delaySimulation(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export default async function authController(req, res) {
  const traceId = req.headers["x-trace-id"];
  const start = Date.now();

  try {
    const delay = Math.floor(Math.random() * 200) + 100;
    await delaySimulation(delay);

    const isSuccess = Math.random() < 0.8;

    if (!isSuccess) {
      throw new Error("Authentication failed");
    }

    const latency = Date.now() - start;

    await Log.create({
      traceId,
      service: "auth-service",
      status: "success",
      message: "Authentication successful",
      latency,
    });

    return res.json({ success: true });
  } catch (error) {
    const latency = Date.now() - start;

    await Log.create({
      traceId,
      service: "auth-service",
      status: "failure",
      message: error.message,
      latency,
    });

    return res.status(401).json({ success: false });
  }
}