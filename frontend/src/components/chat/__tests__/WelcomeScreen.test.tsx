import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { wrapWithI18n } from "@/tests/helpers/i18n";
import { WelcomeScreen } from "../WelcomeScreen";

describe("WelcomeScreen", () => {
  const onExample = vi.fn();

  beforeEach(() => onExample.mockClear());

  it("renders the title", () => {
    render(wrapWithI18n(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Vibe-Trading")).toBeInTheDocument();
  });

  it("renders capability chips", () => {
    render(wrapWithI18n(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Finance Skills Library")).toBeInTheDocument();
    expect(screen.getByText("Swarm Agent Teams")).toBeInTheDocument();
    expect(screen.getByText("Shadow Account Backtest")).toBeInTheDocument();
  });

  it("renders example categories", () => {
    render(wrapWithI18n(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Multi-Market Backtest")).toBeInTheDocument();
    expect(screen.getByText("Research & Analysis")).toBeInTheDocument();
    expect(screen.getByText("Swarm Teams")).toBeInTheDocument();
  });

  it("calls onExample with prompt when an example button is clicked", async () => {
    render(wrapWithI18n(<WelcomeScreen onExample={onExample} />));
    const user = userEvent.setup();
    await user.click(screen.getByText("Cross-Market Portfolio"));
    expect(onExample).toHaveBeenCalledTimes(1);
    expect(onExample).toHaveBeenCalledWith(
      expect.stringContaining("risk-parity portfolio"),
    );
  });

  it("renders the helper text", () => {
    render(wrapWithI18n(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Describe a trading strategy to get started.")).toBeInTheDocument();
    expect(screen.getByText("Try an example:")).toBeInTheDocument();
  });
});
