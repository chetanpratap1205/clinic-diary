import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { generateSalesPackPdfBuffer } from "@/lib/pdf-generator";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  return adminIds.includes(user.id);
}

// GET /api/admin/qr/sales-pack?id=... or ?code=... or ?clinicId=...
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const urlObj = new URL(req.url);
  const id = urlObj.searchParams.get("id");
  const codeParam = urlObj.searchParams.get("code");
  const clinicId = urlObj.searchParams.get("clinicId");

  let qrResult;

  if (id) {
    qrResult = await db
      .select({
        code: qrCodes.code,
        clinicName: clinics.name,
        doctorName: clinics.doctorName,
      })
      .from(qrCodes)
      .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
      .where(eq(qrCodes.id, id))
      .limit(1);
  } else if (codeParam) {
    qrResult = await db
      .select({
        code: qrCodes.code,
        clinicName: clinics.name,
        doctorName: clinics.doctorName,
      })
      .from(qrCodes)
      .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
      .where(eq(qrCodes.code, codeParam.toUpperCase()))
      .limit(1);
  } else if (clinicId) {
    qrResult = await db
      .select({
        code: qrCodes.code,
        clinicName: clinics.name,
        doctorName: clinics.doctorName,
      })
      .from(qrCodes)
      .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
      .where(eq(qrCodes.clinicId, clinicId))
      .limit(1);
  } else {
    qrResult = await db
      .select({
        code: qrCodes.code,
        clinicName: clinics.name,
        doctorName: clinics.doctorName,
      })
      .from(qrCodes)
      .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
      .limit(1);
  }

  if (!qrResult || !qrResult.length) {
    return new NextResponse("QR code or clinic not found", { status: 404 });
  }

  const { code, clinicName, doctorName } = qrResult[0];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  try {
    const pdfBuffer = await generateSalesPackPdfBuffer(code, baseUrl, clinicName, doctorName);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-cache",
        "Content-Disposition": `attachment; filename="sales-pack-${code}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Sales Pack Generation Error:", err);
    return new NextResponse("Error generating Sales Pack PDF", { status: 500 });
  }
}
