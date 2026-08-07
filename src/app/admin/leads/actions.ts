"use server";

import { db } from "@/db";
import { doctorLeads, leadActivities, growthPartners } from "@/db/schema";
import {
  eq,
  desc,
  and,
  or,
  ilike,
  sql,
  count,
  inArray,
  isNull,
  lt,
} from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSuggestedPillar } from "./message-builder";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface LeadFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  specialty?: string;
  city?: string;
  source?: string;
  page?: number;
  pageSize?: number;
}

// ─── Get Leads (paginated + filtered) ─────────────────────────────────────────
export async function getLeads(filters: LeadFilters = {}) {
  const {
    search,
    status,
    priority,
    category,
    specialty,
    city,
    source,
    page = 1,
    pageSize = 50,
  } = filters;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(doctorLeads.doctorName, `%${search}%`),
        ilike(doctorLeads.clinicName, `%${search}%`),
        ilike(doctorLeads.phone, `%${search}%`),
        ilike(doctorLeads.city, `%${search}%`)
      )
    );
  }
  if (status && status !== "all") conditions.push(eq(doctorLeads.status, status));
  if (priority && priority !== "all") conditions.push(eq(doctorLeads.priority, priority));
  if (category && category !== "all") conditions.push(eq(doctorLeads.leadCategory, category));
  if (specialty && specialty !== "all") conditions.push(ilike(doctorLeads.specialty, `%${specialty}%`));
  if (city && city !== "all") conditions.push(ilike(doctorLeads.city, `%${city}%`));
  if (source && source !== "all") conditions.push(eq(doctorLeads.source, source));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * pageSize;

  const [leads, totalRows] = await Promise.all([
    db
      .select()
      .from(doctorLeads)
      .where(where)
      .orderBy(
        // Hot first, then by follow-up date overdue
        sql`CASE priority WHEN 'hot' THEN 1 WHEN 'warm' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END`,
        desc(doctorLeads.createdAt)
      )
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(doctorLeads).where(where),
  ]);

  return {
    leads,
    total: totalRows[0]?.count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalRows[0]?.count ?? 0) / pageSize),
  };
}

// ─── Get Lead Stats (for header pills) ────────────────────────────────────────
export async function getLeadStats() {
  const rows = await db
    .select({
      status: doctorLeads.status,
      priority: doctorLeads.priority,
      count: count(),
    })
    .from(doctorLeads)
    .groupBy(doctorLeads.status, doctorLeads.priority);

  const stats = {
    total: 0,
    hot: 0,
    warm: 0,
    new: 0,
    contacted: 0,
    demo_scheduled: 0,
    converted: 0,
    rejected: 0,
    overdue: 0,
  };

  for (const row of rows) {
    stats.total += row.count;
    if (row.priority === "hot") stats.hot += row.count;
    if (row.priority === "warm") stats.warm += row.count;
    if (row.status === "new") stats.new += row.count;
    if (row.status === "contacted") stats.contacted += row.count;
    if (row.status === "demo_scheduled") stats.demo_scheduled += row.count;
    if (row.status === "converted") stats.converted += row.count;
    if (row.status === "rejected") stats.rejected += row.count;
  }

  // Count overdue follow-ups
  const overdueRows = await db
    .select({ count: count() })
    .from(doctorLeads)
    .where(
      and(
        lt(doctorLeads.followUpDate, new Date()),
        inArray(doctorLeads.status, ["new", "contacted", "demo_scheduled"])
      )
    );
  stats.overdue = overdueRows[0]?.count ?? 0;

  return stats;
}

// ─── Get Lead Activities ───────────────────────────────────────────────────────
export async function getLeadActivities(leadId: string) {
  return db
    .select()
    .from(leadActivities)
    .where(eq(leadActivities.leadId, leadId))
    .orderBy(desc(leadActivities.createdAt));
}

import { autoAssignLeadRoundRobin } from "@/lib/auth/rbac";

