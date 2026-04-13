import { Log } from "../models/Log.js";
export function delaySimulation(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
export async function authService(traceId) {
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
      traceId: traceId,
      service: "auth-service",
      status: "success",
      message: "Authentication successful",
      latency: latency,
    });
    return { success: true };
  } catch (error) {
    const latency = Date.now() - start;
    await Log.create({
      traceId: traceId,
      service: "auth-service",
      status: "failure",
      message: error.message,
      latency: latency,
    });
    return { success: false, error: error.message };
  }
}
