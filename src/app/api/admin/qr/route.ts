import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCodes, clinics, subscriptions } from "@/db/schema";
import { eq, isNull, isNotNull, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// ─── ADMIN AUTH GUARD ──────────────────────────────────────────────────────────
// Only the founder (your account) can access admin routes
// Set ADMIN_USER_IDS in env as comma-separated Supabase auth user IDs
async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  return adminIds.includes(user.id);
}

// GET /api/admin/qr — list all QR codes with clinic info
export async function GET() {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const codes = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      clinicId: qrCodes.clinicId,
      assignedAt: qrCodes.assignedAt,
      printedAt: qrCodes.printedAt,
      notes: qrCodes.notes,
      createdAt: qrCodes.createdAt,
      clinicName: clinics.name,
      clinicSlug: clinics.slug,
      doctorName: clinics.doctorName,
      subStatus: subscriptions.status,
      subEnd: subscriptions.currentPeriodEnd,
    })
    .from(qrCodes)
    .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
    .leftJoin(subscriptions, eq(qrCodes.clinicId, subscriptions.clinicId))
    .orderBy(desc(qrCodes.createdAt));

  return NextResponse.json(codes);
}

// POST /api/admin/qr — create a batch of new codes
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const count = Math.min(Number(body.count) || 1, 100); // max 100 per batch

  // Generate codes: CD-XXXX format (ClinicDiary branded)
  const existingCodes = await db
    .select({ code: qrCodes.code })
    .from(qrCodes);
  const existingSet = new Set(existingCodes.map((r) => r.code));

  const newCodes: { code: string }[] = [];
  let attempts = 0;
  while (newCodes.length < count && attempts < 1000) {
    attempts++;
    const code = `CD-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    if (!existingSet.has(code)) {
      existingSet.add(code);
      newCodes.push({ code });
    }
  }

  const inserted = await db.insert(qrCodes).values(newCodes).returning();
  return NextResponse.json({ created: inserted.length, codes: inserted });
}

// PATCH /api/admin/qr — assign a code to a clinic
export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const { qrId, clinicId, notes } = body;

  if (!qrId) {
    return NextResponse.json({ error: "qrId is required" }, { status: 400 });
  }

  // Unassign: pass clinicId = null
  if (!clinicId) {
    const updated = await db
      .update(qrCodes)
      .set({ clinicId: null, assignedAt: null, notes: notes ?? null })
      .where(eq(qrCodes.id, qrId))
      .returning();
    return NextResponse.json(updated[0]);
  }

  // Validate clinic exists
  const clinic = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
  if (!clinic.length) {
    return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
  }

  // Check no other QR is already assigned to this clinic
  const existing = await db
    .select()
    .from(qrCodes)
    .where(eq(qrCodes.clinicId, clinicId))
    .limit(1);

  if (existing.length && existing[0].id !== qrId) {
    return NextResponse.json(
      { error: `This clinic already has QR code ${existing[0].code}. Unassign it first.` },
      { status: 409 }
    );
  }

  const updated = await db
    .update(qrCodes)
    .set({
      clinicId,
      assignedAt: new Date(),
      notes: notes ?? null,
    })
    .where(eq(qrCodes.id, qrId))
    .returning();

  return NextResponse.json(updated[0]);
}

// DELETE /api/admin/qr?id=xxx — delete a code
export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.delete(qrCodes).where(eq(qrCodes.id, id));
  return NextResponse.json({ success: true });
}

// POST /api/admin/qr/print — mark an array of QR IDs as printed
export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const body = await req.json();
  const { ids } = body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  // We loop and update since drizzle doesn't natively support update ... where in array elegantly without IN operator setup
  // Wait, we can use `inArray` if we import it.
  // Actually, easiest is just looping for a handful of IDs, or using raw SQL, but drizzle's 'inArray' is perfect.
  // We'll just loop since the batch size is usually < 100.
  const now = new Date();
  
  for (const id of ids) {
    await db.update(qrCodes).set({ printedAt: now }).where(eq(qrCodes.id, id));
  }
  
  return NextResponse.json({ success: true, count: ids.length });
}
