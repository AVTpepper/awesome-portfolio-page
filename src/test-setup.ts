import "@testing-library/jest-dom";

// jsdom does not implement IntersectionObserver — provide a no-op stub
// so components using useInView / useScrollSpy can render without throwing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_cb: IntersectionObserverCallback, _opts?: IntersectionObserverInit) {}
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
