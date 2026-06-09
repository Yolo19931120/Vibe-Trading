import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ConnectionBanner } from "../ConnectionBanner";

function wrap(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}

describe("ConnectionBanner", () => {
  it("renders nothing when status is connected", () => {
    const { container } = render(wrap(<ConnectionBanner status="connected" />));
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when status is disconnected", () => {
    const { container } = render(wrap(<ConnectionBanner status="disconnected" />));
    expect(container.innerHTML).toBe("");
  });

  it("shows reconnecting message with attempt number", () => {
    render(wrap(<ConnectionBanner status="reconnecting" retryAttempt={3} />));
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByText(/attempt 3/)).toBeInTheDocument();
  });

  it("defaults to attempt 1 when retryAttempt is not provided", () => {
    render(wrap(<ConnectionBanner status="reconnecting" />));
    expect(screen.getByText(/attempt 1/)).toBeInTheDocument();
  });

  it("has warning styling", () => {
    const { container } = render(wrap(<ConnectionBanner status="reconnecting" retryAttempt={1} />));
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/warning/);
  });
});
