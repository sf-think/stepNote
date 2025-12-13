import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// Users 表
export const users = pgTable("users", {
	id: text("id").primaryKey(), // Clerk ID
	email: text("email").notNull().unique(),
	name: text("name"),
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Documents 表
export const documents = pgTable(
	"documents",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		parentId: uuid("parent_id"), // 父文档ID（树形结构）
		title: text("title").notNull().default("Untitled"),
		content: jsonb("content")
			.$type<any>()
			.default({ type: "doc", content: [] }),
		isPublic: boolean("is_public").default(false).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => ({
		userIdIdx: index("user_id_idx").on(t.userId),
		parentIdIdx: index("parent_id_idx").on(t.parentId),
	}),
);

// 关系定义
export const usersRelations = relations(users, ({ many }) => ({
	documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
	// 多对一：文档 → 用户
	author: one(users, { fields: [documents.userId], references: [users.id] }),
	// 自引用：父文档
	parent: one(documents, {
		fields: [documents.parentId],
		references: [documents.id],
		relationName: "parent_child",
	}),
	// 自引用：子文档列表
	children: many(documents, { relationName: "parent_child" }),
}));
