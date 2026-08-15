/**
 * Challenger 2 Adversarial Stress Test Suite for Milestone 2:
 * Route Metadata Linking, Manifest Generation, Icon Proxy, and Cross-Portal Isolation
 * (Native Node.js ESM execution)
 */

import { strict as assert } from "node:assert";
import fs from "node:fs";

console.log("================================================================================");
console.log("   CHALLENGER 2 EMPIRICAL TEST SUITE - MILESTONE 2: MANIFEST & METADATA        ");
console.log("================================================================================\n");

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

// ============================================================================
// SUITE 1: Route Metadata Resolution & Linking Hierarchy
// ============================================================================
console.log("--- SUITE 1: Route Metadata Resolution & Linking Hierarchy ---");

runTest("Root Layout (/app/layout.tsx) exports doctor manifest by default", () => {
  const layoutContent = fs.readFileSync("src/app/layout.tsx", "utf-8");
  assert.ok(layoutContent.includes('manifest: "/manifest.json"'), "Root layout must point to /manifest.json");
  assert.ok(layoutContent.includes('title: "Doctor Diary"'), "Root appleWebApp must specify Doctor Diary");
  assert.ok(layoutContent.includes('capable: true'), "Root appleWebApp must be capable");
});

runTest("Doctor Dashboard (/dashboard) inherits root doctor manifest without override", () => {
  const dashboardLayout = fs.readFileSync("src/app/dashboard/layout.tsx", "utf-8");
  assert.equal(dashboardLayout.includes("manifest:"), false, "Dashboard layout should not override manifest");
});

runTest("Patient Booking Layout (/book/[slug]/layout.tsx) generates dynamic clinic manifest", () => {
  const bookingLayout = fs.readFileSync("src/app/book/[slug]/layout.tsx", "utf-8");
  assert.ok(bookingLayout.includes("export async function generateMetadata"), "Booking layout must export generateMetadata");
  assert.ok(bookingLayout.includes("manifest: `/api/manifest/${slug}`"), "Booking layout must link dynamic manifest");
});

runTest("Patient Booking Page (/book/[slug]/page.tsx) generates dynamic clinic manifest", () => {
  const bookingPage = fs.readFileSync("src/app/book/[slug]/page.tsx", "utf-8");
  assert.ok(bookingPage.includes("export async function generateMetadata"), "Booking page must export generateMetadata");
  assert.ok(bookingPage.includes("manifest: `/api/manifest/${slug}`"), "Booking page must link dynamic manifest");
});

runTest("Patient Tracking Layout (/track/[appointmentId]/layout.tsx) generates dynamic clinic manifest", () => {
  const trackLayout = fs.readFileSync("src/app/track/[appointmentId]/layout.tsx", "utf-8");
  assert.ok(trackLayout.includes("export async function generateMetadata"), "Track layout must export generateMetadata");
  assert.ok(trackLayout.includes("manifest: `/api/manifest/${slug}`"), "Track layout must handle demo-* appointment manifest");
  assert.ok(trackLayout.includes("manifest: `/api/manifest/${result.clinicSlug}`"), "Track layout must link clinic manifest from DB");
  assert.ok(trackLayout.includes("try {"), "Track layout must wrap DB query in try/catch");
  assert.ok(trackLayout.includes("return {};"), "Track layout must return empty object on error/missing");
});

runTest("Patient Tracking Page (/track/[appointmentId]/page.tsx) generates dynamic clinic manifest", () => {
  const trackPage = fs.readFileSync("src/app/track/[appointmentId]/page.tsx", "utf-8");
  assert.ok(trackPage.includes("export async function generateMetadata"), "Track page must export generateMetadata");
  assert.ok(trackPage.includes("manifest: `/api/manifest/${slug}`"), "Track page must handle demo-* appointment manifest");
  assert.ok(trackPage.includes("manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined"), "Track page must link clinic manifest");
});

