import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	boolean,
	index,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "member"]);

export const users = pgTable("users", {
	id: text("id").primaryKey(), // Clerk ID
	email: text("email").notNull().unique(),
	name: text("name"),
	avatarUrl: text("avatar_url"),
	lastActiveWorkspaceId: uuid("last_active_workspace_id").references(
		() => workspaces.id,
	),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaces = pgTable("workspaces", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workspaceMembers = pgTable(
	"workspace_members",
	{
		workspaceId: uuid("workspace_id").references(() => workspaces.id, {
			onDelete: "cascade",
		}),
		userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
		role: roleEnum("role").default("member"),

		joinedAt: timestamp("joined_at").defaultNow().notNull(),
	},
	(t) => [{ pk: primaryKey({ columns: [t.workspaceId, t.userId] }) }],
);

export const documents = pgTable(
	"documents",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspaces.id, { onDelete: "cascade" }),
		createdById: text("created_by_id").references(() => users.id, {
			onDelete: "set null",
		}),

		parentId: uuid("parent_id"), // 父文档ID

		title: text("title").notNull().default("Untitled"),
		icon: text("icon"),
		coverImage: text("cover_image"),

		isPublic: boolean("is_public").default(false).notNull(),
		isArchived: boolean("is_archived").default(false).notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [
		index("workspace_id_idx").on(t.workspaceId),
		index("parent_id_idx").on(t.parentId),
		index("created_by_id_idx").on(t.createdById),
	],
);

export const blocks = pgTable(
	"blocks",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		documentId: uuid("document_id")
			.notNull()
			.references(() => documents.id, { onDelete: "cascade" }),

		parentBlockId: uuid("parent_block_id").references(
			(): AnyPgColumn => blocks.id,
			{
				onDelete: "cascade",
			},
		),

		type: varchar("type", { length: 50 }).notNull(),

		properties: jsonb("properties").default({}),
		content: jsonb("content"),

		rank: text("rank").notNull(),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
		createdBy: text("created_by").references(() => users.id),
	},
	(t) => [
		index("blocks_doc_id_idx").on(t.documentId),
		index("blocks_parent_id_idx").on(t.parentBlockId),
		index("blocks_rank_idx").on(t.rank),
	],
);

export const usersRelations = relations(users, ({ many }) => ({
	memberships: many(workspaceMembers),
	documentsCreated: many(documents),
}));

export const workspacesRelations = relations(workspaces, ({ many }) => ({
	members: many(workspaceMembers),
	documents: many(documents),
}));

export const workspaceMembersRelations = relations(
	workspaceMembers,
	({ one }) => ({
		user: one(users, {
			fields: [workspaceMembers.userId],
			references: [users.id],
		}),
		workspace: one(workspaces, {
			fields: [workspaceMembers.workspaceId],
			references: [workspaces.id],
		}),
	}),
);

export const documentsRelations = relations(documents, ({ one, many }) => ({
	workspace: one(workspaces, {
		fields: [documents.workspaceId],
		references: [workspaces.id],
	}),
	author: one(users, {
		fields: [documents.createdById],
		references: [users.id],
	}),
	parent: one(documents, {
		fields: [documents.parentId],
		references: [documents.id],
		relationName: "doc_parent_child",
	}),
	children: many(documents, { relationName: "doc_parent_child" }),
	blocks: many(blocks),
}));

export const blocksRelations = relations(blocks, ({ one, many }) => ({
	document: one(documents, {
		fields: [blocks.documentId],
		references: [documents.id],
	}),
	parentBlock: one(blocks, {
		fields: [blocks.parentBlockId],
		references: [blocks.id],
		relationName: "block_parent_child",
	}),
	childrenBlocks: many(blocks, { relationName: "block_parent_child" }),
}));
