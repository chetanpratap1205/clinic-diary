"use server";

import { createClient } from "@/lib/supabase/server";

export async function changeInitialPin(newPin: string) {
  try {
    const supabase = await createClient();
    
    // Ensure the user is logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "You must be logged in to change your PIN." };
    }

    if (newPin.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    // Update password AND metadata atomically
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPin,
      data: { has_changed_pin: true }
    });

    if (updateError) {
      console.error("Failed to update password:", updateError);
      return { error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("changeInitialPin error:", error);
    return { error: "An unexpected error occurred." };
  }
}
