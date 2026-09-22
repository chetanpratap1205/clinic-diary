import "dotenv/config";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running DB migration for Shopify for Clinics new columns...");
  await db.execute(sql`
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS google_review_url TEXT;
    ALTER TABLE clinics ADD COLUMN IF NOT EXISTS enable_auto_review_booster BOOLEAN DEFAULT true NOT NULL;
    ALTER TABLE visit_notes ADD COLUMN IF NOT EXISTS rx_image_url TEXT;
  `);
  console.log("Migration executed successfully!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
}).then(() => process.exit(0));
