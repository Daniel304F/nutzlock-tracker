import { describe, expect, it } from "vitest";

import { getErrorMessage } from "@utils/getErrorMessage";

describe("getErrorMessage", () => {
  it("returns Error messages", () => {
    expect(getErrorMessage(new Error("kaputt"), "fallback")).toBe("kaputt");
  });

  it("returns the fallback for unknown errors", () => {
    expect(getErrorMessage("kaputt", "fallback")).toBe("fallback");
  });
});

