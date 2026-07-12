import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { generateQrPdfBuffer } from "@/lib/pdf-generator";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  return adminIds.includes(user.id);
}

// GET /api/admin/qr/download/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await params;

  const qrResult = await db
    .select({
      code: qrCodes.code,
      clinicName: clinics.name,
    })
    .from(qrCodes)
    .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
    .where(eq(qrCodes.id, id))
    .limit(1);

  if (!qrResult.length) {
    return new NextResponse("QR code not found", { status: 404 });
  }

  const { code, clinicName } = qrResult[0];
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";
  const redirectUrl = `${baseUrl}/q/${code}`;

  try {
    const pdfBuffer = await generateQrPdfBuffer(code, redirectUrl, clinicName);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-cache",
        "Content-Disposition": `attachment; filename="qr-${code}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
