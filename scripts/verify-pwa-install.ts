import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { detectDevicePlatformFromSignals } from "../src/lib/pwa-platform";

const androidChrome =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const androidWhatsApp =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.0.0 Mobile Safari/537.36 WhatsApp/2.24";
const iPhoneSafari =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const iPhoneInstagram =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 335.0.0.0.85";
const iPadDesktopUA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const desktopChrome =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

assert.equal(
  detectDevicePlatformFromSignals({ userAgent: androidChrome }),
  "android"
);
assert.equal(
  detectDevicePlatformFromSignals({ userAgent: androidWhatsApp }),
  "android_in_app"
);
assert.equal(
  detectDevicePlatformFromSignals({ userAgent: iPhoneSafari }),
  "ios"
);
assert.equal(
  detectDevicePlatformFromSignals({ userAgent: iPhoneInstagram }),
  "ios_in_app"
);
assert.equal(
  detectDevicePlatformFromSignals({ userAgent: iPadDesktopUA, maxTouchPoints: 5 }),
  "ios"
);
assert.equal(
  detectDevicePlatformFromSignals({ userAgent: desktopChrome }),
  "desktop"
);
assert.equal(
  detectDevicePlatformFromSignals({ userAgent: desktopChrome, isStandalone: true }),
  "installed"
);

// ─── 1. Static Asset & Service Worker Verification ───────────────────────────
assert.ok(existsSync(join(process.cwd(), "public/sw.js")), "public/sw.js must exist");
assert.ok(existsSync(join(process.cwd(), "public/icon-192.png")), "public/icon-192.png must exist");
assert.ok(existsSync(join(process.cwd(), "public/icon-512.png")), "public/icon-512.png must exist");
assert.ok(existsSync(join(process.cwd(), "public/manifest.json")), "public/manifest.json must exist");

// ─── 2. Manifest JSON Invariant Check ───────────────────────────────────────
const staticManifestRaw = readFileSync(join(process.cwd(), "public/manifest.json"), "utf8");
const staticManifest = JSON.parse(staticManifestRaw);
assert.ok(staticManifest.name, "manifest name required");
assert.ok(staticManifest.short_name, "manifest short_name required");
assert.ok(staticManifest.start_url, "manifest start_url required");
assert.equal(staticManifest.display, "standalone", "manifest display must be standalone");
assert.ok(Array.isArray(staticManifest.icons) && staticManifest.icons.length >= 2, "manifest icons required");

// ─── 3. Single-Owner Hook & Component Invariants ──────────────────────────────
const usePWAInstallSource = readFileSync(join(process.cwd(), "src/hooks/use-pwa-install.ts"), "utf8");
const pwaProviderSource = readFileSync(join(process.cwd(), "src/components/pwa-provider.tsx"), "utf8");

assert.match(usePWAInstallSource, /window\.addEventListener\("beforeinstallprompt"/, "usePWAInstall must listen to beforeinstallprompt");
assert.match(usePWAInstallSource, /BEFOREINSTALLPROMPT FIRED/, "usePWAInstall must log BIP event for diagnostics");
assert.match(usePWAInstallSource, /appInstalled:/, "usePWAInstall must track appInstalled in diagnostics");
assert.match(pwaProviderSource, /const \{ isInstalled, deferredPrompt, triggerInstall \} = usePWAInstall\(\)/, "PWAProvider must consume usePWAInstall as single source of truth");

// ─── 4. Dynamic Manifest Route Verification ─────────────────────────────────
const manifestRoute = readFileSync(
  join(process.cwd(), "src/app/api/manifest/[slug]/route.ts"),
  "utf8"
);
const iconRoute = readFileSync(
  join(process.cwd(), "src/app/api/manifest/[slug]/icon/route.ts"),
  "utf8"
);

assert.match(manifestRoute, /src: "\/icon-192\.png"[\s\S]*purpose: "any"/);
assert.match(manifestRoute, /src: "\/icon-512\.png"[\s\S]*purpose: "maskable"/);
assert.match(manifestRoute, /type: "image\/svg\+xml"/);
assert.match(manifestRoute, /display: "standalone"/);
assert.match(manifestRoute, /prefer_related_applications: false/);
assert.doesNotMatch(iconRoute, /fetch\(clinic\.logoUrl/);
assert.match(iconRoute, /Content-Type": "image\/svg\+xml; charset=utf-8"/);

console.log("PWA install verification passed with comprehensive assertions.");

