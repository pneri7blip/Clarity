import { z } from "zod";
import { callDataApi } from "./_core/dataApi";
import { createAlert, getInvestorProfile, getInvestorProfileByKey, listAlertEvents, listAlerts, listInvestorProfiles, listPositions, replacePositions, toggleAlert, upsertInvestorProfile } from "./db";
import { fetchLiveQuote, evaluateAlertsForProfile } from "./alertMonitor";
import { invokeLLM } from "./_core/llm";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const quoteInput = z.object({ symbol: z.string().min(1), region: z.string().default("US") });
const profileKey = z.string().min(1).max(120);
const requireOwnedProfile = async (openId: string, key: string) => { const profile = await getInvestorProfileByKey(openId, key); if (!profile) throw new Error("Profile not found"); return profile; };

export const appRouter = router({
  system: systemRouter,
  ai: router({
    chat: publicProcedure.input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).max(20) })).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Sei Clarity, un assistente educativo per investitori retail. Rispondi in italiano, in modo chiaro e prudente. Puoi spiegare strumenti, rischi, portafogli e concetti finanziari, ma non dare consulenza personalizzata, non promettere rendimenti e non suggerire ordini. Distingui sempre tra dati, calcoli e scenari. Ricorda che le informazioni possono essere incomplete o non aggiornate." },
          ...input.messages,
        ],
        maxTokens: 700,
      });
      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : content?.map((part) => "text" in part ? part.text : "").join("") ?? "Non riesco a rispondere in questo momento.";
      return { role: "assistant" as const, content: text, user: ctx.user?.name ?? "investitore" };
    }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  profile: router({
    list: protectedProcedure.query(({ ctx }) => listInvestorProfiles(ctx.user.openId)),
    get: protectedProcedure.query(({ ctx }) => getInvestorProfile(ctx.user.openId)),
    save: protectedProcedure.input(z.object({ profileKey: profileKey.optional(), name: z.string().min(1).default("Profilo principale"), goal: z.string().min(1), horizon: z.string().min(1), risk: z.string().min(1) })).mutation(async ({ ctx, input }) => { const key = input.profileKey ?? `${ctx.user.openId}-main`; await upsertInvestorProfile({ profileKey: key, openId: ctx.user.openId, name: input.name, goal: input.goal, horizon: input.horizon, risk: input.risk }); return { success: true, profileKey: key } as const; }),
  }),
  portfolio: router({
    list: protectedProcedure.input(z.object({ profileKey })).query(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); return listPositions(input.profileKey); }),
    import: protectedProcedure.input(z.object({ profileKey, positions: z.array(z.object({ symbol: z.string().min(1), quantity: z.string().min(1), averagePrice: z.string().min(1), currency: z.string().min(1).max(8) })).max(200) })).mutation(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); await replacePositions(input.profileKey, input.positions); return { success: true, count: input.positions.length } as const; }),
    insights: protectedProcedure.input(z.object({ profileKey })).query(async ({ ctx, input }) => {
      await requireOwnedProfile(ctx.user.openId, input.profileKey);
      const positions = await listPositions(input.profileKey);
      const holdings = [];
      for (const position of positions) {
        const quote = await fetchLiveQuote(position.symbol);
        const quantity = Number(position.quantity);
        const averagePrice = Number(position.averagePrice);
        const cost = quantity * averagePrice;
        const currentValue = quote.available ? quantity * quote.price : cost;
        holdings.push({ id: position.id, symbol: position.symbol, quantity, averagePrice, currency: position.currency, cost, currentPrice: quote.available ? quote.price : null, currentValue, pnl: currentValue - cost, changePct: quote.available && quote.previous ? ((quote.price - quote.previous) / quote.previous) * 100 : null, available: quote.available, source: quote.source, asOf: quote.asOf });
      }
      const invested = holdings.reduce((sum, item) => sum + item.cost, 0);
      const currentValue = holdings.reduce((sum, item) => sum + item.currentValue, 0);
      const weights = holdings.map((item) => invested ? item.cost / invested : 0);
      const herfindahl = weights.reduce((sum, weight) => sum + weight * weight, 0);
      const topWeight = Math.max(0, ...weights);
      const diversificationScore = holdings.length === 0 ? 0 : Math.max(0, Math.min(100, Math.round((1 - herfindahl) * 100)));
      const riskLabel = topWeight >= 0.7 ? "Concentrazione alta" : topWeight >= 0.45 ? "Concentrazione da monitorare" : holdings.length < 3 ? "Portafoglio essenziale" : "Diversificazione equilibrata";
      return { holdings, invested, currentValue, pnl: currentValue - invested, liveCount: holdings.filter((item) => item.available).length, totalCount: holdings.length, topWeight, diversificationScore, riskLabel, asOf: Date.now() };
    }),
  }),
  alerts: router({
    list: protectedProcedure.input(z.object({ profileKey })).query(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); return listAlerts(input.profileKey); }),
    events: protectedProcedure.input(z.object({ profileKey })).query(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); return listAlertEvents(input.profileKey); }),
    create: protectedProcedure.input(z.object({ profileKey, symbol: z.string().min(1), kind: z.enum(["price_above", "price_below", "goal_risk"]), threshold: z.string().min(1) })).mutation(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); await createAlert(input); return { success: true } as const; }),
    toggle: protectedProcedure.input(z.object({ profileKey, id: z.number(), enabled: z.boolean() })).mutation(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); await toggleAlert(input.profileKey, input.id, input.enabled); return { success: true } as const; }),
    check: protectedProcedure.input(z.object({ profileKey })).mutation(async ({ ctx, input }) => { await requireOwnedProfile(ctx.user.openId, input.profileKey); return evaluateAlertsForProfile(input.profileKey); }),
  }),
  market: router({
    quote: publicProcedure.input(quoteInput).query(async ({ input }) => { try { const response = await callDataApi("YahooFinance/get_stock_chart", { query: { symbol: input.symbol, region: input.region, lang: "en-US", interval: "1d", range: "5d", includeAdjustedClose: "true", includePrePost: "false" } }) as any; const meta = response?.chart?.result?.[0]?.meta ?? {}; const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0); const previous = Number(meta.previousClose ?? price); return { available: price > 0, price, previous, changePct: previous ? ((price - previous) / previous) * 100 : 0, currency: meta.currency ?? "", exchange: meta.exchangeName ?? "", asOf: Number(meta.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000, source: "Yahoo Finance" }; } catch (error) { console.warn("[Market] Quote unavailable, using demo fallback", error); return { available: false, price: 0, previous: 0, changePct: 0, currency: "", exchange: "", asOf: Date.now(), source: "Demo fallback" }; } }),
    fundamentals: publicProcedure.input(quoteInput).query(async ({ input }) => { try { if (input.symbol === "MSFT") { const ratios = await callDataApi("Massive/get_financial_ratios", { query: { tickers: "MSFT", limit: "1", sort: "period_end.desc" } }) as any; const row = ratios?.results?.[0] ?? ratios?.data?.[0] ?? {}; return { available: true, source: "Massive", asOf: row.period_end ?? new Date().toISOString(), fields: { pe: row.price_to_earnings ?? row.pe_ratio ?? null, pb: row.price_to_book ?? row.pb_ratio ?? null, roe: row.return_on_equity ?? null, roa: row.return_on_assets ?? null, evEbitda: row.enterprise_value_to_ebitda ?? null } }; } if (input.symbol === "ENI.MI") { const profile = await callDataApi("YahooFinance/get_stock_profile", { query: { symbol: "ENI.MI", region: "IT", lang: "it-IT" } }) as any; const data = profile?.quoteSummary?.result?.[0]?.summaryProfile ?? {}; return { available: true, source: "Yahoo Finance", asOf: new Date().toISOString(), fields: { sector: data.sector ?? null, industry: data.industry ?? null, employees: data.fullTimeEmployees ?? null, description: data.longBusinessSummary ?? null } }; } return { available: false, source: "Demo fallback", asOf: new Date().toISOString(), fields: {} }; } catch (error) { console.warn("[Market] Fundamentals unavailable, using demo fallback", error); return { available: false, source: "Demo fallback", asOf: new Date().toISOString(), fields: {} }; } }),
  }),
});

export type AppRouter = typeof appRouter;
