import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client — uses SERVICE_ROLE_KEY.
 * NEVER expose this on the client side.
 * Only import this in Server Actions or API routes.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
