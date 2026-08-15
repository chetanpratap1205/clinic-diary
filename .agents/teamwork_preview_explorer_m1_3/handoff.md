# Handoff Report: Explorer 3 — Root Layout, PWA Provider & Service Worker Integration Safety

## 1. Observation

### 1.1 Root Layout & Head Structure (`src/app/layout.tsx`)
- **File Location**: `src/app/layout.tsx` (119 lines)
- **Current Head Elements (lines 84–100)**:
  ```tsx
  <head>
    {/* Google tag (gtag.js) */}
    <Script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-Y3BEDYTXTW"
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-Y3BEDYTXTW');
      `}
    </Script>
  </head>
  ```
- **Metadata & Manifest (lines 21–37)**:
  - `RootLayout` exports static `metadata` declaring `manifest: "/manifest.json"`.
  - Declares `appleWebApp: { capable: true, statusBarStyle: "default", title: "Doctor Diary" }`.
  - Declares icons: `/icon-192.png` and `/icon-512.png`.
- **PWAProvider Placement (lines 101–115)**:
  - `<PWAProvider />` is mounted at line 112 directly inside the `<body>` element of `RootLayout`.

### 1.2 PWA Provider Component (`src/components/pwa-provider.tsx`)
- **File Location**: `src/components/pwa-provider.tsx` (274 lines)
- **Defective SW Registration (lines 19–27)**:
  ```typescript
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      });
    }
  ```
  - Attaching `window.addEventListener("load", ...)` inside `useEffect` fails when React mounts after document load has already completed (`document.readyState === "complete"`). In Next.js SSR hydration, `document.readyState` is almost always `"complete"` when `useEffect` executes, so `/sw.js` registration is never triggered.
- **Isolated Prompt Capture (lines 36–54)**:
  - `PWAProvider` attaches `window.addEventListener("beforeinstallprompt", handler)` inside `useEffect`.
  - If `beforeinstallprompt` fired before React hydration completed, the handler is never called and `deferredPrompt` remains `null`.
- **Standalone Mode Check (lines 29–34)**:
  - `if (window.matchMedia("(display-mode: standalone)").matches) setIsInstalled(true);`
- **Other Components in Same File**:
  - `InstallButton` (lines 138–178): Doctor-facing nav button; hides if `!deferredPrompt` (line 158).
  - `PatientInstallButton` (lines 181–272): Patient-facing header button; hides if `(!deferredPrompt && !isIOS)` (line 214).

### 1.3 PWA Install Hook (`src/hooks/use-pwa-install.ts`)
- **File Location**: `src/hooks/use-pwa-install.ts` (87 lines)
- **Isolated Prompt Capture (lines 46–54)**:
  ```typescript
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e as BeforeInstallPromptEvent);
    setPlatform("android");
  };
  window.addEventListener("beforeinstallprompt", handler);
  ```
  - Does NOT check for any pre-captured global event (`window.__pwaDeferredPrompt`).
  - If the prompt event fired during HTML loading, `deferredPrompt` is `null` and `platform` stays `"android_manual"` or `"desktop"`.

### 1.4 Route Scope & Manifest Isolation
- **Doctor Portal Routes (`/`, `/dashboard`, `/dashboard/*`, `/login`, `/signup`, `/onboarding`)**:
  - Inherit `/manifest.json` from `src/app/layout.tsx`.
  - Manifest properties: `id: "doctor-diary-app"`, `start_url: "/dashboard"`, `scope: "/"`.
- **Patient Clinic Booking Page (`/book/[slug]`)**:
  - `src/app/book/[slug]/layout.tsx:14-23` and `src/app/book/[slug]/page.tsx:101-189` export `generateMetadata` setting `manifest: `/api/manifest/${slug}``.
  - Dynamic manifest properties: `id: "/book/${slug}"`, `start_url: "/book/${slug}?utm_source=pwa"`, `scope: "/book/${slug}"`.
- **Patient Queue Tracking Page (`/track/[appointmentId]`)**:
  - `src/app/track/[appointmentId]/layout.tsx` (58 lines) currently lacks `generateMetadata` (inherits `/manifest.json`, to be resolved in M2).
  - `src/app/track/[appointmentId]/tracking-client.tsx` (lines 687–692) renders `<PatientInstallButton />`.

### 1.5 Service Worker Caching Architecture (`public/sw.js`)
- **File Location**: `public/sw.js` (262 lines)
- Registered at `{ scope: "/" }`.
- Line 48–81: Network-first for `/api/`, `/_next/`, `/dashboard`, `/login`, `/signup`, `/onboarding`, `/track/` with `/offline` fallback.
- Line 83–99: Stale-while-revalidate for `/book/`.
- Line 101–115: Cache-first for static assets (`.png`, `.svg`, etc.).
- Line 123–225: Handles rich web push notifications for `turn_called`, `turn_nearby`, `reminder`, `checkin_confirmed`.

---

## 2. Logic Chain

### 2.1 Why an Inline `<script>` in `RootLayout` is the Optimal Early-Capture Solution
1. **The Browser Lifecycle Sequence**:
   - `[HTML Download]` -> `[HTML Parsing & <head> Execution]` -> `[Manifest Fetch & SW Eligibility Check]` -> `[Chromium fires 'beforeinstallprompt']` -> `[Next.js JS Chunks Download]` -> `[React JS Bundle Parsing & Execution]` -> `[React DOM Hydration]` -> `[Component useEffect Execution]`.
2. **The Hydration Delay Vulnerability**:
   - On Android devices (especially on mobile network connections or budget hardware), React hydration takes 500ms to 2000ms+ after HTML parsing.
   - Chromium frequently evaluates PWA eligibility and fires `beforeinstallprompt` during initial parsing or immediately upon receiving the manifest.
   - Chromium does NOT buffer or re-fire `beforeinstallprompt` if no event listener is attached at that precise moment.
3. **Comparing Early-Capture Placement Strategies**:
   - **Strategy A — Top of `PWAProvider` client component**:
     - Fails because `PWAProvider` is part of the client JS bundle. Its code cannot execute until after Next.js downloads and runs the entire chunk. Any event fired before bundle evaluation is permanently missed.
   - **Strategy B — `<Script strategy="beforeInteractive">` in `RootLayout`**:
     - Next.js `next/script` with `strategy="beforeInteractive"` is designed for external scripts with a `src` attribute. For inline code, Next.js requires an inline `<script>` tag or `dangerouslySetInnerHTML`.
   - **Strategy C — Synchronous inline `<script id="pwa-early-capture">` in `RootLayout` `<head>`**:
     - Runs synchronously in the HTML stream before any body markup or external JavaScript bundles are loaded.
     - Guarantees that `window.__pwaDeferredPrompt` is initialized and `window.addEventListener("beforeinstallprompt", ...)` is active from millisecond zero.
     - Emits a custom `pwa-prompt-ready` event and caches the prompt on `window.__pwaDeferredPrompt`.
     - Completely eliminates the race condition.

### 2.2 Why Two-Tier Service Worker Registration in `PWAProvider` is Safe and Complete
1. **The `document.readyState` Race Condition**:
   - `window.addEventListener("load", registerSW)` will never fire if `document.readyState === "complete"`.
2. **The Solution**:
   ```typescript
   if ("serviceWorker" in navigator) {
     const registerSW = () => {
       navigator.serviceWorker
         .register("/sw.js", { scope: "/" })
         .catch((err) => console.warn("SW registration failed:", err));
     };
     if (document.readyState === "complete") {
       registerSW();
     } else {
       window.addEventListener("load", registerSW);
     }
   }
   ```
3. **Safety & Non-Regression**:
   - Immediate registration when `readyState === "complete"` ensures `/sw.js` is registered without waiting for an event that will never arrive.
   - Once `/sw.js` is active, Chromium validates installability and triggers `beforeinstallprompt`, which is immediately caught by `window.__pwaDeferredPrompt`.

### 2.3 Cross-Portal Route Isolation & Compatibility
1. **Manifest Scoping & PWA Identity**:
   - Doctor Diary PWA: `manifest.id = "doctor-diary-app"`, `start_url = "/dashboard"`, `scope = "/"`.
   - Patient Clinic PWA: `manifest.id = "/book/${slug}"`, `start_url = "/book/${slug}?utm_source=pwa"`, `scope = "/book/${slug}"`.
   - Under the W3C Web App Manifest specification, browsers identify PWAs by their unique `id` and `scope`.
   - Installing a clinic PWA from `/book/[slug]` installs only that specific clinic and will NEVER conflict with, overwrite, or corrupt the Doctor Diary PWA.
2. **Service Worker Route Isolation**:
   - `public/sw.js` already isolates caching rules:
     - Doctor dashboard (`/dashboard`, `/login`, etc.) is strictly `network-first`.
     - Patient booking (`/book/`) is `stale-while-revalidate`.
     - Patient live queue (`/track/`) is `network-first`.
   - Sharing `public/sw.js` with root scope `{ scope: "/" }` provides unified push notification handling without route leakage.

---

## 3. Caveats

1. **In-App WebViews**: In-app browsers (e.g., inside Instagram, WhatsApp, Facebook, LinkedIn) disable native `beforeinstallprompt` and do not allow PWA installation. For these browsers, UI components must display manual "Open in Chrome / Safari" instructions.
2. **Localhost vs HTTPS in Dev**: PWA installation requires a secure context (`https://` or `http://localhost`). Testing on local LAN IP addresses (e.g. `http://192.168.x.x:3000`) without HTTPS will prevent `beforeinstallprompt` from firing.
3. **Tracking Page Manifest Gap (Milestone 2 Scope)**: Currently `/track/[appointmentId]` does not set a clinic manifest; it inherits Doctor Diary's manifest. This will be updated in Milestone 2 so that patients on the tracking page link to `/api/manifest/[slug]`.
4. **Pre-existing JSX Tag Structure in `tracking-client.tsx`**: `src/app/track/[appointmentId]/tracking-client.tsx` has an extra closing `</div>` before `<AnimatePresence>` at line 754/780 causing `tsc` errors. This file is scheduled for Milestone 2 modifications and should have its root container closing `</div>` wrapped around `<AnimatePresence>`.

---

## 4. Conclusion

### Concrete Architecture & Code Proposals for Milestone 1 Implementation:

#### 1. In `src/app/layout.tsx`:
Add an inline synchronous `<script>` inside `<head>`:
```tsx
<head>
  {/* Early PWA install prompt global capture — executes before ANY client bundle */}
  <script
    id="pwa-early-capture"
    dangerouslySetInnerHTML={{
      __html: `
        window.__pwaDeferredPrompt = null;
        window.addEventListener('beforeinstallprompt', function(e) {
          e.preventDefault();
          window.__pwaDeferredPrompt = e;
          window.dispatchEvent(new CustomEvent('pwa-prompt-ready', { detail: e }));
        });
        window.addEventListener('appinstalled', function() {
          window.__pwaDeferredPrompt = null;
          window.dispatchEvent(new CustomEvent('pwa-installed'));
        });
      `,
    }}
  />
  {/* Existing Google Analytics Scripts */}
  ...
