# Frontend PWA Installation Flow & Detection Logic — Investigation Report

## 1. Observation

### 1.1 Source Code Inventory & Line References

The frontend PWA installation flow is governed by the following core files and UI components:

| Component / File | File Path | Key Line Numbers | Role & Primary Function |
|---|---|---|---|
| `use-pwa-install.ts` | `src/hooks/use-pwa-install.ts` | Lines 12–29, 31–67, 69–83 | Core hook managing platform detection (`detectPlatform`), `beforeinstallprompt` event capture, and prompt execution (`handleAndroidInstall`). |
| `install-app-section.tsx` | `src/components/install-app-section.tsx` | Lines 25, 37–71, 101–121 | Prominent in-page "Download Clinic App" card embedded on patient booking pages (`/book/[slug]`). Origin of the fallback toast. |
| `install-app-banner.tsx` | `src/components/install-app-banner.tsx` | Lines 24, 28, 64–109 | Sticky top banner for booking/tracking pages. |
| `pwa-provider.tsx` | `src/components/pwa-provider.tsx` | Lines 13–65 (`PWAProvider`), 138–178 (`InstallButton`), 181–272 (`PatientInstallButton`) | Root layout PWA manager (SW registration, delayed install banner) and standalone install buttons. |
| `RootLayout` | `src/app/layout.tsx` | Lines 37, 112–113 | Global layout linking `/manifest.json` and mounting `<PWAProvider />`. |
| `BookingLayout` & Page | `src/app/book/[slug]/layout.tsx`, `page.tsx`, `booking-client.tsx` | Layout: L20–22; Page: L174, L961; Client: L468 | Dynamic clinic manifest (`/api/manifest/[slug]`), `PatientInstallButton` in nav & ticket, `InstallAppSection` in body. |
| `TrackingLayout` & Page | `src/app/track/[appointmentId]/layout.tsx`, `tracking-client.tsx` | Layout: L7–56; Tracking Client: L687 | Live queue tracking page with `PatientInstallButton`. Lacks dynamic clinic manifest. |
| Dynamic Manifest API | `src/app/api/manifest/[slug]/route.ts` | Lines 49–87 | Generates per-clinic Web App Manifest with clinic branding. |
| Clinic Icon API | `src/app/api/manifest/[slug]/icon/route.ts` | Lines 22–75 | Dynamic SVG / proxied clinic app icon endpoint. |
| Doctor Portal Manifest | `public/manifest.json` | Lines 1–67 | Static manifest for Doctor Diary (`start_url: "/dashboard"`, `id: "doctor-diary-app"`). |
| Service Worker | `public/sw.js` | Lines 1–260 | Caches static assets, handles offline navigation fallback and Web Push notifications. |

---

### 1.2 Verbatim Code Observations

#### A. Origin of the Fallback Toast in `src/components/install-app-section.tsx` (Lines 37–71)
```tsx
37:   const handleInstallClick = () => {
38:     if (platform === "ios") {
39:       toast.success(
40:         lang === "hi" 
41:           ? "शेयर (Share) 📤 पर टैप करें और 'Add to Home Screen' ➕ चुनें" 
42:           : "Tap Share 📤 then 'Add to Home Screen' ➕ to install",
43:         {
44:           duration: 6000,
45:           position: "top-center",
46:         }
47:       );
48:     } else if (platform === "android_manual") {
49:       toast.success(
50:         lang === "hi" 
51:           ? "मेनू (⋮) पर टैप करें और 'Install app' 📱 चुनें" 
52:           : "Tap Menu (⋮) then 'Install app' 📱 to install",
53:         {
54:           duration: 6000,
55:           position: "top-center",
56:         }
57:       );
58:     } else if (platform === "android") {
59:       handleAndroidInstall();
60:     } else {
61:       toast.info(
62:         lang === "hi" 
63:           ? "ऐप इंस्टॉल करने के लिए कृपया अपने मोबाइल पर क्रोम (Chrome) या सफारी (Safari) ब्राउज़र का उपयोग करें।" 
64:           : "Please open this page in Chrome (Android) or Safari (iOS) on your mobile device to install the app.",
65:         {
66:           duration: 5000,
67:           position: "top-center",
68:         }
69:       );
70:     }
71:   };
```

