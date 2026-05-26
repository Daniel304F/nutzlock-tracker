import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@components/theme/ThemeProvider";
import { HomePage } from "@pages/HomePage";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

const useApiHealthMock = vi.hoisted(() => vi.fn());
const useJoinRoomMock = vi.hoisted(() => vi.fn());
const useRunsMock = vi.hoisted(() => vi.fn());

vi.mock("@components/toast/ToastProvider", () => ({
  useToastService: () => toastMock,
}));

vi.mock("@hooks/useApiHealth", () => ({
  useApiHealth: useApiHealthMock,
}));

vi.mock("@hooks/useJoinRoom", () => ({
  useJoinRoom: useJoinRoomMock,
}));

vi.mock("@hooks/useRuns", () => ({
  useRuns: useRunsMock,
}));

const createRunMock = vi.fn();
const joinRoomMock = vi.fn();

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
  room_id: "room-1",
  ruleset_id: "ruleset-1",
  status: "active",
  updated_at: "2026-05-24T17:00:00Z",
} as const;

function renderHomePage() {
  return render(
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>,
  );
}

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApiHealthMock.mockReturnValue({
      health: { service: "nutzlock-tracker-api", status: "ok" },
      status: "online",
    });
    useJoinRoomMock.mockReturnValue({
      joinRoom: joinRoomMock,
      joinedRoom: null,
      message: null,
      status: "idle",
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
    renderHomePage();

    expect(screen.getAllByAltText("Nutzlocke and Soullink logo")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
    expect(screen.queryByText(/Modern run command center/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Run anlegen" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spielzentrale" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Randomizer/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run erstellen" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Raum beitreten" })).toBeInTheDocument();
    expect(screen.getByLabelText("Beitrittscode")).toBeInTheDocument();
    expect(screen.getByLabelText("Dein Name")).toBeInTheDocument();
    expect(screen.getByText("JSON importieren")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Aktuelle Runs" })).toBeInTheDocument();
    expect(screen.getByText("Heartgold w/ Sam")).toBeInTheDocument();
    expect(screen.getAllByText("Soullink").length).toBeGreaterThan(0);
    expect(screen.getByText("Raum bereit")).toBeInTheDocument();
    expect(screen.getAllByText("Randomizer").length).toBeGreaterThan(0);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Nutzlock Tracker");
    expect(
      screen.getByRole("link", { name: "Daniel304F/nutzlock-tracker" }),
    ).toHaveAttribute("href", "https://github.com/Daniel304F/nutzlock-tracker");
    expect(screen.getByRole("contentinfo")).not.toHaveTextContent("React");
  });

  it("submits a new run and shows success feedback", async () => {
    const user = userEvent.setup();
    createRunMock.mockResolvedValueOnce({
      ...run,
      challenge_mode: "nuzlocke",
      name: "Emerald solo",
      room_id: null,
    });

    renderHomePage();

    await user.clear(screen.getByLabelText("Run-Name"));
    await user.type(screen.getByLabelText("Run-Name"), "Emerald solo");
    await user.clear(screen.getByLabelText("Edition"));
    await user.type(screen.getByLabelText("Edition"), "emerald");
    await user.type(screen.getByLabelText("Notizen"), "First clear attempt.");

    await user.click(screen.getByRole("button", { name: "Run erstellen" }));

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
    expect(toastMock.success).toHaveBeenCalledWith("Run erstellt", {
      description: "Emerald solo ist bereit.",
    });
  });

  it("joins a room and shows success feedback", async () => {
    const user = userEvent.setup();
    joinRoomMock.mockResolvedValueOnce({
      member: {
        display_name: "Sam",
        id: "member-2",
        joined_at: "2026-05-24T17:05:00Z",
        last_seen_at: null,
        role: "partner",
      },
      room: {
        created_at: "2026-05-24T17:00:00Z",
        created_by_member_id: "member-1",
        id: "room-1",
        join_code: "ABCD2345EF",
        join_code_revoked_at: null,
        members: [],
        read_only_token: null,
        run_id: "run-1",
        updated_at: "2026-05-24T17:05:00Z",
      },
    });

    renderHomePage();

    await user.type(screen.getByLabelText("Beitrittscode"), "ABCD2345EF");
    await user.type(screen.getByLabelText("Dein Name"), "Sam");
    await user.click(screen.getByRole("button", { name: "Raum beitreten" }));

    await waitFor(() => {
      expect(joinRoomMock).toHaveBeenCalledWith({
        display_name: "Sam",
        join_code: "ABCD2345EF",
      });
    });
    expect(toastMock.success).toHaveBeenCalledWith("Raum beigetreten", {
      description: "Sam ist im Raum ABCD2345EF.",
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

    renderHomePage();

    await user.clear(screen.getByLabelText("Run-Name"));
    await user.type(screen.getByLabelText("Run-Name"), "Emerald randomizer");
    await user.click(screen.getByRole("radio", { name: /Randomizer/ }));
    await user.click(screen.getByRole("button", { name: "Run erstellen" }));

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

    renderHomePage();

    await user.clear(screen.getByLabelText("Run-Name"));
    await user.type(screen.getByLabelText("Run-Name"), "Quad soullink");
    await user.click(screen.getByRole("radio", { name: /Mehrspieler/ }));

    const countInput = screen.getByLabelText("Anzahl Spieler");
    await user.clear(countInput);
    await user.type(countInput, "4");

    await user.click(screen.getByRole("button", { name: "Run erstellen" }));

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

    renderHomePage();

    expect(screen.getByText("API offline")).toBeInTheDocument();
  });
});
