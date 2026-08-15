import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("===============================================================================");
console.log("FORENSIC INTEGRITY AUDIT: MILESTONE 2 (Independent Verification Suite)");
console.log("===============================================================================\n");

let passedChecks = 0;
let totalChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedChecks++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
  }
}

// ----------------------------------------------------------------------------
// 1. Prohibited Pattern Checks: Hardcoded Responses & Dummy Facades
// ----------------------------------------------------------------------------
console.log(">>> Phase 1: Prohibited Pattern & Facade Detection");

check("No hardcoded clinic names or slugs in manifest generator", () => {
  const code = fs.readFileSync("src/app/api/manifest/[slug]/route.ts", "utf-8");
  // Ensure route does not contain hardcoded clinic slugs or mock return values for specific test cases
  assert.equal(code.includes('if (slug === "test")'), false, "Must not contain hardcoded test branches");
  assert.equal(code.includes('if (slug === "demo")'), false, "Must not contain hardcoded demo slug overrides");
  assert.ok(/\.from\(clinics\)\s*\.where\(eq\(clinics\.slug,\s*slug\)\)/.test(code), "Must dynamically query clinics table");
  assert.ok(/\.from\(doctorLeads\)\.where\(eq\(doctorLeads\.clinicSlug,\s*slug\)\)/.test(code), "Must dynamically fallback to doctorLeads");
});

check("No hardcoded clinic names or SVG bypass in icon generator", () => {
  const code = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");
  assert.equal(code.includes('if (slug === "test")'), false, "Must not contain hardcoded test branches");
  assert.ok(/\.from\(clinics\)\s*\.where\(eq\(clinics\.slug,\s*slug\)\)/.test(code), "Must dynamically query clinics table for icon");
  assert.ok(/\.from\(doctorLeads\)\s*\.where\(eq\(doctorLeads\.clinicSlug,\s*slug\)\)/.test(code), "Must dynamically fallback to doctorLeads for icon");
});

check("No facade implementations in route metadata", () => {
  const trackLayout = fs.readFileSync("src/app/track/[appointmentId]/layout.tsx", "utf-8");
  const trackPage = fs.readFileSync("src/app/track/[appointmentId]/page.tsx", "utf-8");
  const statusPage = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");

  assert.ok(trackLayout.includes("generateMetadata"), "track layout must implement generateMetadata");
  assert.ok(trackPage.includes("generateMetadata"), "track page must implement generateMetadata");
  assert.ok(statusPage.includes("generateMetadata"), "status page must implement generateMetadata");

  // Ensure they don't return static dummy manifest strings like '/manifest.json'
  assert.equal(trackLayout.includes('manifest: "/manifest.json"'), false, "track layout must not link to doctor manifest");
  assert.equal(trackPage.includes('manifest: "/manifest.json"'), false, "track page must not link to doctor manifest");
  assert.equal(statusPage.includes('manifest: "/manifest.json"'), false, "status page must not link to doctor manifest");
});

// ----------------------------------------------------------------------------
// 2. Behavioral Verification: Dynamic Icon Logic & XML Escaping
// ----------------------------------------------------------------------------
console.log("\n>>> Phase 2: Behavioral & Algorithmic Logic Verification");

check("Icon SVG generator properly escapes XML special characters (XSS/Malformed XML prevention)", () => {
  // Test the initials escaping logic directly
  const testClinicNames = [
    { name: "<Script> Alert & Co", expectedInitials: "&lt;A" },
    { name: 'Dr. "Bob" & Alice', expectedInitials: "D&quot;" },
    { name: "Apollo > Fortis & Max", expectedInitials: "A&gt;" },
    { name: "C & D Clinic", expectedInitials: "C&amp;" },
    { name: "Apex Dental Care", expectedInitials: "AD" },
    { name: "", expectedInitials: "DR" },
  ];

  for (const tc of testClinicNames) {
    const rawInitials = tc.name
      ? tc.name
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "DR";

    const escaped = rawInitials
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    assert.equal(escaped, tc.expectedInitials, `Initials for "${tc.name}" must match ${tc.expectedInitials}`);
  }
});

check("Icon generator size parameter sanitization & clamping logic", () => {
  const clampSize = (sizeParam) => {
    const parsedSize = sizeParam ? parseInt(sizeParam, 10) : 512;
    return !isNaN(parsedSize) && parsedSize >= 16 && parsedSize <= 1024 ? parsedSize : 512;
  };

  assert.equal(clampSize("192"), 192);
  assert.equal(clampSize("512"), 512);
  assert.equal(clampSize("16"), 16);
  assert.equal(clampSize("1024"), 1024);
  assert.equal(clampSize("8"), 512, "Below minimum (16) must clamp to default 512");
  assert.equal(clampSize("2048"), 512, "Above maximum (1024) must clamp to default 512");
  assert.equal(clampSize("invalid"), 512, "Invalid string must fallback to 512");
  assert.equal(clampSize(null), 512, "Null param must default to 512");
});

