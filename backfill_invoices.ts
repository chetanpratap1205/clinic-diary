import 'dotenv/config';
import { db } from "./src/db";
import { subscriptions, paymentLogs } from "./src/db/schema";
import { eq } from "drizzle-orm";

const PLANS = {
  monthly: { amount: 499 * 100, name: "1 Month" },
  quarterly: { amount: 1299 * 100, name: "3 Months" },
  yearly: { amount: 4999 * 100, name: "12 Months" },
};

async function backfill() {
  console.log("Starting backfill for missing invoices...");
  const subs = await db.select().from(subscriptions);
  let backfilledCount = 0;

  for (const sub of subs) {
    const logs = await db
      .select()
      .from(paymentLogs)
      .where(eq(paymentLogs.clinicId, sub.clinicId));

    if (logs.length === 0) {
      console.log(`Clinic ${sub.clinicId} has subscription (${sub.planId}) but no invoices. Backfilling...`);
      
      const planDetails = PLANS[sub.planId as keyof typeof PLANS];
      
      await db.insert(paymentLogs).values({
        clinicId: sub.clinicId,
        razorpayOrderId: `order_backfill_${sub.id.slice(0, 8)}`,
        razorpayPaymentId: `pay_backfill_${sub.id.slice(0, 8)}`,
        planId: sub.planId,
        planName: planDetails?.name || "Unknown Plan",
        amountPaise: planDetails?.amount || 0,
        status: "paid",
        paidAt: sub.createdAt, // Use subscription creation time as payment time
      });
      backfilledCount++;
    }
  }

  console.log(`Backfill complete. Inserted ${backfilledCount} invoices.`);
}

backfill().catch(console.error).then(() => process.exit(0));
