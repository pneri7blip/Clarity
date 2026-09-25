import { z } from "zod";
import { callDataApi } from "./_core/dataApi";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  market: router({
    quote: publicProcedure
      .input(z.object({ symbol: z.string().min(1), region: z.string().default("US") }))
      .query(async ({ input }) => {
        try {
          const response = await callDataApi("YahooFinance/get_stock_chart", {
            query: {
              symbol: input.symbol,
              region: input.region,
              lang: "en-US",
              interval: "1d",
              range: "5d",
              includeAdjustedClose: "true",
              includePrePost: "false",
            },
          }) as any;
          const result = response?.chart?.result?.[0];
          const meta = result?.meta ?? {};
          const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0);
          const previous = Number(meta.previousClose ?? price);
          const changePct = previous ? ((price - previous) / previous) * 100 : 0;
          return {
            available: price > 0,
            price,
            previous,
            changePct,
            currency: meta.currency ?? "",
            exchange: meta.exchangeName ?? "",
            asOf: Number(meta.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000,
            source: "Yahoo Finance",
          };
        } catch (error) {
          console.warn("[Market] Quote unavailable, using demo fallback", error);
          return { available: false, price: 0, previous: 0, changePct: 0, currency: "", exchange: "", asOf: Date.now(), source: "Demo fallback" };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