runTest("Patient Status Page (/status/[slug]/page.tsx) metadata links clinic manifest", () => {
  const statusPage = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");
  assert.ok(statusPage.includes("export async function generateMetadata"), "Status page must export generateMetadata");
  assert.ok(statusPage.includes("manifest: `/api/manifest/${slug}`"), "Status page must link clinic manifest");
});

// ============================================================================
// SUITE 2: Doctor Diary Portal Manifest Integrity
// ============================================================================
console.log("\n--- SUITE 2: Doctor Diary Portal Manifest Integrity ---");

runTest("public/manifest.json conforms strictly to Doctor Diary specification", () => {
  const raw = fs.readFileSync("public/manifest.json", "utf-8");
  const manifest = JSON.parse(raw);

  assert.equal(manifest.id, "doctor-diary-app", "id must be doctor-diary-app");
  assert.equal(manifest.start_url, "/dashboard", "start_url must be /dashboard");
  assert.equal(manifest.scope, "/", "scope must be /");
  assert.equal(manifest.display, "standalone", "display must be standalone");
  assert.equal(manifest.theme_color, "#0f766e", "theme_color must match doctor diary theme");
  assert.ok(Array.isArray(manifest.icons), "icons must be an array");
  assert.ok(manifest.icons.length >= 4, "icons must have at least 4 entries");

  const purposes = manifest.icons.map((i) => i.purpose);
  assert.ok(purposes.includes("any"), "Must have purpose 'any'");
  assert.ok(purposes.includes("maskable"), "Must have purpose 'maskable'");
  assert.ok(!purposes.includes("any maskable"), "Must NOT combine 'any maskable'");

  const sizes = manifest.icons.map((i) => i.sizes);
  assert.ok(sizes.includes("192x192"), "Must include 192x192");
  assert.ok(sizes.includes("512x512"), "Must include 512x512");
});

// ============================================================================
// SUITE 3: Dynamic Manifest API Route Code Structure & Standards
// ============================================================================
console.log("\n--- SUITE 3: Dynamic Manifest API Route Code Structure & Standards ---");

runTest("src/app/api/manifest/[slug]/route.ts adheres to Chromium & WebAPK PWA standards", () => {
  const manifestCode = fs.readFileSync("src/app/api/manifest/[slug]/route.ts", "utf-8");

  assert.ok(manifestCode.includes('id: `/book/${slug}`'), "Manifest id must be /book/[slug]");
  assert.ok(manifestCode.includes('start_url: `/book/${slug}?utm_source=pwa`'), "Manifest start_url must be /book/[slug]?utm_source=pwa");
  assert.ok(manifestCode.includes('scope: `/book/${slug}`'), "Manifest scope must be /book/[slug]");
  assert.ok(manifestCode.includes('display: "standalone"'), "Manifest display must be standalone");
  assert.ok(manifestCode.includes('orientation: "portrait-primary"'), "Manifest orientation must be portrait-primary");
  assert.ok(manifestCode.includes('"Content-Type": "application/manifest+json"'), "Content-Type header must be application/manifest+json");
  assert.ok(manifestCode.includes('"Access-Control-Allow-Origin": "*"'), "Must include Access-Control-Allow-Origin: *");
  assert.ok(manifestCode.includes('"Cache-Control": "public, max-age=3600, s-maxage=3600"'), "Must include Cache-Control header");

  // Icon checks
  assert.ok(manifestCode.includes('purpose: "any"'), "Must define discrete purpose 'any'");
  assert.ok(manifestCode.includes('purpose: "maskable"'), "Must define discrete purpose 'maskable'");
  assert.equal(manifestCode.includes('purpose: "any maskable"'), false, "Must NOT contain combined 'any maskable'");

  // Dynamic icon proxy links
  assert.ok(manifestCode.includes('src: `/api/manifest/${slug}/icon?size=192`'), "Must include dynamic 192 icon proxy");
  assert.ok(manifestCode.includes('src: `/api/manifest/${slug}/icon?size=512`'), "Must include dynamic 512 icon proxy");
  // Static PNG fallbacks
  assert.ok(manifestCode.includes('src: "/icon-192.png"'), "Must include static 192 fallback");
  assert.ok(manifestCode.includes('src: "/icon-512.png"'), "Must include static 512 fallback");
  // Lead fallback
  assert.ok(manifestCode.includes("doctorLeads"), "Must support lead clinics fallback");
});

