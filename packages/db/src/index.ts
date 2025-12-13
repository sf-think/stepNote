import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
	connectionString,
	max: 20, // 连接池上限
});

export const db = drizzle(pool, { schema });
export * from "./schema";
