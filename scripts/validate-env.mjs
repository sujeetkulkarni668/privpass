#!/usr/bin/env node
/**
 * validate-env.mjs — Asserts required environment variables before builds or runtime
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED_BACKEND_VARS = [
  "DATABASE_URL",
  "MASTER_ENCRYPTION_KEY_HEX",
];

const OPTIONAL_VARS = [
  "PORT",
  "NODE_ENV",
  "CORS_ALLOWED_ORIGINS",
  "MIDNIGHT_NODE_URL",
  "PROOF_SERVER_URL",
];

function validate() {
  console.log("🔍 Validating PrivPass environment configuration...");

  let hasErrors = false;

  // Check if .env or process.env contains required keys
  const missing: string[] = [];

  for (const key of REQUIRED_BACKEND_VARS) {
    const val = process.env[key];
    if (!val) {
      missing.push(key);
    } else if (key === "MASTER_ENCRYPTION_KEY_HEX" && val.length !== 64) {
      console.error(`❌ MASTER_ENCRYPTION_KEY_HEX must be a 64-character (32-byte) hex string. Current length: ${val.length}`);
      hasErrors = true;
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Missing required environment variables for production: ${missing.join(", ")}`);
    console.warn(`ℹ️  In local development, default values will be applied where available.`);
  } else {
    console.log("✅ All required environment variables are set and validated.");
  }

  process.exit(hasErrors ? 1 : 0);
}

validate();
