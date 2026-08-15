# Handoff Report: Dynamic Manifest Generation & Icon Route Blueprint (Milestone 2 - Explorer 1)

## 1. Observation

### Exact File Paths & Code Locations

#### 1. Manifest Generator: `src/app/api/manifest/[slug]/route.ts`
- **Lines 49–62**:
  ```typescript
  const defaultIcons = [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any maskable"
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable"
    }
  ];
  ```
  *Defect*: The combined string `purpose: "any maskable"` causes Chromium / Android WebAPK parser rejections or Lighthouse validation warnings. In Chrome's PWA installability criteria, `"any"` (badge/splash) and `"maskable"` (adaptive rounded icon) must be declared in separate objects.
- **Lines 64–74**:
  ```typescript
  const icons = clinic.logoUrl 
    ? [
        {
          src: clinic.logoUrl,
          sizes: "192x192 512x512",
          type: "image/png",
          purpose: "any maskable"
        },
        ...defaultIcons
      ]
    : defaultIcons;
  ```
  *Defect*:
  1. Directly references external `clinic.logoUrl` (e.g., Supabase / Cloudinary / S3). If the remote host does not return permissive CORS headers (`Access-Control-Allow-Origin: *`), Android Chrome's WebAPK builder fails to fetch the icon during `beforeinstallprompt` validation and drops the install prompt.
  2. Hardcodes `type: "image/png"` even if `clinic.logoUrl` is JPEG, WebP, or SVG, creating a MIME-type mismatch with the image stream.
  3. Space-separated `sizes: "192x192 512x512"` for a single raster file confuses dimensions during WebAPK generation.
- **Lines 76–87**:
  ```typescript
  const manifest = {
    name: appName,
    short_name: shortName,
    description: `Official booking app for ${appName}`,
    start_url: `/book/${slug}?utm_source=pwa`,
    scope: `/book/${slug}`,
    id: `/book/${slug}`,
    display: "standalone",
    background_color: "#f8fafc", // slate-50
    theme_color: themeColor,
    icons,
  };
  ```
  *Status*: Standard properties (`name`, `short_name`, `description`, `start_url`, `scope`, `id`, `display`, `background_color`, `theme_color`) are well-formed and isolate individual clinics from Doctor Diary (`id: "doctor-diary-app"`). Minor improvements: add `orientation: "portrait-primary"`, `categories: ["medical", "health", "productivity"]`, `lang: "en-IN"`, and `prefer_related_applications: false`.
- **Lines 89–94**:
  ```typescript
  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
  ```
  *Status*: Returns correct `Content-Type: application/manifest+json`. Should also include `Access-Control-Allow-Origin: *`.

---

#### 2. Dynamic Clinic Icon Proxy & Generator: `src/app/api/manifest/[slug]/icon/route.ts`
- **Lines 12–20**:
  ```typescript
  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinic) {
    return new NextResponse("Not Found", { status: 404 });
  }
  ```
  *Defect*: Unlike `src/app/api/manifest/[slug]/route.ts` and `src/app/book/[slug]/layout.tsx`, this route does NOT check the `doctorLeads` table when a slug is not found in `clinics`. As a result, lead/onboarding clinics fail with a 404 on icon requests.
- **Lines 22–39**:
  ```typescript
  if (clinic.logoUrl && clinic.logoUrl.startsWith("http")) {
    try {
      const imgRes = await fetch(clinic.logoUrl);
      if (imgRes.ok) {
        const contentType = imgRes.headers.get("content-type") || "image/png";
        const buffer = await imgRes.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch (e) {
      console.warn("Failed to fetch clinic logoUrl for icon, falling back to SVG:", e);
    }
  }
  ```
  *Defect*:
  1. `fetch(clinic.logoUrl)` has no timeout controller; slow external CDNs can block the response.
  2. Missing `Access-Control-Allow-Origin: *` response header.
