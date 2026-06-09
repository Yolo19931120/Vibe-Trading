import React from "react";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import { ErrorBoundary } from "../ErrorBoundary";

function Thrower({ message }: { message: string }): React.ReactElement {
  throw new Error(message);
}

// Suppress React error boundary console.error in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("ErrorBoundary")) return;
    originalError(...args);
  };
});
afterAll(() => {
  console.error = originalError;
});

describe("ErrorBoundary", () => {
  it("renders children normally when no error", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <div>Hello World</div>
        </ErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders default fallback with error message on error", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <Thrower message="Something broke" />
        </ErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByText("Something broke")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary fallback={<div>Custom fallback</div>}>
          <Thrower message="ignored" />
        </ErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
    expect(screen.queryByText("ignored")).not.toBeInTheDocument();
  });

  it("shows default message when error has no message", () => {
    function ThrowEmpty(): React.ReactElement {
      throw {};
    }
    render(
      <I18nextProvider i18n={i18n}>
        <ErrorBoundary>
          <ThrowEmpty />
        </ErrorBoundary>
      </I18nextProvider>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
