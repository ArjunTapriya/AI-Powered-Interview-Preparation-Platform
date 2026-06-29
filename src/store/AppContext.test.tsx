import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppProvider, useApp } from "./AppContext";

// Mock global fetch
(globalThis as any).fetch = vi.fn();

const TestComponent = () => {
  const { user, streak, accessToken } = useApp();
  return (
    <div>
      <div data-testid="user-name">{user.name}</div>
      <div data-testid="streak">{streak}</div>
      <div data-testid="token">{accessToken || "No Token"}</div>
    </div>
  );
};

describe("AppContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize with default unauthenticated user", () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("user-name").textContent).toBe("Guest");
    expect(screen.getByTestId("streak").textContent).toBe("14"); // Fallback streak in mock
    expect(screen.getByTestId("token").textContent).toBe("No Token");
  });

  it("should load user and token from localStorage if present", () => {
    localStorage.setItem("antigravity_token", "test-token");
    localStorage.setItem("antigravity_user", JSON.stringify({ name: "Alice", isLoggedIn: true }));

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId("user-name").textContent).toBe("Alice");
    expect(screen.getByTestId("token").textContent).toBe("test-token");
  });
});
