import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ModalProvider, useModalService } from "@components/modal/ModalProvider";

type OpenModalHarnessProps = {
  onConfirm: () => void;
};

function OpenModalHarness({ onConfirm }: OpenModalHarnessProps) {
  const modal = useModalService();

  return (
    <button
      type="button"
      onClick={() =>
        modal.openModal({
          title: "Death confirmation",
          description: "This action moves the Pokemon to the graveyard.",
          content: <p>Partner death propagation will be handled by the server.</p>,
          primaryAction: {
            intent: "danger",
            label: "Mark dead",
            onAction: onConfirm,
          },
          secondaryAction: {
            label: "Keep alive",
          },
        })
      }
    >
      Open modal
    </button>
  );
}

function ConfirmHarness() {
  const modal = useModalService();
  const [answer, setAnswer] = useState("none");

  async function askForConfirmation() {
    const confirmed = await modal.confirm({
      title: "Archive run",
      description: "Archived runs stay readable but leave the active workspace.",
      confirmLabel: "Archive",
      cancelLabel: "Cancel",
      intent: "warning",
    });

    setAnswer(confirmed ? "confirmed" : "cancelled");
  }

  return (
    <>
      <button type="button" onClick={askForConfirmation}>
        Ask
      </button>
      <p>Result: {answer}</p>
    </>
  );
}

describe("ModalProvider", () => {
  it("opens a service modal, runs the primary action, and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ModalProvider>
        <OpenModalHarness onConfirm={onConfirm} />
      </ModalProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByRole("dialog", { name: "Death confirmation" })).toBeInTheDocument();
    expect(screen.getByText("Partner death propagation will be handled by the server.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Mark dead" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Death confirmation" })).not.toBeInTheDocument();
    });
  });

  it("resolves confirm prompts from cancel and confirm actions", async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ConfirmHarness />
      </ModalProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByText("Result: cancelled")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Ask" }));
    await user.click(screen.getByRole("button", { name: "Archive" }));

    expect(await screen.findByText("Result: confirmed")).toBeInTheDocument();
  });
});
