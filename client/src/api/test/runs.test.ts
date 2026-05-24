import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@api/client";
import { runsApi, type RunCreateInput, type RunResponse } from "@api/runs";

vi.mock("@api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

const runResponse: RunResponse = {
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
};

describe("runsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists runs through the shared API client", async () => {
    const signal = new AbortController().signal;
    mockedApiClient.get.mockResolvedValueOnce({ data: [runResponse] });

    await expect(runsApi.list(signal)).resolves.toEqual([runResponse]);

    expect(mockedApiClient.get).toHaveBeenCalledWith("/runs", { signal });
  });

  it("creates a run through the shared API client", async () => {
    const input: RunCreateInput = {
      challenge_mode: "soullink",
      game_version_ref: "heartgold",
      is_randomizer: true,
      name: "Heartgold w/ Sam",
      notes: "Shared attempt.",
      player_count: 2,
    };
    mockedApiClient.post.mockResolvedValueOnce({ data: { ...runResponse, ...input } });

    await expect(runsApi.create(input)).resolves.toEqual({ ...runResponse, ...input });

    expect(mockedApiClient.post).toHaveBeenCalledWith("/runs", input);
  });
});
