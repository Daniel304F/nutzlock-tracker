import { useCallback, useEffect, useState } from "react";

import {
  trackerApi,
  type EncounterCreateInput,
  type EncounterRecordResponse,
  type RunTrackerResponse,
} from "@api/tracker";
import { getErrorMessage } from "@utils/getErrorMessage";

type RunTrackerStatus = "error" | "loading" | "ready";

export type NewEncounterInput = Omit<EncounterCreateInput, "location_slot_id"> & {
  location_name: string;
};

export type UseRunTrackerResult = {
  message: string | null;
  recordEncounter: (input: NewEncounterInput) => Promise<EncounterRecordResponse>;
  refresh: () => Promise<void>;
  status: RunTrackerStatus;
  tracker: RunTrackerResponse | null;
};

export function useRunTracker(runId: string): UseRunTrackerResult {
  const [tracker, setTracker] = useState<RunTrackerResponse | null>(null);
  const [status, setStatus] = useState<RunTrackerStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadTracker = useCallback(
    async (signal?: AbortSignal) => {
      setStatus("loading");

      try {
        const nextTracker = await trackerApi.get(runId, signal);
        setTracker(nextTracker);
        setMessage(null);
        setStatus("ready");
      } catch (error: unknown) {
        if (signal?.aborted) {
          return;
        }

        setTracker(null);
        setMessage(getErrorMessage(error, "Run konnte nicht geladen werden"));
        setStatus("error");
      }
    },
    [runId],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadTracker(controller.signal);

    return () => controller.abort();
  }, [loadTracker]);

  const recordEncounter = useCallback(
    async (input: NewEncounterInput) => {
      const location = await trackerApi.createLocation(runId, {
        name: input.location_name,
      });
      const response = await trackerApi.recordEncounter(runId, {
        ability: input.ability,
        encounter_status: input.encounter_status,
        gender: input.gender,
        is_shiny: input.is_shiny,
        level: input.level,
        location_slot_id: location.id,
        member_id: input.member_id,
        nature: input.nature,
        nickname: input.nickname,
        notes: input.notes,
        species_ref: input.species_ref,
      });

      await loadTracker();
      return response;
    },
    [loadTracker, runId],
  );

  const refresh = useCallback(async () => {
    await loadTracker();
  }, [loadTracker]);

  return {
    message,
    recordEncounter,
    refresh,
    status,
    tracker,
  };
}
