import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"scope-enum": [
			2,
			"always",
			["web", "api", "ui", "db", "shared", "config", "root"],
		],
	},
};

export default Configuration;
