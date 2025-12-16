import { writeFileSync } from "node:fs";
import { generateOpenApi } from "@ts-rest/open-api";
import { contract } from "../packages/shared/src/contract";

// 从 ts-rest 合约生成 OpenAPI 文档
const openApiDocument = generateOpenApi(contract, {
	info: {
		title: "StepNote API",
		version: "1.0.0",
		description: "StepNote 应用的 API 文档",
	},
});

// 写入 JSON 文件
const outputPath = "./openapi.json";
writeFileSync(outputPath, JSON.stringify(openApiDocument, null, 2));

console.log(`✅ OpenAPI 文档已生成: ${outputPath}`);
