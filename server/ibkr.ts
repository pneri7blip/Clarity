import { ENV } from "./_core/env";

const IBKR_DOCS_URL = "https://ibkrcampus.com/campus/ibkr-api-page/webapi-doc/";
const GATEWAY_DOCS_URL = "https://ibkrcampus.com/campus/trading-lessons/launching-and-authenticating-the-gateway/";

type IbkrAccount = { id?: string; accountId?: string; displayName?: string; currency?: string; type?: string };

type IbkrPosition = {
  acctId?: string;
  conid?: number;
  ticker?: string;
  position?: number;
  avgPrice?: number;
  mktPrice?: number;
  mktValue?: number;
  currency?: string;
};

function baseUrl() {
  return (process.env.IBKR_API_BASE_URL ?? "").replace(/\/$/, "");
}

function headers() {
  const token = process.env.IBKR_API_TOKEN;
  const value: Record<string, string> = { accept: "application/json" };
  if (token) value.authorization = `Bearer ${token}`;
  return value;
}

async function ibkrGet<T>(path: string): Promise<T> {
  const base = baseUrl();
  if (!base) throw new Error("IBKR_API_BASE_URL is not configured");
  const response = await fetch(`${base}${path}`, { headers: headers(), signal: AbortSignal.timeout(12_000) });
  if (!response.ok) throw new Error(`IBKR API ${response.status}`);
  return (await response.json()) as T;
}

export function getIbkrStatus() {
  const configured = Boolean(baseUrl());
  return {
    provider: "Interactive Brokers",
    mode: "read_only" as const,
    configured,
    connected: false,
    tradingEnabled: false,
    accounts: [] as string[],
    docsUrl: IBKR_DOCS_URL,
    gatewayDocsUrl: GATEWAY_DOCS_URL,
    message: configured
      ? "Configurazione presente; la sessione IBKR deve essere autenticata nel Client Portal Gateway."
      : "Per collegare IBKR serve un Client Portal Gateway autenticato e raggiungibile dal server.",
  };
}

export async function listIbkrAccounts(): Promise<IbkrAccount[]> {
  return ibkrGet<IbkrAccount[]>("/portfolio/accounts");
}

export async function listIbkrPositions(accountId: string): Promise<IbkrPosition[]> {
  return ibkrGet<IbkrPosition[]>(`/portfolio/${encodeURIComponent(accountId)}/positions/0`);
}
