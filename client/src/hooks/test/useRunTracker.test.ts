import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { trackerApi, type RunTrackerResponse } from "@api/tracker";
import { useRunTracker } from "@hooks/useRunTracker";

vi.mock("@api/tracker", () => ({
  trackerApi: {
    createLocation: vi.fn(),
    get: vi.fn(),
    recordEncounter: vi.fn(),
  },
}));

const mockedTrackerApi = vi.mocked(trackerApi);

const tracker: RunTrackerResponse = {
  locations: [],
  room: null,
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
};

describe("useRunTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads tracker state on mount", async () => {
    mockedTrackerApi.get.mockResolvedValueOnce(tracker);

    const { result } = renderHook(() => useRunTracker("run-1"));

    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.tracker).toEqual(tracker);
  });

  it("creates a location, records an encounter, and refreshes tracker state", async () => {
    mockedTrackerApi.get.mockResolvedValue(tracker);
    mockedTrackerApi.createLocation.mockResolvedValueOnce({
      created_at: "2026-05-24T17:01:00Z",
      encounters: [],
      game_version_ref: "emerald",
      id: "location-1",
      is_custom: true,
      name: "Route 101",
      reference_location_ref: null,
      run_id: "run-1",
      sort_order: 1,
      updated_at: "2026-05-24T17:01:00Z",
    });
    mockedTrackerApi.recordEncounter.mockResolvedValueOnce({
      encounter: {
        ability: null,
        created_at: "2026-05-24T17:02:00Z",
        encounter_status: "caught",
        gender: null,
        id: "encounter-1",
        is_shiny: true,
        level: null,
        location_slot_id: "location-1",
        member_id: null,
        nature: null,
        nickname: "Zip",
        notes: null,
        run_id: "run-1",
        species_ref: "zigzagoon",
        updated_at: "2026-05-24T17:02:00Z",
      },
      pokemon: null,
      warnings: [],
    });

    const { result } = renderHook(() => useRunTracker("run-1"));

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    await act(async () => {
      await result.current.recordEncounter({
        encounter_status: "caught",
        is_shiny: true,
        location_name: "Route 101",
        nickname: "Zip",
        species_ref: "zigzagoon",
      });
    });

    expect(mockedTrackerApi.createLocation).toHaveBeenCalledWith("run-1", {
      name: "Route 101",
    });
    expect(mockedTrackerApi.recordEncounter).toHaveBeenCalledWith("run-1", {
      ability: undefined,
      encounter_status: "caught",
      gender: undefined,
      is_shiny: true,
      level: undefined,
      location_slot_id: "location-1",
      member_id: undefined,
      nature: undefined,
      nickname: "Zip",
      notes: undefined,
      species_ref: "zigzagoon",
    });
    expect(mockedTrackerApi.get).toHaveBeenCalledTimes(2);
  });

  it("surfaces tracker load errors", async () => {
    mockedTrackerApi.get.mockRejectedValueOnce(new Error("API offline"));

    const { result } = renderHook(() => useRunTracker("run-1"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.message).toBe("API offline");
    expect(result.current.tracker).toBeNull();
  });
});
