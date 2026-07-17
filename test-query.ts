import { db } from "./src/db";
import { growthPartners, doctorLeads } from "./src/db/schema";
import { eq, sql } from "drizzle-orm";
import { startOfMonth } from "date-fns";

async function main() {
  const monthStart = startOfMonth(new Date());
  try {
    const leaderboard = await db
      .select({
        id: growthPartners.id,
        name: growthPartners.name,
        conversions: sql<number>`count(case when ${doctorLeads.status} = 'converted' and ${doctorLeads.convertedAt} >= ${monthStart.toISOString()} then 1 end)`,
      })
      .from(growthPartners)
      .leftJoin(doctorLeads, eq(doctorLeads.assignedTo, growthPartners.id))
      .where(eq(growthPartners.isActive, true))
      .groupBy(growthPartners.id)
      .orderBy(sql`conversions desc`)
      .limit(5);

    console.log("Leaderboard query success:", leaderboard);
  } catch (err) {
    console.error("Leaderboard query error:", err);
  }
}

main();
