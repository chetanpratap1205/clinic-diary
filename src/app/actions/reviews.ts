"use server";

import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateReviewStatusAction(reviewId: string, isVerified: boolean) {
  try {
    await db
      .update(reviews)
      .set({ isVerified })
      .where(eq(reviews.id, reviewId));

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error updating review status:", error);
    return { success: false, error: "Failed to update review status." };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId));

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    return { success: false, error: "Failed to delete review." };
  }
}
