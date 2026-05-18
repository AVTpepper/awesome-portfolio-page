import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RevealOnScroll from "../RevealOnScroll";

// Control what useInView returns so we can test both states without real IO.
const { mockUseInView } = vi.hoisted(() => ({
  mockUseInView: vi.fn(),
}));

vi.mock("@/hooks/useInView", () => ({
  useInView: mockUseInView,
}));

describe("RevealOnScroll", () => {
  const divRef = { current: null };

  beforeEach(() => {
    mockUseInView.mockReturnValue({ ref: divRef, inView: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders its children", () => {
    render(
      <RevealOnScroll>
        <span>Hello world</span>
      </RevealOnScroll>,
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("applies opacity-0 and translate-y-6 when not in view", () => {
    const { container } = render(
      <RevealOnScroll>
        <span>content</span>
      </RevealOnScroll>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("opacity-0");
    expect(wrapper.className).toContain("translate-y-6");
  });

  it("applies opacity-100 and translate-y-0 when in view", () => {
    mockUseInView.mockReturnValue({ ref: divRef, inView: true });
    const { container } = render(
      <RevealOnScroll>
        <span>content</span>
      </RevealOnScroll>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("opacity-100");
    expect(wrapper.className).toContain("translate-y-0");
  });

  it("forwards an extra className to the wrapper div", () => {
    const { container } = render(
      <RevealOnScroll className="extra-class">
        <span>content</span>
      </RevealOnScroll>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("extra-class");
  });

  it("adds a delay class when the delay prop is provided", () => {
    const { container } = render(
      <RevealOnScroll delay="delay-300">
        <span>content</span>
      </RevealOnScroll>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("delay-300");
  });
});
