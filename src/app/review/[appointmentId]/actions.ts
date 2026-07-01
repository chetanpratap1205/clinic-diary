"use server";

import { db } from "@/db";
import { appointments, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitReview(
  appointmentId: string,
  rating: number,
  comment: string
) {
  try {
    // Check if appointment exists
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return { error: "Appointment not found." };
    }

    if (appointment.status !== "completed") {
      return { error: "You can only review a completed appointment." };
    }

    // Check if review already exists
    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.appointmentId, appointmentId))
      .limit(1);

    if (existing) {
      return { error: "You have already submitted a review for this visit." };
    }

    // Insert the review
    await db.insert(reviews).values({
      clinicId: appointment.clinicId,
      patientId: appointment.patientId!,
      appointmentId,
      rating,
      comment: comment.trim() || null,
      isVerified: true,
    });

    // Revalidate the clinic booking page
    revalidatePath(`/book`);
    // Ideally we revalidate `/book/[slug]` but we don't have the slug directly here. 
    // `revalidatePath('/book', 'layout')` will clear all nested routes under /book
    revalidatePath('/book', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}
