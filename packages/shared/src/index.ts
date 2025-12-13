import { z } from "zod";

export const APP_NAME = "StepNote";

export const UserSchema = z.object({
	id: z.string(), // Clerk ID
	email: z.email(),
	name: z.string().optional(),
	avatarUrl: z.string().optional(),
	createdAt: z.date(),
});

export const DocumentSchema = z.object({
	id: z.uuid(),
	userId: z.string(),
	parentId: z.uuid().nullable().optional(),
	title: z.string().min(1, "Title cannot be empty"),
	content: z.any(),
	isPublic: z.boolean().default(false),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
export type Document = z.infer<typeof DocumentSchema>;
