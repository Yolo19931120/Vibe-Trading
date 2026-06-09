# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vibe-Trading is an open-source natural-language finance research AI agent. Backend is Python (FastAPI + ReAct agent loop), frontend is React 19 + Vite + TypeScript. The PyPI package is `vibe-trading-ai` (v0.1.9). MIT license.

## Common Commands

### Python Backend

```bash
# Install in editable mode (from repo root)
pip install -e ".[dev]"

# Run the interactive CLI
vibe-trading

# Non-interactive single run
vibe-trading run -p "Backtest BTC-USDT MACD strategy"

# Start API server
vibe-trading serve --port 8899

# Start MCP server (stdio)
vibe-trading-mcp

# Compile-check critical modules
python -m compileall -q agent/cli
python -m py_compile agent/api_server.py agent/mcp_server.py
```

### Testing

```bash
# Full test suite (skip e2e — those need a real LLM key)
pytest --ignore=agent/tests/e2e_backtest --ignore=agent/tests/test_e2e_harness_v2.py --tb=short -q

# Factor zoo safety gates
pytest agent/tests/factors/test_alpha_purity.py agent/tests/factors/test_lookahead.py -q

# Order safety / mandate enforcement
pytest agent/tests/test_sdk_order_gate.py agent/tests/test_mandate_enforcement.py -q

# Run a single test file or test
pytest agent/tests/path/to/test_file.py
pytest agent/tests/path/to/test_file.py -k "test_name"
```

Tests live under `agent/tests/`. `pyproject.toml` sets `testpaths = ["agent/tests"]` and `pythonpath = ["agent"]`. CI skips e2e; real-LLM e2e is gated behind `VIBE_TRADING_RUN_LIVE_E2E=1`.

### Linting & Formatting

```bash
python -m ruff check agent/
python -m black agent/
```

Config: `line-length = 120`, target `py311`, `select = ["E", "F", "W"]`, per-file ignore `F401` on factor zoo files.

### Frontend

```bash
cd frontend
npm ci
npm run dev            # Vite dev server on port 5899
npm run build          # TypeScript check + Vite production build
npm run test:run       # vitest unit tests
npm run test:coverage  # vitest with coverage
```

### Docker

```bash
docker compose up --build
```

Opens `http://localhost:8899`. Backend + prebuilt frontend in one container.

## Architecture

### Three Entry Points

1. **`agent/cli/`** — Interactive TUI: `vibe-trading` (imported as `cli:main`). Uses Rich + prompt_toolkit. Subcommands: `run`, `serve`, `alpha list/show/bench/compare`. Slash commands inside TUI (`/swarm`, `/show`, `/pine`, etc.).

2. **`agent/api_server.py`** — FastAPI REST server: `vibe-trading serve`. SSE streaming for real-time agent events. Serves prebuilt frontend `dist/` in production. Routes: `/runs`, `/sessions`, `/swarm/runs`, `/alpha/*`, `/settings/*`, `/upload`, `/correlation`.

3. **`agent/mcp_server.py`** — 36 MCP tools exposed via stdio/SSE for Claude Desktop, OpenClaw, Cursor, etc. Built on `fastmcp`.

### ReAct Agent Loop (`agent/src/agent/loop.py`)

The core agent uses a 5-layer context management system:
- **Layer 1 (microcompact)**: silently prunes old tool results, keeping most recent N
- **Layer 2 (context_collapse)**: folds long text blocks without LLM call (zero cost)
- **Layer 3 (auto_compact)**: LLM structured summary with token-budget tail protection
- **Layer 4 (compact tool)**: model explicitly calls the compact tool
- **Layer 5 (iterative update)**: Nth compression updates previous summary

Read/write batching: consecutive readonly tools run in parallel via threads. At 80% of iteration budget, the agent receives a wrap-up nudge; final iteration drops tool definitions to force a text answer.

### Tools (`agent/src/tools/`)

~32 auto-discovered tools built on `BaseTool` (defined in `agent/src/agent/tools.py`). Each tool has `name`, `description`, `parameters` (JSON Schema), and `execute(**kwargs) -> str`. Tools declare `is_readonly` for parallel execution safety. The `ToolRegistry` auto-discovers tools by scanning `src/tools/` for `BaseTool` subclasses.

Key tools: `backtest_tool`, `swarm_tool`, `remember_tool`, `skill_writer_tool`, `session_search_tool`, `web_search_tool`, `trading_connector_tool`, `goal_tool`, `alpha_zoo_tool`, `alpha_bench_tool`, `read_file_tool`, `write_file_tool`, `bash_tool`, `read_document_tool`.

### Provider Abstraction (`agent/src/providers/`)

12 LLM providers supported. `ChatLLM` (in `chat.py`) wraps LangChain `ChatOpenAI` with function-calling support. Provider metadata in `llm_providers.json`. Config via `agent/.env`: `LANGCHAIN_PROVIDER`, `<PROVIDER>_API_KEY`, `<PROVIDER>_BASE_URL`, `LANGCHAIN_MODEL_NAME`. Gemini thinking models require special `thought_signature` round-tripping handled in `_convert_input`.

### Backtest System (`agent/backtest/`)

Seven engines under `engines/`: `china_a`, `crypto`, `global_equity`, `forex`, `china_futures`, `global_futures`, `composite` (cross-market with shared capital pool), plus `options_portfolio`.

