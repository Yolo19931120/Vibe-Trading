# Vibe-Trading 本地启动指南

通过 Python 虚拟环境从源码启动前后端。

## 环境要求

| 工具 | 最低版本 | 验证命令 |
|------|---------|---------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+（推荐 22） | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 任意 | `git --version` |

---

## 1. 克隆项目

```bash
git clone https://github.com/HKUDS/Vibe-Trading.git
cd Vibe-Trading
```

---

## 2. 创建 Python 虚拟环境

**Windows (PowerShell / CMD):**

```powershell
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

激活成功后，终端提示符前会出现 `(.venv)` 标识。

---

## 3. 安装后端依赖

```bash
pip install -e ".[dev]"
```

这会将 `vibe-trading-ai` 以可编辑模式（editable）安装到虚拟环境中，同时安装了 `pytest` / `pytest-cov` 等开发依赖。

---

## 4. 配置 LLM 和数据源

```bash
cp agent/.env.example agent/.env
```

编辑 `agent/.env`，按需修改以下关键配置：

### 4.1 LLM 提供商（至少配一个）

以 OpenRouter 为例（推荐，多模型网关）：

```env
LANGCHAIN_PROVIDER=openrouter
LANGCHAIN_MODEL_NAME=deepseek/deepseek-v4-pro
OPENROUTER_API_KEY=sk-or-v1-你的key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

其他可选提供商：`openai` / `deepseek` / `gemini` / `groq` / `dashscope` / `zhipu` / `moonshot` / `ollama`（本地）。详见 `.env.example` 中的注释。

### 4.2 数据源（可选）

- **A 股数据**（推荐）：注册 [Tushare Pro](https://tushare.pro)，获取 token 填入 `TUSHARE_TOKEN`
- **美股 / 港股**：yfinance 免费，无需配置
- **加密货币**：OKX 公开 API，无需配置
- **Futu**（港股 / A 股）：需要本地运行 FutuOpenD，填写 `FUTU_HOST` / `FUTU_PORT`

不配 Tushare 也能跑，系统会自动降级到 mootdx → akshare。

### 4.3 API 鉴权（仅局域网/公网访问时需要）

```env
API_AUTH_KEY=你自定义的密钥
```

本地 loopback 访问（`localhost`）无需配置此项。

---

## 5. 安装前端依赖

```bash
cd frontend
npm ci
cd ..
```

`npm ci` 按 `package-lock.json` 精确安装，比 `npm install` 更快更稳定。

---

## 6. 启动后端

```bash
vibe-trading serve --port 8899
```

成功后会看到：

```
INFO:     Uvicorn running on http://127.0.0.1:8899
```

后端同时提供 REST API（含 SSE 流式传输）和预构建前端页面。

> **注意**：`vibe-trading` 和 `vibe-trading-mcp` 命令在 `pip install -e .` 后自动注册到虚拟环境的 `Scripts`/`bin` 目录中。

---

## 7. 启动前端（开发模式）

另开一个终端，同样先激活虚拟环境（仅后端需要，前端用 npm）：

```bash
cd frontend
npm run dev
```

Vite 开发服务器默认运行在 `http://localhost:5899`。如果端口被占用，Vite 会自动切换到 5900、5901 等。

> **开发模式下前端独立运行**：前端请求会自动代理到 `localhost:8899` 的后端 API。如需修改代理目标，编辑 `frontend/vite.config.ts` 中的 `server.proxy` 配置。

---

## 8. 访问

| 模式 | 地址 |
|------|------|
| 生产模式（后端一体化） | `http://localhost:8899` |
| 开发模式（前端热重载） | `http://localhost:5899` |

生产模式下后端直接提供 `frontend/dist/` 的构建产物。如果 `dist/` 不存在，前端页面不会加载，可以使用开发模式或先执行 `npm run build`。

---

## 9. 运行测试（可选）

```bash
# 后端测试（跳过 e2e）
pytest --ignore=agent/tests/e2e_backtest --ignore=agent/tests/test_e2e_harness_v2.py --tb=short -q

# 前端测试
cd frontend
npm run test:run
```

---

## 常见问题

### `vibe-trading` 命令找不到

确保虚拟环境已激活（终端提示符有 `(.venv)`），然后重装：

```bash
pip install -e ".[dev]"
```

### 端口 8899 被占用

```bash
# Windows
netstat -ano | findstr :8899
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :8899
kill -9 <PID>
```

### 前端页面空白 / API 不通

1. 确认后端已启动且没有报错
2. 开发模式下检查 Vite 代理配置
3. 生产模式下确认 `frontend/dist/` 存在（执行 `cd frontend && npm run build`）

### Tushare token 无效

不影响启动。系统会自动降级到 mootdx（免费，通达信 TCP 协议）或 akshare（免费 Web 聚合）。但建议配置 Tushare 以获得最稳定的 A 股数据。

### SSL / 证书错误（公司网络）

部分公司网络会拦截 HTTPS 请求。如果 LLM API 调用或数据源报 SSL 错误，可以临时设置：

```bash
# Windows PowerShell
$env:CURL_CA_BUNDLE=""; $env:REQUESTS_CA_BUNDLE=""

# macOS / Linux
export CURL_CA_BUNDLE=""
export REQUESTS_CA_BUNDLE=""
```

注意这会禁用 SSL 验证，仅用于排查网络问题，不建议长期使用。