- **Lines 41–75**:
  ```typescript
  const themeColor = clinic.themeColor || "#0f766e";
  const clinicInitials = clinic.name
    ? clinic.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";
  ```
  *Defect*:
  1. Does not accept or respect `?size=192` or `?size=512` query parameters.
  2. SVG text is not XML-entity escaped (e.g. clinic names with `&` or `<` can break the SVG).
  3. Missing `Access-Control-Allow-Origin: *` response header.

---

## 2. Logic Chain

1. **Android Chrome Installability Requirements**:
   - Chromium checks that the manifest contains at least one 192x192 icon and one 512x512 icon.
   - For adaptive icons, Android Chrome checks for an icon with `purpose: "maskable"`.
   - When `purpose: "any maskable"` is a combined string, Chromium WebAPK tooling or strict parsers can fail to match the required purpose. Splitting into explicit `"any"` and `"maskable"` entries ensures 100% standard compliance.
2. **CORS and Content-Type Safety via Same-Origin Proxying**:
   - Direct external URLs (`https://res.cloudinary.com/...`, `https://...supabase.co/...`) in `manifest.json` are fetched by the browser/OS during installation. Any CORS restriction, DNS delay, or MIME type mismatch (declaring `type: "image/png"` for a WebP file) aborts WebAPK generation and suppresses `beforeinstallprompt`.
   - By routing dynamic clinic icons through `/api/manifest/${slug}/icon?size=192` and `/api/manifest/${slug}/icon?size=512`, the origin is guaranteed to be same-origin, `Access-Control-Allow-Origin: *` is provided, and the server dynamically detects the true Content-Type or generates an SVG fallback.
3. **Database Consistency between Manifest and Icon Routes**:
   - Both `/api/manifest/[slug]` and `/api/manifest/[slug]/icon` must query `clinics` first and fall back to `doctorLeads` if not yet fully onboarded. This guarantees that un-migrated or lead clinics generate valid manifests and icons without 404 errors.
4. **Doctor PWA Non-Regression**:
   - The Doctor Diary PWA uses `public/manifest.json` (`id: "doctor-diary-app"`, `start_url: "/dashboard"`, `scope: "/"`).
   - Dynamic patient manifests use `id: "/book/${slug}"`, `start_url: "/book/${slug}?utm_source=pwa"`, `scope: "/book/${slug}"`.
   - The dynamic changes are scoped exclusively to `/api/manifest/[slug]/*` and will have zero impact on `public/manifest.json` or doctor routes.

---

## 3. Caveats

- **External Image Fetch Timeouts**: External logo URLs could occasionally hang or timeout. We mitigate this by adding an `AbortController` with a 3.5s timeout, gracefully falling back to dynamic SVG icon generation if the fetch exceeds 3.5s.
- **SVG vs PNG WebAPK Parsing**: Android Chrome supports SVG icons in web manifests, but some older Android OS WebAPK builders prefer raster PNGs. To guarantee 100% universal compatibility, we include both the dynamic `/api/manifest/${slug}/icon` entries AND the static `/icon-192.png` / `/icon-512.png` fallback PNG entries in the manifest `icons` list.

---

## 4. Conclusion (Implementation Blueprint)