Engine selection: `daily` (auto-routed by symbol) or `options`. Symbol classification in `engines/_market_hooks.py` (shared single source of truth between runner and composite).

Seven data loaders under `loaders/`: `tushare`, `okx`, `yfinance`, `akshare`, `mootdx` (通达信 TCP protocol, no auth), `ccxt`, `futu`. Each loader satisfies the `DataLoaderProtocol` (duck-typed: `name`, `markets`, `is_available()`, `fetch()`). `registry.py` provides auto-fallback chains per market. Opt-in local cache gated by `VIBE_TRADING_DATA_CACHE`.

Four portfolio optimizers: `mean_variance`, `equal_volatility`, `max_diversification`, `risk_parity`.

### Skills System (`agent/src/skills/`)

77 finance skills across 8 categories. Each skill is a `SKILL.md` file with YAML frontmatter. Skills are loaded by `SkillsLoader` and displayed in the system prompt. The agent loads a skill's full content via the `load_skill` tool. Skills are the "knowledge base" — they tell the agent *how* to use its tools for domain-specific tasks.

### Swarm (`agent/src/swarm/`)

29 preset multi-agent teams defined as YAML files under `presets/`. Workers run as sub-agents via `swarm_tool.py`. The runtime system (`runtime.py`, `worker.py`) handles DAG scheduling, streaming progress, MCP keepalive, stale-run reaping with per-run thresholds, and live reconciliation from task files. The `retry_run` tool relaunches failed/stale runs.

### Trading Connectors (`agent/src/trading/`)

10 brokers: IBKR (local TWS/Gateway + remote MCP read-only probe), Robinhood (remote MCP, OAuth), Tiger, Longbridge, Alpaca, OKX, Binance, Futu, Dhan, Shoonya. Connector-first architecture: `profiles.py` manages selectable connector profiles; `service.py` provides the uniform read/write interface. SDK connectors use a uniform module pattern (`build_config`, `check_status`, `get_account_snapshot`, etc.). Safety: mandate-gated live orders, filesystem kill switch, fail-closed pre-trade gate, full audit ledger.

### Session & Memory (`agent/src/session/`, `agent/src/memory/`)

Multi-turn chat sessions stored as JSONL files. FTS5 cross-session search. Persistent memory stored as markdown files under `~/.vibe-trading/memory/` with YAML frontmatter. The agent auto-recalls relevant memories via the `ContextBuilder`.

### Alpha Zoo (`agent/src/factors/`)

452 pre-built cross-sectional alphas across 4 zoos: `qlib158` (154, Apache-2), `alpha101` (101, Kakushadze), `gtja191` (191, Guotai Junan), `academic` (6, FF5+Carhart). Each alpha is a pure `compute(panel)` function using only allowlisted imports from `src.factors.base` (19 operators). AST purity gate + lookahead guard enforced by tests. `registry.py` does AST-only metadata load + lazy compute. `bench_runner.py` handles IC + alive/reversed/dead categorization.

### Frontend (`frontend/src/`)

React 19 SPA with Vite build tooling. State management via Zustand (`frontend/src/stores/`). Pages: Home, Agent (chat), AlphaZoo, RunDetail, Compare, Correlation, Settings. Chat component uses SSE for real-time streaming with `ToolProgressIndicator` for tool status. ECharts for data visualization (correlation heatmaps). Tailwind CSS for styling. Path alias `@/*` → `src/*`.

### Repository Structure Conventions

- Backend code: `agent/`. Python path root for imports is `agent/` (e.g., `from src.agent.loop import AgentLoop`).
- Backtest code lives under `agent/backtest/` (package path) and `agent/src/` (source path). Both are package directories.
- Frontend code: `frontend/`.
- CLI: `agent/cli/` package with `_legacy.py` shim for backward compatibility.
- Public wiki: `wiki/` (separate deployment to Cloudflare Pages).
- CI tools: `tools/` (e.g., `ci_grep_gates.sh` for rejection patterns).

### Environment Variables

`agent/.env` (copy from `agent/.env.example`) controls everything. Key vars: `LANGCHAIN_PROVIDER`, `<PROVIDER>_API_KEY`, `<PROVIDER>_BASE_URL`, `LANGCHAIN_MODEL_NAME`, `LANGCHAIN_REASONING_EFFORT`, `API_AUTH_KEY` (required for non-loopback API access), `VIBE_TRADING_DATA_CACHE` (opt-in loader cache), `VIBE_TRADING_ENABLE_SHELL_TOOLS` (explicit opt-in for remote API), `TUSHARE_TOKEN`, `FUTU_HOST`/`FUTU_PORT`.

### Contribution Rules (from CONTRIBUTING.md + AGENT_CONTRIBUTOR_GUIDE.md)

- Every community commit MUST carry `Signed-off-by:` trailer (DCO). Use `git commit -s`. No CLA.
- No `Co-Authored-By:` or AI-assistant attribution trailers in commits.
- Format with `black`, lint with `ruff`, Google-style docstrings.
- Files under 400 lines where practical, 800 hard cap.
- Alpha PRs must pass purity gate + lookahead gate + have `__alpha_meta__`.
- High-risk surfaces (order placement, broker auth, credential writes, external server starts, force pushes, CI secrets) require explicit maintainer approval.
- Never commit `.env` files, token caches, broker exports, or private data.
