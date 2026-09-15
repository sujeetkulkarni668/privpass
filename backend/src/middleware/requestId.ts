import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const REQUEST_ID_HEADER = "x-request-id";

export interface RequestWithId extends Request {
  id?: string;
  startTime?: number;
}

export function requestIdMiddleware(
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void {
  const incomingId = req.header(REQUEST_ID_HEADER);
  const requestId = (incomingId && /^[a-zA-Z0-9_-]{8,64}$/.test(incomingId))
    ? incomingId
    : crypto.randomUUID();

  req.id = requestId;
  req.startTime = Date.now();
  res.setHeader(REQUEST_ID_HEADER, requestId);

  res.on("finish", () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;
    res.setHeader("x-response-time-ms", duration.toString());
  });

  next();
}
