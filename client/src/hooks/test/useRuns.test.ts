import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { runsApi, type RunCreateInput, type RunResponse } from "@api/runs";
import { useRuns } from "@hooks/useRuns";

vi.mock("@api/runs", () => ({
  runsApi: {
    create: vi.fn(),
    list: vi.fn(),
  },
}));

const mockedRunsApi = vi.mocked(runsApi);

const existingRun: RunResponse = {
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

const newRun: RunResponse = {
  ...existingRun,
  challenge_mode: "soullink",
  game_version_ref: "heartgold",
  id: "run-2",
  is_randomizer: true,
  name: "Heartgold w/ Sam",
  ruleset_id: "ruleset-2",
};

describe("useRuns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads runs on mount", async () => {
    mockedRunsApi.list.mockResolvedValueOnce([existingRun]);

    const { result } = renderHook(() => useRuns());

    expect(result.current.status).toBe("loading");

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.runs).toEqual([existingRun]);
  });

  it("adds newly created runs to the top of the list", async () => {
    mockedRunsApi.list.mockResolvedValueOnce([existingRun]);
    mockedRunsApi.create.mockResolvedValueOnce(newRun);
    const input: RunCreateInput = {
      challenge_mode: "soullink",
      game_version_ref: "heartgold",
      is_randomizer: true,
      name: "Heartgold w/ Sam",
      notes: null,
      player_count: 2,
    };

    const { result } = renderHook(() => useRuns());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    await act(async () => {
      await result.current.createRun(input);
    });

    expect(mockedRunsApi.create).toHaveBeenCalledWith(input);
    expect(result.current.runs).toEqual([newRun, existingRun]);
  });

  it("surfaces load errors without clearing interaction helpers", async () => {
    mockedRunsApi.list.mockRejectedValueOnce(new Error("API offline"));

    const { result } = renderHook(() => useRuns());

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });

    expect(result.current.message).toBe("API offline");
    expect(result.current.runs).toEqual([]);
    expect(result.current.createRun).toEqual(expect.any(Function));
  });
});
