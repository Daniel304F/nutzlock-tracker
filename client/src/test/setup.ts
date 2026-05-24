import "@testing-library/jest-dom/vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof window !== "undefined" && typeof window.HTMLElement !== "undefined") {
  const proto = window.HTMLElement.prototype;

  if (typeof proto.hasPointerCapture !== "function") {
    proto.hasPointerCapture = () => false;
  }

  if (typeof proto.releasePointerCapture !== "function") {
    proto.releasePointerCapture = () => {};
  }

  if (typeof proto.scrollIntoView !== "function") {
    proto.scrollIntoView = () => {};
  }
}
