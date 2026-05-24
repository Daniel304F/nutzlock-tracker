import { useCallback, useEffect, useState } from "react";

import { runsApi, type RunCreateInput, type RunResponse } from "@api/runs";
import { getErrorMessage } from "@utils/getErrorMessage";

type RunsStatus = "error" | "loading" | "ready";

export type UseRunsResult = {
  createRun: (input: RunCreateInput) => Promise<RunResponse>;
  message: string | null;
  refresh: () => Promise<void>;
  runs: RunResponse[];
  status: RunsStatus;
};

export function useRuns(): UseRunsResult {
  const [runs, setRuns] = useState<RunResponse[]>([]);
  const [status, setStatus] = useState<RunsStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const loadRuns = useCallback(async (signal?: AbortSignal) => {
    setStatus("loading");

    try {
      const nextRuns = await runsApi.list(signal);
      setRuns(nextRuns);
      setMessage(null);
      setStatus("ready");
    } catch (error: unknown) {
      if (signal?.aborted) {
        return;
      }

      setMessage(getErrorMessage(error, "Runs konnten nicht geladen werden"));
      setRuns([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadRuns(controller.signal);

    return () => controller.abort();
  }, [loadRuns]);

  const createRun = useCallback(async (input: RunCreateInput) => {
    const run = await runsApi.create(input);
    setRuns((currentRuns) => [run, ...currentRuns]);
    setMessage(null);
    setStatus("ready");
    return run;
  }, []);

  const refresh = useCallback(async () => {
    await loadRuns();
  }, [loadRuns]);

  return {
    createRun,
    message,
    refresh,
    runs,
    status,
  };
}
