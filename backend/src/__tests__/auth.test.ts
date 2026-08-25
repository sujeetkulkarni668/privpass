/**
 * auth.test.ts — Tests for the username/password authentication system.
 *
 * Verifies:
 * 1. User can register with username + password (no email required)
 * 2. Email is not required anywhere in registration or login
 * 3. User can log in with username + password
 * 4. User can enter the application without a wallet
 * 5. User cannot issue a government document without a wallet
 * 6. Wallet presence (X-Wallet-Address header) allows issuance to proceed past the wallet gate
 * 7. Invalid/stale wallet state cannot bypass issuance protection
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock prisma so tests run without a real database ────────────────────────
const mockUser = {
  id: "test-user-id",
  username: "testuser",
  displayName: "Test User",
  passwordHash: "",
};

let mockExistingUser: typeof mockUser | null = null;

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { username?: string } }) => {
        if (where.username && mockExistingUser?.username === where.username) {
          return mockExistingUser;
        }
        return null;
      }),
      create: vi.fn(async ({ data }: { data: any }) => ({ ...mockUser, ...data })),
    },
    session: {
      create: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({}),
    },
    auditLog: { create: vi.fn().mockResolvedValue({}) },
    credential: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: "cred-id",
        type: "PAN",
        status: "ACTIVE",
        issuer: "SyntheticIdentityProvider",
        commitment: "deadbeef",
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 86400000),
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    credentialStatusEvent: { create: vi.fn().mockResolvedValue({}) },
  },
}));

// Mock authService to allow testable password flows
vi.mock("../services/authService.js", async (importOriginal) => {
  const real = await importOriginal<typeof import("../services/authService.js")>();
  return {
    ...real,
    hashPassword: async (pw: string) => `hashed:${pw}`,
    verifyPassword: async (hash: string, pw: string) => hash === `hashed:${pw}`,
    issueAccessToken: () => "test-access-token",
    issueRefreshSession: async () => "test-refresh-token",
  };
});

// Mock identityProviders to avoid filesystem dependency
vi.mock("../services/identityProviders.js", () => ({
  getConfiguredProvider: () => ({
    name: "SyntheticIdentityProvider",
    isSynthetic: true,
    fetchAttributes: async () => ({
      pan: "TESTPAN1234",
      aadhaar: "123456789012",
      dobUnixSeconds: Math.floor(new Date("2000-01-01").getTime() / 1000),
      address: "123 Test Street",
    }),
  }),
  computeCommitment: (value: string) => ({ commitment: `commit:${value}`, salt: "testsalt" }),
}));

// Mock midnight client
vi.mock("../services/midnightClient.js", () => ({
  isMidnightConfigured: () => false,
  getMidnightClient: () => { throw new Error("not configured"); },
}));

vi.mock("../middleware/auth.js", () => ({
  requireUser: (req: any, _res: any, next: any) => {
    // In tests, simulate an already-authenticated user
    req.userId = "test-user-id";
    next();
  },
  requireApiKey: (_req: any, res: any) => {
    return res.status(401).json({ error: "api_key_required" });
  },
  requireOrgRole: () => (_req: any, res: any) => {
    return res.status(403).json({ error: "forbidden" });
  },
}));

vi.mock("../services/auditService.js", () => ({
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
}));

// ── Import app after mocks ───────────────────────────────────────────────────
const { authRouter } = await import("../routes/auth.js");

// Import credential handler WITHOUT the requireUser middleware that wraps it
// in server.ts — the test injects userId directly to simulate an authenticated
// user so we can focus on wallet-gate behaviour in isolation.
const { credentialsRouter } = await import("../routes/credentials.js");

// Minimal Express app for testing
import express from "express";
import cookieParser from "cookie-parser";

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/auth", authRouter);

  // Simulate an authenticated session by injecting userId BEFORE the
  // credentials router runs. In production, this is done by requireUser
  // (JWT validation). Here we skip JWT and inject directly so tests can
  // exercise the wallet-gate logic without a real database or auth tokens.
  app.use("/credentials", (req: any, _res: any, next: any) => {
    req.userId = "test-user-id"; // simulate authenticated user
    next();
  }, credentialsRouter);
  return app;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("Auth: Username/Password (no email required)", () => {
  let app: ReturnType<typeof makeApp>;

  beforeEach(() => {
    mockExistingUser = null;
    app = makeApp();
    vi.clearAllMocks();
  });

  it("1. registers a new user with username + password — no email field required", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app).post("/auth/register").send({
      username: "newuser",
      password: "ValidPassword123",
      displayName: "New User",
    });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe("newuser");
    expect(res.body.displayName).toBe("New User");
    // Email must NOT appear in response
    expect(res.body.email).toBeUndefined();
  });

  it("2. email field is completely ignored — registration succeeds without it", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app).post("/auth/register").send({
      username: "noemailer",
      password: "ValidPassword123",
      displayName: "No Email User",
      // no email field at all
    });
    expect(res.status).toBe(201);
  });

  it("2b. sending an email field does not break registration (it is silently ignored)", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app).post("/auth/register").send({
      username: "withextraemail",
      password: "ValidPassword123",
      displayName: "Extra Email User",
      email: "ignored@example.com", // should be silently ignored, not cause failure
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBeUndefined();
  });

  it("3. user can log in with username + password", async () => {
    const { default: request } = await import("supertest");
    mockExistingUser = { ...mockUser, passwordHash: "hashed:ValidPassword123" };

    const res = await request(app).post("/auth/login").send({
      username: "testuser",
      password: "ValidPassword123",
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("test-access-token");
    expect(res.body.user.username).toBe("testuser");
    expect(res.body.user.email).toBeUndefined();
  });

  it("3b. login fails with wrong password", async () => {
    const { default: request } = await import("supertest");
    mockExistingUser = { ...mockUser, passwordHash: "hashed:ValidPassword123" };

    const res = await request(app).post("/auth/login").send({
      username: "testuser",
      password: "WrongPassword123",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("invalid_credentials");
  });

  it("4. user can access the application (list credentials) without a wallet", async () => {
    const { default: request } = await import("supertest");
    // GET /credentials does not require a wallet
    const res = await request(app).get("/credentials");
    expect(res.status).toBe(200);
    expect(res.body.credentials).toBeDefined();
  });

  it("5. user CANNOT issue a document without a wallet (no X-Wallet-Address header)", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app)
      .post("/credentials/issue")
      .send({ type: "PAN" });
    // Must be 403, not 201 or any other success code
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("wallet_required");
    expect(res.body.message).toContain("Lace or 1AM");
  });

  it("5b. empty X-Wallet-Address header is rejected", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app)
      .post("/credentials/issue")
      .set("X-Wallet-Address", "")
      .send({ type: "PAN" });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("wallet_required");
  });

  it("5c. trivially short/fake wallet address is rejected", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app)
      .post("/credentials/issue")
      .set("X-Wallet-Address", "fake")
      .send({ type: "PAN" });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("wallet_required");
  });

  it("6/7. valid wallet address (Lace/1AM) allows issuance to proceed past the wallet gate", async () => {
    const { default: request } = await import("supertest");
    // A realistic Midnight wallet address (long hex/bech32 string)
    const walletAddress =
      "mn1q8psx4f8x6qvzm4kl9wqtqmvkzxe7j2h5fgrcnst9p4xm3qjhkd8vxs2l7w";
    const res = await request(app)
      .post("/credentials/issue")
      .set("X-Wallet-Address", walletAddress)
      .send({ type: "PAN" });
    // Should proceed past wallet gate (may succeed or fail for other reasons like provider config)
    expect(res.status).not.toBe(403);
    // If it reaches issuance it returns 201
    if (res.status === 201) {
      expect(res.body.credential).toBeDefined();
      expect(res.body.walletSecret).toBeDefined();
    }
  });

  it("9. literal 'undefined'/'null' as wallet address is rejected (frontend state manipulation)", async () => {
    const { default: request } = await import("supertest");
    for (const bad of ["undefined", "null"]) {
      const res = await request(app)
        .post("/credentials/issue")
        .set("X-Wallet-Address", bad)
        .send({ type: "PAN" });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("wallet_required");
    }
  });

  it("username must meet format requirements", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app).post("/auth/register").send({
      username: "ab", // too short
      password: "ValidPassword123",
      displayName: "Too Short",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_input");
  });

  it("password must be at least 12 characters", async () => {
    const { default: request } = await import("supertest");
    const res = await request(app).post("/auth/register").send({
      username: "validuser",
      password: "short",
      displayName: "Short Password",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_input");
  });
});
