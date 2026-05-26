import { apiClient } from "@api/client";
import type { RoomResponse } from "@api/rooms";
import type { RunResponse } from "@api/runs";

export type EncounterStatus =
  | "caught"
  | "dupe_skipped"
  | "failed"
  | "fled"
  | "killed_before_catch"
  | "missed";

export type Gender = "female" | "genderless" | "male" | "unknown";

export type WarningSeverity = "warning";

export type RuleWarningResponse = {
  code: string;
  message: string;
  severity: WarningSeverity;
};

export type LocationSlotCreateInput = {
  game_version_ref?: string | null;
  name: string;
  reference_location_ref?: string | null;
  sort_order?: number | null;
};

export type EncounterCreateInput = {
  ability?: string | null;
  encounter_status: EncounterStatus;
  gender?: Gender | null;
  level?: number | null;
  location_slot_id: string;
  member_id?: string | null;
  nature?: string | null;
  nickname?: string | null;
  notes?: string | null;
  species_ref?: string | null;
};

export type PokemonResponse = {
  created_at: string;
  current_level: number | null;
  death_at: string | null;
  death_cause: string | null;
  death_source: "manual" | "partner_death" | "system" | null;
  encounter_id: string;
  id: string;
  life_status: "alive" | "dead" | "released";
  nickname: string | null;
  notes: string | null;
  owner_member_id: string | null;
  randomized_overrides: Record<string, unknown> | null;
  roster_status: "box" | "graveyard" | "team";
  run_id: string;
  species_ref: string;
  updated_at: string;
};

export type EncounterResponse = {
  ability: string | null;
  created_at: string;
  encounter_status: EncounterStatus;
  gender: Gender | null;
  id: string;
  level: number | null;
  location_slot_id: string;
  member_id: string | null;
  nature: string | null;
  nickname: string | null;
  notes: string | null;
  run_id: string;
  species_ref: string | null;
  updated_at: string;
};

export type EncounterWithPokemonResponse = EncounterResponse & {
  pokemon: PokemonResponse | null;
};

export type LocationSlotResponse = {
  created_at: string;
  encounters: EncounterWithPokemonResponse[];
  game_version_ref: string | null;
  id: string;
  is_custom: boolean;
  name: string;
  reference_location_ref: string | null;
  run_id: string;
  sort_order: number;
  updated_at: string;
};

export type EncounterRecordResponse = {
  encounter: EncounterResponse;
  pokemon: PokemonResponse | null;
  warnings: RuleWarningResponse[];
};

export type RunTrackerResponse = {
  locations: LocationSlotResponse[];
  room: RoomResponse | null;
  run: RunResponse;
};

export const trackerApi = {
  createLocation: async (
    runId: string,
    input: LocationSlotCreateInput,
  ): Promise<LocationSlotResponse> => {
    const { data } = await apiClient.post<LocationSlotResponse>(
      `/runs/${runId}/locations`,
      input,
    );
    return data;
  },
  get: async (runId: string, signal?: AbortSignal): Promise<RunTrackerResponse> => {
    const { data } = await apiClient.get<RunTrackerResponse>(`/runs/${runId}/tracker`, {
      signal,
    });
    return data;
  },
  recordEncounter: async (
    runId: string,
    input: EncounterCreateInput,
  ): Promise<EncounterRecordResponse> => {
    const { data } = await apiClient.post<EncounterRecordResponse>(
      `/runs/${runId}/encounters`,
      input,
    );
    return data;
  },
};
