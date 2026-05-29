import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "@layout/AppShell";

describe("AppShell", () => {
  it("renders app chrome without API status noise", () => {
    render(
      <AppShell>
        <p>Run dashboard</p>
      </AppShell>,
    );

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText(/API online/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tracker Workspace" })).toBeInTheDocument();
    expect(screen.getByText("Run dashboard")).toBeInTheDocument();
  });
});
