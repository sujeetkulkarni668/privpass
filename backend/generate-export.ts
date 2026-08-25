/**
 * generate-export.ts — one-off script to generate prepod_user_list.xlsx
 * Run from backend/ with:  npx tsx generate-export.ts
 */
import { regeneratePreprodExport } from "./src/services/preprodExport.js";

console.log("Generating prepod_user_list.xlsx and pushing to GitHub...");
await regeneratePreprodExport();
console.log("Done.");
process.exit(0);