</head>
```

#### 2. In `src/components/pwa-provider.tsx`:
- Fix SW registration timing to check `document.readyState === "complete"`.
- Check `window.__pwaDeferredPrompt` on mount.
- Add listeners for `"pwa-prompt-ready"` and `"pwa-installed"`.
- In `PatientInstallButton` and `InstallButton`, check `window.__pwaDeferredPrompt` on mount and subscribe to `pwa-prompt-ready`.

#### 3. In `src/hooks/use-pwa-install.ts`:
- Check `window.__pwaDeferredPrompt` on mount:
  ```typescript
  if (typeof window !== "undefined" && (window as any).__pwaDeferredPrompt) {
    setDeferredPrompt((window as any).__pwaDeferredPrompt);
    if (detected !== "ios") {
      setPlatform("android");
    }
  }
  ```
- Listen to `"pwa-prompt-ready"` and `"pwa-installed"`.
- Clean up `window.__pwaDeferredPrompt = null` upon install completion.

---

## 5. Verification Method

1. **TypeScript Verification**:
   ```bash
   npx tsc --noEmit
   ```
   Verify 0 TypeScript errors after adding `__pwaDeferredPrompt` global types.

2. **Next.js Production Build**:
   ```bash
   npm run build
   ```
   Confirm successful SSR compilation of `RootLayout`, `BookingLayout`, `DashboardLayout`, and `TrackingLayout`.

3. **Runtime & DevTools Verification**:
   - **Service Worker**: Navigate to `/dashboard` and `/book/[slug]`. Check DevTools > Application > Service Workers. Confirm `/sw.js` is active and running on `{ scope: "/" }`.
   - **Prompt Capture**: Open Chrome DevTools Console, inspect `window.__pwaDeferredPrompt`. Confirm it holds the `BeforeInstallPromptEvent` object.
   - **Doctor Portal Isolation**: On `/dashboard`, verify Doctor Diary install prompt triggers with `doctor-diary-app` manifest.
   - **Patient Portal Isolation**: On `/book/[slug]`, verify "Official App" / "Install" button opens the clinic's native install sheet without showing the "Please open on Android/Safari" fallback toast.
