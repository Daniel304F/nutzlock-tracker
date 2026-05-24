import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HomePage } from "@pages/HomePage";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

const useApiHealthMock = vi.hoisted(() => vi.fn());
const useRunsMock = vi.hoisted(() => vi.fn());

vi.mock("@components/toast/ToastProvider", () => ({
  useToastService: () => toastMock,
}));

vi.mock("@hooks/useApiHealth", () => ({
  useApiHealth: useApiHealthMock,
}));

vi.mock("@hooks/useRuns", () => ({
  useRuns: useRunsMock,
}));

const createRunMock = vi.fn();

const run = {
  challenge_mode: "soullink",
  created_at: "2026-05-24T17:00:00Z",
  game_version_ref: "heartgold",
  id: "run-1",
  is_randomizer: true,
  name: "Heartgold w/ Sam",
  notes: "Shared route.",
  player_count: 2,
  randomizer_config_id: null,
  room_id: null,
  ruleset_id: "ruleset-1",
  status: "active",
  updated_at: "2026-05-24T17:00:00Z",
} as const;

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApiHealthMock.mockReturnValue({
      health: { service: "nutzlock-tracker-api", status: "ok" },
      status: "online",
    });
    useRunsMock.mockReturnValue({
      createRun: createRunMock,
      message: null,
      refresh: vi.fn(),
      runs: [run],
      status: "ready",
    });
  });

  it("renders run creation controls and recent runs", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "New run" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Randomizer/ })).toBeInTheDocument();
    expect(screen.getByText("Heartgold w/ Sam")).toBeInTheDocument();
    expect(screen.getByText("soullink")).toBeInTheDocument();
    expect(screen.getByText("RNG")).toBeInTheDocument();
  });

  it("submits a new run and shows success feedback", async () => {
    const user = userEvent.setup();
    createRunMock.mockResolvedValueOnce({ ...run, name: "Emerald solo" });

    render(<HomePage />);

    await user.clear(screen.getByLabelText("Run name"));
    await user.type(screen.getByLabelText("Run name"), "Emerald solo");
    await user.clear(screen.getByLabelText("Edition key"));
    await user.type(screen.getByLabelText("Edition key"), "emerald");
    await user.type(screen.getByLabelText("Notes"), "First clear attempt.");

    await user.click(screen.getByRole("button", { name: "Create run" }));

    await waitFor(() => {
      expect(createRunMock).toHaveBeenCalledWith({
        challenge_mode: "nuzlocke",
        game_version_ref: "emerald",
        is_randomizer: false,
        name: "Emerald solo",
        notes: "First clear attempt.",
        player_count: 1,
      });
    });
    expect(toastMock.success).toHaveBeenCalledWith("Run created", {
      description: "Emerald solo is ready.",
    });
  });

  it("submits solo randomizer mode as a randomized nuzlocke run", async () => {
    const user = userEvent.setup();
    createRunMock.mockResolvedValueOnce({
      ...run,
      challenge_mode: "nuzlocke",
      is_randomizer: true,
      name: "Emerald randomizer",
    });

    render(<HomePage />);

    await user.clear(screen.getByLabelText("Run name"));
    await user.type(screen.getByLabelText("Run name"), "Emerald randomizer");
    await user.click(screen.getByRole("radio", { name: /Randomizer/ }));
    await user.click(screen.getByRole("button", { name: "Create run" }));

    await waitFor(() => {
      expect(createRunMock).toHaveBeenCalledWith({
        challenge_mode: "nuzlocke",
        game_version_ref: "emerald",
        is_randomizer: true,
        name: "Emerald randomizer",
        notes: null,
        player_count: 1,
      });
    });
  });

  it("submits a multiplayer soullink run with the chosen player count", async () => {
    const user = userEvent.setup();
    createRunMock.mockResolvedValueOnce({
      ...run,
      challenge_mode: "soullink",
      is_randomizer: false,
      name: "Quad soullink",
      player_count: 4,
    });

    render(<HomePage />);

    await user.clear(screen.getByLabelText("Run name"));
    await user.type(screen.getByLabelText("Run name"), "Quad soullink");
    await user.click(screen.getByRole("radio", { name: /Mehrspieler/ }));

    const countInput = screen.getByLabelText("Anzahl Spieler");
    await user.clear(countInput);
    await user.type(countInput, "4");

    await user.click(screen.getByRole("button", { name: "Create run" }));

    await waitFor(() => {
      expect(createRunMock).toHaveBeenCalledWith({
        challenge_mode: "soullink",
        game_version_ref: "emerald",
        is_randomizer: false,
        name: "Quad soullink",
        notes: null,
        player_count: 4,
      });
    });
  });

  it("shows the load error state", () => {
    useRunsMock.mockReturnValueOnce({
      createRun: createRunMock,
      message: "API offline",
      refresh: vi.fn(),
      runs: [],
      status: "error",
    });

    render(<HomePage />);

    expect(screen.getByText("API offline")).toBeInTheDocument();
  });
});
