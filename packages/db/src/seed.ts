import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"; // 👈 确保这里指向你存放 schema.ts 的路径
import "dotenv/config";

// 检查环境变量
if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
	console.log("🌱 Starting seed...");

	// ---------------------------------------------------------
	// 1. 清理数据 (注意删除顺序，先删子表再删父表，或者利用级联)
	// ---------------------------------------------------------
	console.log("🧹 Cleaning up old data...");
	await db.delete(schema.blocks);
	await db.delete(schema.documents);
	await db.delete(schema.workspaceMembers);
	await db.delete(schema.workspaces);
	await db.delete(schema.users);

	// ---------------------------------------------------------
	// 2. 创建用户 (User)
	// ---------------------------------------------------------
	console.log("👤 Creating user...");
	const [user] = await db
		.insert(schema.users)
		.values({
			id: "user_test_001", // 模拟 Clerk ID
			email: "test@stepnote.com",
			name: "Test User",
			avatarUrl: "https://github.com/shadcn.png",
		})
		.returning();
	if (!user) throw new Error("Failed to create user");

	// ---------------------------------------------------------
	// 3. 创建工作区 (Workspace)
	// ---------------------------------------------------------
	console.log("🏢 Creating workspace...");
	const [workspace] = await db
		.insert(schema.workspaces)
		.values({
			name: "My First Workspace",
		})
		.returning();
	if (!workspace) throw new Error("Failed to create workspace");

	// 关联用户和工作区 (Member)
	await db.insert(schema.workspaceMembers).values({
		userId: user.id,
		workspaceId: workspace.id,
		role: "owner",
	});

	// 更新用户的最后活跃工作区
	await db
		.update(schema.users)
		.set({ lastActiveWorkspaceId: workspace.id })
		.where(eq(schema.users.id, user.id));

	// ---------------------------------------------------------
	// 4. 创建文档 (Document)
	// ---------------------------------------------------------
	console.log("📄 Creating document...");
	const [doc] = await db
		.insert(schema.documents)
		.values({
			workspaceId: workspace.id,
			createdById: user.id,
			title: "Getting Started with StepNote",
			isPublic: false,
		})
		.returning();
	if (!doc) throw new Error("Failed to create document");

	// ---------------------------------------------------------
	// 5. 创建 Block (模拟嵌套结构)
	// ---------------------------------------------------------
	console.log("🧱 Creating blocks...");

	// Block 1: 一个简单的文本段落
	await db.insert(schema.blocks).values({
		documentId: doc.id,
		type: "paragraph",
		content: { text: "Hello, this is the first block." },
		rank: "0|0001", // Lexorank 模拟值
		createdBy: user.id,
	});

	// Block 2: 一个父级 Block (比如 Toggle List)
	const [parentBlock] = await db
		.insert(schema.blocks)
		.values({
			documentId: doc.id,
			type: "toggle",
			content: { text: "Click to verify cascade delete" },
			rank: "0|0002",
			createdBy: user.id,
		})
		.returning();
	if (!parentBlock) throw new Error("Failed to create parent block");

	// Block 3: 子 Block (嵌套在 Block 2 里面)
	const [childBlock] = await db
		.insert(schema.blocks)
		.values({
			documentId: doc.id,
			parentBlockId: parentBlock.id, // 👈 关键：指向父 Block
			type: "bullet",
			content: { text: "I am a child block!" },
			rank: "0|0002:0001", // Lexorank 模拟层级
			createdBy: user.id,
		})
		.returning();
	if (!childBlock) throw new Error("Failed to create child block");

	console.log("✅ Seed data created successfully!");

	// ---------------------------------------------------------
	// 6. 🔥 关键测试：验证级联删除 (Cascade Delete)
	// ---------------------------------------------------------
	console.log("\n🧪 Verification: Testing Block Cascade Delete...");

	// 删除父 Block
	await db.delete(schema.blocks).where(eq(schema.blocks.id, parentBlock.id));
	console.log(`❌ Deleted parent block: ${parentBlock.id}`);

	// 查询子 Block 是否还在
	const childCheck = await db.query.blocks.findFirst({
		where: eq(schema.blocks.id, childBlock.id),
	});

	if (!childCheck) {
		console.log(
			"✨ SUCCESS: Child block was automatically deleted by database!",
		);
		console.log("   (Database schema constraints are working correctly)");
	} else {
		console.error(
			"⛔ FAILURE: Child block still exists! Check your 'onDelete: cascade' definition.",
		);
	}

	// ---------------------------------------------------------
	// 7. 🔥 关键测试：验证文档删除
	// ---------------------------------------------------------
	console.log("\n🧪 Verification: Testing Document Cascade Delete...");
	await db.delete(schema.documents).where(eq(schema.documents.id, doc.id));

	const remainingBlocks = await db.query.blocks.findMany({
		where: eq(schema.blocks.documentId, doc.id),
	});

	if (remainingBlocks.length === 0) {
		console.log("✨ SUCCESS: All blocks deleted after document deletion.");
	} else {
		console.error(`⛔ FAILURE: ${remainingBlocks.length} blocks remain.`);
	}

	process.exit(0);
}

main().catch((err) => {
	console.error("❌ Seed failed");
	console.error(err);
	process.exit(1);
});
