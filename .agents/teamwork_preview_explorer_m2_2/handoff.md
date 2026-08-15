# Handoff Report — Explorer 2: Manifest Generation & Route Metadata (Milestone 2)

## 1. Observation

### Observation 1.1: Root Manifest Fallback in Patient Tracking Route
- **File**: `src/app/track/[appointmentId]/layout.tsx` (Lines 1–58)
- **File**: `src/app/track/[appointmentId]/page.tsx` (Lines 7–24)
- **Observation**: In `src/app/track/[appointmentId]/layout.tsx`, there is no `generateMetadata` function exported. In `src/app/track/[appointmentId]/page.tsx`, `generateMetadata` (lines 7–24) only returns `{ title: ... }`:
  ```tsx
  export async function generateMetadata({ params }: { params: Promise<{ appointmentId: string }> }) {
    const { appointmentId } = await params;
    if (appointmentId.startsWith("demo-")) {
      return { title: "Live Tracking | Demo Patient" };
    }
    try {
      const appt = await db
        .select({ patientName: appointments.patientName })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (appt.length === 0) return { title: "Not Found" };
      return { title: `Live Tracking | ${appt[0].patientName}` };
    } catch {
      return { title: "Invalid Tracking Link" };
    }
  }
  ```
- **Result**: Because neither `layout.tsx` nor `page.tsx` sets `manifest`, Next.js falls back to root `src/app/layout.tsx` (Line 37: `manifest: "/manifest.json"`). Consequently, patients opening tracking pages install Doctor Diary (`id: "doctor-diary-app"`, `start_url: "/dashboard"`) instead of the clinic's dedicated PWA.

---

### Observation 1.2: Status Page Manifest Omission
- **File**: `src/app/status/[slug]/page.tsx` (Lines 11–29)
- **Observation**: `generateMetadata` retrieves clinic data by slug and sets `title` and `description`, but does not declare `manifest`:
  ```tsx
  export async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<Metadata> {
    const { slug } = await params;
    let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
    if (!clinic) {
      const { doctorLeads } = await import("@/db/schema");
      const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
      if (!lead) return { title: "Not Found" };
      clinic = { name: lead.clinicName || `${lead.doctorName}'s Clinic` } as any;
    }

    return {
      title: `Check Status | ${clinic.name}`,
      description: `Check your live queue status at ${clinic.name}.`,
    };
  }
  ```
- **Result**: `/status/[slug]` falls back to root `/manifest.json`.

---

### Observation 1.3: JSX Nesting Error TS1005 in TrackingClient
- **File**: `src/app/track/[appointmentId]/tracking-client.tsx` (Lines 331–333, 749–782)
- **Command Run**: `npx tsc --noEmit`
- **Compiler Output**:
  ```
  src/app/track/[appointmentId]/tracking-client.tsx(756,7): error TS1005: ')' expected.
  src/app/track/[appointmentId]/tracking-client.tsx(780,5): error TS1128: Declaration or statement expected.
  src/app/track/[appointmentId]/tracking-client.tsx(781,3): error TS1109: Expression expected.
  ```
- **Code Inspection**:
  - Line 332 opens `<div className="space-y-6">`.
  - Line 754 closes `</div>`.
  - Lines 757–779 define `<AnimatePresence>{showCancelModal && (...) }</AnimatePresence>`.
  - Line 780 contains an orphaned `</div>`.
  - Because line 754 closed the main return element without a enclosing React Fragment `<> ... </>`, `<AnimatePresence>` is parsed as a syntax error outside the JSX return, and line 780 fails with declaration expected.

---

## 2. Logic Chain

1. **Patient Portal Manifest Isolation (PWA Requirement)**:
   - For PWA installability, each clinic's patient web app must bind to `/api/manifest/[slug]`.
   - Next.js App Router merges metadata hierarchically. If a leaf page or sub-layout does not specify `manifest`, Next.js inherits `manifest: "/manifest.json"` from `src/app/layout.tsx`.
   - To guarantee that `/track/[appointmentId]` always resolves to `/api/manifest/[clinicSlug]`, `generateMetadata` in `src/app/track/[appointmentId]/layout.tsx` and `src/app/track/[appointmentId]/page.tsx` must query the clinic slug associated with `appointmentId` (handling both regular appointments via join and `demo-*` lead slugs) and return `{ manifest: `/api/manifest/${clinicSlug}` }`.
   - In `src/app/status/[slug]/page.tsx`, `generateMetadata` has direct access to `slug` from route params, so returning `{ manifest: `/api/manifest/${slug}` }` provides the required manifest link.

2. **TypeScript Compilation & Modal Rendering Fix**:
   - In `tracking-client.tsx`, wrapping the return tree in a top-level React Fragment `<> ... </>` allows `<div className="space-y-6"> ... </div>` to wrap the page content while `<AnimatePresence>` renders the modal portal outside the vertical spacing flow (`space-y-6`).
   - Line 780 is replaced with `</>`, completely matching the opening `<>` at line 332 and eliminating TS1005, TS1128, and TS1109 errors.

---

## 3. Caveats

1. **Demo Appointment Slug Handling**: In demo tracking URLs (`demo-<leadSlug>`), the clinic record is in `doctorLeads` rather than `clinics`. The `appointmentId.startsWith("demo-")` branch extracts `slug = appointmentId.replace("demo-", "")` and immediately returns `/api/manifest/${slug}`, matching the demo page handler.
2. **Invalid Appointment IDs**: If an invalid UUID is supplied to `/track/[appointmentId]`, `generateMetadata` safely catches the error and returns a clean fallback without throwing unhandled exceptions.
3. No other files in `src/app/track/` or `src/app/status/` produced TypeScript errors during `tsc --noEmit`.

---

## 4. Conclusion & Implementation Blueprint

### Target 1: `src/app/track/[appointmentId]/layout.tsx`
Add dynamic `generateMetadata` and optimize theme color query.

#### Proposed Code for `src/app/track/[appointmentId]/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}): Promise<Metadata> {
  const { appointmentId } = await params;

  if (appointmentId.startsWith("demo-")) {
    const slug = appointmentId.replace("demo-", "");
    return {
      manifest: `/api/manifest/${slug}`,
    };
  }

  try {
    const [result] = await db
      .select({
        clinicSlug: clinics.slug,
      })
      .from(appointments)
      .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (result?.clinicSlug) {
      return {
        manifest: `/api/manifest/${result.clinicSlug}`,
      };
    }
  } catch {
    // If invalid UUID or DB error, fall back gracefully
  }

  return {};
}