### Target 1: `src/app/api/manifest/[slug]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // 1. Fetch clinic by slug from clinics table
    let [clinic] = await db
      .select({
        name: clinics.name,
        themeColor: clinics.themeColor,
        logoUrl: clinics.logoUrl,
      })
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    // 2. Fallback to doctorLeads if clinic record not found
    if (!clinic) {
      const { doctorLeads } = await import("@/db/schema");
      const [lead] = await db.select({
        name: doctorLeads.clinicName,
        doctorName: doctorLeads.doctorName,
        logoUrl: doctorLeads.logoUrl,
      }).from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
      
      if (!lead) {
        return new NextResponse("Clinic not found", { status: 404 });
      }
      
      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        themeColor: "#0d9488",
        logoUrl: lead.logoUrl || null,
      };
    }

    const themeColor = clinic.themeColor || "#0ea5e9";
    const appName = clinic.name || "Clinic App";
    
    // Create a truncated short name for mobile home screens (max ~12 chars)
    const shortName = appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;

    // Detect MIME type hint for dynamic icon if logoUrl is provided
    let dynamicIconType = "image/png";
    if (clinic.logoUrl) {
      const lower = clinic.logoUrl.toLowerCase();
      if (lower.endsWith(".svg")) dynamicIconType = "image/svg+xml";
      else if (lower.endsWith(".webp")) dynamicIconType = "image/webp";
      else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) dynamicIconType = "image/jpeg";
    } else {
      dynamicIconType = "image/svg+xml";
    }

    // 3. Construct standard-compliant icons array with separate "any" and "maskable" purposes
    const icons = [
      // Dynamic clinic icons via same-origin proxy
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
      // Guaranteed static PNG fallbacks
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

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
```

---

### Target 2: `src/app/api/manifest/[slug]/icon/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const sizeParam = url.searchParams.get("size");
    const parsedSize = sizeParam ? parseInt(sizeParam, 10) : 512;
    const size = !isNaN(parsedSize) && parsedSize > 0 && parsedSize <= 1024 ? parsedSize : 512;

    // 1. Fetch clinic from clinics table
    let [clinic] = await db
      .select({
        name: clinics.name,
        themeColor: clinics.themeColor,
        logoUrl: clinics.logoUrl,
      })
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    // 2. Fallback to doctorLeads table
    if (!clinic) {
      const { doctorLeads } = await import("@/db/schema");
      const [lead] = await db
        .select({
          name: doctorLeads.clinicName,
          doctorName: doctorLeads.doctorName,
          logoUrl: doctorLeads.logoUrl,
        })
        .from(doctorLeads)
        .where(eq(doctorLeads.clinicSlug, slug))
        .limit(1);

      if (!lead) {
        return new NextResponse("Not Found", { status: 404 });
      }

      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        themeColor: "#0d9488",
        logoUrl: lead.logoUrl || null,
      };
    }

    // 3. Proxy remote logo URL with 3.5s timeout
    if (clinic.logoUrl && clinic.logoUrl.startsWith("http")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const imgRes = await fetch(clinic.logoUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "DoctorDiary-ManifestIconProxy/1.0",
          },
        });
        clearTimeout(timeoutId);

        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") || "image/png";
          const buffer = await imgRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (e) {
        console.warn(`Failed to fetch clinic logoUrl for icon (${slug}), falling back to dynamic SVG:`, e);
      }
    }

    // 4. Dynamic Scalable SVG Generation (Maskable-safe)
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
  <path d="M256 140 V372 M140 256 H372" stroke="white" stroke-width="36" stroke-linecap="round" filter="url(#glow)" />
  <text x="256" y="440" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="2">${clinicInitials}</text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating manifest icon:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
```

---

## 5. Verification Method

### Test Plan & Inspection Steps

1. **Verify Manifest API Response**:
   - Query `GET /api/manifest/demo-clinic` (or any valid clinic slug):
     - Response status: `200 OK`.
     - Response header: `Content-Type: application/manifest+json`.
     - Response header: `Access-Control-Allow-Origin: *`.
     - Verify `icons` contains 8 entries: 4 dynamic entries pointing to `/api/manifest/demo-clinic/icon` and 4 static entries pointing to `/icon-*.png`.
     - Verify no combined `purpose: "any maskable"` exists; all entries have either `purpose: "any"` or `purpose: "maskable"`.
2. **Verify Dynamic Icon Route**:
   - Query `GET /api/manifest/demo-clinic/icon?size=192`:
     - Response status: `200 OK`.
     - Response header: `Content-Type: image/svg+xml` or image format.
     - Response header: `Access-Control-Allow-Origin: *`.
   - Query `GET /api/manifest/demo-clinic/icon?size=512`:
     - Verify SVG `width="512" height="512"`.
3. **Verify Lead Clinic Fallback**:
   - Query `/api/manifest/<leadClinicSlug>` for a lead clinic that exists in `doctorLeads` table:
     - Returns 200 with clinic branding.
4. **Doctor PWA Isolation Check**:
   - Verify `public/manifest.json` remains untouched (`id: "doctor-diary-app"`, `start_url: "/dashboard"`).
