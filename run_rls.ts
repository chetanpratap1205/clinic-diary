import "dotenv/config";
import { readFileSync } from "fs";
import { pool } from "./src/db/index.js";

async function runRLS() {
  try {
    const sql = readFileSync("supabase_rls.sql", "utf-8");
    console.log("Executing RLS policies...");
    await pool.query(sql);
    console.log("RLS policies applied successfully!");
  } catch (error) {
    console.error("Error applying RLS:", error);
  } finally {
    await pool.end();
  }
}

runRLS();
