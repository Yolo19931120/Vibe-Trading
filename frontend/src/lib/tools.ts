/**
 * Single source of truth for tool name → user-facing label.
 */
export const TOOL_LABELS: Record<string, string> = {
  load_skill: "Load strategy knowledge",
  write_file: "Generate code",
  edit_file: "Edit code",
  read_file: "Read file",
  run_backtest: "Run backtest",
  bash: "Run command",
  read_url: "Read webpage",
  read_document: "Read document",
  trading_connections: "List trading connectors",
  trading_select_connection: "Select trading connector",
  trading_check: "Check trading connector",
  trading_account: "Read connector account",
  trading_positions: "Read connector positions",
  trading_orders: "Read connector orders",
  trading_quote: "Read connector quote",
  trading_history: "Read connector history",
  compact: "Summarize conversation",
  create_task: "Create task",
  update_task: "Update task",
  spawn_subagent: "Spawn sub-agent",
};

export const TOOL_I18N_KEYS: Record<string, string> = {
  load_skill: "common:tools.loadSkill",
  write_file: "common:tools.writeFile",
  edit_file: "common:tools.editFile",
  read_file: "common:tools.readFile",
  run_backtest: "common:tools.runBacktest",
  bash: "common:tools.bash",
  read_url: "common:tools.readUrl",
  read_document: "common:tools.readDocument",
  trading_connections: "common:tools.tradingConnections",
  trading_select_connection: "common:tools.tradingSelectConnection",
  trading_check: "common:tools.tradingCheck",
  trading_account: "common:tools.tradingAccount",
  trading_positions: "common:tools.tradingPositions",
  trading_orders: "common:tools.tradingOrders",
  trading_quote: "common:tools.tradingQuote",
  trading_history: "common:tools.tradingHistory",
  compact: "common:tools.compact",
  create_task: "common:tools.createTask",
  update_task: "common:tools.updateTask",
  spawn_subagent: "common:tools.spawnSubagent",
};

export function localizeToolName(tool: string, fallback?: string): string {
  if (tool in TOOL_LABELS) {
    return TOOL_LABELS[tool];
  }
  if (fallback !== undefined) {
    return fallback;
  }
  return tool;
}

/** Returns the i18n key for a tool name. Use with t() in components: `t(getToolI18nKey(tool))`. */
export function getToolI18nKey(tool: string): string {
  return TOOL_I18N_KEYS[tool] || `common:tools.${tool}`;
}
