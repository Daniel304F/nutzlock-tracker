import { apiClient } from "@api/client";

export type ChallengeMode = "nuzlocke" | "soullink";

export type RunStatus = "active" | "archived" | "completed_victory" | "failed_wipeout";

export type RunCreateInput = {
  challenge_mode: ChallengeMode;
  game_version_ref: string;
  is_randomizer: boolean;
  name: string;
  notes?: string | null;
};

export type RunResponse = {
  challenge_mode: ChallengeMode;
  created_at: string;
  game_version_ref: string;
  id: string;
  is_randomizer: boolean;
  name: string;
  notes: string | null;
  randomizer_config_id: string | null;
  room_id: string | null;
  ruleset_id: string;
  status: RunStatus;
  updated_at: string;
};

export const runsApi = {
  create: async (input: RunCreateInput): Promise<RunResponse> => {
    const { data } = await apiClient.post<RunResponse>("/runs", input);
    return data;
  },
  list: async (signal?: AbortSignal): Promise<RunResponse[]> => {
    const { data } = await apiClient.get<RunResponse[]>("/runs", { signal });
    return data;
  },
};
