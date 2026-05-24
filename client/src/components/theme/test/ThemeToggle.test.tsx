import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "@components/theme/ThemeToggle";

const themeMock = vi.hoisted(() => ({
  resolvedTheme: "light",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => themeMock,
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    themeMock.resolvedTheme = "light";
  });

  it("switches from light to dark mode", async () => {
    const user = userEvent.setup();

    render(<ThemeToggle />);

    await user.click(await screen.findByRole("button", { name: "Switch to dark mode" }));

    expect(themeMock.setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from dark to light mode", async () => {
    const user = userEvent.setup();
    themeMock.resolvedTheme = "dark";

    render(<ThemeToggle />);

    await user.click(await screen.findByRole("button", { name: "Switch to light mode" }));

    expect(themeMock.setTheme).toHaveBeenCalledWith("light");
  });
});
