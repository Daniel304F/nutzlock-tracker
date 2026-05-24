import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@layout/AppShell";

describe("AppShell", () => {
  it("renders the API status and page content", () => {
    render(
      <AppShell apiLabel="API online" apiStatus="online">
        <p>Run dashboard</p>
      </AppShell>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("API online");
    expect(screen.getByRole("heading", { name: "Tracker Workspace" })).toBeInTheDocument();
    expect(screen.getByText("Run dashboard")).toBeInTheDocument();
  });
});

