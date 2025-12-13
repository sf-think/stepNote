import { describe, expect, it } from "vitest";

describe("Math", () => {
	it("should work in node", () => {
		expect(1 + 1).toBe(2);
		expect(typeof window).toBe("undefined");
	});
});
