import { Log } from "../models/Log.js";
function delaySimulation(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export default async function orderController(req, res) {
  const traceId = req.headers["x-trace-id"];
  const start = Date.now();

  try {
    const delay = Math.floor(Math.random() * 200) + 100;
    await delaySimulation(delay);

    const isSuccess = Math.random() < 0.9;

    if (!isSuccess) {
      throw new Error("Order processing failed");
    }

    const latency = Date.now() - start;

    await Log.create({
      traceId,
      service: "order-service",
      status: "success",
      message: "Order processed successfully",
      latency,
    });

    return res.json({ success: true });
  } catch (error) {
    const latency = Date.now() - start;

    await Log.create({
      traceId,
      service: "order-service",
      status: "failure",
      message: error.message,
      latency,
    });

    return res.status(400).json({ success: false });
  }
}