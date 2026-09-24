import { describe, expect, it } from "vitest";
import { formatPercent } from "../shared/format";

describe("formatPercent", () => {
  it("formats positive values with a plus sign and Italian decimals", () => {
    expect(formatPercent(8.6)).toBe("+8,6%");
  });

  it("formats negative values without duplicating the sign", () => {
    expect(formatPercent(-2.4)).toBe("-2,4%");
  });

  it("keeps zero explicit and readable", () => {
    expect(formatPercent(0)).toBe("+0,0%");
  });
});
