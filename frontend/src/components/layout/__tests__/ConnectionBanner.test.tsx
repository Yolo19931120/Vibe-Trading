import { render, screen } from "@testing-library/react";
import { wrapWithI18n } from "@/tests/helpers/i18n";
import { ConnectionBanner } from "../ConnectionBanner";

describe("ConnectionBanner", () => {
  it("renders nothing when status is connected", () => {
    const { container } = render(wrapWithI18n(<ConnectionBanner status="connected" />));
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when status is disconnected", () => {
    const { container } = render(wrapWithI18n(<ConnectionBanner status="disconnected" />));
    expect(container.innerHTML).toBe("");
  });

  it("shows reconnecting message with attempt number", () => {
    render(wrapWithI18n(<ConnectionBanner status="reconnecting" retryAttempt={3} />));
    expect(screen.getByText(/reconnecting/i)).toBeInTheDocument();
    expect(screen.getByText(/attempt 3/)).toBeInTheDocument();
  });

  it("defaults to attempt 1 when retryAttempt is not provided", () => {
    render(wrapWithI18n(<ConnectionBanner status="reconnecting" />));
    expect(screen.getByText(/attempt 1/)).toBeInTheDocument();
  });

  it("has warning styling", () => {
    const { container } = render(wrapWithI18n(<ConnectionBanner status="reconnecting" retryAttempt={1} />));
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toMatch(/warning/);
  });
});
