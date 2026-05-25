import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("@pages/HomePage", () => ({
  HomePage: () => <h1>Workspace Page</h1>,
}));

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the landing page first with a workspace CTA", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Nutzlocke & Soullink Tracker App" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Nutzlocke und Soullink Tracker App" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tracker starten" })).toHaveAttribute(
      "href",
      "/workspace",
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Soullink" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sync" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Alles für deine Challenge." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/während des Runs/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gemeinsame Räume" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Workspace Page" })).not.toBeInTheDocument();
  });

  it("renders the existing workspace at /workspace", () => {
    window.history.pushState({}, "", "/workspace");

    render(<App />);

    expect(screen.getByRole("heading", { name: "Workspace Page" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Nutzlocke & Soullink Tracker App" }),
    ).not.toBeInTheDocument();
  });
});