// ─── Create Lead ───────────────────────────────────────────────────────────────
export async function createLead(data: {
  doctorName: string;
  clinicName?: string;
  phone: string;
  email?: string;
  specialty?: string;
  city?: string;
  address?: string;
  source: string;
  status: string;
  priority: string;
  leadCategory: string;
  domainPillar?: string;
  notes?: string;
  followUpDate?: string;
}) {
  try {
    const pillar = data.domainPillar || getSuggestedPillar(data.specialty);
    const { assignedEmployeeId, assignedManagerId } = await autoAssignLeadRoundRobin(data.city);

    await db.insert(doctorLeads).values({
      doctorName: data.doctorName,
      clinicName: data.clinicName || null,
      phone: data.phone.replace(/\D/g, ""),
      email: data.email || null,
      specialty: data.specialty || null,
      city: data.city || null,
      address: data.address || null,
      source: data.source,
      status: data.status,
      priority: data.priority,
      leadCategory: data.leadCategory,
      domainPillar: pillar,
      notes: data.notes || null,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
      assignedEmployeeId,
      assignedManagerId,
      messageSentStep: 0,
      updatedAt: new Date(),
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err) {
    console.error("createLead error:", err);
    return { error: "Failed to create lead. Phone may already exist." };
  }
}

// ─── Update Lead ───────────────────────────────────────────────────────────────
export async function updateLead(
  id: string,
  data: Partial<{
    doctorName: string;
    clinicName: string | null;
    phone: string;
    email: string | null;
    specialty: string | null;
    city: string | null;
    address: string | null;
    source: string;
    status: string;
    priority: string;
    leadCategory: string;
    domainPillar: string | null;
    assignedTo: string | null;
    notes: string | null;
    followUpDate: string | null;
    demoScheduledAt: string | null;
    convertedAt: string | null;
  }>
) {
  try {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    if (data.doctorName !== undefined) updateData.doctorName = data.doctorName;
    if (data.clinicName !== undefined) updateData.clinicName = data.clinicName;
    if (data.phone !== undefined) updateData.phone = data.phone.replace(/\D/g, "");
    if (data.email !== undefined) updateData.email = data.email;
    if (data.specialty !== undefined) {
      updateData.specialty = data.specialty;
      updateData.domainPillar = getSuggestedPillar(data.specialty);
    }
    if (data.domainPillar !== undefined) updateData.domainPillar = data.domainPillar;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "converted") updateData.convertedAt = new Date();
    }
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.leadCategory !== undefined) updateData.leadCategory = data.leadCategory;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.followUpDate !== undefined) {
      updateData.followUpDate = data.followUpDate ? new Date(data.followUpDate) : null;
    }
    if (data.demoScheduledAt !== undefined) {
      updateData.demoScheduledAt = data.demoScheduledAt ? new Date(data.demoScheduledAt) : null;
    }

     
    await db.update(doctorLeads).set(updateData as unknown as typeof doctorLeads.$inferInsert).where(eq(doctorLeads.id, id));

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err) {
    console.error("updateLead error:", err);
    return { error: "Failed to update lead." };
  }
}

// ─── Delete Lead ───────────────────────────────────────────────────────────────
export async function deleteLead(id: string) {
  try {
    await db.delete(doctorLeads).where(eq(doctorLeads.id, id));
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err) {
    console.error("deleteLead error:", err);
    return { error: "Failed to delete lead." };
  }
}

// ─── Mark Message Sent (increments step + logs activity) ─────────────────────
export async function markMessageSent(leadId: string, step: number) {
  try {
    await db
      .update(doctorLeads)
      .set({
        messageSentStep: step,
        lastContactedAt: new Date(),
        status: "contacted",
        updatedAt: new Date(),
      })
      .where(eq(doctorLeads.id, leadId));

    revalidatePath("/admin/leads");
    return { success: true };
  } catch (err) {
    console.error("markMessageSent error:", err);
    return { error: "Failed to mark message sent." };
  }
}

