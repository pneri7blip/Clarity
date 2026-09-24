# Atlas Invest

> An AI-assisted investment intelligence platform for retail investors.

Atlas helps everyday investors understand markets, individual securities, and long-term financial decisions through a calmer, more explainable interface. The product direction combines portfolio visibility, plain-language research, and specialized AI agents without presenting the system as an autonomous trading bot.

## Why this project exists

Retail investors often face a fragmented experience: price charts in one place, financial statements in another, macroeconomic news elsewhere, and little help translating all of it into a coherent decision. Atlas explores how an AI-native product can reduce that cognitive load while preserving user agency.

The current MVP focuses on two connected experiences:

- **Portfolio overview:** a dashboard for performance, allocation, watchlists, and daily market context.
- **Instrument analysis:** a focused research workspace for ETFs, equities, and government bonds with a score, key metrics, plain-language thesis, and risk framing.

The interface is intentionally designed for a retail audience: dense enough to be useful, but structured around explanations rather than financial jargon.

## Product principles

1. **Explain before suggesting.** Every insight should show the reasoning, the relevant risk, and the timestamp of the underlying data.
2. **Support decisions, do not automate trust.** Atlas is an educational and research-oriented assistant in this MVP; it does not place trades.
3. **Make uncertainty visible.** Scores are signals, not guarantees. The product should communicate confidence, missing data, and scenario sensitivity.
4. **Design for progressive disclosure.** The first view answers “what matters now?” while deeper metrics remain available for users who want to investigate.

## Current experience

- Italian-language responsive dashboard for a retail investor.
- Portfolio value, daily result, liquidity, and risk profile cards.
- Performance chart with selectable time ranges.
- Asset-allocation visualization.
- Watchlist for VWCE, Microsoft, Eni, and a BTP example.
- Three conceptual AI agents: Market Scout, Securities Analyst, and Financial Coach.
- Daily AI briefing drawer.
- Instrument analysis page with search, score, metrics, thesis, risks, and source metadata.
- Mobile navigation and responsive layouts.
- Vitest coverage for shared formatting logic and existing authentication behavior.

## Technical approach

Atlas is built as a full-stack WebDev project using React, TypeScript, Vite, Tailwind CSS, Express, tRPC, Drizzle, and MySQL/TiDB-ready infrastructure.

```text
React + TypeScript UI
        ↓
tRPC application boundary
        ↓
Express server + authentication
        ↓
Drizzle / MySQL-compatible persistence
        ↓
Future market-data adapters and AI job workers
```

The current financial content is deliberately demo data. The next implementation step is to introduce a provider-agnostic market-data layer with timestamps, caching, source metadata, and normalized schemas before exposing live data to AI agents.

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

### Next milestone: research assistant

- Add a real market-data provider behind a normalized adapter.
- Add an analysis API that stores source, timestamp, and confidence metadata.
- Replace hardcoded instrument details with fetched data.
- Add a structured AI response for thesis, risks, and missing information.

### Later milestones

- User onboarding and risk profiling.
- Personal goals and long-term planning.
- Portfolio import and concentration analysis.
- Alerts and scheduled briefings.
- Italian pension planning and tax-aware simulations.
- Broker integrations only after security, compliance, and operational controls are reviewed.

## Scope and limitations

This repository is a product prototype and portfolio project. It uses demo financial data and does not provide financial advice, execute trades, or connect to a broker. A production version would require data licensing, security hardening, privacy controls, audit logs, legal review, and jurisdiction-specific compliance work.

## Portfolio context

This project demonstrates product thinking across UX, AI interaction design, financial-data architecture, and full-stack implementation. The main design challenge is balancing approachable language with the precision expected by an investor. The core trade-off is intentionally visible: Atlas keeps the first screen simple, while allowing deeper research through progressive disclosure.

## License

This project is presented for portfolio and educational purposes. Licensing terms can be added before public distribution.
