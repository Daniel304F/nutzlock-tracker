import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToastService } from "@components/toast/ToastProvider";

const sonnerMock = vi.hoisted(() => ({
  toast: {
    dismiss: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  Toaster: ({ position }: { position?: string }) => (
    <div data-position={position} data-testid="toaster" />
  ),
  toast: sonnerMock.toast,
}));

function ToastHarness() {
  const toastService = useToastService();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          toastService.success("Encounter saved", {
            description: "Route 3 is now linked.",
            duration: 5000,
          })
        }
      >
        Save encounter
      </button>
      <button type="button" onClick={() => toastService.error("API offline")}>
        Show error
      </button>
      <button type="button" onClick={() => toastService.dismiss("toast-1")}>
        Dismiss toast
      </button>
    </>
  );
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the toast viewport", () => {
    render(
      <ToastProvider>
        <p>Workspace</p>
      </ToastProvider>,
    );

    expect(screen.getByTestId("toaster")).toHaveAttribute("data-position", "top-right");
    expect(screen.getByText("Workspace")).toBeInTheDocument();
  });

  it("exposes typed toast actions through the service hook", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Save encounter" }));
    await user.click(screen.getByRole("button", { name: "Show error" }));
    await user.click(screen.getByRole("button", { name: "Dismiss toast" }));

    expect(sonnerMock.toast.success).toHaveBeenCalledWith(
      "Encounter saved",
      expect.objectContaining({
        description: "Route 3 is now linked.",
        duration: 5000,
      }),
    );
    expect(sonnerMock.toast.error).toHaveBeenCalledWith("API offline", expect.any(Object));
    expect(sonnerMock.toast.dismiss).toHaveBeenCalledWith("toast-1");
  });
});
