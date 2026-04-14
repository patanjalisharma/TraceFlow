import { Log } from "../models/Log.js";

function delaySimulation(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export default async function paymentController(req, res) {
  const traceId = req.headers["x-trace-id"];
  const start = Date.now();

  try {
    const delay = Math.floor(Math.random() * 400) + 100;
    await delaySimulation(delay);

    const isSuccess = Math.random() < 0.7;

    if (!isSuccess) {
      throw new Error("Payment processing failed");
    }

    const latency = Date.now() - start;

    await Log.create({
      traceId,
      service: "payment-service",
      status: "success",
      message: "Payment processed successfully",
      latency,
    });

    return res.json({ success: true });
  } catch (error) {
    const latency = Date.now() - start;

    await Log.create({
      traceId,
      service: "payment-service",
      status: "failure",
      message: error.message,
      latency,
    });

    return res.status(402).json({ success: false });
  }
}
