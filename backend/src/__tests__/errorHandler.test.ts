import { describe, it, expect, vi } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  errorHandler,
} from "../middleware/errorHandler.js";

describe("ErrorHandler Middleware", () => {
  it("should create AppError with status and code", () => {
    const err = new AppError("Something went wrong", 500, "CUSTOM_ERR");
    expect(err.message).toBe("Something went wrong");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("CUSTOM_ERR");
  });

  it("should create NotFoundError with 404 status", () => {
    const err = new NotFoundError("Credential", "cred-123");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Credential 'cred-123' not found");
  });

  it("should create UnauthorizedError with 401 status", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });

  it("should format problem details correctly in express middleware", () => {
    const err = new ValidationError("Invalid parameters", [
      { name: "email", reason: "email is invalid" },
    ]);

    const req: any = {
      originalUrl: "/api/v1/verify",
      method: "POST",
      log: { warn: vi.fn() },
    };

    let responseStatus: number | null = null;
    let responseBody: any = null;

    const res: any = {
      status(s: number) {
        responseStatus = s;
        return this;
      },
      json(b: any) {
        responseBody = b;
        return this;
      },
    };

    errorHandler(err, req, res, vi.fn());

    expect(responseStatus).toBe(400);
    expect(responseBody.title).toBe("AppError");
    expect(responseBody.detail).toBe("Invalid parameters");
    expect(responseBody.invalidParams).toHaveLength(1);
    expect(responseBody.invalidParams[0].name).toBe("email");
  });
});
