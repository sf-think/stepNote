import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

describe("Button", () => {
	it("renders correctly", () => {
		render(<button type="button">Click me</button>);
		expect(screen.getByText("Click me")).toBeInTheDocument();
	});
});