#### B. Platform Detection & State Transition in `src/hooks/use-pwa-install.ts` (Lines 12–29, 46–54)
```tsx
12: export function detectPlatform(): Platform {
13:   if (typeof window === "undefined") return "unknown";
14: 
15:   // Already running as PWA
16:   if (window.matchMedia("(display-mode: standalone)").matches) return "installed";
17: 
18:   const ua = navigator.userAgent;
19: 
20:   // iOS detection (iPhone, iPad, iPod — Safari doesn't fire beforeinstallprompt)
21:   const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
22:   if (isIOS) return "ios";
23: 
24:   // Android detection (if beforeinstallprompt doesn't fire, we'll fall back to android_manual)
25:   const isAndroid = /android/i.test(ua);
26:   if (isAndroid) return "android_manual";
27: 
28:   return "desktop"; // Will upgrade to "android" when beforeinstallprompt fires
29: }
...
46:     // Listen for the Android/Chrome install prompt
47:     const handler = (e: Event) => {
48:       e.preventDefault();
49:       setDeferredPrompt(e as BeforeInstallPromptEvent);
50:       setPlatform("android");
51:     };
52: 
53:     window.addEventListener("beforeinstallprompt", handler);
```

#### C. Service Worker Registration Failure in `src/components/pwa-provider.tsx` (Lines 19–27)
```tsx
19:   useEffect(() => {
20:     // Register service worker
21:     if ("serviceWorker" in navigator) {
22:       window.addEventListener("load", () => {
23:         navigator.serviceWorker
24:           .register("/sw.js", { scope: "/" })
25:           .catch((err) => console.warn("SW registration failed:", err));
26:       });
27:     }
```

#### D. Patient Install Button Disappearing Logic in `src/components/pwa-provider.tsx` (Lines 214–229)
```tsx
214:   if (isInstalled || (!deferredPrompt && !isIOS)) return null;
215: 
216:   const handleInstall = async () => {
217:     if (isIOS) {
218:       toast.success("Tap Share 📤 then 'Add to Home Screen' ➕ to install", {
219:         duration: 6000,
220:         position: "top-center"
221:       });
222:       return;
223:     }
224:     if (!deferredPrompt) return;
225:     await deferredPrompt.prompt();
...
```

#### E. Malformed Icon Sizes in Dynamic Manifest `src/app/api/manifest/[slug]/route.ts` (Lines 64–75)
```tsx
64:     const icons = clinic.logoUrl 
65:       ? [
66:           {
67:             src: clinic.logoUrl,
68:             sizes: "192x192 512x512",
69:             type: "image/png",
70:             purpose: "any maskable"
71:           },
72:           ...defaultIcons
73:         ]
74:       : defaultIcons;
```

#### F. Empty UI Render for `android_manual` in `src/components/install-app-banner.tsx` (Lines 64–109)
```tsx
64:             {platform === "android" && (
65:               <button onClick={handleAndroidInstall} ...>{t.installAndroidCta}</button>
66:             )}
67:             {platform === "ios" && (
68:               <button onClick={...}>{t.installAndroidCta}</button>
69:             )}
70:             {platform === "desktop" && (
71:               <div ...>{lang === "hi" ? "डेस्कटॉप ऐप" : "Desktop App"}</div>
72:             )}
                // MISSING: platform === "android_manual" branch! Nothing renders!
```

---

## 2. Logic Chain

### Step 1: Trace the Lifecycle of `beforeinstallprompt`
1. **Initial Mount**: When a user navigates to `/book/[slug]`, React hydrates client components.
2. **Platform Initialization**: `usePWAInstall` calls `detectPlatform()`.
   - On Android: `navigator.userAgent` matches `/android/i`, setting `platform = "android_manual"`.
   - On Desktop (or Android in "Desktop site" mode, or iPadOS 13+): `detectPlatform()` returns `"desktop"`.
