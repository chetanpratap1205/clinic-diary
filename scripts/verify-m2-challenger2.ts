/**
 * Challenger 2 Adversarial Stress Test Suite for Milestone 2:
 * Route Metadata Linking, Manifest Generation, Icon Proxy, and Cross-Portal Isolation
 */

import { strict as assert } from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { parse } from "node:url";

console.log("================================================================================");
console.log("   CHALLENGER 2 EMPIRICAL TEST SUITE - MILESTONE 2: MANIFEST & METADATA        ");
console.log("================================================================================\n");

let passedTests = 0;
let failedTests = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passedTests++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) console.error(`    ${err.stack.split("\n").slice(1, 4).join("\n    ")}`);
      failedTests++;
    }
  })();
}

async function main() {
  // ============================================================================
  // SUITE 1: Route Metadata Resolution & Linking Hierarchy
  // ============================================================================
  console.log("--- SUITE 1: Route Metadata Resolution & Linking Hierarchy ---");

  await runTest("Root Layout (/app/layout.tsx) exports doctor manifest by default", () => {
    const layoutContent = fs.readFileSync("src/app/layout.tsx", "utf-8");
    assert.ok(layoutContent.includes('manifest: "/manifest.json"'), "Root layout must point to /manifest.json");
    assert.ok(layoutContent.includes('title: "Doctor Diary"'), "Root appleWebApp must specify Doctor Diary");
    assert.ok(layoutContent.includes('capable: true'), "Root appleWebApp must be capable");
  });

  await runTest("Doctor Dashboard (/dashboard) inherits root doctor manifest without override", () => {
    const dashboardLayout = fs.readFileSync("src/app/dashboard/layout.tsx", "utf-8");
    // Dashboard layout must NOT declare a custom manifest (so it falls back to /manifest.json)
    assert.equal(dashboardLayout.includes("manifest:"), false, "Dashboard layout should not override manifest");
  });

  await runTest("Patient Booking Layout (/clinic/[slug]/layout.tsx) generates dynamic clinic manifest", async () => {
    const bookingLayoutMod = await import("../src/app/clinic/[slug]/layout");
    assert.ok(typeof bookingLayoutMod.generateMetadata === "function", "generateMetadata must be exported");
    
    const testSlug = "apollo-dental-delhi";
    const meta = await bookingLayoutMod.generateMetadata({
      params: Promise.resolve({ slug: testSlug }),
    });
    assert.equal(meta.manifest, `/api/manifest/${testSlug}`, "Booking layout must link /api/manifest/[slug]");
  });

  await runTest("Patient Booking Page (/clinic/[slug]/page.tsx) generates dynamic clinic manifest", () => {
    const bookingPageContent = fs.readFileSync("src/app/clinic/[slug]/page.tsx", "utf-8");
    assert.ok(
      bookingPageContent.includes("manifest: `/api/manifest/${slug}`"),
      "Booking page metadata must include dynamic manifest link"
    );
  });

  await runTest("Patient Tracking Layout (/track/[appointmentId]/layout.tsx) handles demo-* links", async () => {
    const trackingLayoutMod = await import("../src/app/track/[appointmentId]/layout");
    assert.ok(typeof trackingLayoutMod.generateMetadata === "function", "generateMetadata must be exported");

    const demoMeta = await trackingLayoutMod.generateMetadata({
      params: Promise.resolve({ appointmentId: "demo-ayurveda-care" }),
    });
    assert.equal(demoMeta.manifest, "/api/manifest/ayurveda-care", "Demo link must extract clinic slug and link manifest");
  });

  await runTest("Patient Tracking Layout (/track/[appointmentId]/layout.tsx) gracefully handles non-existent/invalid IDs", async () => {
    const trackingLayoutMod = await import("../src/app/track/[appointmentId]/layout");
    
    // Invalid UUID / missing appointment should not throw, returns empty object
    const result = await trackingLayoutMod.generateMetadata({
      params: Promise.resolve({ appointmentId: "00000000-0000-0000-0000-000000000000" }),
    });
    assert.deepEqual(result, {}, "Invalid tracking ID must return {} gracefully");
  });

  await runTest("Patient Tracking Page (/track/[appointmentId]/page.tsx) handles demo-* links", async () => {
    const trackingPageMod = await import("../src/app/track/[appointmentId]/page");
    assert.ok(typeof trackingPageMod.generateMetadata === "function", "generateMetadata must be exported");

    const demoMeta = await trackingPageMod.generateMetadata({
      params: Promise.resolve({ appointmentId: "demo-max-hospital" }),
    });
    assert.equal(demoMeta.manifest, "/api/manifest/max-hospital", "Demo link must link manifest in page metadata");
    assert.equal(demoMeta.title, "Live Tracking | Demo Patient", "Demo link must return live tracking title");
  });

  await runTest("Patient Status Page (/status/[slug]/page.tsx) metadata links clinic manifest", () => {
    const statusPageContent = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");
    assert.ok(
      statusPageContent.includes("manifest: `/api/manifest/${slug}`"),
      "Status page metadata must include dynamic manifest link"
    );
  });

  // ============================================================================
  // SUITE 2: Doctor Diary Portal Manifest Integrity
  // ============================================================================
  console.log("\n--- SUITE 2: Doctor Diary Portal Manifest Integrity ---");

  await runTest("public/manifest.json conforms strictly to Doctor Diary specification", () => {
    const raw = fs.readFileSync("public/manifest.json", "utf-8");
    const manifest = JSON.parse(raw);

    assert.equal(manifest.id, "doctor-diary-app", "id must be doctor-diary-app");
    assert.equal(manifest.start_url, "/dashboard", "start_url must be /dashboard");
    assert.equal(manifest.scope, "/", "scope must be /");
    assert.equal(manifest.display, "standalone", "display must be standalone");
    assert.equal(manifest.theme_color, "#0f766e", "theme_color must match doctor diary theme");
    assert.ok(Array.isArray(manifest.icons), "icons must be an array");
    assert.ok(manifest.icons.length >= 4, "icons must have at least 4 entries (192 any/maskable, 512 any/maskable)");

    const purposes = manifest.icons.map((i: any) => i.purpose);
    assert.ok(purposes.includes("any"), "Must have purpose 'any'");
    assert.ok(purposes.includes("maskable"), "Must have purpose 'maskable'");
    assert.ok(!purposes.includes("any maskable"), "Must NOT combine 'any maskable'");

    // Check sizes
    const sizes = manifest.icons.map((i: any) => i.sizes);
    assert.ok(sizes.includes("192x192"), "Must include 192x192");
    assert.ok(sizes.includes("512x512"), "Must include 512x512");
  });

  // ============================================================================
  // SUITE 3: Dynamic Manifest API Endpoint (/api/manifest/[slug])
  // ============================================================================
  console.log("\n--- SUITE 3: Dynamic Manifest API Endpoint (/api/manifest/[slug]) ---");

  await runTest("Manifest route handler constructs valid Web App Manifest", async () => {
    const manifestRouteMod = await import("../src/app/api/manifest/[slug]/route");
    assert.ok(typeof manifestRouteMod.GET === "function", "GET handler must be exported");

    const req = new Request("http://localhost:3000/api/manifest/demo-ayurveda-care");
    const response = await manifestRouteMod.GET(req, {
      params: Promise.resolve({ slug: "demo-ayurveda-care" }),
    });

    // Check headers
    assert.equal(response.headers.get("Content-Type"), "application/manifest+json");
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
    assert.ok(response.headers.get("Cache-Control")?.includes("max-age=3600"));

    const json = await response.json();
    assert.equal(json.id, "/clinic/demo-ayurveda-care", "id must be /clinic/[slug]");
    assert.equal(json.start_url, "/clinic/demo-ayurveda-care?utm_source=pwa", "start_url must be /clinic/[slug]?utm_source=pwa");
    assert.equal(json.scope, "/clinic/demo-ayurveda-care", "scope must be /clinic/[slug]");
    assert.equal(json.display, "standalone", "display must be standalone");
    assert.equal(json.orientation, "portrait-primary", "orientation must be portrait-primary");
    assert.deepEqual(json.categories, ["medical", "health", "productivity"]);
    assert.equal(json.lang, "en-IN");
    assert.equal(json.prefer_related_applications, false);

    // Check icons
    assert.ok(Array.isArray(json.icons), "icons must be an array");
    assert.equal(json.icons.length, 8, "Must contain exactly 8 icons (4 dynamic + 4 static fallbacks)");

    // Verify discrete purpose entries
    for (const icon of json.icons) {
      assert.ok(
        icon.purpose === "any" || icon.purpose === "maskable",
        `Icon purpose must be strictly 'any' or 'maskable', got '${icon.purpose}'`
      );
      assert.ok(
        icon.sizes === "192x192" || icon.sizes === "512x512",
        `Icon sizes must be 192x192 or 512x512, got '${icon.sizes}'`
      );
    }

    // Verify dynamic proxy icon URLs
    const dynamic192Any = json.icons.find((i: any) => i.src.includes("size=192") && i.purpose === "any");
    const dynamic192Maskable = json.icons.find((i: any) => i.src.includes("size=192") && i.purpose === "maskable");
    const dynamic512Any = json.icons.find((i: any) => i.src.includes("size=512") && i.purpose === "any");
    const dynamic512Maskable = json.icons.find((i: any) => i.src.includes("size=512") && i.purpose === "maskable");

    assert.ok(dynamic192Any, "Must have dynamic 192 any icon");
    assert.ok(dynamic192Maskable, "Must have dynamic 192 maskable icon");
    assert.ok(dynamic512Any, "Must have dynamic 512 any icon");
    assert.ok(dynamic512Maskable, "Must have dynamic 512 maskable icon");

    // Verify static fallbacks
    const static192Any = json.icons.find((i: any) => i.src === "/icon-192.png" && i.purpose === "any");
    const static192Maskable = json.icons.find((i: any) => i.src === "/icon-192.png" && i.purpose === "maskable");
    const static512Any = json.icons.find((i: any) => i.src === "/icon-512.png" && i.purpose === "any");
    const static512Maskable = json.icons.find((i: any) => i.src === "/icon-512.png" && i.purpose === "maskable");

    assert.ok(static192Any, "Must have static 192 any icon");
    assert.ok(static192Maskable, "Must have static 192 maskable icon");
    assert.ok(static512Any, "Must have static 512 any icon");
    assert.ok(static512Maskable, "Must have static 512 maskable icon");
  });

  await runTest("Manifest route returns 404 for unknown clinic slug", async () => {
    const manifestRouteMod = await import("../src/app/api/manifest/[slug]/route");
    const req = new Request("http://localhost:3000/api/manifest/non-existent-random-slug-12345");
    const response = await manifestRouteMod.GET(req, {
      params: Promise.resolve({ slug: "non-existent-random-slug-12345" }),
    });
    assert.equal(response.status, 404, "Unknown clinic must return 404");
  });

  // ============================================================================
  // SUITE 4: Dynamic Icon Generator & Proxy (/api/manifest/[slug]/icon)
  // ============================================================================
  console.log("\n--- SUITE 4: Dynamic Icon Generator & Proxy (/api/manifest/[slug]/icon) ---");

  await runTest("Dynamic icon route parses ?size= parameter accurately (192, 512, 1024)", async () => {
    const iconRouteMod = await import("../src/app/api/manifest/[slug]/icon/route");
    assert.ok(typeof iconRouteMod.GET === "function", "GET handler must be exported");

    for (const size of [192, 512, 1024]) {
      const req = new Request(`http://localhost:3000/api/manifest/demo-ayurveda-care/icon?size=${size}`);
      const response = await iconRouteMod.GET(req, {
        params: Promise.resolve({ slug: "demo-ayurveda-care" }),
      });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Content-Type"), "image/svg+xml");
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");

      const svgText = await response.text();
      assert.ok(svgText.includes(`width="${size}"`), `SVG must specify width="${size}"`);
      assert.ok(svgText.includes(`height="${size}"`), `SVG must specify height="${size}"`);
      assert.ok(svgText.includes(`viewBox="0 0 512 512"`), "SVG must preserve 512x512 viewBox");
    }
  });

  await runTest("Dynamic icon route safely clamps adversarial / invalid sizes to default (512)", async () => {
    const iconRouteMod = await import("../src/app/api/manifest/[slug]/icon/route");
    const testCases = ["0", "-50", "99999", "abc", "NaN", "", "%20"];

    for (const badSize of testCases) {
      const req = new Request(`http://localhost:3000/api/manifest/demo-ayurveda-care/icon?size=${badSize}`);
      const response = await iconRouteMod.GET(req, {
        params: Promise.resolve({ slug: "demo-ayurveda-care" }),
      });
      assert.equal(response.status, 200);
      const svgText = await response.text();
      assert.ok(svgText.includes('width="512"') && svgText.includes('height="512"'), `Bad size '${badSize}' must fall back to 512`);
    }
  });

  await runTest("Dynamic icon route escapes XML entities to prevent SVG syntax crashes", () => {
    // Check SVG escaping in icon route source code
    const iconSource = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");
    assert.ok(iconSource.includes('.replace(/&/g, "&amp;")'), "Must escape &");
    assert.ok(iconSource.includes('.replace(/</g, "&lt;")'), "Must escape <");
    assert.ok(iconSource.includes('.replace(/>/g, "&gt;")'), "Must escape >");
    assert.ok(iconSource.includes('.replace(/"/g, "&quot;")'), "Must escape \"");
    assert.ok(iconSource.includes(".replace(/'/g, \"&apos;\")"), "Must escape '");
  });

  await runTest("Dynamic icon route enforces 3.5s timeout on remote logo proxy fetches", () => {
    const iconSource = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");
    assert.ok(iconSource.includes("const controller = new AbortController()"), "Must use AbortController");
    assert.ok(iconSource.includes("setTimeout(() => controller.abort(), 3500)"), "Must set 3500ms timeout");
    assert.ok(iconSource.includes("signal: controller.signal"), "Must pass abort signal to fetch");
  });

  // ============================================================================
  // SUITE 5: Zero Cross-Contamination & Strict Isolation Stress Test
  // ============================================================================
  console.log("\n--- SUITE 5: Zero Cross-Contamination & Strict Isolation Stress Test ---");

  await runTest("Doctor PWA and Patient PWA have completely mutually exclusive identities & scopes", async () => {
    const doctorManifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
    const manifestRouteMod = await import("../src/app/api/manifest/[slug]/route");

    const req = new Request("http://localhost:3000/api/manifest/demo-ayurveda-care");
    const response = await manifestRouteMod.GET(req, {
      params: Promise.resolve({ slug: "demo-ayurveda-care" }),
    });
    const patientManifest = await response.json();

    // 1. App ID isolation
    assert.notEqual(doctorManifest.id, patientManifest.id, "Doctor and Patient app IDs must be distinct");
    assert.equal(doctorManifest.id, "doctor-diary-app", "Doctor app ID must be doctor-diary-app");
    assert.equal(patientManifest.id, "/clinic/demo-ayurveda-care", "Patient app ID must be scoped to /clinic/[slug]");

    // 2. Scope isolation
    assert.notEqual(doctorManifest.scope, patientManifest.scope, "Doctor and Patient scopes must be distinct");
    assert.equal(doctorManifest.scope, "/", "Doctor scope is root");
    assert.equal(patientManifest.scope, "/clinic/demo-ayurveda-care", "Patient scope is strictly /clinic/[slug]");

    // 3. Start URL isolation
    assert.notEqual(doctorManifest.start_url, patientManifest.start_url, "Start URLs must be distinct");
    assert.equal(doctorManifest.start_url, "/dashboard", "Doctor start_url is /dashboard");
    assert.equal(patientManifest.start_url, "/clinic/demo-ayurveda-care?utm_source=pwa", "Patient start_url has utm_source=pwa");

    // 4. Verification that patient PWA scope cannot capture doctor routes
    const patientScope = patientManifest.scope;
    const doctorRoutes = ["/dashboard", "/dashboard/settings", "/login", "/admin", "/onboarding"];
    for (const r of doctorRoutes) {
      assert.ok(!r.startsWith(patientScope), `Patient scope ${patientScope} must NOT encompass doctor route ${r}`);
    }
  });

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
  console.log("================================================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