// ─── Log Activity ──────────────────────────────────────────────────────────────
export async function logActivity(
  leadId: string,
  type: string,
  notes: string,
  previousStatus?: string,
  newStatus?: string
) {
  try {
    // Get lead to find assignedTo, fallback to a system indicator
    const [lead] = await db
      .select({ assignedTo: doctorLeads.assignedTo })
      .from(doctorLeads)
      .where(eq(doctorLeads.id, leadId));

    if (!lead?.assignedTo) {
      // If no partner assigned, just return success without logging to leadActivities
      // (leadActivities requires a partnerId FK)
      return { success: true };
    }

    await db.insert(leadActivities).values({
      leadId,
      partnerId: lead.assignedTo,
      type,
      notes,
      previousStatus: previousStatus || null,
      newStatus: newStatus || null,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    console.error("logActivity error:", err);
    return { error: "Failed to log activity." };
  }
}

// ─── Bulk Import Leads from CSV rows ──────────────────────────────────────────
export async function importLeads(
  rows: Array<{
    doctorName: string;
    clinicName?: string;
    phone: string;
    email?: string;
    specialty?: string;
    city?: string;
    address?: string;
    source?: string;
    leadCategory?: string;
    state?: string;
    degree?: string;
    consultationFee?: number;
    googleMapsUrl?: string;
  }>,
  generateShadowProfiles: boolean = false
) {
  const results = { added: 0, skipped: 0, errors: 0 };
  const { clinics, availability } = await import("@/db/schema");

  for (const row of rows) {
    if (!row.doctorName || !row.phone) {
      results.errors++;
      continue;
    }
    try {
      const phone = row.phone.replace(/\D/g, "");
      // Check duplicate
      const [existing] = await db
        .select({ id: doctorLeads.id })
        .from(doctorLeads)
        .where(eq(doctorLeads.phone, phone));

      if (existing) {
        results.skipped++;
        continue;
      }

      const pillar = getSuggestedPillar(row.specialty);
      
      let clinicSlug = null;
      let accessPin = null;

      if (generateShadowProfiles) {
        // Generate robust slug
        const baseName = (row.clinicName || row.doctorName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        clinicSlug = `${baseName}-${Math.random().toString(36).substring(2, 6)}`;

        // We use the last 6 digits of the phone as the secure PIN
        // (Supabase requires at least 6 characters for a password)
        accessPin = phone.slice(-6);
        if (accessPin.length < 6) accessPin = "123456"; // fallback

        // Create the shadow clinic
        const [newClinic] = await db.insert(clinics).values({
          slug: clinicSlug,
          name: row.clinicName || `${row.doctorName}'s Clinic`,
          doctorName: row.doctorName,
          degree: row.degree || null,
          specialty: row.specialty || "General Physician",
          phone: phone,
          whatsappNumber: phone,
          address: row.address || null,
          state: row.state || row.city || null,
          googleMapsUrl: row.googleMapsUrl || null,
          consultationFee: row.consultationFee || 0,
          createdAt: new Date(),
        }).returning();

        // Create default availability (Mon-Sat, 09:00 - 17:00, 30 min slots)
        const availabilityValues = [];
        for (let day = 1; day <= 6; day++) { // 1=Monday, 6=Saturday
          availabilityValues.push({
            clinicId: newClinic.id,
            dayOfWeek: day,
            startTime: "09:00:00",
            endTime: "17:00:00",
            slotDurationMinutes: 30,
            maxPatientsPerSlot: 1,
            isWalkInOnly: false,
          });
        }
        await db.insert(availability).values(availabilityValues);

        // --- CONCIERGE ONBOARDING AUTOMATION ---
        // Create the Supabase User instantly using the Admin API
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const dummyEmail = `doc_${phone}@naturexpress.in`;
        
        // Try to create the user
        let authUserId = null;
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: dummyEmail,
          password: accessPin,
          email_confirm: true,
          user_metadata: { has_changed_pin: false }
        });

        if (createError && createError.message.includes("already registered")) {
          // If they exist, update their password to the new PIN
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = listData.users.find((u: any) => u.email === dummyEmail);
          if (existingUser) {
            authUserId = existingUser.id;
            await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: accessPin });
          }
        } else if (createData.user) {
          authUserId = createData.user.id;
        }

        if (authUserId) {
          // Link user to the clinic
          const { clinicAdmins } = await import("@/db/schema");
          
          await db.insert(clinicAdmins).values({
            clinicId: newClinic.id,
            authUserId: authUserId,
          });
        }
      }

      await db.insert(doctorLeads).values({
        doctorName: row.doctorName,
        clinicName: row.clinicName || null,
        phone,
        email: row.email || null,
        specialty: row.specialty || null,
        city: row.city || null,
        address: row.address || null,
        source: row.source || "imported",
        status: "new",
        priority: "normal",
        leadCategory: row.leadCategory || "A",
        domainPillar: pillar,
        messageSentStep: 0,
        clinicSlug,
        accessPin,
        updatedAt: new Date(),
      });

      results.added++;
    } catch (err) {
      console.error("Row import error:", err);
      results.errors++;
    }
  }

  revalidatePath("/admin/leads");
  return results;
}

