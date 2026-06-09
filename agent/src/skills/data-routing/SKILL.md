---
name: data-routing
category: data-source
description: Data source selection decision tree. Load this skill BEFORE any backtest or data-fetching task to choose the best available data source.
---

## Data Source Overview

| Source | Markets | Auth Required | Network | Skill |
|--------|---------|---------------|---------|-------|
| tushare | A-shares, futures, funds, macro | Yes (`TUSHARE_TOKEN`) | China network | tushare |
| mootdx | A-shares | No (TCP direct) | China network | mootdx |
| akshare | A-shares, US, HK, futures, macro, forex | No | Unrestricted | akshare |
| yfinance | US stocks, HK stocks, ETFs | No | Needs Yahoo Finance access | yfinance |
| okx | Crypto (OKX exchange) | No | Needs okx.com access | okx-market |
| ccxt | Crypto (100+ exchanges) | No | Needs exchange access | ccxt |
| futu | HK stocks, A-shares | Yes (FutuOpenD) | Local FutuOpenD | — |

## Decision Tree

### Backtest Scenario (writing config.json)

**A-shares (A股)**: Always use `source: "tushare"` when `TUSHARE_TOKEN` is configured. Tushare is the primary and most reliable data source for Chinese A-shares.

**Other markets**: Use `source: "auto"` — the runner automatically routes by symbol pattern and falls back to alternative sources if the primary one is unavailable.

### Analysis / Research Scenario (writing Python scripts)

1. Identify the market type from the user's request
2. Pick the source by priority:

**A-shares**: tushare (primary, requires TUSHARE_TOKEN) > mootdx (free, TCP direct, no auth) > akshare (free fallback)
**US stocks**: yfinance > akshare
**HK stocks**: yfinance > futu > akshare
**Crypto**: okx (single exchange) > ccxt (multi-exchange)
**Futures**: tushare > akshare
**Macro / economics**: akshare > tushare
**Forex**: akshare > yfinance

3. Load the corresponding skill for API details: `load_skill("akshare")`

### Availability Check

- **tushare**: check if `TUSHARE_TOKEN` environment variable exists
- **yfinance / okx / ccxt / akshare**: free but may have network restrictions
- If the user reports "connection timeout" or "cannot access", switch to the same-market fallback

## Symbol Format Reference

| Market | Format | Examples |
|--------|--------|---------|
| A-shares | `NNNNNN.SZ/SH/BJ` | 000001.SZ, 600000.SH |
| US stocks | `TICKER.US` | AAPL.US, MSFT.US |
| HK stocks | `NNN(N).HK` | 700.HK, 9988.HK |
| Crypto | `SYMBOL-USDT` | BTC-USDT, ETH-USDT |
| Futures | `XXNNNN.EXCHANGE` | CU2406.SHFE |
| Forex | `XXX/YYY` | USD/CNY, EUR/USD |

## Fallback Chain (Runner Layer)

The backtest runner implements automatic fallback at the market level.
When ``source="auto"``, the runner resolves the first available loader:

```
A-share: tushare (token → available ✅) > mootdx (TCP, no auth) > akshare
US equities: yfinance > akshare
HK equities: yfinance > futu > akshare
Crypto: okx > ccxt > yfinance
Futures: tushare > akshare
Macro: akshare > tushare
Forex: akshare > yfinance
```

**Important**: For A-share backtests, prefer writing `source: "tushare"` explicitly
rather than `source: "auto"`. This ensures the backtest always uses Tushare and
fails fast with a clear error if the token is missing, rather than silently
falling back to a lower-quality source.
