import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.url(),
	REDIS_URL: z.url(),
	PORT: z.string().default("3000"),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	CLERK_SECRET_KEY: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
	console.error("❌ Invalid environment variables:");
	console.error(_env.error.flatten().fieldErrors);
	process.exit(1);
}

export const env = _env.data;