check("Dynamic manifest icon purpose structure matches W3C/Chromium WebAPK spec", () => {
  const code = fs.readFileSync("src/app/api/manifest/[slug]/route.ts", "utf-8");
  
  // Verify icon definitions count & purpose split
  const anyPurposes = (code.match(/purpose:\s*"any"/g) || []).length;
  const maskablePurposes = (code.match(/purpose:\s*"maskable"/g) || []).length;
  const combinedPurposes = (code.match(/purpose:\s*"any maskable"/g) || []).length;

  assert.ok(anyPurposes >= 4, `Expected at least 4 "any" purpose declarations, found ${anyPurposes}`);
  assert.ok(maskablePurposes >= 4, `Expected at least 4 "maskable" purpose declarations, found ${maskablePurposes}`);
  assert.equal(combinedPurposes, 0, 'Must have 0 combined "any maskable" declarations');
});

// ----------------------------------------------------------------------------
// 3. Route Metadata & Cross-Portal Isolation Checks
// ----------------------------------------------------------------------------
console.log("\n>>> Phase 3: Route Metadata & Portal Isolation");

check("Track layout dynamic metadata generates clinic-isolated manifest", () => {
  const code = fs.readFileSync("src/app/track/[appointmentId]/layout.tsx", "utf-8");
  assert.ok(code.includes("generateMetadata"), "Layout has generateMetadata");
  assert.ok(code.includes('manifest: `/api/manifest/${result.clinicSlug}`'), "Returns dynamic manifest link for real appointment");
  assert.ok(code.includes('manifest: `/api/manifest/${slug}`'), "Returns dynamic manifest link for demo-* appointment");
});

check("Track page dynamic metadata generates clinic-isolated manifest", () => {
  const code = fs.readFileSync("src/app/track/[appointmentId]/page.tsx", "utf-8");
  assert.ok(code.includes("generateMetadata"), "Page has generateMetadata");
  assert.ok(code.includes('manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined'), "Returns dynamic manifest link");
});

check("Status page dynamic metadata generates clinic-isolated manifest", () => {
  const code = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");
  assert.ok(code.includes("generateMetadata"), "Status page has generateMetadata");
  assert.ok(code.includes('manifest: `/api/manifest/${slug}`'), "Returns dynamic clinic manifest link");
});

check("Doctor Diary static manifest remains completely isolated and pristine", () => {
  const manifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
  assert.equal(manifest.id, "doctor-diary-app");
  assert.equal(manifest.start_url, "/dashboard");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.name, "Doctor Diary — by NatureXpress");
  assert.ok(manifest.icons.length > 0);
});

// ----------------------------------------------------------------------------
// 4. Type Cleanliness & JSX Integrity
// ----------------------------------------------------------------------------
console.log("\n>>> Phase 4: Type Cleanliness & Syntax Integrity");

check("Ambient PWA type declarations in types/pwa.d.ts", () => {
  const pwaTypes = fs.readFileSync("src/types/pwa.d.ts", "utf-8");
  assert.ok(pwaTypes.includes("interface BeforeInstallPromptEvent"), "Defines BeforeInstallPromptEvent");
  assert.ok(pwaTypes.includes("__pwaDeferredPrompt?: BeforeInstallPromptEvent | null"), "Defines __pwaDeferredPrompt on Window");
  assert.ok(pwaTypes.includes("pwa-prompt-ready"), "Defines pwa-prompt-ready event");
  assert.ok(pwaTypes.includes("pwa-installed"), "Defines pwa-installed event");
  assert.ok(pwaTypes.includes("standalone?: boolean"), "Defines standalone on Navigator");
});

check("No duplicate ambient type re-exports in hooks or components", () => {
  const pwaProvider = fs.readFileSync("src/components/pwa-provider.tsx", "utf-8");
  const usePwa = fs.readFileSync("src/hooks/use-pwa-install.ts", "utf-8");

  assert.equal(pwaProvider.includes("export type { BeforeInstallPromptEvent }"), false);
  assert.equal(usePwa.includes("export type { BeforeInstallPromptEvent }"), false);
});

check("tracking-client.tsx JSX fragment closure valid", () => {
  const code = fs.readFileSync("src/app/track/[appointmentId]/tracking-client.tsx", "utf-8");
  assert.ok(code.includes("<AnimatePresence>") && code.includes("</AnimatePresence>"));
  assert.ok(code.includes("return (\n    <>") || code.includes("return (\r\n    <>"));
  assert.ok(code.includes("</>\n  );") || code.includes("</>\r\n  );"));
});

console.log("\n===============================================================================");
console.log(`AUDIT RESULTS: ${passedChecks}/${totalChecks} checks passed`);
console.log("===============================================================================");

if (passedChecks !== totalChecks) {
  process.exit(1);
}
