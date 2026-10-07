type AlpacaAccount = {
  id?: string;
  account_number?: string;
  status?: string;
  currency?: string;
  cash?: string;
  buying_power?: string;
  portfolio_value?: string;
  pattern_day_trader?: boolean;
  trading_blocked?: boolean;
};

type AlpacaPosition = {
  asset_id?: string;
  symbol?: string;
  qty?: string;
  avg_entry_price?: string;
  current_price?: string;
  market_value?: string;
  unrealized_pl?: string;
  unrealized_plpc?: string;
  currency?: string;
};

const PAPER_BASE_URL = "https://paper-api.alpaca.markets";
const LIVE_BASE_URL = "https://api.alpaca.markets";

function credentials() {
  return { key: process.env.ALPACA_API_KEY ?? "", secret: process.env.ALPACA_SECRET_KEY ?? "" };
}

function baseUrl() {
  return process.env.ALPACA_PAPER !== "false" ? PAPER_BASE_URL : LIVE_BASE_URL;
}

async function alpacaGet<T>(path: string): Promise<T> {
  const { key, secret } = credentials();
  if (!key || !secret) throw new Error("ALPACA_API_KEY and ALPACA_SECRET_KEY are not configured");
  const response = await fetch(`${baseUrl()}${path}`, {
    headers: { accept: "application/json", "APCA-API-KEY-ID": key, "APCA-API-SECRET-KEY": secret },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`Alpaca API ${response.status}`);
  return (await response.json()) as T;
}

export function getAlpacaConfig() {
  const configured = Boolean(credentials().key && credentials().secret);
  return { provider: "Alpaca", mode: "paper" as const, configured, tradingEnabled: false, baseUrl: PAPER_BASE_URL };
}

export async function getAlpacaAccount() {
  return alpacaGet<AlpacaAccount>("/v2/account");
}

export async function getAlpacaPositions() {
  return alpacaGet<AlpacaPosition[]>("/v2/positions");
}
