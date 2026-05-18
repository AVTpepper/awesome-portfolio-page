import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollSpy } from "../useScrollSpy";

// Per-section observer tracking so we can fire callbacks selectively.
const ioInstances: Array<{
  cb: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}> = [];

class MockIO {
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(cb: IntersectionObserverCallback) {
    ioInstances.push({ cb, observe: this.observe, disconnect: this.disconnect });
  }
}

beforeEach(() => {
  ioInstances.length = 0;
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIO,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

/** Helper: create a real DOM element with the given id so getElementById works. */
function createSection(id: string): HTMLElement {
  const el = document.createElement("section");
  el.id = id;
  document.body.appendChild(el);
  return el;
}

describe("useScrollSpy", () => {
  it("returns empty string initially", () => {
    createSection("about");
    const { result } = renderHook(() => useScrollSpy(["about"]));
    expect(result.current).toBe("");
  });

  it("returns the id of the section that becomes intersecting", () => {
    createSection("about");
    createSection("projects");
    const { result } = renderHook(() => useScrollSpy(["about", "projects"]));

    // Fire the callback for the second observer (projects)
    act(() => {
      ioInstances[1]?.cb(
        [{ isIntersecting: true, target: document.getElementById("projects") } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(result.current).toBe("projects");
  });

  it("updates active section when a different section intersects", () => {
    createSection("about");
    createSection("contact");
    const { result } = renderHook(() => useScrollSpy(["about", "contact"]));

    act(() => {
      ioInstances[0]?.cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(result.current).toBe("about");

    act(() => {
      ioInstances[1]?.cb(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(result.current).toBe("contact");
  });

  it("creates one observer per section id", () => {
    createSection("s1");
    createSection("s2");
    createSection("s3");
    renderHook(() => useScrollSpy(["s1", "s2", "s3"]));
    expect(ioInstances).toHaveLength(3);
  });

  it("returns empty string when given an empty ids array", () => {
    const { result } = renderHook(() => useScrollSpy([]));
    expect(result.current).toBe("");
    expect(ioInstances).toHaveLength(0);
  });

  it("disconnects all observers on unmount", () => {
    createSection("a");
    createSection("b");
    const { unmount } = renderHook(() => useScrollSpy(["a", "b"]));
    unmount();
    ioInstances.forEach((io) => expect(io.disconnect).toHaveBeenCalled());
  });
});
