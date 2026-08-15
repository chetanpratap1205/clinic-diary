import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

console.log("=== Milestone 2 Verification Suite ===\n");

// 1. Check pwa-provider.tsx & use-pwa-install.ts for duplicate type exports
console.log("Checking PWA Provider & use-pwa-install type exports...");
const pwaProviderCode = fs.readFileSync("src/components/pwa-provider.tsx", "utf-8");
assert.equal(
  pwaProviderCode.includes("export type { BeforeInstallPromptEvent }"),
  false,
  "pwa-provider.tsx must NOT re-export ambient BeforeInstallPromptEvent"
);

const usePwaInstallCode = fs.readFileSync("src/hooks/use-pwa-install.ts", "utf-8");
assert.equal(
  usePwaInstallCode.includes("export type { BeforeInstallPromptEvent }"),
  false,
  "use-pwa-install.ts must NOT re-export ambient BeforeInstallPromptEvent"
);
console.log("✓ PWA type exports verified clean.\n");

// 2. Check tracking-client.tsx JSX nesting & fragment wrapping
console.log("Checking tracking-client.tsx syntax structure...");
const trackingClientCode = fs.readFileSync("src/app/track/[appointmentId]/tracking-client.tsx", "utf-8");
assert.ok(
  trackingClientCode.includes("return (\n    <>") || trackingClientCode.includes("return (\r\n    <>"),
  "tracking-client.tsx should wrap return in fragment"
);
assert.ok(
  trackingClientCode.includes("    </>\n  );") || trackingClientCode.includes("    </>\r\n  );"),
  "tracking-client.tsx should close fragment before return end"
);
console.log("✓ tracking-client.tsx JSX nesting verified clean.\n");

// 3. Check manifest generator route
console.log("Checking src/app/api/manifest/[slug]/route.ts...");
const manifestRouteCode = fs.readFileSync("src/app/api/manifest/[slug]/route.ts", "utf-8");

assert.ok(manifestRouteCode.includes('id: `/book/${slug}`'), "Manifest must define clinic-isolated id");
assert.ok(manifestRouteCode.includes('start_url: `/book/${slug}?utm_source=pwa`'), "Manifest must define clinic start_url");
assert.ok(manifestRouteCode.includes('scope: `/book/${slug}`'), "Manifest must define clinic scope");
assert.ok(manifestRouteCode.includes('display: "standalone"'), "Manifest must define standalone display");
assert.ok(manifestRouteCode.includes('background_color: "#f8fafc"'), "Manifest must define background_color");
assert.ok(manifestRouteCode.includes('"Content-Type": "application/manifest+json"'), "Manifest response must have application/manifest+json content type");
assert.ok(manifestRouteCode.includes('"Access-Control-Allow-Origin": "*"'), "Manifest response must include CORS header");

// Check separate any and maskable purpose declarations
assert.ok(manifestRouteCode.includes('purpose: "any"'), 'Manifest icons must declare purpose: "any"');
assert.ok(manifestRouteCode.includes('purpose: "maskable"'), 'Manifest icons must declare purpose: "maskable"');
assert.equal(manifestRouteCode.includes('purpose: "any maskable"'), false, 'Manifest must NOT declare combined purpose "any maskable"');
assert.ok(manifestRouteCode.includes('src: `/api/manifest/${slug}/icon?size=192`'), "Manifest must reference dynamic 192 icon proxy");
assert.ok(manifestRouteCode.includes('src: `/api/manifest/${slug}/icon?size=512`'), "Manifest must reference dynamic 512 icon proxy");
assert.ok(manifestRouteCode.includes('src: "/icon-192.png"'), "Manifest must include static 192 icon fallback");
assert.ok(manifestRouteCode.includes('src: "/icon-512.png"'), "Manifest must include static 512 icon fallback");
console.log("✓ Manifest route verified compliant.\n");

// 4. Check dynamic icon route
console.log("Checking src/app/api/manifest/[slug]/icon/route.ts...");
const iconRouteCode = fs.readFileSync("src/app/api/manifest/[slug]/icon/route.ts", "utf-8");

assert.ok(iconRouteCode.includes('searchParams.get("size")'), "Icon route must parse size query param");
assert.ok(iconRouteCode.includes('doctorLeads'), "Icon route must fall back to doctorLeads");
assert.ok(iconRouteCode.includes('AbortController'), "Icon route must use AbortController timeout for remote logo");
assert.ok(iconRouteCode.includes('"Access-Control-Allow-Origin": "*"'), "Icon route must include CORS header");
assert.ok(iconRouteCode.includes('replace(/&/g, "&amp;")'), "Icon route must escape XML characters in initials");
console.log("✓ Dynamic icon route verified compliant.\n");

// 5. Check metadata in track/[appointmentId]/layout.tsx & page.tsx
console.log("Checking src/app/track/[appointmentId]/layout.tsx & page.tsx...");
const trackLayoutCode = fs.readFileSync("src/app/track/[appointmentId]/layout.tsx", "utf-8");
assert.ok(trackLayoutCode.includes("export async function generateMetadata"), "track layout must export generateMetadata");
assert.ok(trackLayoutCode.includes('manifest: `/api/manifest/${slug}`'), "track layout must handle demo-* appointment manifest");
assert.ok(trackLayoutCode.includes('manifest: `/api/manifest/${result.clinicSlug}`'), "track layout must return clinic manifest from DB");

const trackPageCode = fs.readFileSync("src/app/track/[appointmentId]/page.tsx", "utf-8");
assert.ok(trackPageCode.includes("export async function generateMetadata"), "track page must export generateMetadata");
assert.ok(trackPageCode.includes('manifest: `/api/manifest/${slug}`'), "track page must handle demo-* appointment manifest");
assert.ok(trackPageCode.includes('manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined'), "track page must return clinic manifest");
console.log("✓ Track metadata verified compliant.\n");

// 6. Check metadata in status/[slug]/page.tsx
console.log("Checking src/app/status/[slug]/page.tsx...");
const statusPageCode = fs.readFileSync("src/app/status/[slug]/page.tsx", "utf-8");
assert.ok(statusPageCode.includes("export async function generateMetadata"), "status page must export generateMetadata");
assert.ok(statusPageCode.includes('manifest: `/api/manifest/${slug}`'), "status page must return clinic manifest");
console.log("✓ Status metadata verified compliant.\n");

// 7. Doctor Diary manifest isolation check
console.log("Checking public/manifest.json for Doctor Diary PWA integrity...");
const doctorManifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
assert.equal(doctorManifest.id, "doctor-diary-app", "Doctor Diary manifest id must be doctor-diary-app");
assert.equal(doctorManifest.start_url, "/dashboard", "Doctor Diary start_url must be /dashboard");
assert.equal(doctorManifest.scope, "/", "Doctor Diary scope must be /");
console.log("✓ Doctor Diary PWA manifest untouched and intact.\n");

console.log("=== ALL MILESTONE 2 CHECKS PASSED SUCCESSFULLY ===");
