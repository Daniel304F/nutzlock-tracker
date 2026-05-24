import { useEffect, useState } from "react";

import { healthApi, type HealthResponse } from "@api/health";
import { getErrorMessage } from "@utils/getErrorMessage";

export type ApiHealthState =
  | { status: "loading" }
  | { status: "online"; health: HealthResponse }
  | { status: "offline"; message: string };

export function useApiHealth(): ApiHealthState {
  const [apiState, setApiState] = useState<ApiHealthState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    healthApi
      .get(controller.signal)
      .then((health) => setApiState({ status: "online", health }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setApiState({
          status: "offline",
          message: getErrorMessage(error, "API nicht erreichbar"),
        });
      });

    return () => controller.abort();
  }, []);

  return apiState;
}

