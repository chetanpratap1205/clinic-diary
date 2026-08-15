import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("=================================================");
console.log("=== Reviewer 2 Adversarial Stress Test Suite ===");
console.log("=================================================\n");

let passedChecks = 0;
let totalChecks = 0;

function runCheck(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

// -------------------------------------------------------------
// Test 1: JSX Syntax Validation for tracking-client.tsx
// -------------------------------------------------------------
runCheck("tracking-client.tsx JSX nesting & balanced fragments", () => {
  const code = fs.readFileSync("src/app/track/[appointmentId]/tracking-client.tsx", "utf-8");
  
  // Ensure the main return wraps in Fragment <> ... </>
  const hasFragmentOpen = /return\s*\(\s*<>/m.test(code);
  const hasFragmentClose = /<\/>\s*\);\s*\}/m.test(code);
  assert.ok(hasFragmentOpen, "Main component return must start with fragment open '<>'");
  assert.ok(hasFragmentClose, "Main component return must end with fragment close '</>'");

  // Check no unclosed tags
  const modalOpenCount = (code.match(/<AnimatePresence[\s>]/g) || []).length;
  const modalCloseCount = (code.match(/<\/AnimatePresence>/g) || []).length;
  assert.equal(modalOpenCount, modalCloseCount, "All AnimatePresence elements must be properly closed");
  assert.equal(modalOpenCount, 5, "Must have exactly 5 AnimatePresence blocks");

  // Check that old syntax errors (TS1005, TS1128, TS1109) are absent
  assert.ok(!code.includes(");</div>"), "Corrupted closing tag sequence should not exist");
});

// -------------------------------------------------------------
// Test 2: Ambient Type Re-Export Integrity (TS2661)
// -------------------------------------------------------------
runCheck("No conflicting re-exports of ambient BeforeInstallPromptEvent", () => {
  const pwaProvider = fs.readFileSync("src/components/pwa-provider.tsx", "utf-8");
  const usePwaInstall = fs.readFileSync("src/hooks/use-pwa-install.ts", "utf-8");
  const pwaDts = fs.readFileSync("src/types/pwa.d.ts", "utf-8");

  assert.ok(
    pwaDts.includes("interface BeforeInstallPromptEvent"),
    "src/types/pwa.d.ts must declare BeforeInstallPromptEvent ambiently"
  );
  assert.ok(
    !pwaProvider.includes("export type { BeforeInstallPromptEvent }"),
    "pwa-provider.tsx must NOT export ambient BeforeInstallPromptEvent"
  );
  assert.ok(
    !usePwaInstall.includes("export type { BeforeInstallPromptEvent }"),
    "use-pwa-install.ts must NOT export ambient BeforeInstallPromptEvent"
  );
});

// -------------------------------------------------------------
// Test 3: Manifest Route Adversarial Check
// -------------------------------------------------------------
runCheck("src/app/api/manifest/[slug]/route.ts Chromium & WebAPK Compliance", () => {
  const code = fs.readFileSync("src/app/api/manifest/[slug]/route.ts", "utf-8");

  // 1. Check isolation fields
  assert.ok(code.includes("id: `/book/${slug}`"), "id must be isolated to /book/${slug}");
  assert.ok(code.includes("start_url: `/book/${slug}?utm_source=pwa`"), "start_url must include utm_source=pwa");
  assert.ok(code.includes("scope: `/book/${slug}`"), "scope must be /book/${slug}");

  // 2. Check icon array purposes
  assert.ok(!code.includes('"any maskable"'), "Must NOT contain combined 'any maskable'");
  assert.ok(!code.includes('"maskable any"'), "Must NOT contain combined 'maskable any'");

  // 3. Check for 8 discrete icon declarations (4 dynamic + 4 fallback)
  const anyMatches = (code.match(/purpose:\s*"any"/g) || []).length;
  const maskableMatches = (code.match(/purpose:\s*"maskable"/g) || []).length;
  assert.equal(anyMatches, 4, "Must have exactly 4 discrete 'any' icon entries (192 dynamic, 512 dynamic, 192 static, 512 static)");
  assert.equal(maskableMatches, 4, "Must have exactly 4 discrete 'maskable' icon entries (192 dynamic, 512 dynamic, 192 static, 512 static)");

  // 4. Short name truncation logic
  assert.ok(code.includes("const shortName = appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;"), "Short name must be properly truncated to <= 12 chars with ellipsis");

  // 5. Check error handling and headers
  assert.ok(code.includes('catch (error)'), "Route must wrap logic in try/catch");
  assert.ok(code.includes('"Access-Control-Allow-Origin": "*"'), "CORS header must be present");
  assert.ok(code.includes('"Content-Type": "application/manifest+json"'), "Content-Type must be application/manifest+json");
  assert.ok(code.includes("doctorLeads"), "Must have fallback to doctorLeads table");
});

