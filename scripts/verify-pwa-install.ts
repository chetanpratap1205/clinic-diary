import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

console.log("PWA install verification passed.");
