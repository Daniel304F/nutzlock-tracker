import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@api/client";
import {
  trackerApi,
  type EncounterCreateInput,
  type LocationSlotCreateInput,
  type RunTrackerResponse,
} from "@api/tracker";

vi.mock("@api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

const trackerResponse: RunTrackerResponse = {
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

describe("trackerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads the run tracker state", async () => {
    const signal = new AbortController().signal;
    mockedApiClient.get.mockResolvedValueOnce({ data: trackerResponse });

    await expect(trackerApi.get("run-1", signal)).resolves.toEqual(trackerResponse);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/runs/run-1/tracker", { signal });
  });

  it("creates a location slot", async () => {
    const input: LocationSlotCreateInput = { name: "Route 101" };
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        created_at: "2026-05-24T17:00:00Z",
        encounters: [],
        game_version_ref: "emerald",
        id: "location-1",
        is_custom: true,
        name: "Route 101",
        reference_location_ref: null,
        run_id: "run-1",
        sort_order: 1,
        updated_at: "2026-05-24T17:00:00Z",
      },
    });

    await trackerApi.createLocation("run-1", input);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/runs/run-1/locations", input);
  });

  it("records an encounter", async () => {
    const input: EncounterCreateInput = {
      encounter_status: "caught",
      location_slot_id: "location-1",
      nickname: "Zip",
      species_ref: "zigzagoon",
    };
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        encounter: { id: "encounter-1" },
        pokemon: { id: "pokemon-1" },
        warnings: [],
      },
    });

    await trackerApi.recordEncounter("run-1", input);

    expect(mockedApiClient.post).toHaveBeenCalledWith("/runs/run-1/encounters", input);
  });
});
