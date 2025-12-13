import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export const sharedConfig: Config = {
	darkMode: "class",
	content: ["../../packages/ui/src/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {},
	},
	plugins: [animate],
};
export default sharedConfig;
