import assert from "node:assert/strict";

console.log("=== Reviewer 2 Logic & Edge Case Unit Tests ===\n");

// 1. Test short name truncation logic
function computeShortName(appName) {
  return appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;
}

assert.equal(computeShortName("Dental Care"), "Dental Care"); // 11 chars
assert.equal(computeShortName("Aarogya Clinic"), "Aarogya Cli…"); // 14 chars -> 11 + '…'
assert.equal(computeShortName("Dr. Sharma's Super Specialty Hospital"), "Dr. Sharma'…");
console.log("✓ Short name truncation logic verified.");

// 2. Test dynamic icon MIME type detection logic
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

assert.equal(getDynamicIconType(null), "image/svg+xml");
assert.equal(getDynamicIconType("https://example.com/logo.svg"), "image/svg+xml");
assert.equal(getDynamicIconType("https://example.com/logo.webp"), "image/webp");
assert.equal(getDynamicIconType("https://example.com/logo.jpg"), "image/jpeg");
assert.equal(getDynamicIconType("https://example.com/logo.png"), "image/png");
assert.equal(getDynamicIconType("https://example.com/logo.unknown"), "image/png");
console.log("✓ Dynamic icon MIME type logic verified.");

// 3. Test dynamic icon size parsing and bounds
function parseSize(sizeParam) {
  const parsedSize = sizeParam ? parseInt(sizeParam, 10) : 512;
  return !isNaN(parsedSize) && parsedSize >= 16 && parsedSize <= 1024 ? parsedSize : 512;
}

assert.equal(parseSize(null), 512);
assert.equal(parseSize("192"), 192);
assert.equal(parseSize("512"), 512);
assert.equal(parseSize("16"), 16);
assert.equal(parseSize("1024"), 1024);
assert.equal(parseSize("15"), 512); // below min
assert.equal(parseSize("2048"), 512); // above max
assert.equal(parseSize("-100"), 512);
assert.equal(parseSize("invalid"), 512);
console.log("✓ Icon size bounds & validation logic verified.");

// 4. Test XML sanitization on initials
function sanitizeInitials(name) {
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

assert.equal(sanitizeInitials("Apex Dental"), "AD");
assert.equal(sanitizeInitials("Dr. Sharma"), "DS");
assert.equal(sanitizeInitials(""), "DR");
assert.equal(sanitizeInitials("<script>"), "&lt;");
assert.equal(sanitizeInitials("& Associates"), "&amp;A");
assert.equal(sanitizeInitials("\"Quotes\" Clinic"), "&quot;C");
assert.equal(sanitizeInitials("'Apostrophe' Care"), "&apos;C");
console.log("✓ XML sanitization and initials generation verified.");

// 5. Test theme color hex validation
function sanitizeThemeColor(rawColor) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ? rawColor : "#0f766e";
}

assert.equal(sanitizeThemeColor("#0ea5e9"), "#0ea5e9");
assert.equal(sanitizeThemeColor("#fff"), "#fff");
assert.equal(sanitizeThemeColor("#123456"), "#123456");
assert.equal(sanitizeThemeColor("red"), "#0f766e");
assert.equal(sanitizeThemeColor("rgb(0,0,0)"), "#0f766e");
assert.equal(sanitizeThemeColor("#000; alert(1)"), "#0f766e");
assert.equal(sanitizeThemeColor("<script>"), "#0f766e");
console.log("✓ Theme color security validation verified.");

// 6. Test demo-* extraction logic in track layout & page metadata
function getDemoSlug(appointmentId) {
  if (appointmentId.startsWith("demo-")) {
    return appointmentId.replace("demo-", "");
  }
  return null;
}

assert.equal(getDemoSlug("demo-ayurveda-care"), "ayurveda-care");
assert.equal(getDemoSlug("demo-city-dental-clinic"), "city-dental-clinic");
assert.equal(getDemoSlug("e5b8e987-a50d-4bb1-bf75-01e4ec7076a0"), null);
console.log("✓ Demo slug resolution verified.");

console.log("\n=== ALL LOGIC & EDGE CASE UNIT TESTS PASSED ===");
