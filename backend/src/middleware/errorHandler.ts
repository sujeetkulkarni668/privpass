import type { Request, Response, NextFunction } from "express";

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
  timestamp: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly invalidParams?: Array<{ name: string; reason: string }>;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    invalidParams?: Array<{ name: string; reason: string }>
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.invalidParams = invalidParams;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", identifier?: string) {
    const detail = identifier ? `${resource} '${identifier}' not found` : `${resource} not found`;
    super(detail, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", invalidParams?: Array<{ name: string; reason: string }>) {
    super(message, 400, "VALIDATION_ERROR", invalidParams);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || (typeof err.status === "number" ? err.status : 500);
  const code = err.code || (statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "ERROR");

  if (statusCode >= 500) {
    (req as any).log?.error?.({ err, path: req.path, method: req.method }, "Server error");
  } else {
    (req as any).log?.warn?.({ err, path: req.path, method: req.method }, "Client error");
  }

  const problem: ProblemDetails = {
    type: `https://privpass.id/errors/${code.toLowerCase()}`,
    title: err.name || "Application Error",
    status: statusCode,
    detail: err.message || "An unexpected error occurred",
    instance: req.originalUrl || req.url,
    timestamp: new Date().toISOString(),
  };

  if (err.invalidParams) {
    problem.invalidParams = err.invalidParams;
  }

  res.status(statusCode).json(problem);
}
