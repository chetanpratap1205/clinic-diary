import { db } from "./src/db";
import { paymentLogs, subscriptions } from "./src/db/schema";
import { sql } from "drizzle-orm";

async function check() {
  const subs = await db.select().from(subscriptions);
  console.log("Subscriptions:", subs);
  const logs = await db.select().from(paymentLogs);
  console.log("Payment Logs:", logs);
}

check().catch(console.error).then(() => process.exit(0));
