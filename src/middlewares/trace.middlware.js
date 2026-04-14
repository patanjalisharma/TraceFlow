import { v4 as uuidv4 } from "uuid";

export function traceMiddleware(req, res, next) {
  req.startTime = Date.now();
  let traceId = req.headers["x-trace-id"];
  if (!traceId) {
    traceId = uuidv4();
  }
  req.traceId = traceId;

  console.log(`[${req.method} ${req.url}] TraceId: ${traceId}`);
  res.setHeader("x-trace-id", traceId);
  next();
}
