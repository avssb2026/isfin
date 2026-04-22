/**
 * npm audit is occasionally flaky in CI (ECONNRESET/ETIMEDOUT).
 * We still want builds to fail on real vulnerabilities, but not on network hiccups.
 */
import { spawnSync } from "node:child_process";

function runAudit(args) {
  return spawnSync("npm", ["audit", ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function isTransientNetworkError(output) {
  return (
    output.includes("ECONNRESET") ||
    output.includes("ETIMEDOUT") ||
    output.includes("EAI_AGAIN") ||
    output.includes("ENOTFOUND") ||
    output.includes("audit endpoint returned an error")
  );
}

const args = ["--omit=dev", "--json"];
const res = runAudit(args);
const combined = `${res.stdout ?? ""}\n${res.stderr ?? ""}`;

if (res.status === 0) {
  process.stdout.write(res.stdout);
  process.exit(0);
}

if (isTransientNetworkError(combined)) {
  console.warn("[prebuild] npm audit failed due to network error; continuing build.");
  process.exit(0);
}

// Non-network failure: try to print JSON if available (helps CI log readability)
try {
  // If stdout isn't JSON, this will throw; fallback below.
  const json = JSON.parse(res.stdout || "{}");
  console.error(JSON.stringify(json, null, 2));
} catch {
  process.stderr.write(combined);
}

process.exit(res.status ?? 1);

