import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import "./styles/global.css";

// Debug: log window.midnight after a short delay to confirm wallet injection.
// Open DevTools → Console to see detected wallets. Safe to remove in production.
if (import.meta.env.DEV) {
  setTimeout(() => {
    const midnight = (window as any).midnight;
    if (midnight && typeof midnight === "object") {
      const keys = [
        ...Object.keys(midnight),
        ...Object.getOwnPropertyNames(midnight),
      ].filter((k, i, a) => a.indexOf(k) === i && !["__proto__", "constructor", "prototype"].includes(k));

      if (keys.length > 0) {
        console.info(
          `[PrivPass] Midnight wallets detected in window.midnight: [${keys.join(", ")}]`
        );
        keys.forEach((k) => {
          const p = midnight[k];
          console.info(`  [${k}]`, {
            name: p?.name,
            rdns: p?.rdns,
            apiVersion: p?.apiVersion,
            hasConnect: typeof p?.connect === "function",
            hasEnable: typeof p?.enable === "function",
          });
        });
      } else {
        console.warn(
          "[PrivPass] window.midnight exists but has no keys. " +
          "Extension may still be loading — wallet detector retries for 1.5 s."
        );
      }
    } else {
      console.warn(
        "[PrivPass] window.midnight is not defined. " +
        "Install the 1AM or Lace wallet extension and reload this page."
      );
    }
  }, 800);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