export default async function TrackingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  
  // Quick validation to get the theme color safely
  let themeColor = "#0ea5e9";
  try {
    if (appointmentId.startsWith("demo-")) {
      themeColor = "#0ea5e9";
    } else {
      const [result] = await db
        .select({ themeColor: clinics.themeColor })
        .from(appointments)
        .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (result?.themeColor) {
        themeColor = result.themeColor;
      }
    }
  } catch (e) {
    // If invalid UUID, ignore here, page will handle it
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ minHeight: '100dvh' }}>
      <div 
        className="h-1.5 w-full flex-shrink-0" 
        style={{ backgroundColor: themeColor }} 
      />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="py-6 pb-safe text-center flex flex-col items-center justify-center space-y-1.5 flex-shrink-0">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Technology Partner</p>
        <p className="text-sm font-semibold text-slate-400">
          Powered by <span className="font-black text-slate-700">Doctor Diary</span>
        </p>
      </footer>
    </div>
  );
}
```

---

### Target 2: `src/app/track/[appointmentId]/page.tsx`
Update `generateMetadata` to return dynamic manifest.

#### Proposed Change in `src/app/track/[appointmentId]/page.tsx`:
```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}): Promise<Metadata> {
  const { appointmentId } = await params;
  if (appointmentId.startsWith("demo-")) {
    const slug = appointmentId.replace("demo-", "");
    return {
      title: "Live Tracking | Demo Patient",
      manifest: `/api/manifest/${slug}`,
    };
  }
  try {
    const [result] = await db
      .select({
        patientName: appointments.patientName,
        clinicSlug: clinics.slug,
        clinicName: clinics.name,
      })
      .from(appointments)
      .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!result) return { title: "Not Found" };
    return {
      title: `Live Tracking | ${result.patientName}${result.clinicName ? ` - ${result.clinicName}` : ""}`,
      manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined,
    };
  } catch {
    return { title: "Invalid Tracking Link" };
  }
}
```

---

### Target 3: `src/app/status/[slug]/page.tsx`
Update `generateMetadata` to include `manifest: `/api/manifest/${slug}``.

#### Proposed Change in `src/app/status/[slug]/page.tsx`:
```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) {
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    if (!lead) return { title: "Not Found" };
    clinic = { name: lead.clinicName || `${lead.doctorName}'s Clinic` } as any;
  }

  return {
    title: `Check Status | ${clinic.name}`,
    description: `Check your live queue status at ${clinic.name}.`,
    manifest: `/api/manifest/${slug}`,
  };
}
```

---

### Target 4: `src/app/track/[appointmentId]/tracking-client.tsx`
Fix JSX nesting and TS1005 error by wrapping with `<> ... </>`.

#### Proposed Diff for `src/app/track/[appointmentId]/tracking-client.tsx`:
Around line 331:
```tsx
<<<< BEFORE (Line 331)
  return (
    <div className="space-y-6">
==== AFTER
  return (
    <>
      <div className="space-y-6">
>>>>
```

Around lines 748–782:
```tsx
<<<< BEFORE (Lines 748-782)
        {/* ──── Cancel Link ──── */}
        {canCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pt-2">
            <button onClick={() => setShowCancelModal(true)} className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors py-2 underline-offset-4 hover:underline">{t.cancelThisAppt}</button>
          </motion.div>
        )}
      </div>

      {/* ──── Cancel Confirmation Modal ──── */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={() => setShowCancelModal(false)} />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", stiffness: 350, damping: 32 }} className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-full sm:max-w-sm">
              <div className="bg-white rounded-t-[2rem] sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-6 pb-8">
                <div className="flex justify-center mb-6 sm:hidden"><div className="w-12 h-1.5 bg-slate-200 rounded-full" /></div>
                <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                   <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 text-center mb-2">{t.cancelApptTitle}</h2>
                <p className="text-[15px] text-slate-500 text-center mb-8 leading-relaxed font-medium"><span dangerouslySetInnerHTML={{ __html: t.cancelApptDesc(doctorFirstName) }} /></p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white text-slate-700 font-bold text-[15px] hover:bg-slate-50 hover:border-slate-200 transition-colors order-2 sm:order-1" onClick={() => setShowCancelModal(false)} disabled={isPending}>{t.keepIt}</button>
                  <button className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-[15px] shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 order-1 sm:order-2" onClick={handleCancel} disabled={isPending}>
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t.yesCancel}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
==== AFTER
        {/* ──── Cancel Link ──── */}
        {canCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center pt-2">
            <button onClick={() => setShowCancelModal(true)} className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors py-2 underline-offset-4 hover:underline">{t.cancelThisAppt}</button>
          </motion.div>
        )}
      </div>

      {/* ──── Cancel Confirmation Modal ──── */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50" onClick={() => setShowCancelModal(false)} />
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", stiffness: 350, damping: 32 }} className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-full sm:max-w-sm">
              <div className="bg-white rounded-t-[2rem] sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden p-6 pb-8">
                <div className="flex justify-center mb-6 sm:hidden"><div className="w-12 h-1.5 bg-slate-200 rounded-full" /></div>
                <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
                   <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-black text-slate-900 text-center mb-2">{t.cancelApptTitle}</h2>
                <p className="text-[15px] text-slate-500 text-center mb-8 leading-relaxed font-medium"><span dangerouslySetInnerHTML={{ __html: t.cancelApptDesc(doctorFirstName) }} /></p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white text-slate-700 font-bold text-[15px] hover:bg-slate-50 hover:border-slate-200 transition-colors order-2 sm:order-1" onClick={() => setShowCancelModal(false)} disabled={isPending}>{t.keepIt}</button>
                  <button className="w-full h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-[15px] shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 order-1 sm:order-2" onClick={handleCancel} disabled={isPending}>
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : t.yesCancel}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
>>>>
```

---

## 5. Verification Method

1. **TypeScript Verification**:
   - Run `npx tsc --noEmit`
   - Invalidation condition: Any error reported in `tracking-client.tsx`, `layout.tsx`, or `page.tsx`.
2. **Metadata Verification**:
   - Request rendered HTML for `/track/<appointmentId>` and check that `<link rel="manifest" href="/api/manifest/<clinicSlug>">` is present.
   - Request rendered HTML for `/status/<slug>` and check that `<link rel="manifest" href="/api/manifest/<slug>">` is present.
   - Request rendered HTML for `/dashboard` or `/login` and check that `<link rel="manifest" href="/manifest.json">` remains for doctor portal.
