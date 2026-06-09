import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { WelcomeScreen } from "../WelcomeScreen";

function wrap(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("WelcomeScreen", () => {
  const onExample = vi.fn();

  beforeEach(() => onExample.mockClear());

  it("renders the title", () => {
    render(wrap(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Vibe-Trading")).toBeInTheDocument();
  });

  it("renders capability chips", () => {
    render(wrap(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Finance Skills Library")).toBeInTheDocument();
    expect(screen.getByText("Swarm Agent Teams")).toBeInTheDocument();
    expect(screen.getByText("Shadow Account Backtest")).toBeInTheDocument();
  });

  it("renders example categories", () => {
    render(wrap(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Multi-Market Backtest")).toBeInTheDocument();
    expect(screen.getByText("Research & Analysis")).toBeInTheDocument();
    expect(screen.getByText("Swarm Teams")).toBeInTheDocument();
  });

  it("calls onExample with prompt when an example button is clicked", async () => {
    render(wrap(<WelcomeScreen onExample={onExample} />));
    const user = userEvent.setup();
    await user.click(screen.getByText("Cross-Market Portfolio"));
    expect(onExample).toHaveBeenCalledTimes(1);
    expect(onExample).toHaveBeenCalledWith(
      expect.stringContaining("risk-parity portfolio"),
    );
  });

  it("renders the helper text", () => {
    render(wrap(<WelcomeScreen onExample={onExample} />));
    expect(screen.getByText("Describe a trading strategy to get started.")).toBeInTheDocument();
    expect(screen.getByText("Try an example:")).toBeInTheDocument();
  });
});
