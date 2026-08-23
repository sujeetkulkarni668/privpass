import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // BUG FIX: the backend mounts routes at their bare paths (/auth,
      // /credentials, /organizations, /verification-requests,
      // /verifications, /admin) — NOT under /api (only /api/v1, the
      // external REST API, actually lives under /api). The frontend's
      // api.ts prefixes every call with "/api" for a clean same-origin
      // namespace in prod, so in dev that prefix must be stripped before
      // forwarding, or every request 404s. Without this `rewrite`, ALL
      // frontend API calls (register, login, credentials, verification
      // requests, ...) silently 404 — which is why signup previously
      // appeared to fail with a misleading "password too short" message
      // regardless of the password entered.
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