// ─── Get distinct cities for filter dropdown ──────────────────────────────────
export async function getLeadCities() {
  const rows = await db
    .selectDistinct({ city: doctorLeads.city })
    .from(doctorLeads)
    .where(sql`${doctorLeads.city} IS NOT NULL`)
    .orderBy(doctorLeads.city);
  return rows.map((r) => r.city).filter(Boolean) as string[];
}

// ─── Convert Lead to Active Clinic ────────────────────────────────────────────
export async function convertLeadToClinicAction(leadId: string) {
  try {
    const { clinics, subscriptions } = await import("@/db/schema");
    const [lead] = await db
      .select()
      .from(doctorLeads)
      .where(eq(doctorLeads.id, leadId))
      .limit(1);

    if (!lead) return { error: "Lead not found" };

    const baseName = lead.clinicName || lead.doctorName || "Practice Clinic";
    const slugBase = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).substring(2, 6)}`;

    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // 1. Create Clinic
    const [newClinic] = await db
      .insert(clinics)
      .values({
        slug,
        name: lead.clinicName || `${lead.doctorName}'s Practice`,
        doctorName: lead.doctorName,
        specialty: lead.specialty || "General Physician",
        phone: lead.phone,
        address: lead.address || lead.city || null,
        state: lead.city || null,
        createdAt: now,
      })
      .returning();

    // 2. Create Subscription Trial
    await db.insert(subscriptions).values({
      clinicId: newClinic.id,
      planId: "quarterly",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
    });

    // 3. Update Lead Status to Converted
    await db
      .update(doctorLeads)
      .set({
        status: "converted",
        convertedAt: now,
        updatedAt: now,
      })
      .where(eq(doctorLeads.id, leadId));

    revalidatePath("/admin/leads");
    revalidatePath("/admin/clinics");
    revalidatePath("/admin/finance");

    return { success: true, clinicId: newClinic.id, clinicName: newClinic.name };
  } catch (error) {
    console.error("Error converting lead to clinic:", error);
    return { error: "Failed to convert lead into active clinic." };
  }
}

// ─── Get Growth Partners ───────────────────────────────────────────────────────
export async function getGrowthPartners() {
  return db
    .select({
      id: growthPartners.id,
      name: growthPartners.name,
      product: growthPartners.product,
      isActive: growthPartners.isActive,
    })
    .from(growthPartners)
    .where(eq(growthPartners.isActive, true))
    .orderBy(growthPartners.name);
}