// -------------------------------------------------------------
// Test 4: Dynamic Icon Route Security & Sanitization
// -------------------------------------------------------------
runCheck("src/app/api/manifest/[slug]/icon/route.ts Security & Edge Case Handling", () => {
  const code = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");

  // 1. Size parameter clamping
  assert.ok(code.includes("parseInt(sizeParam, 10)"), "Must parse size param as integer");
  assert.ok(code.includes("parsedSize >= 16 && parsedSize <= 1024"), "Must clamp size between 16 and 1024");

  // 2. XML escaping for SVG
  assert.ok(code.includes('.replace(/&/g, "&amp;")'), "Must escape ampersand in initials");
  assert.ok(code.includes('.replace(/</g, "&lt;")'), "Must escape < in initials");
  assert.ok(code.includes('.replace(/>/g, "&gt;")'), "Must escape > in initials");
  assert.ok(code.includes('.replace(/"/g, "&quot;")'), "Must escape double quotes in initials");
  assert.ok(code.includes(".replace(/'/g, \"&apos;\")"), "Must escape single quotes in initials");

  // 3. Theme color validation regex
  assert.ok(code.includes("/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/"), "Theme color must be validated with strict hex regex to prevent CSS injection");

  // 4. Remote image proxy timeout & fallback
  assert.ok(code.includes("new AbortController()"), "Must use AbortController for remote fetch");
  assert.ok(code.includes("setTimeout(() => controller.abort()"), "Must abort fetch on timeout");
  assert.ok(code.includes("clearTimeout(timeoutId)"), "Must clear timeout on fetch completion");
  assert.ok(code.includes("doctorLeads"), "Must fall back to doctorLeads for lead clinics");
});

// -------------------------------------------------------------
// Test 5: Route Metadata Generation & Failure Resilience
// -------------------------------------------------------------
runCheck("Tracking route metadata & layout error handling", () => {
  const layoutCode = fs.readFileSync("src/app/track/[appointmentId]/layout.tsx", "utf-8");
  const pageCode = fs.readFileSync("src/app/track/[appointmentId]/page.tsx", "utf-8");
  const statusPageCode = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");
  const bookLayoutCode = fs.readFileSync("src/app/book/[slug]/layout.tsx", "utf-8");

  // Layout metadata
  assert.ok(layoutCode.includes("export async function generateMetadata"), "Track layout must export generateMetadata");
  assert.ok(layoutCode.includes('if (appointmentId.startsWith("demo-"))'), "Track layout metadata must handle demo-* without DB query");
  assert.ok(layoutCode.includes("try {"), "Track layout metadata must catch DB errors");
  assert.ok(layoutCode.includes("manifest: `/api/manifest/${result.clinicSlug}`"), "Track layout metadata must link clinic manifest");

  // Page metadata
  assert.ok(pageCode.includes("export async function generateMetadata"), "Track page must export generateMetadata");
  assert.ok(pageCode.includes('if (appointmentId.startsWith("demo-"))'), "Track page metadata must handle demo-*");
  assert.ok(pageCode.includes("try {"), "Track page metadata must catch DB errors");
  assert.ok(pageCode.includes("manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined"), "Track page metadata must link clinic manifest");

  // Status page metadata
  assert.ok(statusPageCode.includes("export async function generateMetadata"), "Status page must export generateMetadata");
  assert.ok(statusPageCode.includes("manifest: `/api/manifest/${slug}`"), "Status page metadata must link clinic manifest");

  // Book layout metadata
  assert.ok(bookLayoutCode.includes("export async function generateMetadata"), "Book layout must export generateMetadata");
  assert.ok(bookLayoutCode.includes("manifest: `/api/manifest/${slug}`"), "Book layout metadata must link clinic manifest");
});

// -------------------------------------------------------------
// Test 6: Cross-Portal Manifest Isolation
// -------------------------------------------------------------
runCheck("Doctor Diary Portal vs Patient Clinic Portal Isolation", () => {
  const doctorManifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
  assert.equal(doctorManifest.id, "doctor-diary-app");
  assert.equal(doctorManifest.start_url, "/dashboard");
  assert.equal(doctorManifest.scope, "/");

  // Check that root layout does NOT hardcode patient manifest
  const rootLayoutCode = fs.readFileSync("src/app/layout.tsx", "utf-8");
  assert.ok(
    !rootLayoutCode.includes('manifest: "/api/manifest/'),
    "Root layout must not link dynamic clinic manifest globally"
  );
});

// -------------------------------------------------------------
// Test 7: Integrity and Facade Detection
// -------------------------------------------------------------
runCheck("Integrity validation (no hardcoded test stubs or facades)", () => {
  const manifestRoute = fs.readFileSync("src/app/api/manifest/[slug]/route.ts", "utf-8");
  const iconRoute = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");
  
  // Verify real DB query logic exists
  assert.ok(/db\s*\.select/.test(manifestRoute), "Manifest route must contain real DB query logic");
  assert.ok(/db\s*\.select/.test(iconRoute), "Icon route must contain real DB query logic");
  assert.ok(!manifestRoute.includes("if (slug === 'test') return"), "No hardcoded test mocks in manifest route");
  assert.ok(!iconRoute.includes("if (slug === 'test') return"), "No hardcoded test mocks in icon route");
});

console.log(`\n=================================================`);
console.log(`=== ALL ${passedChecks}/${totalChecks} ADVERSARIAL CHECKS PASSED ===`);
console.log(`=================================================`);
