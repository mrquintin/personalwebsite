"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import Button from "@/components/primitives/Button";
import { microcopy } from "@/content/microcopy";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err: unknown): ErrorBoundaryState {
    const message = err instanceof Error ? err.message : microcopy.errors.unknown;
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown, info: ErrorInfo): void {
    console.error("[ChatErrorBoundary]", err, info);
  }

  handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    return (
      <section
        role="alert"
        aria-live="assertive"
        className="chat-error-boundary"
      >
        <h2 className="chat-error-boundary__title">
          {microcopy.errors.boundaryTitle}
        </h2>
        <p className="chat-error-boundary__detail">
          {microcopy.errors.boundaryDetail(this.state.message)}
        </p>
        <Button
          variant="solid"
          tone="accent"
          size="md"
          onClick={this.handleReload}
        >
          {microcopy.buttons.reload}
        </Button>
      </section>
    );
  }
}
