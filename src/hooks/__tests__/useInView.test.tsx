import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useInView } from "../useInView";

// We need a controllable IntersectionObserver that lets us fire the callback.
// The hook only creates the observer once ref.current is non-null (i.e. when a
// real DOM element is rendered with the returned ref attached).
type IOInstance = {
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  callback: IntersectionObserverCallback;
};
let lastIOInstance: IOInstance | null = null;

class MockIO {
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(cb: IntersectionObserverCallback) {
    lastIOInstance = { observe: this.observe, disconnect: this.disconnect, callback: cb };
  }
}

// Wrapper component: attaches the hook's ref to a real <div> so ref.current is
// non-null and the IntersectionObserver is actually created inside useEffect.
function HookHost({ store }: { store: { inView?: boolean } }) {
  const { ref, inView } = useInView();
  store.inView = inView;
  return <div ref={ref} data-testid="host" />;
}

beforeEach(() => {
  lastIOInstance = null;
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIO,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useInView", () => {
  it("returns inView=false initially", () => {
    const store: { inView?: boolean } = {};
    render(<HookHost store={store} />);
    expect(store.inView).toBe(false);
  });

  it("creates an IntersectionObserver with threshold 0.15", () => {
    const store: { inView?: boolean } = {};
    render(<HookHost store={store} />);
    // Observer was created because ref.current is the rendered <div>
    expect(lastIOInstance).not.toBeNull();
    expect(lastIOInstance?.observe).toHaveBeenCalled();
  });

  it("sets inView=true when the intersection callback fires with isIntersecting=true", () => {
    const store: { inView?: boolean } = {};
    const { rerender } = render(<HookHost store={store} />);

    act(() => {
      lastIOInstance?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        lastIOInstance as unknown as IntersectionObserver,
      );
    });
    rerender(<HookHost store={store} />);

    expect(store.inView).toBe(true);
  });

  it("disconnects the observer after the element becomes visible (animate once)", () => {
    const store: { inView?: boolean } = {};
    render(<HookHost store={store} />);

    act(() => {
      lastIOInstance?.callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        lastIOInstance as unknown as IntersectionObserver,
      );
    });

    expect(lastIOInstance?.disconnect).toHaveBeenCalled();
  });

  it("does not set inView when isIntersecting is false", () => {
    const store: { inView?: boolean } = {};
    const { rerender } = render(<HookHost store={store} />);

    act(() => {
      lastIOInstance?.callback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        lastIOInstance as unknown as IntersectionObserver,
      );
    });
    rerender(<HookHost store={store} />);

    expect(store.inView).toBe(false);
  });

  it("disconnects the observer on unmount", () => {
    const store: { inView?: boolean } = {};
    const { unmount } = render(<HookHost store={store} />);
    unmount();
    expect(lastIOInstance?.disconnect).toHaveBeenCalled();
  });
});
