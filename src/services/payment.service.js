import { Log } from "../models/Log.js";

export function delaySimulation(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}

export async function paymentService(traceId) {
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
            traceId: traceId,
            service: "payment-service",
            status: "success",
            message: "Payment processed successfully",
            latency: latency,
        });

        return { success: true };
    } catch (error) {
        const latency = Date.now() - start;

        await Log.create({
            traceId: traceId,
            service: "payment-service",
            status: "failure",
            message: "Payment processing failed",
            latency: latency,
        });

        return { success: false, error: error.message };
    }
}