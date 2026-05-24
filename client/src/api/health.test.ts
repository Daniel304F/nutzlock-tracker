import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@api/client";
import { healthApi } from "@api/health";

vi.mock("@api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockedApiClient = vi.mocked(apiClient);

describe("healthApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the health response data", async () => {
    const signal = new AbortController().signal;
    mockedApiClient.get.mockResolvedValueOnce({
      data: { service: "nutzlock-tracker-api", status: "ok" },
    });

    await expect(healthApi.get(signal)).resolves.toEqual({
      service: "nutzlock-tracker-api",
      status: "ok",
    });
    expect(mockedApiClient.get).toHaveBeenCalledWith("/health", { signal });
  });
});

