import { Log } from "../models/Log.js";

export function delaySimulation(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function orderService(traceId) {
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
            traceId: traceId,
            service: "order-service",
            status: "success",
            message: "Order processed successfully",
            latency: latency,
        });

        return { success: true };
    } catch (error) {
        const latency = Date.now() - start;

        await Log.create({
            traceId: traceId,
            service: "order-service",
            status: "failure",
            message: "Order processing failed",
            latency: latency,
        });

        return { success: false, error: error.message };
    }
}