3. **Event Registration**: `useEffect` registers `window.addEventListener("beforeinstallprompt", handler)`.
4. **Browser PWA Evaluation**: Chromium evaluates whether the page meets PWA criteria:
   - HTTPS: Yes.
   - Valid Web App Manifest: Evaluates `/api/manifest/[slug]`.
   - Active/Registered Service Worker with `fetch` handler: Evaluates `/sw.js`.
5. **Browser Event Dispatch**: If criteria are satisfied, Chromium fires `beforeinstallprompt`.
6. **Prompt Interception**: The event handler intercepts the event, calls `e.preventDefault()`, stores `e` in `deferredPrompt`, and sets `platform = "android"`.
7. **User Click**: When user clicks the install button, `handleAndroidInstall()` invokes `deferredPrompt.prompt()` and awaits user selection.

---

### Step 2: Why the Fallback Toast Triggers ("Please open on Android (Chrome) or Safari")

The toast is triggered directly by line 64 in `InstallAppSection` whenever `platform` is neither `"ios"`, `"android_manual"`, nor `"android"`. Specifically, this happens in four distinct situations:

1. **Desktop Chrome / Edge / Brave Testing (Primary Developer & User Scenario)**:
   - On Desktop Chrome, `detectPlatform()` returns `"desktop"`.
   - Even though Desktop Chrome fully supports PWAs, if `beforeinstallprompt` hasn't fired yet or wasn't captured, `platform` remains `"desktop"`.
   - Clicking the enabled "Download Clinic" button immediately hits the `else` branch, showing the fallback toast instructing the user to switch to a mobile device.
   - If `beforeinstallprompt` *does* fire on Desktop Chrome, line 50 of `use-pwa-install.ts` executes `setPlatform("android")`, which mislabels the desktop environment as Android.

2. **Android Chrome in "Desktop site" Mode / Tablets**:
   - When an Android user has "Desktop site" toggled on, the UA string becomes `Mozilla/5.0 (X11; Linux x86_64) ... Chrome/...`.
   - `/android/i.test(ua)` returns `false`.
   - `detectPlatform()` returns `"desktop"`.
   - If `beforeinstallprompt` does not fire (see Service Worker bug below), `platform` stays `"desktop"`, causing the fallback toast on an actual Android device.

