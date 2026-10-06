type YahooChartMeta = {
  regularMarketPrice?: number;
  previousClose?: number;
  regularMarketTime?: number;
  currency?: string;
  exchangeName?: string;
};

type YahooChartResponse = {
  chart?: { result?: Array<{ meta?: YahooChartMeta }> };
};

export type LiveQuote = {
  available: boolean;
  price: number;
  previous: number;
  changePct: number;
  currency: string;
  exchange: string;
  asOf: number;
  source: string;
};

const CACHE_TTL_MS = 30_000;
const quoteCache = new Map<string, { expiresAt: number; quote: LiveQuote }>();

function fallbackQuote(): LiveQuote {
  return {
    available: false,
    price: 0,
    previous: 0,
    changePct: 0,
    currency: "",
    exchange: "",
    asOf: Date.now(),
    source: "Yahoo Finance unavailable",
  };
}

export async function fetchYahooQuote(symbol: string): Promise<LiveQuote> {
  const cached = quoteCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) return cached.quote;

  try {
    const endpoint = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
    endpoint.searchParams.set("interval", "1d");
    endpoint.searchParams.set("range", "5d");
    endpoint.searchParams.set("includePrePost", "false");
    const response = await fetch(endpoint, {
      headers: { accept: "application/json", "user-agent": "Clarity/1.0 market-data" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`Yahoo Finance ${response.status}`);

    const payload = (await response.json()) as YahooChartResponse;
    const meta = payload.chart?.result?.[0]?.meta ?? {};
    const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0);
    const previous = Number(meta.previousClose ?? price);
    if (!Number.isFinite(price) || price <= 0) throw new Error("Yahoo Finance returned no price");

    const quote: LiveQuote = {
      available: true,
      price,
      previous,
      changePct: previous ? ((price - previous) / previous) * 100 : 0,
      currency: meta.currency ?? "",
      exchange: meta.exchangeName ?? "",
      asOf: Number(meta.regularMarketTime ?? Math.floor(Date.now() / 1000)) * 1000,
      source: "Yahoo Finance",
    };
    quoteCache.set(symbol, { expiresAt: Date.now() + CACHE_TTL_MS, quote });
    return quote;
  } catch (error) {
    console.warn(`[Market] Yahoo quote unavailable for ${symbol}`, error);
    const quote = fallbackQuote();
    quoteCache.set(symbol, { expiresAt: Date.now() + 5_000, quote });
    return quote;
  }
}