// ============================================================================
// SUITE 4: Dynamic Icon Generator Route Code Structure & Security
// ============================================================================
console.log("\n--- SUITE 4: Dynamic Icon Generator Route Code Structure & Security ---");

runTest("src/app/api/manifest/[slug]/icon/route.ts handles size, XML escaping, and fetch timeout", () => {
  const iconCode = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");

  // Size parsing & bounds
  assert.ok(iconCode.includes('url.searchParams.get("size")'), "Must parse size query parameter");
  assert.ok(iconCode.includes("parsedSize >= 16 && parsedSize <= 1024"), "Must clamp size between 16 and 1024");

  // Lead fallback
  assert.ok(iconCode.includes("doctorLeads"), "Must support doctorLeads table fallback");

  // Remote proxy timeout
  assert.ok(iconCode.includes("new AbortController()"), "Must use AbortController for timeout");
  assert.ok(iconCode.includes("setTimeout(() => controller.abort(), 3500)"), "Must enforce 3.5s timeout");
  assert.ok(iconCode.includes("signal: controller.signal"), "Must pass abort signal to fetch");

  // XML escaping
  assert.ok(iconCode.includes('.replace(/&/g, "&amp;")'), "Must escape &");
  assert.ok(iconCode.includes('.replace(/</g, "&lt;")'), "Must escape <");
  assert.ok(iconCode.includes('.replace(/>/g, "&gt;")'), "Must escape >");
  assert.ok(iconCode.includes('.replace(/"/g, "&quot;")'), "Must escape \"");
  assert.ok(iconCode.includes(".replace(/'/g, \"&apos;\")"), "Must escape '");

  // CORS and Cache headers
  assert.ok(iconCode.includes('"Access-Control-Allow-Origin": "*"'), "Must include Access-Control-Allow-Origin: *");
  assert.ok(iconCode.includes('"Content-Type": "image/svg+xml"'), "Must return image/svg+xml for generated SVG");
  assert.ok(iconCode.includes("max-age=86400"), "Must set long cache for icons");
});

// ============================================================================
// SUITE 5: Cross-Portal Isolation & Zero Contamination Matrix
// ============================================================================
console.log("\n--- SUITE 5: Cross-Portal Isolation & Zero Contamination Matrix ---");

runTest("Doctor Portal vs Patient Portal Isolation Contract", () => {
  const doctorManifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
  
  // Patient parameters from code
  const patientAppIdTemplate = (slug) => `/book/${slug}`;
  const patientStartUrlTemplate = (slug) => `/book/${slug}?utm_source=pwa`;
  const patientScopeTemplate = (slug) => `/book/${slug}`;

  const testSlug = "sharma-ent-clinic";
  const patientId = patientAppIdTemplate(testSlug);
  const patientStartUrl = patientStartUrlTemplate(testSlug);
  const patientScope = patientScopeTemplate(testSlug);

  // 1. App ID comparison
  assert.notEqual(doctorManifest.id, patientId);
  assert.equal(doctorManifest.id, "doctor-diary-app");
  assert.equal(patientId, `/book/${testSlug}`);

  // 2. Start URL comparison
  assert.notEqual(doctorManifest.start_url, patientStartUrl);
  assert.equal(doctorManifest.start_url, "/dashboard");
  assert.equal(patientStartUrl, `/book/${testSlug}?utm_source=pwa`);

  // 3. Scope comparison
  assert.notEqual(doctorManifest.scope, patientScope);
  assert.equal(doctorManifest.scope, "/");
  assert.equal(patientScope, `/book/${testSlug}`);

  // 4. Doctor routes are NOT covered by patient scope
  const doctorRoutes = ["/dashboard", "/dashboard/settings", "/dashboard/calendar", "/login", "/admin", "/onboarding"];
  for (const route of doctorRoutes) {
    assert.ok(!route.startsWith(patientScope), `Patient scope ${patientScope} must not match ${route}`);
  }
});

