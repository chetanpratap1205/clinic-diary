import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim());
  return adminIds.includes(user.id);
}

// PATCH /api/admin/reviews — toggle isVerified
export async function PATCH(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, isVerified } = body as { id: string; isVerified: boolean };

    if (!id || typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await db
      .update(reviews)
      .set({ isVerified })
      .where(eq(reviews.id, id));

    return NextResponse.json({ success: true, isVerified });
  } catch (err) {
    console.error("[Admin/Reviews PATCH]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// GET /api/admin/reviews — list all reviews (optional, for future use)
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allReviews = await db.select().from(reviews);
    return NextResponse.json(allReviews);
  } catch (err) {
    console.error("[Admin/Reviews GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
