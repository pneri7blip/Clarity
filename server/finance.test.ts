import { describe, expect, it } from "vitest";
import { formatEuro, projectFutureValue } from "../shared/finance";

describe("projectFutureValue", () => {
  it("includes the initial capital and recurring contributions", () => {
    const points = projectFutureValue({ initial: 1000, monthlyContribution: 100, annualReturnPct: 0, years: 1 });
    expect(points.at(-1)?.value).toBe(2200);
  });

  it("does not return negative values for negative input controls", () => {
    const points = projectFutureValue({ initial: -100, monthlyContribution: -50, annualReturnPct: 5, years: 2 });
    expect(points.every((point) => point.value >= 0)).toBe(true);
  });
});

describe("formatEuro", () => {
  it("formats an amount for the Italian interface", () => {
    expect(formatEuro(250000)).toContain("250.000");
  });
});
