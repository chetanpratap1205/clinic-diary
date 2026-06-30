import { db } from "./src/db";
import { followUps } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const f = await db.select().from(followUps).limit(1);
    if (f.length > 0) {
      console.log("Updating follow up:", f[0].id);
      const res = await db.update(followUps).set({
        completedAt: new Date()
      }).where(eq(followUps.id, f[0].id)).returning();
      console.log("Success:", res);
    } else {
      console.log("No follow ups found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
