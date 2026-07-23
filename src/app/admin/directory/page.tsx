import { db } from "@/db";
import { unclaimedClinics } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DirectoryClient } from "./directory-client";

export const dynamic = "force-dynamic";

export default async function DirectoryAdminPage() {
  const clinics = await db
    .select()
    .from(unclaimedClinics)
    .orderBy(desc(unclaimedClinics.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">SEO Directory Manager</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Bulk import unclaimed doctor profiles to automatically generate SEO-optimized landing pages.
        </p>
      </div>

      <DirectoryClient unclaimedClinics={clinics} />
    </div>
  );
}
