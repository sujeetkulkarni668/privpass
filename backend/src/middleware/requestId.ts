import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const REQUEST_ID_HEADER = "x-request-id";

export type RequestWithId = Request & {
  startTime?: number;
};


export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const reqWithId = req as RequestWithId;

  const incomingId = req.header(REQUEST_ID_HEADER);
  const requestId = (incomingId && /^[a-zA-Z0-9_-]{8,64}$/.test(incomingId))
    ? incomingId
    : crypto.randomUUID();

  reqWithId.id = requestId;
  reqWithId.startTime = Date.now();
  res.setHeader(REQUEST_ID_HEADER, requestId);

  res.on("finish", () => {
    const duration = reqWithId.startTime ? Date.now() - reqWithId.startTime : 0;
    res.setHeader("x-response-time-ms", duration.toString());
  });


  next();
}
