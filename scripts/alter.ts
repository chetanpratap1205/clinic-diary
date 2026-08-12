import 'dotenv/config';
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Adding invoice_number...");
    await db.execute(sql`ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE;`);
    
    console.log("Making razorpay_order_id nullable...");
    await db.execute(sql`ALTER TABLE payment_logs ALTER COLUMN razorpay_order_id DROP NOT NULL;`);
    
    console.log("Making razorpay_payment_id nullable...");
    await db.execute(sql`ALTER TABLE payment_logs ALTER COLUMN razorpay_payment_id DROP NOT NULL;`);
    
    console.log("Successfully altered schema.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

main();
