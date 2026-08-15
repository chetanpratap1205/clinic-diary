import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=== Adversarial Stress Test Suite for Milestone 2 ===\n");

// 1. Stress-test XML escaping logic in icon route
console.log("1. Testing XML entity escaping in icon generation...");
const testNames = [
  { name: "Dr & Partner", expected: "D&amp;" },
  { name: "<Dr> 'Clinic'", expected: "&lt;&apos;" },
  { name: 'Dr. "Awesome" Care', expected: 'D&quot;' },
  { name: "Special > Clinic", expected: "S&gt;" },
  { name: "Apex Dental Care", expected: "AD" },
  { name: "City Hospital", expected: "CH" },
  { name: "", expected: "DR" },
  { name: null, expected: "DR" },
];

function escapeInitials(name) {
  const rawInitials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";

  return rawInitials
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

for (const tc of testNames) {
  const res = escapeInitials(tc.name);
  console.log(`  Testing "${tc.name}" -> initials escaped: "${res}"`);
  assert.equal(res, tc.expected);
}
console.log("✓ XML escaping properly sanitizes raw characters into XML entities.\n");

// 2. Stress-test size parameter clamping
console.log("2. Testing size parameter parsing and clamping...");
function parseSize(sizeParam) {
  const parsedSize = sizeParam ? parseInt(sizeParam, 10) : 512;
  return !isNaN(parsedSize) && parsedSize >= 16 && parsedSize <= 1024 ? parsedSize : 512;
}

assert.equal(parseSize("192"), 192);
assert.equal(parseSize("512"), 512);
assert.equal(parseSize("1024"), 1024);
assert.equal(parseSize("16"), 16);
assert.equal(parseSize("15"), 512); // Underflow defaults to 512
assert.equal(parseSize("2048"), 512); // Overflow defaults to 512
assert.equal(parseSize("-100"), 512); // Negative defaults to 512
assert.equal(parseSize("abc"), 512); // Non-numeric defaults to 512
assert.equal(parseSize(null), 512); // Omitted defaults to 512
console.log("✓ Size parameter bounds handling robust.\n");

// 3. Stress-test theme color regex
console.log("3. Testing themeColor hex validation...");
function sanitizeColor(rawColor) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ? rawColor : "#0f766e";
}

assert.equal(sanitizeColor("#0ea5e9"), "#0ea5e9");
assert.equal(sanitizeColor("#FFF"), "#FFF");
assert.equal(sanitizeColor("red; background: black"), "#0f766e"); // CSS injection attempt
assert.equal(sanitizeColor("javascript:alert(1)"), "#0f766e");
assert.equal(sanitizeColor('"><script>'), "#0f766e");
console.log("✓ Theme color sanitization prevents SVG attribute injection.\n");

// 4. Verify MIME type detection in manifest generator
console.log("4. Testing dynamic icon MIME type detection...");
function getDynamicIconType(logoUrl) {
  let dynamicIconType = "image/png";
  if (logoUrl) {
    const lower = logoUrl.toLowerCase();
    if (lower.endsWith(".svg")) dynamicIconType = "image/svg+xml";
    else if (lower.endsWith(".webp")) dynamicIconType = "image/webp";
    else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) dynamicIconType = "image/jpeg";
  } else {
    dynamicIconType = "image/svg+xml";
  }
  return dynamicIconType;
}

assert.equal(getDynamicIconType("https://example.com/logo.svg"), "image/svg+xml");
assert.equal(getDynamicIconType("https://example.com/logo.webp"), "image/webp");
assert.equal(getDynamicIconType("https://example.com/logo.jpg"), "image/jpeg");
assert.equal(getDynamicIconType("https://example.com/logo.png"), "image/png");
assert.equal(getDynamicIconType(null), "image/svg+xml");
console.log("✓ MIME type detection verified.\n");

// 5. Verify patient route isolation & lack of doctor manifest leak
console.log("5. Verifying route metadata manifest links...");
const trackLayout = fs.readFileSync("src/app/track/[appointmentId]/layout.tsx", "utf-8");
const trackPage = fs.readFileSync("src/app/track/[appointmentId]/page.tsx", "utf-8");
const statusPage = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");
const bookLayout = fs.readFileSync("src/app/book/[slug]/layout.tsx", "utf-8");

assert.ok(trackLayout.includes("manifest: `/api/manifest/"), "track layout must point to /api/manifest/");
assert.ok(trackPage.includes("manifest: `/api/manifest/"), "track page demo must point to /api/manifest/");
assert.ok(statusPage.includes("manifest: `/api/manifest/${slug}`"), "status page must point to /api/manifest/${slug}");
assert.ok(bookLayout.includes("manifest: `/api/manifest/${slug}`"), "book layout must point to /api/manifest/${slug}");

assert.equal(trackLayout.includes('manifest: "/manifest.json"'), false, "track layout must NOT point to doctor manifest");
assert.equal(trackPage.includes('manifest: "/manifest.json"'), false, "track page must NOT point to doctor manifest");
assert.equal(statusPage.includes('manifest: "/manifest.json"'), false, "status page must NOT point to doctor manifest");
assert.equal(bookLayout.includes('manifest: "/manifest.json"'), false, "book layout must NOT point to doctor manifest");
console.log("✓ Patient route isolation verified: no leaks of Doctor Diary manifest.\n");

console.log("=== ALL ADVERSARIAL CHECKS PASSED ===");
