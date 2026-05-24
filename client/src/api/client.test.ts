import { describe, expect, it } from "vitest";

import { apiClient } from "@api/client";

describe("apiClient", () => {
  it("uses the configured API base URL", () => {
    expect(apiClient.defaults.baseURL).toBe("http://localhost:8000/api/v1");
  });

  it("sends JSON and keeps room credentials with requests", () => {
    expect(apiClient.defaults.headers.common.Accept).toContain("application/json");
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
    expect(apiClient.defaults.withCredentials).toBe(true);
  });
});

