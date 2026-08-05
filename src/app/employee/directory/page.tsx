export const dynamic = "force-dynamic";

import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { db } from "@/db";
import { unclaimedClinics } from "@/db/schema";
import { DirectoryClient } from "./directory-client";
import { redirect } from "next/navigation";
import { eq, desc, and, inArray } from "drizzle-orm";

export default async function EmployeeDirectoryPage() {
  const emp = await getAuthenticatedEmployee();
  if (!emp) redirect("/login");

  const conditions = [eq(unclaimedClinics.isClaimed, false)];

  if (emp.territoryCities && emp.territoryCities.length > 0) {
    conditions.push(inArray(unclaimedClinics.city, emp.territoryCities));
  }

  const clinics = await db
    .select()
    .from(unclaimedClinics)
    .where(and(...conditions))
    .orderBy(desc(unclaimedClinics.createdAt))
    .limit(60);

  return <DirectoryClient clinics={clinics} emp={emp} />;
}
