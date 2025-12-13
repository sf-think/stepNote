import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		name: "@stepnote/web",
		environment: "jsdom",
		setupFiles: ["./vitest-cleanup-after-each.ts"],
		include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
	},
	resolve: {
		alias: {
			"@": resolve(process.cwd(), "./src"),
		},
	},
});
