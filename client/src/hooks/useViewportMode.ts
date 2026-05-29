import { useMemo, useSyncExternalStore } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";
const DESKTOP_MIN_WIDTH = 1024;

export type ViewportMode = {
  isDesktop: boolean;
  isMobile: boolean;
  mode: "desktop" | "mobile";
};

function getDesktopSnapshot(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(DESKTOP_QUERY).matches;
  }

  return window.innerWidth >= DESKTOP_MIN_WIDTH;
}

function subscribeToViewport(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  if (typeof window.matchMedia !== "function") {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }

  const mediaQueryList = window.matchMedia(DESKTOP_QUERY);

  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

export function useViewportMode(): ViewportMode {
  const isDesktop = useSyncExternalStore(
    subscribeToViewport,
    getDesktopSnapshot,
    () => false,
  );

  return useMemo(
    () => ({
      isDesktop,
      isMobile: !isDesktop,
      mode: isDesktop ? "desktop" : "mobile",
    }),
    [isDesktop],
  );
}
