import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CookieConsent from "../CookieConsent";

// next/script has no test double — render it as a plain <script> element
vi.mock("next/script", () => ({
  default: ({ id, src, children }: { id?: string; src?: string; children?: React.ReactNode }) =>
    src ? <script src={src} data-testid={id ?? "ga-script"} /> : <script id={id}>{children}</script>,
}));

const GA_ID = "G-TEST1234";

beforeEach(() => {
  localStorage.clear();
});

describe("CookieConsent — initial render", () => {
  it("shows the consent banner when no localStorage entry exists", () => {
    render(<CookieConsent gaId={GA_ID} />);
    expect(screen.getByRole("dialog", { name: /cookie consent/i })).toBeInTheDocument();
  });

  it("does not show the banner when the user has already accepted", () => {
    localStorage.setItem("ga_consent", "granted");
    render(<CookieConsent gaId={GA_ID} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not show the banner when the user has already declined", () => {
    localStorage.setItem("ga_consent", "denied");
    render(<CookieConsent gaId={GA_ID} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("CookieConsent — Accept button", () => {
  it("hides the banner after clicking Accept", () => {
    render(<CookieConsent gaId={GA_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("writes 'granted' to localStorage after accepting", () => {
    render(<CookieConsent gaId={GA_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    expect(localStorage.getItem("ga_consent")).toBe("granted");
  });
});

describe("CookieConsent — Decline button", () => {
  it("hides the banner after clicking Decline", () => {
    render(<CookieConsent gaId={GA_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("writes 'denied' to localStorage after declining", () => {
    render(<CookieConsent gaId={GA_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(localStorage.getItem("ga_consent")).toBe("denied");
  });
});

describe("CookieConsent — GA4 Script injection", () => {
  it("does not inject GA script before consent is given", () => {
    render(<CookieConsent gaId={GA_ID} />);
    expect(screen.queryByTestId("ga-script")).not.toBeInTheDocument();
  });

  it("injects GA script after user accepts", () => {
    render(<CookieConsent gaId={GA_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    const script = screen.getByTestId("ga-script");
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("src", expect.stringContaining(GA_ID));
  });

  it("does not inject GA script after user declines", () => {
    render(<CookieConsent gaId={GA_ID} />);
    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(screen.queryByTestId("ga-script")).not.toBeInTheDocument();
  });

  it("injects GA script on load when consent was previously granted", () => {
    localStorage.setItem("ga_consent", "granted");
    render(<CookieConsent gaId={GA_ID} />);
    const script = screen.getByTestId("ga-script");
    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("src", expect.stringContaining(GA_ID));
  });
});
