import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@components/theme/ThemeProvider";
import { RunDetailPage } from "@pages/RunDetailPage";

const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
}));

const useApiHealthMock = vi.hoisted(() => vi.fn());
const useRunTrackerMock = vi.hoisted(() => vi.fn());

vi.mock("@components/toast/ToastProvider", () => ({
  useToastService: () => toastMock,
}));

vi.mock("@hooks/useApiHealth", () => ({
  useApiHealth: useApiHealthMock,
}));

vi.mock("@hooks/useRunTracker", () => ({
  useRunTracker: useRunTrackerMock,
}));

const recordEncounterMock = vi.fn();
const refreshMock = vi.fn();

const tracker = {
  locations: [
    {
      created_at: "2026-05-24T17:01:00Z",
      encounters: [
        {
          ability: null,
          created_at: "2026-05-24T17:02:00Z",
          encounter_status: "caught",
          gender: null,
          id: "encounter-1",
          level: 4,
          location_slot_id: "location-1",
          member_id: null,
          nature: null,
          nickname: "Zip",
          notes: null,
          pokemon: {
            created_at: "2026-05-24T17:02:00Z",
            current_level: 4,
            death_at: null,
            death_cause: null,
            death_source: null,
            encounter_id: "encounter-1",
            id: "pokemon-1",
            life_status: "alive",
            nickname: "Zip",
            notes: null,
            owner_member_id: null,
            randomized_overrides: null,
            roster_status: "box",
            run_id: "run-1",
            species_ref: "zigzagoon",
            updated_at: "2026-05-24T17:02:00Z",
          },
          run_id: "run-1",
          species_ref: "zigzagoon",
          updated_at: "2026-05-24T17:02:00Z",
        },
      ],
      game_version_ref: "emerald",
      id: "location-1",
      is_custom: true,
      name: "Route 101",
      reference_location_ref: null,
      run_id: "run-1",
      sort_order: 1,
      updated_at: "2026-05-24T17:02:00Z",
    },
  ],
  run: {
    challenge_mode: "nuzlocke",
    created_at: "2026-05-24T17:00:00Z",
    game_version_ref: "emerald",
    id: "run-1",
    is_randomizer: false,
    name: "Emerald solo",
    notes: null,
    player_count: 1,
    randomizer_config_id: null,
    room_id: null,
    ruleset_id: "ruleset-1",
    status: "active",
    updated_at: "2026-05-24T17:00:00Z",
  },
} as const;

function renderRunDetailPage() {
  return render(
    <ThemeProvider>
      <RunDetailPage runId="run-1" />
    </ThemeProvider>,
  );
}

describe("RunDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useApiHealthMock.mockReturnValue({
      health: { service: "nutzlock-tracker-api", status: "ok" },
      status: "online",
    });
    useRunTrackerMock.mockReturnValue({
      message: null,
      recordEncounter: recordEncounterMock,
      refresh: refreshMock,
      status: "ready",
      tracker,
    });
  });

  it("renders run context and existing encounters", () => {
    renderRunDetailPage();

    expect(screen.getByRole("heading", { name: "Emerald solo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Zurück zu Runs" })).toHaveAttribute(
      "href",
      "/workspace",
    );
    expect(screen.getByRole("heading", { name: "Encounter eintragen" })).toBeInTheDocument();
    expect(screen.getByLabelText("Gebiet")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Route 101" })).toBeInTheDocument();
    expect(screen.getByText("zigzagoon")).toBeInTheDocument();
    expect(screen.getByText("Zip")).toBeInTheDocument();
    expect(screen.getByText("Box")).toBeInTheDocument();
  });

  it("submits a new caught encounter and shows success feedback", async () => {
    const user = userEvent.setup();
    recordEncounterMock.mockResolvedValueOnce({
      encounter: { id: "encounter-2" },
      pokemon: { id: "pokemon-2" },
      warnings: [],
    });

    renderRunDetailPage();

    await user.type(screen.getByLabelText("Gebiet"), "Route 102");
    await user.type(screen.getByLabelText("Spezies"), "poochyena");
    await user.type(screen.getByLabelText("Spitzname"), "Byte");
    await user.type(screen.getByLabelText("Level"), "5");
    await user.click(screen.getByRole("button", { name: "Encounter speichern" }));

    await waitFor(() => {
      expect(recordEncounterMock).toHaveBeenCalledWith({
        encounter_status: "caught",
        level: 5,
        location_name: "Route 102",
        member_id: undefined,
        nickname: "Byte",
        species_ref: "poochyena",
      });
    });
    expect(toastMock.success).toHaveBeenCalledWith("Encounter gespeichert", {
      description: "poochyena wurde eingetragen.",
    });
  });
});