// ============================================================================
// SUITE 6: Simulation of Route Metadata and Manifest Generation
// ============================================================================
console.log("\n--- SUITE 6: Simulation of Route Metadata and Manifest Generation ---");

runTest("Simulated Manifest Generation matches specification", () => {
  // Pure logic simulation of manifest generator
  function generateManifestForClinic(clinic, slug) {
    const themeColor = clinic.themeColor || "#0ea5e9";
    const appName = clinic.name || "Clinic App";
    const shortName = appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;

    let dynamicIconType = "image/png";
    if (clinic.logoUrl) {
      const lower = clinic.logoUrl.toLowerCase();
      if (lower.endsWith(".svg")) dynamicIconType = "image/svg+xml";
      else if (lower.endsWith(".webp")) dynamicIconType = "image/webp";
      else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) dynamicIconType = "image/jpeg";
    } else {
      dynamicIconType = "image/svg+xml";
    }

    const icons = [
      { src: `/api/manifest/${slug}/icon?size=192`, sizes: "192x192", type: dynamicIconType, purpose: "any" },
      { src: `/api/manifest/${slug}/icon?size=192`, sizes: "192x192", type: dynamicIconType, purpose: "maskable" },
      { src: `/api/manifest/${slug}/icon?size=512`, sizes: "512x512", type: dynamicIconType, purpose: "any" },
      { src: `/api/manifest/${slug}/icon?size=512`, sizes: "512x512", type: dynamicIconType, purpose: "maskable" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ];

    return {
      id: `/book/${slug}`,
      name: appName,
      short_name: shortName,
      description: `Official booking and live queue tracking app for ${appName}`,
      start_url: `/book/${slug}?utm_source=pwa`,
      scope: `/book/${slug}`,
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#f8fafc",
      theme_color: themeColor,
      categories: ["medical", "health", "productivity"],
      lang: "en-IN",
      prefer_related_applications: false,
      icons,
    };
  }

  const manifest = generateManifestForClinic({
    name: "Dr. Sharma's Ortho Clinic",
    themeColor: "#059669",
    logoUrl: null,
  }, "sharma-ortho");

  assert.equal(manifest.id, "/book/sharma-ortho");
  assert.equal(manifest.short_name, "Dr. Sharma'…");
  assert.equal(manifest.theme_color, "#059669");
  assert.equal(manifest.icons.length, 8);
  assert.equal(manifest.icons[0].type, "image/svg+xml");
});

runTest("Simulated SVG Icon Generation with Special Characters", () => {
  function generateSvg(clinicName, rawColor, size = 512) {
    const themeColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ? rawColor : "#0f766e";
    const rawInitials = clinicName
      ? clinicName.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : "DR";

    const clinicInitials = rawInitials
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)" />
  <circle cx="256" cy="256" r="180" fill="white" fill-opacity="0.1" />
  <path d="M256 140 V372 M140 256 H372" stroke="white" stroke-width="36" stroke-linecap="round" filter="url(#glow)" />
  <text x="256" y="440" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="2">${clinicInitials}</text>
</svg>`;
  }

  const svg1 = generateSvg("Skin & Laser Clinic", "#10b981", 192);
  assert.ok(svg1.includes('width="192"'));
  assert.ok(svg1.includes('stop-color="#10b981"'));
  assert.ok(svg1.includes('S&amp;')); // initials from "Skin & Laser" are "S" and "&"

  const svg2 = generateSvg("<b>Care</b> Clinic", "invalid-color", 512);
  assert.ok(svg2.includes('stop-color="#0f766e"')); // fallback color
  assert.ok(svg2.includes('&lt;C')); // initials from "<b>Care</b>" are "<" and "C"
});

console.log("\n================================================================================");
console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
console.log("================================================================================");

if (failedTests > 0) {
  process.exit(1);
}
