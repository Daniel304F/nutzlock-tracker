import { apiClient } from "@api/client";

export type HealthResponse = {
  service: string;
  status: "ok";
};

export const healthApi = {
  get: async (signal?: AbortSignal): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>("/health", { signal });
    return data;
  },
};

