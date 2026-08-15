/**
 * Empirical Challenge Test Suite for Milestone 2:
 * Manifest Generation & Route Metadata Compliance
 */

import { strict as assert } from "node:assert";
import fs from "node:fs";
import http from "node:http";

// ── Test Harness ─────────────────────────────────────────────────────────────

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function test(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) console.error(`    ${err.stack.split("\n").slice(1, 3).join("\n    ")}`);
  }
}

// ── Re-create / Import Handlers for Direct Empirical Execution ───────────────

/**
 * Manifest generator runner matching src/app/api/manifest/[slug]/route.ts logic
 */
function createManifestHandler(mockDb) {
  return async function GET(request, { params }) {
    try {
      const { slug } = await params;
      
      let [clinic] = await mockDb.getClinic(slug);

      if (!clinic) {
        const [lead] = await mockDb.getLead(slug);
        if (!lead) {
          return new Response("Clinic not found", { status: 404 });
        }
        clinic = {
          name: lead.name || `${lead.doctorName}'s Clinic`,
          themeColor: "#0d9488",
          logoUrl: lead.logoUrl || null,
        };
      }

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
        {
          src: `/api/manifest/${slug}/icon?size=192`,
          sizes: "192x192",
          type: dynamicIconType,
          purpose: "any",
        },
        {
          src: `/api/manifest/${slug}/icon?size=192`,
          sizes: "192x192",
          type: dynamicIconType,
          purpose: "maskable",
        },
        {
          src: `/api/manifest/${slug}/icon?size=512`,
          sizes: "512x512",
          type: dynamicIconType,
          purpose: "any",
        },
        {
          src: `/api/manifest/${slug}/icon?size=512`,
          sizes: "512x512",
          type: dynamicIconType,
          purpose: "maskable",
        },
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ];

      const manifest = {
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

      return new Response(JSON.stringify(manifest), {
        headers: {
          "Content-Type": "application/manifest+json",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  };
}

/**
 * Icon generator runner matching src/app/api/manifest/[slug]/icon/route.ts logic
 */
function createIconHandler(mockDb, customFetch = fetch) {
  return async function GET(request, { params }) {
    try {
      const { slug } = await params;
      const url = new URL(request.url);
      const sizeParam = url.searchParams.get("size");
      const parsedSize = sizeParam ? parseInt(sizeParam, 10) : 512;
      const size = !isNaN(parsedSize) && parsedSize >= 16 && parsedSize <= 1024 ? parsedSize : 512;

      let [clinic] = await mockDb.getClinic(slug);

      if (!clinic) {
        const [lead] = await mockDb.getLead(slug);
        if (!lead) {
          return new Response("Not Found", { status: 404 });
        }
        clinic = {
          name: lead.name || `${lead.doctorName}'s Clinic`,
          themeColor: "#0d9488",
          logoUrl: lead.logoUrl || null,
        };
      }

      if (clinic.logoUrl && clinic.logoUrl.startsWith("http")) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const imgRes = await customFetch(clinic.logoUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent": "DoctorDiary-ManifestIconProxy/1.0",
            },
          });
          clearTimeout(timeoutId);

          if (imgRes.ok) {
            const contentType = imgRes.headers.get("content-type") || "image/png";
            const buffer = await imgRes.arrayBuffer();
            return new Response(buffer, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }
        } catch (e) {
          // Graceful fallback to dynamic SVG
        }
      }

      const rawColor = clinic.themeColor || "#0f766e";
      const themeColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ? rawColor : "#0f766e";

      const rawInitials = clinic.name
        ? clinic.name
            .trim()
            .split(/\s+/)
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()
        : "DR";

      const clinicInitials = rawInitials
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
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
  <!-- Stethoscope / Cross Icon -->
  <path d="M256 140 V372 M140 256 H372" stroke="white" stroke-width="36" stroke-linecap="round" filter="url(#glow)" />
  <text x="256" y="440" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="2">${clinicInitials}</text>
</svg>`;

      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response("Internal Server Error", { status: 500 });
    }
  };
}

// ── Main Test Runner ─────────────────────────────────────────────────────────

async function runEmpiricalSuite() {
  console.log("\n=======================================================");
  console.log("  M2 Empirical Challenge & Stress Test Suite");
  console.log("=======================================================\n");

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: Manifest Generator (/api/manifest/[slug])
  // ───────────────────────────────────────────────────────────────────────────
  console.log("--- Suite 1: Web Manifest Schema, Headers & Icons ---");

  const mockDb = {
    clinics: new Map([
      ["nature-express", { name: "Nature Express Cardiology", themeColor: "#10b981", logoUrl: null }],
      ["apollo-delhi", { name: "Apollo Hospital Delhi Central", themeColor: "#ff5722", logoUrl: "https://cdn.example.com/logo.webp" }],
      ["dr-smith", { name: "Smith Clinic", themeColor: "#3b82f6", logoUrl: "https://cdn.example.com/logo.svg" }],
      ["dr-patel", { name: "Patel Care", themeColor: "#8b5cf6", logoUrl: "https://cdn.example.com/logo.jpg" }],
      ["long-name-clinic", { name: "Super Speciality Healthcare Institute of Research & Science", themeColor: "#14b8a6", logoUrl: null }],
      ["malformed-color", { name: "Malformed Color Clinic", themeColor: "red; attack();", logoUrl: null }],
    ]),
    leads: new Map([
      ["ayurveda-care", { name: "Ayurveda Wellness Center", doctorName: "Rahul Sharma", logoUrl: null }],
      ["dr-lead-only", { name: "", doctorName: "Dr. Ananya Roy", logoUrl: "https://cdn.example.com/lead.png" }],
    ]),
    async getClinic(slug) {
      if (slug === "throw-error") throw new Error("Database connection timeout");
      const c = this.clinics.get(slug);
      return c ? [c] : [];
    },
    async getLead(slug) {
      const l = this.leads.get(slug);
      return l ? [l] : [];
    },
  };

  const manifestHandler = createManifestHandler(mockDb);

  await test("1.1: Returns valid JSON manifest for regular DB clinic with 200 status", async () => {
    const req = new Request("http://localhost:3000/api/manifest/nature-express");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });

    assert.equal(res.status, 200, "Status must be 200");
    assert.equal(res.headers.get("Content-Type"), "application/manifest+json", "Content-Type must be application/manifest+json");
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*", "CORS header must be *");
    assert.ok(res.headers.get("Cache-Control").includes("max-age=3600"), "Cache-Control must include 1 hour max-age");

    const data = await res.json();
    assert.equal(data.id, "/book/nature-express", "id must be isolated to /book/nature-express");
    assert.equal(data.start_url, "/book/nature-express?utm_source=pwa", "start_url must include utm_source=pwa");
    assert.equal(data.scope, "/book/nature-express", "scope must be /book/nature-express");
    assert.equal(data.display, "standalone", "display must be standalone");
    assert.equal(data.orientation, "portrait-primary", "orientation must be portrait-primary");
    assert.equal(data.background_color, "#f8fafc", "background_color must be #f8fafc");
    assert.equal(data.theme_color, "#10b981", "theme_color must match clinic themeColor");
    assert.deepEqual(data.categories, ["medical", "health", "productivity"], "categories must match standard");
    assert.equal(data.lang, "en-IN", "lang must be en-IN");
    assert.equal(data.prefer_related_applications, false);
  });

  await test("1.2: Strict Chromium/WebAPK Icon Purpose Compliance (zero combined 'any maskable')", async () => {
    const req = new Request("http://localhost:3000/api/manifest/nature-express");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    const data = await res.json();

    assert.ok(Array.isArray(data.icons), "icons must be an array");
    assert.equal(data.icons.length, 8, "must contain exactly 8 icon entries (4 dynamic + 4 static fallbacks)");

    // Check each icon entry
    for (const icon of data.icons) {
      assert.ok(icon.src, "Icon must have src");
      assert.ok(icon.sizes, "Icon must have sizes");
      assert.ok(icon.type, "Icon must have type");
      assert.ok(["any", "maskable"].includes(icon.purpose), `Icon purpose must be discrete 'any' or 'maskable', got '${icon.purpose}'`);
      assert.notEqual(icon.purpose, "any maskable", "Must NEVER combine 'any maskable'");
      assert.ok(icon.sizes === "192x192" || icon.sizes === "512x512", `Icon sizes must be 192x192 or 512x512, got ${icon.sizes}`);
    }

    // Check presence of dynamic proxy URLs
    const srcList = data.icons.map((i) => i.src);
    assert.ok(srcList.includes("/api/manifest/nature-express/icon?size=192"), "Must include 192 dynamic icon");
    assert.ok(srcList.includes("/api/manifest/nature-express/icon?size=512"), "Must include 512 dynamic icon");
    assert.ok(srcList.includes("/icon-192.png"), "Must include 192 static png");
    assert.ok(srcList.includes("/icon-512.png"), "Must include 512 static png");
  });

  await test("1.3: Truncates short_name with ellipsis when name > 12 characters", async () => {
    const req = new Request("http://localhost:3000/api/manifest/long-name-clinic");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "long-name-clinic" }) });
    const data = await res.json();

    assert.equal(data.name, "Super Speciality Healthcare Institute of Research & Science");
    assert.equal(data.short_name, "Super Speci…", "short_name must be truncated to 11 chars + ellipsis (12 total chars)");
    assert.ok(data.short_name.length <= 12, "short_name length must be <= 12");
  });

  await test("1.4: Preserves short_name when name <= 12 characters", async () => {
    const req = new Request("http://localhost:3000/api/manifest/dr-smith");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "dr-smith" }) });
    const data = await res.json();

    assert.equal(data.name, "Smith Clinic");
    assert.equal(data.short_name, "Smith Clinic", "short_name should not be truncated when <= 12 chars");
  });

  await test("1.5: Dynamic MIME type hints derived from clinic logoUrl", async () => {
    // 1. .svg -> image/svg+xml
    let res = await manifestHandler(new Request("http://localhost:3000/api/manifest/dr-smith"), { params: Promise.resolve({ slug: "dr-smith" }) });
    let data = await res.json();
    assert.equal(data.icons[0].type, "image/svg+xml");

    // 2. .webp -> image/webp
    res = await manifestHandler(new Request("http://localhost:3000/api/manifest/apollo-delhi"), { params: Promise.resolve({ slug: "apollo-delhi" }) });
    data = await res.json();
    assert.equal(data.icons[0].type, "image/webp");

    // 3. .jpg -> image/jpeg
    res = await manifestHandler(new Request("http://localhost:3000/api/manifest/dr-patel"), { params: Promise.resolve({ slug: "dr-patel" }) });
    data = await res.json();
    assert.equal(data.icons[0].type, "image/jpeg");

    // 4. null -> image/svg+xml (dynamic SVG generated)
    res = await manifestHandler(new Request("http://localhost:3000/api/manifest/nature-express"), { params: Promise.resolve({ slug: "nature-express" }) });
    data = await res.json();
    assert.equal(data.icons[0].type, "image/svg+xml");
  });

  await test("1.6: Lead clinic fallback generates valid manifest from doctorLeads table", async () => {
    const req = new Request("http://localhost:3000/api/manifest/ayurveda-care");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "ayurveda-care" }) });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.name, "Ayurveda Wellness Center");
    assert.equal(data.id, "/book/ayurveda-care");
    assert.equal(data.start_url, "/book/ayurveda-care?utm_source=pwa");
    assert.equal(data.theme_color, "#0d9488");
  });

  await test("1.7: Lead clinic with empty clinicName synthesizes name from doctorName", async () => {
    const req = new Request("http://localhost:3000/api/manifest/dr-lead-only");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "dr-lead-only" }) });
    assert.equal(res.status, 200);

    const data = await res.json();
    assert.equal(data.name, "Dr. Ananya Roy's Clinic");
    assert.equal(data.id, "/book/dr-lead-only");
  });

  await test("1.8: Non-existent clinic returns 404 status", async () => {
    const req = new Request("http://localhost:3000/api/manifest/non-existent-clinic-slug");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "non-existent-clinic-slug" }) });
    assert.equal(res.status, 404, "Unknown clinic must return 404");
  });

  await test("1.9: DB Exception returns 500 without crashing", async () => {
    const req = new Request("http://localhost:3000/api/manifest/throw-error");
    const res = await manifestHandler(req, { params: Promise.resolve({ slug: "throw-error" }) });
    assert.equal(res.status, 500, "Database error must return 500 gracefully");
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: Dynamic Icon Generator (/api/manifest/[slug]/icon)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 2: Dynamic Icon Generation, SVG Sanitization & Proxy ---");

  // Mock upstream fetch for image proxy
  const mockFetch = async (url, options) => {
    if (url.includes("timeout")) {
      return new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error("Timeout")), 4000);
        if (options?.signal) {
          options.signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    }
    if (url.includes("500-error")) {
      return new Response("Server Error", { status: 500 });
    }
    // Success response with PNG buffer
    const fakeBuffer = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]).buffer; // PNG magic bytes
    return new Response(fakeBuffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  };

  const iconDb = {
    clinics: new Map([
      ["nature-express", { name: "Nature Express Cardiology", themeColor: "#10b981", logoUrl: null }],
      ["special-chars", { name: "Smith & Jones <Advanced> \"Heart\" 'Clinic'", themeColor: "#3b82f6", logoUrl: null }],
      ["remote-logo", { name: "Remote Logo Clinic", themeColor: "#0ea5e9", logoUrl: "https://cdn.example.com/logo.png" }],
      ["timeout-logo", { name: "Timeout Clinic", themeColor: "#0ea5e9", logoUrl: "https://cdn.example.com/timeout.png" }],
      ["broken-remote-logo", { name: "Broken Logo Clinic", themeColor: "#0ea5e9", logoUrl: "https://cdn.example.com/500-error.png" }],
      ["hex-3-color", { name: "Short Hex Clinic", themeColor: "#0ea", logoUrl: null }],
      ["malformed-color", { name: "Malformed Color Clinic", themeColor: "javascript:alert(1)", logoUrl: null }],
    ]),
    leads: new Map([
      ["ayurveda-care", { name: "Ayurveda Wellness Center", doctorName: "Rahul Sharma", logoUrl: null }],
    ]),
    async getClinic(slug) {
      if (slug === "throw-error") throw new Error("DB Error");
      const c = this.clinics.get(slug);
      return c ? [c] : [];
    },
    async getLead(slug) {
      const l = this.leads.get(slug);
      return l ? [l] : [];
    },
  };

  const iconHandler = createIconHandler(iconDb, mockFetch);

  await test("2.1: Generates valid SVG with default size 512 when size omitted", async () => {
    const req = new Request("http://localhost:3000/api/manifest/nature-express/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "image/svg+xml");
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*");
    assert.ok(res.headers.get("Cache-Control").includes("max-age=86400"));

    const svg = await res.text();
    assert.ok(svg.includes('width="512"'), "width should be 512");
    assert.ok(svg.includes('height="512"'), "height should be 512");
    assert.ok(svg.includes('viewBox="0 0 512 512"'));
    assert.ok(svg.includes("#10b981"), "SVG must include clinic theme color");
    assert.ok(svg.includes("NE"), "Initials must be NE (Nature Express)");
  });

  await test("2.2: Dynamic size parameter parsing (192, 64, 1024)", async () => {
    // size=192
    let req = new Request("http://localhost:3000/api/manifest/nature-express/icon?size=192");
    let res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    let svg = await res.text();
    assert.ok(svg.includes('width="192"'));
    assert.ok(svg.includes('height="192"'));

    // size=64
    req = new Request("http://localhost:3000/api/manifest/nature-express/icon?size=64");
    res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    svg = await res.text();
    assert.ok(svg.includes('width="64"'));
    assert.ok(svg.includes('height="64"'));

    // size=1024
    req = new Request("http://localhost:3000/api/manifest/nature-express/icon?size=1024");
    res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    svg = await res.text();
    assert.ok(svg.includes('width="1024"'));
    assert.ok(svg.includes('height="1024"'));
  });

  await test("2.3: Out-of-bounds or malformed size clamps/defaults to 512", async () => {
    // size=10 (< 16)
    let req = new Request("http://localhost:3000/api/manifest/nature-express/icon?size=10");
    let res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    let svg = await res.text();
    assert.ok(svg.includes('width="512"'), "Size < 16 must default to 512");

    // size=2048 (> 1024)
    req = new Request("http://localhost:3000/api/manifest/nature-express/icon?size=2048");
    res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    svg = await res.text();
    assert.ok(svg.includes('width="512"'), "Size > 1024 must default to 512");

    // size=abc
    req = new Request("http://localhost:3000/api/manifest/nature-express/icon?size=abc");
    res = await iconHandler(req, { params: Promise.resolve({ slug: "nature-express" }) });
    svg = await res.text();
    assert.ok(svg.includes('width="512"'), "Non-numeric size must default to 512");
  });

  await test("2.4: XML Entity Escaping in SVG Initials (No XML injection / XSS)", async () => {
    const req = new Request("http://localhost:3000/api/manifest/special-chars/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "special-chars" }) });
    const svg = await res.text();

    // Initials of "Smith & Jones ..." -> "S&"
    // Must be escaped as "S&amp;" in XML
    assert.ok(svg.includes("S&amp;"), "Ampersand '&' must be XML escaped to '&amp;'");
    assert.equal(svg.includes("<text x=\"256\" y=\"440\" text-anchor=\"middle\" fill=\"white\" font-family=\"system-ui, -apple-system, sans-serif\" font-weight=\"900\" font-size=\"44\" letter-spacing=\"2\">S&amp;</text>"), true);
  });

  await test("2.5: Theme color validation and hex sanitization", async () => {
    // 3-char hex #0ea
    let req = new Request("http://localhost:3000/api/manifest/hex-3-color/icon");
    let res = await iconHandler(req, { params: Promise.resolve({ slug: "hex-3-color" }) });
    let svg = await res.text();
    assert.ok(svg.includes("#0ea"), "3-char valid hex must be accepted");

    // Malformed color -> fallback to #0f766e
    req = new Request("http://localhost:3000/api/manifest/malformed-color/icon");
    res = await iconHandler(req, { params: Promise.resolve({ slug: "malformed-color" }) });
    svg = await res.text();
    assert.ok(svg.includes("#0f766e"), "Malformed color must fall back to safe default #0f766e");
    assert.equal(svg.includes("javascript"), false, "Dangerous string must never be injected into SVG");
  });

  await test("2.6: Proxies remote logo image when logoUrl is valid", async () => {
    const req = new Request("http://localhost:3000/api/manifest/remote-logo/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "remote-logo" }) });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "image/png");
    assert.equal(res.headers.get("Access-Control-Allow-Origin"), "*");
    const buffer = await res.arrayBuffer();
    assert.equal(buffer.byteLength, 8, "Must return image buffer");
  });

  await test("2.7: Remote logo timeout falls back gracefully to dynamic SVG", async () => {
    const req = new Request("http://localhost:3000/api/manifest/timeout-logo/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "timeout-logo" }) });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "image/svg+xml", "Must fall back to SVG on fetch timeout");
    const svg = await res.text();
    assert.ok(svg.includes("<svg"), "Must return valid SVG markup");
    assert.ok(svg.includes("TC"), "Initials must be TC (Timeout Clinic)");
  });

  await test("2.8: Remote logo 500 error falls back gracefully to dynamic SVG", async () => {
    const req = new Request("http://localhost:3000/api/manifest/broken-remote-logo/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "broken-remote-logo" }) });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "image/svg+xml");
    const svg = await res.text();
    assert.ok(svg.includes("<svg"));
  });

  await test("2.9: Lead clinic fallback generates valid icon", async () => {
    const req = new Request("http://localhost:3000/api/manifest/ayurveda-care/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "ayurveda-care" }) });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get("Content-Type"), "image/svg+xml");
    const svg = await res.text();
    assert.ok(svg.includes("AW"), "Initials must be AW (Ayurveda Wellness)");
  });

  await test("2.10: Non-existent clinic returns 404 for icon", async () => {
    const req = new Request("http://localhost:3000/api/manifest/non-existent/icon");
    const res = await iconHandler(req, { params: Promise.resolve({ slug: "non-existent" }) });
    assert.equal(res.status, 404);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: Route Metadata Verification
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 3: Route Metadata & Layout Manifest Links ---");

  // Re-create generateMetadata logic from track/[appointmentId]/layout.tsx & page.tsx
  const mockTrackDb = {
    appointments: new Map([
      ["appt-123", { clinicSlug: "nature-express", patientName: "Rahul Verma", clinicName: "Nature Express Cardiology" }],
    ]),
    async getAppt(id) {
      if (id === "db-error-uuid") throw new Error("Postgres query failed");
      const a = this.appointments.get(id);
      return a ? [a] : [];
    },
  };

  async function generateTrackLayoutMetadata({ params }) {
    const { appointmentId } = await params;
    if (appointmentId.startsWith("demo-")) {
      const slug = appointmentId.replace("demo-", "");
      return { manifest: `/api/manifest/${slug}` };
    }
    try {
      const [result] = await mockTrackDb.getAppt(appointmentId);
      if (result?.clinicSlug) {
        return { manifest: `/api/manifest/${result.clinicSlug}` };
      }
    } catch {
      // Graceful fallback
    }
    return {};
  }

  async function generateTrackPageMetadata({ params }) {
    const { appointmentId } = await params;
    if (appointmentId.startsWith("demo-")) {
      const slug = appointmentId.replace("demo-", "");
      return {
        title: "Live Tracking | Demo Patient",
        manifest: `/api/manifest/${slug}`,
      };
    }
    try {
      const [result] = await mockTrackDb.getAppt(appointmentId);
      if (!result) return { title: "Not Found" };
      return {
        title: `Live Tracking | ${result.patientName}${result.clinicName ? ` - ${result.clinicName}` : ""}`,
        manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined,
      };
    } catch {
      return { title: "Invalid Tracking Link" };
    }
  }

  await test("3.1: Tracking Layout generates manifest for demo-* appointment ID", async () => {
    const meta = await generateTrackLayoutMetadata({ params: Promise.resolve({ appointmentId: "demo-ayurveda-care" }) });
    assert.equal(meta.manifest, "/api/manifest/ayurveda-care", "Demo link must extract slug and link manifest");
  });

  await test("3.2: Tracking Layout generates manifest for real appointment UUID in DB", async () => {
    const meta = await generateTrackLayoutMetadata({ params: Promise.resolve({ appointmentId: "appt-123" }) });
    assert.equal(meta.manifest, "/api/manifest/nature-express", "DB lookup must link clinic manifest");
  });

  await test("3.3: Tracking Layout handles invalid UUID / DB error without crashing", async () => {
    const meta = await generateTrackLayoutMetadata({ params: Promise.resolve({ appointmentId: "db-error-uuid" }) });
    assert.deepEqual(meta, {}, "Error must return empty metadata object gracefully");
  });

  await test("3.4: Tracking Page generates manifest and title for demo-*", async () => {
    const meta = await generateTrackPageMetadata({ params: Promise.resolve({ appointmentId: "demo-ayurveda-care" }) });
    assert.equal(meta.title, "Live Tracking | Demo Patient");
    assert.equal(meta.manifest, "/api/manifest/ayurveda-care");
  });

  await test("3.5: Tracking Page generates manifest and patient title for real appointment", async () => {
    const meta = await generateTrackPageMetadata({ params: Promise.resolve({ appointmentId: "appt-123" }) });
    assert.equal(meta.title, "Live Tracking | Rahul Verma - Nature Express Cardiology");
    assert.equal(meta.manifest, "/api/manifest/nature-express");
  });

  // Re-create generateMetadata logic from status/[slug]/page.tsx
  async function generateStatusPageMetadata({ params }) {
    const { slug } = await params;
    let [clinic] = await mockDb.getClinic(slug);
    if (!clinic) {
      const [lead] = await mockDb.getLead(slug);
      if (!lead) return { title: "Not Found" };
      clinic = { name: lead.name || `${lead.doctorName}'s Clinic` };
    }
    return {
      title: `Check Status | ${clinic.name}`,
      description: `Check your live queue status at ${clinic.name}.`,
      manifest: `/api/manifest/${slug}`,
    };
  }

  await test("3.6: Status Page generates clinic manifest for regular DB clinic", async () => {
    const meta = await generateStatusPageMetadata({ params: Promise.resolve({ slug: "nature-express" }) });
    assert.equal(meta.title, "Check Status | Nature Express Cardiology");
    assert.equal(meta.manifest, "/api/manifest/nature-express");
  });

  await test("3.7: Status Page generates clinic manifest for lead clinic", async () => {
    const meta = await generateStatusPageMetadata({ params: Promise.resolve({ slug: "ayurveda-care" }) });
    assert.equal(meta.title, "Check Status | Ayurveda Wellness Center");
    assert.equal(meta.manifest, "/api/manifest/ayurveda-care");
  });

  await test("3.8: Status Page returns 'Not Found' title when clinic does not exist", async () => {
    const meta = await generateStatusPageMetadata({ params: Promise.resolve({ slug: "unknown-clinic" }) });
    assert.equal(meta.title, "Not Found");
    assert.equal(meta.manifest, undefined);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: Doctor Diary Isolation & Cross-Portal Non-Regression
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 4: Doctor Diary Isolation & Cross-Portal Non-Regression ---");

  await test("4.1: Doctor Diary public/manifest.json is strictly isolated", () => {
    const doctorManifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
    assert.equal(doctorManifest.id, "doctor-diary-app", "Doctor manifest id must be 'doctor-diary-app'");
    assert.equal(doctorManifest.start_url, "/dashboard", "Doctor manifest start_url must be '/dashboard'");
    assert.equal(doctorManifest.scope, "/", "Doctor manifest scope must be '/'");
    assert.equal(doctorManifest.display, "standalone");
  });

  await test("4.2: Patient manifest IDs NEVER collide with Doctor Diary manifest", async () => {
    const slugs = ["nature-express", "ayurveda-care", "apollo-delhi", "dr-smith"];
    for (const slug of slugs) {
      const res = await manifestHandler(new Request(`http://localhost:3000/api/manifest/${slug}`), {
        params: Promise.resolve({ slug }),
      });
      const data = await res.json();
      assert.notEqual(data.id, "doctor-diary-app", `Patient manifest ${slug} must not match doctor manifest id`);
      assert.notEqual(data.start_url, "/dashboard", `Patient manifest ${slug} must not start at /dashboard`);
      assert.equal(data.id, `/book/${slug}`);
      assert.equal(data.start_url, `/book/${slug}?utm_source=pwa`);
      assert.equal(data.scope, `/book/${slug}`);
    }
  });

  console.log("\n=======================================================");
  console.log(`  Results: ${passedTests} passed, ${failedTests} failed, ${totalTests} total`);
  console.log("=======================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runEmpiricalSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
