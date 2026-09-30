import { z } from "zod";
import { callDataApi } from "./_core/dataApi";
import { getInvestorProfile, upsertInvestorProfile } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const quoteInput = z.object({ symbol: z.string().min(1), region: z.string().default("US") });

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
  profile: router({
    get: protectedProcedure.query(({ ctx }) => getInvestorProfile(ctx.user.openId)),
    save: protectedProcedure.input(z.object({ goal: z.string().min(1), horizon: z.string().min(1), risk: z.string().min(1) })).mutation(async ({ ctx, input }) => {
      await upsertInvestorProfile({ openId: ctx.user.openId, ...input });
      return { success: true } as const;
    }),
  }),
  market: router({
    quote: publicProcedure.input(quoteInput).query(async ({ input }) => {
      try {
        const response = await callDataApi("YahooFinance/get_stock_chart", { query: { symbol: input.symbol, region: input.region, lang: "en-US", interval: "1d", range: "5d", includeAdjustedClose: "true", includePrePost: "false" } }) as any;
        const meta = response?.chart?.result?.[0]?.meta ?? {};
        const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0);
        const previous = Number(meta.previousClose ?? price);
        return { available: price > 0, price, previous, changePct: previous ? ((price - previous) / previous) * 100 : 0, currency: meta.currency ?? "", exchange: meta.exchangeName ?? "", asOf: Number(meta.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000, source: "Yahoo Finance" };
      } catch (error) {
        console.warn("[Market] Quote unavailable, using demo fallback", error);
        return { available: false, price: 0, previous: 0, changePct: 0, currency: "", exchange: "", asOf: Date.now(), source: "Demo fallback" };
      }
    }),
    fundamentals: publicProcedure.input(quoteInput).query(async ({ input }) => {
      try {
        if (input.symbol === "MSFT") {
          const ratios = await callDataApi("Massive/get_financial_ratios", { query: { tickers: "MSFT", limit: "1", sort: "period_end.desc" } }) as any;
          const row = ratios?.results?.[0] ?? ratios?.data?.[0] ?? {};
          return { available: true, source: "Massive", asOf: row.period_end ?? new Date().toISOString(), fields: { pe: row.price_to_earnings ?? row.pe_ratio ?? null, pb: row.price_to_book ?? row.pb_ratio ?? null, roe: row.return_on_equity ?? null, roa: row.return_on_assets ?? null, evEbitda: row.enterprise_value_to_ebitda ?? null } };
        }
        if (input.symbol === "ENI.MI") {
          const profile = await callDataApi("YahooFinance/get_stock_profile", { query: { symbol: "ENI.MI", region: "IT", lang: "it-IT" } }) as any;
          const data = profile?.quoteSummary?.result?.[0]?.summaryProfile ?? {};
          return { available: true, source: "Yahoo Finance", asOf: new Date().toISOString(), fields: { sector: data.sector ?? null, industry: data.industry ?? null, employees: data.fullTimeEmployees ?? null, description: data.longBusinessSummary ?? null } };
        }
        return { available: false, source: "Demo fallback", asOf: new Date().toISOString(), fields: {} };
      } catch (error) {
        console.warn("[Market] Fundamentals unavailable, using demo fallback", error);
        return { available: false, source: "Demo fallback", asOf: new Date().toISOString(), fields: {} };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
