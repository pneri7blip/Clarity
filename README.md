# Clarity

> An AI-assisted investment intelligence platform for retail investors.

## Live demo

[Open Clarity](https://clarity-production-1de3.up.railway.app/)

The public Railway deployment is an educational MVP: it supports research, planning, authenticated portfolio tracking, CSV import, live quote enrichment, and profile-scoped alerts. It does **not** connect to brokers, place trades, or provide regulated financial advice.

For Railway deployment, use `pnpm run build` as the build command, `pnpm start` as the start command, and `/health` as the healthcheck path. The server listens on Railway's injected `PORT` and binds to `0.0.0.0` in production.

Clarity helps everyday investors understand markets, individual securities, and long-term financial decisions through a calmer, more explainable interface. The product direction combines portfolio visibility, plain-language research, and specialized AI agents without presenting the system as an autonomous trading bot.

### AI-Assisted Development

Clarity is a product prototype exploring how AI agents can support retail investment research and financial decision-making. The project was developed using AI-assisted coding tools, with a focus on product architecture, UX, agent workflows, and financial intelligence interfaces.

## Why this project exists

Retail investors often face a fragmented experience: price charts in one place, financial statements in another, macroeconomic news elsewhere, and little help translating all of it into a coherent decision. Clarity explores how an AI-native product can reduce that cognitive load while preserving user agency.

The current MVP focuses on three connected experiences:

- **Portfolio overview:** a dashboard for performance, allocation, watchlists, and daily market context.
- **Instrument analysis:** a focused research workspace for ETFs, equities, and government bonds with a score, key metrics, plain-language thesis, and risk framing.
- **Private portfolio workspace:** authenticated investor profiles, CSV import, live quote enrichment, portfolio P&L, concentration metrics, and alert history.
- **Portfolio history:** profile-scoped buy/sell transaction log, manual valuation snapshots, and performance chart built from the user's recorded history.
- **Railway-ready market data:** current quotes use a server-side Yahoo Finance adapter with short-lived caching, so the watchlist, portfolio valuation, and price alerts do not depend on Manus gateway variables.
- **IBKR read-only foundation:** protected server procedures expose connection status, accounts, and positions through the official Client Portal API shape. Trading procedures are intentionally absent; an authenticated Client Portal Gateway is required before synchronization can be enabled.
- **Alpaca paper foundation:** protected server procedures can read the paper account and positions through Alpaca's cloud API. Configure `ALPACA_API_KEY` and `ALPACA_SECRET_KEY` only as server-side Railway variables; paper mode remains the default and order submission is not implemented.

The interface is intentionally designed for a retail audience: dense enough to be useful, but structured around explanations rather than financial jargon.

## Product principles

1. **Explain before suggesting.** Every insight should show the reasoning, the relevant risk, and the timestamp of the underlying data.
2. **Support decisions, do not automate trust.** Clarity is an educational and research-oriented assistant in this MVP; it does not place trades.
3. **Make uncertainty visible.** Scores are signals, not guarantees. The product should communicate confidence, missing data, and scenario sensitivity.
4. **Design for progressive disclosure.** The first view answers “what matters now?” while deeper metrics remain available for users who want to investigate.

## Current experience

- Italian-language responsive dashboard for a retail investor.
- Portfolio value, daily result, liquidity, and risk profile cards.
- Performance chart with selectable time ranges.
- Asset-allocation visualization.
- Watchlist for VWCE, Microsoft, Eni, and a BTP example.
- Three conceptual AI agents: Market Scout, Securities Analyst, and Financial Coach.
- Daily briefing drawer with a server-side AI conversation flow and suggested prompts.
- Instrument analysis page with search, score, metrics, thesis, risks, and source metadata.
- Mobile navigation and responsive layouts.
- Authenticated multi-profile portfolio area with CSV import (`symbol,quantity,averagePrice,currency`).
- Live valuation enrichment through a server-side Yahoo Finance adapter, with source/timestamp and transparent fallback states.
- Live watchlist quotes for VWCE, Microsoft, Eni, and a transparent unavailable state for unsupported BTP pricing.
- Dashboard portfolio cards and allocation are empty-state aware: they use imported holdings and saved snapshots instead of hardcoded sample balances.
- Deterministic diversification and concentration insights based on holding weights, plus price-threshold alert rules.
- Alert event history with duplicate suppression and a protected scheduled-monitor endpoint ready for deployment-managed heartbeat checks.
- Vitest coverage for shared formatting logic and existing authentication behavior.

## Technical approach

Clarity is built as a full-stack WebDev project using React, TypeScript, Vite, Tailwind CSS, Express, tRPC, Drizzle, and MySQL/TiDB-ready infrastructure.

```text
React + TypeScript UI
        ↓
tRPC application boundary
        ↓
Express server + authentication
        ↓
Drizzle / MySQL-compatible persistence
        ↓
Server-side market-data adapters + deterministic alert monitor
```

Market data is accessed server-side through Yahoo Finance for current quote enrichment. Each result carries source, timestamp, and availability metadata; when a quote is unavailable, Clarity keeps the cost basis visible instead of inventing a current value. Alert evaluation is deterministic and stores profile-scoped events; the production deployment can attach the protected `/api/scheduled/check-alerts` callback to a managed heartbeat.

## Local development

```bash
pnpm install
pnpm dev
```

Useful checks:

```bash
pnpm check
pnpm test
```

## Roadmap

### Next milestone: connected intelligence

- Add caching and freshness policies around the normalized market-data adapter.
- Add an analysis API that stores source, timestamp, and confidence metadata.
- Replace hardcoded instrument details with fetched data.
- Add a structured AI response for thesis, risks, and missing information.

### Later milestones

- ~~User onboarding and risk profiling.~~
- ~~Personal goals and long-term planning.~~
- ~~Portfolio import and concentration analysis.~~
- ~~Alerts and scheduled event history.~~
- Connect the deployed monitor to a managed recurring heartbeat and add user-facing delivery preferences.
- Italian pension planning and tax-aware simulations.
- Broker integrations only after security, compliance, and operational controls are reviewed.

## Scope and limitations

This repository is a product prototype and portfolio project. It does not provide financial advice, execute trades, or connect to a broker. Portfolio values depend on the availability and currency conventions of the upstream quote provider; the MVP currently uses a manual refresh and profile-scoped event history. A production version would require data licensing, caching and retry policies, security hardening, privacy controls, audit logs, legal review, jurisdiction-specific compliance work, and a deployed recurring monitor.

## Portfolio context

This project demonstrates product thinking across UX, AI interaction design, financial-data architecture, and full-stack implementation. The main design challenge is balancing approachable language with the precision expected by an investor. The core trade-off is intentionally visible: Clarity keeps the first screen simple, while allowing deeper research through progressive disclosure.

## License

This project is presented for portfolio and educational purposes. Licensing terms can be added before public distribution.
