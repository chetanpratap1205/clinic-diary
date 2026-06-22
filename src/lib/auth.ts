import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { clinicAdmins, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  clinicId: string | null;
  clinicSlug: string | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // fetch clinic details if linked
    const adminRecord = await db
      .select()
      .from(clinicAdmins)
      .where(eq(clinicAdmins.authUserId, user.id))
      .limit(1);

    if (!adminRecord.length) {
      return {
        userId: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.name ?? "",
        clinicId: null,
        clinicSlug: null,
      };
    }

    const clinic = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, adminRecord[0].clinicId))
      .limit(1);

    return {
      userId: user.id,
      email: user.email ?? "",
      name: clinic[0]?.doctorName ?? "", 
      clinicId: clinic[0]?.id ?? null,
      clinicSlug: clinic[0]?.slug ?? null,
    };
  } catch (err) {
    console.error("getAuthUser error:", err);
    return null;
  }
}
