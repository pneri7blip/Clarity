import { createAlertEvent, listAlertEvents, listAllEnabledAlerts, listAlerts } from "./db";
import { fetchYahooQuote } from "./marketData";

type AlertRow = { id: number; profileKey: string; symbol: string; kind: string; threshold: string | number; enabled: number };

type Quote = { price: number; previous: number; available: boolean; asOf: number; source: string };

export async function fetchLiveQuote(symbol: string): Promise<Quote> {
  const quote = await fetchYahooQuote(symbol);
  return { available: quote.available, price: quote.price, previous: quote.previous, asOf: quote.asOf, source: quote.source };
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