3. **Modern iPads (iPadOS 13+) on Safari**:
   - Modern iPads send a desktop Safari user-agent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`.
   - `/iPad|iPhone|iPod/.test(ua)` evaluates to `false`.
   - `detectPlatform()` returns `"desktop"`.
   - iPad users tapping "Download Clinic" receive the fallback toast instructing them to use Safari on iOS, even though they are already on Safari on an iPad.

4. **Initial Render State / Timing Glitch**:
   - If the component state is `"unknown"` or if `platform` has not transitioned, clicks fall through to the fallback toast.

---

### Step 3: Why `deferredPrompt` is Null and Why `beforeinstallprompt` Fails to Fire

There are three concrete architectural reasons why `deferredPrompt` is `null` on Chrome:

#### Defect 1: Missed Service Worker Registration (`window.addEventListener("load")`)
- In `PWAProvider` (`src/components/pwa-provider.tsx` lines 21–26):
  ```ts
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" });
    });
  }
  ```
- In Next.js client-side navigation or fast SSR hydration, `document.readyState` is already `"complete"` by the time React runs `useEffect`.
- The browser `"load"` event has already fired.
- Attaching `window.addEventListener("load", ...)` after the load event means the callback is **never executed**.
- Consequently, `/sw.js` is **never registered**.
- **Chromium PWA Criteria Requirement**: Chromium will *never* fire `beforeinstallprompt` if there is no registered Service Worker controlling the scope.

#### Defect 2: Race Condition Between Browser Event Dispatch and React Mount
- Chromium dispatches `beforeinstallprompt` very early during page load.
- Each React component (`usePWAInstall`, `PWAProvider`, `PatientInstallButton`, `InstallButton`) registers its own local `beforeinstallprompt` listener inside `useEffect`.
- If `beforeinstallprompt` is dispatched before React finishes hydrating and running `useEffect`, the event is permanently missed by all components.
- Because there is no global/window-level store (e.g. `window.__deferredPrompt`), any component mounted after the event was dispatched has `deferredPrompt === null` forever.
- Furthermore, because `PatientInstallButton` hides itself when `!deferredPrompt && !isIOS`, the button completely vanishes from the header and tracking card on Android.

#### Defect 3: Malformed Manifest Icon Declarations
- In `/api/manifest/[slug]/route.ts` line 68:
  ```ts
  sizes: "192x192 512x512",
  type: "image/png",
  purpose: "any maskable"
  ```
- `sizes: "192x192 512x512"` is non-standard. Providing an external `clinic.logoUrl` that is actually a JPEG or WebP from Supabase storage while declaring `type: "image/png"` causes Chromium's manifest icon parser to fail validation, suppressing the installability prompt.

---

### Step 4: Comparing Patient Flow vs. Doctor Diary Portal

| Dimension | Doctor Diary Portal (`/dashboard`, `/`) | Patient Booking / Tracking (`/book/[slug]`, `/track/[id]`) |
|---|---|---|
| **Manifest Used** | Static `/manifest.json` (`start_url: "/dashboard"`, `id: "doctor-diary-app"`) | Dynamic `/api/manifest/[slug]` (on `/book/[slug]`). **Bug**: `/track/[id]` lacks dynamic manifest and mistakenly inherits `/manifest.json`. |
| **PWA Scope** | Scope: `"/"` | Dynamic scope: `"/book/[slug]"` |
| **Install UI** | `InstallButton` (in nav), `PWAProvider` 8s bottom popup with doctor branding | `PatientInstallButton` (nav, post-booking card, tracking page), `InstallAppSection` (in-page card) |
| **Behavior if Prompt Missing** | Button gracefully hides (`InstallButton` returns `null`) | `PatientInstallButton` disappears; `InstallAppSection` displays fallback toast; `InstallAppBanner` renders empty |
| **Doctor PWA Isolation** | Works when SW is active and standalone mode is entered | Must remain strictly isolated so clinic PWA installs do not overwrite doctor session/manifest |

---

## 3. Caveats

1. **Chromium Cooldown Heuristics**: If a user has repeatedly dismissed the native PWA install prompt in Chrome on a specific origin, Chrome enters a temporary cooldown period where `beforeinstallprompt` will not fire regardless of manifest/SW validity. Fallback UI (`android_manual`) must be robust.
2. **In-App Browsers (WebView)**: Links opened from WhatsApp, Instagram, Facebook, or Gmail on mobile devices run in custom WebViews where `beforeinstallprompt` is unsupported by design. Clear "Open in Chrome/Safari" guidance is required.
3. **PWA Scope Isolation**: Each clinic's patient PWA must remain scoped to `/book/${slug}` with unique `id: "/book/${slug}"` to ensure installing Clinic A does not conflict with Clinic B or the Doctor Diary dashboard.

---

## 4. Conclusion

### Summary of Root Causes
1. **Fallback Toast Trigger**: `InstallAppSection` triggers the toast because `platform` is evaluated as `"desktop"` when UA detection does not match Android/iOS (e.g. Desktop Chrome, Android Desktop Mode, iPadOS 13+) and `beforeinstallprompt` has not elevated the state.
2. **Missing `beforeinstallprompt`**: Caused primarily by `window.addEventListener("load")` in `PWAProvider` missing the load event upon hydration (leaving `/sw.js` unregistered), combined with icon validation quirks in `/api/manifest/[slug]`.
3. **Event Loss & Vanishing Buttons**: Decentralized `useEffect` listeners miss early `beforeinstallprompt` dispatches because there is no window-level capture cache (`window.__deferredPrompt`), causing `PatientInstallButton` to return `null` on Android.
4. **UI Inconsistency**: `InstallAppBanner` does not handle `android_manual`, rendering an empty action slot when `beforeinstallprompt` is unavailable.

---

### Concrete Proposed Fix Strategies

#### Fix 1: Global Early Capture & Reliable Service Worker Registration
- In `src/components/pwa-provider.tsx` (or a dedicated root PWA controller):
  1. Check `document.readyState === "complete"` before registering `/sw.js`.
  2. Capture `beforeinstallprompt` at the window level and store it on `window.__pwa_deferred_prompt` with a custom dispatch event (`pwa-prompt-ready`).
  3. Ensure `PWAProvider` only shows the generic Doctor Diary install popup on doctor-facing routes (`/dashboard`, `/`), not on patient booking pages (`/book/[slug]`).

#### Fix 2: Upgrade `detectPlatform` & `use-pwa-install.ts`
- Enhance iOS detection to support iPadOS 13+:
  ```ts
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  ```
- Separate platform identification from prompt availability:
  - `platform`: `"android" | "ios" | "desktop" | "installed" | "unknown"`
  - `canNativeInstall`: `boolean` (true whenever `deferredPrompt` exists, whether on Android or Desktop Chrome)
- On Desktop Chrome with `deferredPrompt`, allow native install prompt without mislabeling platform as `"android"`.

#### Fix 3: Handle All Platform States in UI Components
- In `InstallAppSection`:
  - When `canNativeInstall` is true: trigger `prompt()`.
  - When `platform === "ios"`: show iOS "Share 📤 -> Add to Home Screen" instructions.
  - When `platform === "android"` (without native prompt): show "Tap Menu (⋮) -> Install app 📱".
  - When `platform === "desktop"` (without native prompt): show "Click the install icon (⊕) in the browser address bar".
- In `InstallAppBanner`:
  - Add explicit render branch for `android_manual` with clear manual install instructions.
- In `PatientInstallButton`:
  - Keep button visible for Android even if `deferredPrompt` is not yet available, falling back to manual install instructions.

#### Fix 4: Fix Manifest & Scope Configuration
- In `src/app/api/manifest/[slug]/route.ts`:
  - Fix icon sizes: Provide separate entries for `192x192` and `512x512` with proper MIME types.
  - Ensure fallback icons `/icon-192.png` and `/icon-512.png` are always present.
- In `src/app/track/[appointmentId]/layout.tsx`:
  - Add dynamic manifest metadata pointing to the clinic's manifest so patient tracking does not inherit the doctor portal manifest.

---

## 5. Verification Method

To independently verify these findings:

1. **Inspect Service Worker Registration Timing**:
   - Open Chrome DevTools -> Application -> Service Workers.
   - Hard refresh (`Ctrl+F5`) on `/book/[slug]`.
   - Verify whether `/sw.js` registers immediately or fails to register due to `load` listener timing.

2. **Inspect Manifest Installability & Icons**:
   - Open Chrome DevTools -> Application -> Manifest on `/book/[slug]`.
   - Check the "Installability" section for warnings regarding icon sizes (`sizes: "192x192 512x512"`) or scope mismatches.

3. **Verify User-Agent Platform Emulation**:
   - Emulate "Pixel 7" in DevTools: Verify `detectPlatform()` returns `"android_manual"` before prompt and `"android"` after prompt.
   - Emulate "iPad Pro": Verify `detectPlatform()` currently returns `"desktop"` instead of `"ios"`.
   - Emulate "Desktop Chrome": Click "Download Clinic" in `InstallAppSection` and observe the fallback toast triggering.

4. **Verify TypeScript & Project Build**:
   ```powershell
   npm run build
   ```
