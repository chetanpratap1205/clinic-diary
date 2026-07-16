import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clinics, growthPartners, doctorLeads } from "@/db/schema";
import { ilike, or, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Make sure user is admin
    const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim());
    if (!adminIds.includes(authUser.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${q}%`;

    // Fire all queries concurrently for maximum speed
    const [matchedClinics, matchedPartners, matchedLeads] = await Promise.all([
      db.select({ id: clinics.id, name: clinics.name, doctorName: clinics.doctorName, phone: clinics.phone })
        .from(clinics)
        .where(or(
          ilike(clinics.name, searchTerm),
          ilike(clinics.doctorName, searchTerm),
          ilike(clinics.phone, searchTerm)
        ))
        .limit(5),
        
      db.select({ id: growthPartners.id, name: growthPartners.name, email: growthPartners.email, phone: growthPartners.phone })
        .from(growthPartners)
        .where(or(
          ilike(growthPartners.name, searchTerm),
          ilike(growthPartners.email, searchTerm),
          ilike(growthPartners.phone, searchTerm)
        ))
        .limit(5),
        
      db.select({ id: doctorLeads.id, doctorName: doctorLeads.doctorName, clinicName: doctorLeads.clinicName, phone: doctorLeads.phone })
        .from(doctorLeads)
        .where(or(
          ilike(doctorLeads.doctorName, searchTerm),
          ilike(doctorLeads.clinicName, searchTerm),
          ilike(doctorLeads.phone, searchTerm)
        ))
        .orderBy(desc(doctorLeads.createdAt))
        .limit(5)
    ]);

    const results = [
      ...matchedClinics.map(c => ({
        id: c.id,
        title: c.name,
        subtitle: `${c.doctorName} • ${c.phone}`,
        type: "clinic",
        href: `/admin/clinics/${c.id}`
      })),
      ...matchedPartners.map(p => ({
        id: p.id,
        title: p.name,
        subtitle: `${p.email} • ${p.phone || 'No phone'}`,
        type: "partner",
        href: `/admin/partners/${p.id}`
      })),
      ...matchedLeads.map(l => ({
        id: l.id,
        title: `Dr. ${l.doctorName}`,
        subtitle: `${l.clinicName || 'No Clinic Name'} • ${l.phone}`,
        type: "lead",
        href: `/admin/leads` // Leads don't have dedicated detail pages yet, they are on a master table
      }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[Admin Search API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
