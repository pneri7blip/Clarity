import { callDataApi } from "./_core/dataApi";
import { createAlertEvent, listAlertEvents, listAllEnabledAlerts, listAlerts } from "./db";

type AlertRow = { id: number; profileKey: string; symbol: string; kind: string; threshold: string | number; enabled: number };

type Quote = { price: number; previous: number; available: boolean; asOf: number; source: string };

export async function fetchLiveQuote(symbol: string): Promise<Quote> {
  try {
    const response = await callDataApi("YahooFinance/get_stock_chart", {
      query: { symbol, region: symbol.includes(".") ? "IT" : "US", lang: "en-US", interval: "1d", range: "5d", includeAdjustedClose: "true", includePrePost: "false" },
    }) as any;
    const meta = response?.chart?.result?.[0]?.meta ?? {};
    const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0);
    const previous = Number(meta.previousClose ?? price);
    return { available: price > 0, price, previous, asOf: Number(meta.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000, source: "Yahoo Finance" };
  } catch (error) {
    console.warn(`[Market] Quote unavailable for ${symbol}`, error);
    return { available: false, price: 0, previous: 0, asOf: Date.now(), source: "Demo fallback" };
  }
}

function isTriggered(alert: AlertRow, price: number) {
  const threshold = Number(alert.threshold);
  if (!Number.isFinite(threshold) || price <= 0) return false;
  if (alert.kind === "price_above") return price >= threshold;
  if (alert.kind === "price_below") return price <= threshold;
  return false;
}

export async function evaluateAlerts(alerts: AlertRow[]) {
  const created: Array<{ symbol: string; message: string }> = [];
  for (const alert of alerts) {
    const quote = await fetchLiveQuote(alert.symbol);
    if (!quote.available || !isTriggered(alert, quote.price)) continue;
    const recent = (await listAlertEvents(alert.profileKey)).some((event) => event.alertId === alert.id && Date.now() - new Date(event.triggeredAt).getTime() < 60 * 60 * 1000);
    if (recent) continue;
    const message = `${alert.symbol}: ${alert.kind === "price_above" ? "ha superato" : "è sceso sotto"} la soglia ${Number(alert.threshold).toLocaleString("it-IT")} (prezzo ${quote.price.toLocaleString("it-IT", { maximumFractionDigits: 2 })}).`;
    await createAlertEvent({ profileKey: alert.profileKey, alertId: alert.id, symbol: alert.symbol, message });
    created.push({ symbol: alert.symbol, message });
  }
  return created;
}

export async function evaluateAlertsForProfile(profileKey: string) {
  return evaluateAlerts(await listAlerts(profileKey) as AlertRow[]);
}

export async function evaluateAllAlerts() {
  return evaluateAlerts(await listAllEnabledAlerts() as AlertRow[]);
}
