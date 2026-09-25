import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("market.quote", () => {
  it("returns a stable quote contract even when the live provider is unavailable", async () => {
    const ctx = {
      user: undefined,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const result = await appRouter.createCaller(ctx).market.quote({ symbol: "VWCE.DE", region: "DE" });

    expect(result).toMatchObject({
      available: expect.any(Boolean),
      price: expect.any(Number),
      previous: expect.any(Number),
      changePct: expect.any(Number),
      source: expect.any(String),
    });
    expect(typeof result.asOf).toBe("number");
  });
});
