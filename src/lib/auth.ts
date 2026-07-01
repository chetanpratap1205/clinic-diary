import { cache } from "react";
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
  clinicName: string | null;
  themeColor: string | null;
}

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
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
        clinicName: null,
        themeColor: null,
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
      clinicName: clinic[0]?.name ?? null,
      themeColor: clinic[0]?.themeColor ?? null,
    };
  } catch (err: any) {
    // Next.js uses exceptions to handle dynamic routing, so we must rethrow it
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("getAuthUser error:", err);
    return null;
  }
});
