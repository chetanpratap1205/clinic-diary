import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

// GET /api/qr/[clinicId]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;

  // Auth check
  const user = await getAuthUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (user.clinicId !== clinicId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Find all QR codes assigned to this clinic
  const codes = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      usageType: qrCodes.usageType,
    })
    .from(qrCodes)
    .where(eq(qrCodes.clinicId, clinicId));

  if (!codes.length) {
    return NextResponse.json({ error: "No QR code assigned yet" }, { status: 404 });
  }

  return NextResponse.json(codes);
}
