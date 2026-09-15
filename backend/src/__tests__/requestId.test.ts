import { describe, it, expect, vi } from "vitest";
import { requestIdMiddleware, REQUEST_ID_HEADER } from "../middleware/requestId.js";

describe("RequestId Middleware", () => {
  it("should generate a new request id if none is provided", () => {
    const req: any = {
      header: vi.fn().mockReturnValue(undefined),
    };
    const headers: Record<string, string> = {};
    const res: any = {
      setHeader: (key: string, val: string) => {
        headers[key] = val;
      },
      on: vi.fn(),
    };
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.id).toBeDefined();
    expect(req.startTime).toBeDefined();
    expect(headers[REQUEST_ID_HEADER]).toBe(req.id);
    expect(next).toHaveBeenCalled();
  });

  it("should preserve valid incoming request id", () => {
    const existingId = "client-trace-12345678";
    const req: any = {
      header: vi.fn().mockReturnValue(existingId),
    };
    const headers: Record<string, string> = {};
    const res: any = {
      setHeader: (key: string, val: string) => {
        headers[key] = val;
      },
      on: vi.fn(),
    };
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.id).toBe(existingId);
    expect(headers[REQUEST_ID_HEADER]).toBe(existingId);
    expect(next).toHaveBeenCalled();
  });
});
