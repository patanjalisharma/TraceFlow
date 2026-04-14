import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failure"],
      required: true,
    },
    message: {
      type: String,
    },
    latency: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Log = mongoose.model("Log", logSchema);