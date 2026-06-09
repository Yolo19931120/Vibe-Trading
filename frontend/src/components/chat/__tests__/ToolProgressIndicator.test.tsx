import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ToolProgressIndicator } from "../ToolProgressIndicator";
import type { ToolCallEntry } from "@/types/agent";

function wrap(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

function makeTc(overrides: Partial<ToolCallEntry> = {}): ToolCallEntry {
  return {
    id: "tc-1",
    tool: "run_backtest",
    arguments: {},
    status: "running",
    timestamp: Date.now(),
    ...overrides,
  };
}

describe("ToolProgressIndicator", () => {
  it("renders nothing when no tools are running", () => {
    const tcs = [makeTc({ status: "ok" }), makeTc({ id: "tc-2", status: "error" })];
    const { container } = render(wrap(<ToolProgressIndicator toolCalls={tcs} />));
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for empty array", () => {
    const { container } = render(wrap(<ToolProgressIndicator toolCalls={[]} />));
    expect(container.innerHTML).toBe("");
  });

  it("renders single running tool", () => {
    const tcs = [makeTc({ elapsed_s: 5 })];
    render(wrap(<ToolProgressIndicator toolCalls={tcs} />));
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Run backtest/)).toBeInTheDocument();
    expect(screen.getByText("5s")).toBeInTheDocument();
  });

  it("renders multiple running tools with header", () => {
    const tcs = [
      makeTc({ id: "tc-1", tool: "bash" }),
      makeTc({ id: "tc-2", tool: "write_file" }),
    ];
    render(wrap(<ToolProgressIndicator toolCalls={tcs} />));
    expect(screen.getByText("2 tools running")).toBeInTheDocument();
    expect(screen.getByText(/Run command/)).toBeInTheDocument();
    expect(screen.getByText(/Generate code/)).toBeInTheDocument();
  });

  it("shows overflow indicator for > 3 running tools", () => {
    const tcs = [
      makeTc({ id: "tc-1", tool: "bash" }),
      makeTc({ id: "tc-2", tool: "write_file" }),
      makeTc({ id: "tc-3", tool: "run_backtest" }),
      makeTc({ id: "tc-4", tool: "read_file" }),
    ];
    render(wrap(<ToolProgressIndicator toolCalls={tcs} />));
    expect(screen.getByText(/… \+2 more/)).toBeInTheDocument();
  });

  it("shows determinate progress bar when progress data exists", () => {
    const tcs = [
      makeTc({
        progress: { current: 5, total: 10, stage: "Processing" },
      }),
    ];
    render(wrap(<ToolProgressIndicator toolCalls={tcs} />));
    expect(screen.getByText("Processing")).toBeInTheDocument();
    expect(screen.getByText("5/10")).toBeInTheDocument();
    // Should have a progressbar element
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
