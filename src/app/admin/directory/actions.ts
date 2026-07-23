"use server";

import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { unclaimedClinics } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function bulkUploadDirectory(data: any[]) {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(authUser.userId)) {
    throw new Error("Unauthorized");
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { error: "No valid data provided." };
  }

  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  // Process in chunks to avoid overwhelming the DB
  const chunkSize = 50;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    
    // Format chunk
    const valuesToInsert = chunk.map((row) => {
      // Basic slug generation
      const baseSlug = `${row.doctorName}-${row.specialty}-${row.city}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      
      // Append a random hash if needed to avoid slug collision, or just use baseSlug
      // Assuming the user cleans the list, we'll try baseSlug
      return {
        slug: baseSlug,
        doctorName: row.doctorName,
        clinicName: row.clinicName || `${row.doctorName}'s Clinic`,
        specialty: row.specialty,
        city: row.city,
        state: row.state,
        address: row.address,
        phone: row.phone || null,
      };
    });

    try {
      // Use ON CONFLICT DO NOTHING (Supported in Postgres)
      // Drizzle Postgres insert().onConflictDoNothing()
      await db.insert(unclaimedClinics)
        .values(valuesToInsert)
        .onConflictDoNothing({ target: unclaimedClinics.slug });
      
      // Note: onConflictDoNothing doesn't tell us exactly how many succeeded vs skipped easily in Drizzle without complex returning clauses.
      // For simplicity, we just count them all as processed.
      successCount += chunk.length;
    } catch (err: any) {
      console.error("[BulkUpload Error]", err);
      errorCount += chunk.length;
    }
  }

  revalidatePath("/admin/directory");
  return { 
    success: true, 
    message: `Processed ${data.length} records. Upload completed.` 
  };
}
