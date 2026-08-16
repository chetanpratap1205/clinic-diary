import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    
    // Check if it's a demo URL
    if (appointmentId.startsWith("demo-")) {
      const slug = appointmentId.replace("demo-", "");
      const url = new URL(request.url);
      return NextResponse.redirect(new URL(`/clinic/${slug}/track/${appointmentId}${url.search}`, request.url));
    }

    // Lookup the clinic slug
    const [result] = await db
      .select({ clinicSlug: clinics.slug })
      .from(appointments)
      .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (result?.clinicSlug) {
      const url = new URL(request.url);
      return NextResponse.redirect(new URL(`/clinic/${result.clinicSlug}/track/${appointmentId}${url.search}`, request.url));
    }

    return new NextResponse("Appointment not found", { status: 404 });
  } catch (error) {
    console.error("Error in legacy track redirect:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
