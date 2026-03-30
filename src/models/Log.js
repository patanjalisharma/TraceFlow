import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    traceId: String, 
    service: String,
    status: {
        type: String,
        enum: ["success", "failure"],
        required: true
    },
    message: String,
    latency: Number,
    
}, { timestamps: true })

export const Log = mongoose.model("Log", logSchema)