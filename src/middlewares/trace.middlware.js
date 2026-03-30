import { v4 as uuidv4 } from 'uuid';

export function traceMiddleware(req, res, next) {
    const traceId = uuidv4();
    req.traceId = traceId;
    console.log(`TraceId: ${req.traceId}`)
    next();
}