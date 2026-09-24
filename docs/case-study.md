# Clarity — Product Case Study

## Summary

Clarity is a concept for an AI-assisted investment intelligence platform aimed at retail investors. It is designed to help users understand markets, individual securities, and long-term financial choices without requiring professional-level financial literacy.

The MVP deliberately avoids automated trading. It focuses on research, explanation, and portfolio awareness: three areas where an AI interface can reduce complexity while keeping the user in control.

## Problem

Retail investors rarely lack access to information. They lack a coherent way to interpret it. Market prices, fundamentals, macroeconomic news, and personal goals are commonly presented as separate experiences. This increases decision fatigue and can make users overreact to short-term noise.

Clarity addresses this problem by giving each piece of analysis a clear context: what changed, why it matters, which risks are relevant, and how the information relates to the user’s stated horizon.

## Target user

The primary user is an Italian retail investor who is comfortable using digital products but does not want to read financial filings or interpret every market indicator alone. The user may hold ETFs, individual shares, government bonds, or cash and wants to become more deliberate without turning investing into a full-time job.

## Product response

The dashboard gives users a fast answer to “what deserves my attention today?” The analysis workspace then provides a deeper answer to “what am I looking at, and what should I understand before acting?”

The experience uses three conceptual agents:

- **Market Scout** summarizes macroeconomic and global market context.
- **Securities Analyst** structures fundamentals, valuation, thesis, and risks.
- **Financial Coach** connects research to goals, time horizon, and contribution plans.

This separation is intentional. It gives the user multiple perspectives instead of a single opaque assistant response.

## Design decisions

The visual language uses a dark green navigation rail and a warm, low-contrast workspace. The palette is meant to feel trustworthy without copying a traditional bank interface. Large values are paired with short explanations, while secondary metrics remain visually quieter.

The analysis page uses progressive disclosure. A user first sees the instrument identity, current signal, and key metrics. The plain-language thesis and risk list follow immediately. Deeper fundamentals and source details are available without competing with the initial explanation.

## Technical decisions

The project uses a React and TypeScript frontend backed by a full-stack template with Express, tRPC, Drizzle, and MySQL/TiDB-ready persistence. The UI is component-driven, responsive, and organized around feature pages rather than one monolithic dashboard.

The next architectural step is a provider-agnostic market-data adapter. It should normalize prices, fundamentals, timestamps, currencies, and source identifiers before the data reaches the AI layer. This prevents vendor-specific assumptions from leaking into the product and makes caching and provider changes easier.

## What I would measure

The first usability questions are whether users can find a security quickly, explain the main risk in their own words, and distinguish information from a recommendation. Product metrics would include search-to-analysis completion, time to first useful insight, source-panel usage, and the percentage of users who return to a saved watchlist.

## Limitations and next steps

The current experience uses demo data. It is not connected to a broker, does not place trades, and is not financial advice. A production path would need licensed data, privacy and security controls, auditability, accessibility testing, and legal review for each target market.

The next milestone is a research assistant backed by live data, structured AI outputs, confidence metadata, and citations for every decision-relevant claim.
