import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useViewportMode } from "@hooks/useViewportMode";

type MatchMediaListener = (event: MediaQueryListEvent) => void;
const originalMatchMedia = window.matchMedia;

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<MatchMediaListener>();
  const mediaQueryList = {
    addEventListener: vi.fn(
      (event: string, listener: EventListenerOrEventListenerObject) => {
        if (event === "change" && typeof listener === "function") {
          listeners.add(listener as MatchMediaListener);
        }
      },
    ),
    addListener: vi.fn((listener: MatchMediaListener) => listeners.add(listener)),
    dispatch(nextMatches: boolean) {
      this.matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
    dispatchEvent: vi.fn(() => false),
    matches: initialMatches,
    media: "(min-width: 1024px)",
    onchange: null,
    removeEventListener: vi.fn(
      (event: string, listener: EventListenerOrEventListenerObject) => {
        if (event === "change" && typeof listener === "function") {
          listeners.delete(listener as MatchMediaListener);
        }
      },
    ),
    removeListener: vi.fn((listener: MatchMediaListener) => listeners.delete(listener)),
  };

  window.matchMedia = vi.fn(() => mediaQueryList as unknown as MediaQueryList);

  return mediaQueryList;
}

describe("useViewportMode", () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("reports desktop mode when the desktop media query matches", () => {
    installMatchMedia(true);

    const { result } = renderHook(() => useViewportMode());

    expect(result.current).toEqual({
      isDesktop: true,
      isMobile: false,
      mode: "desktop",
    });
  });

  it("reports mobile mode and updates when the media query changes", () => {
    const mediaQueryList = installMatchMedia(false);

    const { result } = renderHook(() => useViewportMode());

    expect(result.current).toEqual({
      isDesktop: false,
      isMobile: true,
      mode: "mobile",
    });

    act(() => {
      mediaQueryList.dispatch(true);
    });

    expect(result.current).toEqual({
      isDesktop: true,
      isMobile: false,
      mode: "desktop",
    });
  });
});
