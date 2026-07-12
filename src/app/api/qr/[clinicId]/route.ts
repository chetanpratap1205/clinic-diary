import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { generateQrPdfBuffer } from "@/lib/pdf-generator";

// Serves the QR code PDF for a given clinic
// Used by doctor dashboard widget + print download
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await params;

  // Auth check — must be the clinic's own admin OR a super-admin
  const user = await getAuthUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Allow the clinic's own doctor to fetch their QR
  // Or if user is a founder admin (you can add super-admin checks here if needed)
  if (user.clinicId !== clinicId) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Find the QR code assigned to this clinic
  const qrResult = await db
    .select({
      code: qrCodes.code,
      clinicName: clinics.name,
    })
    .from(qrCodes)
    .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
    .where(eq(qrCodes.clinicId, clinicId))
    .limit(1);

  if (!qrResult.length) {
    return new NextResponse("No QR code assigned yet", { status: 404 });
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
        "Cache-Control": "public, max-age=86400", // cache 24h
        "Content-Disposition": `attachment; filename="clinic-qr-${code}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return new NextResponse("Error generating PDF", { status: 500 });
  }
}
