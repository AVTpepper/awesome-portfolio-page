import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ContactSection from "../ContactSection";

describe("ContactSection", () => {
  // ── Form fields ───────────────────────────────────────────────────────────
  it("renders the Name field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("renders the Email field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders the Subject field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
  });

  it("renders the Message field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  // ── Submit button state ───────────────────────────────────────────────────
  it("renders a submit button", () => {
    render(<ContactSection />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("submit button is disabled (backend not yet wired)", () => {
    render(<ContactSection />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeDisabled();
  });

  it("shows a note that the backend is coming soon", () => {
    render(<ContactSection />);
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });

  // ── Controlled inputs ─────────────────────────────────────────────────────
  it("updates the name field value when the user types", () => {
    render(<ContactSection />);
    const input = screen.getByLabelText("Name") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jane Doe" } });
    expect(input.value).toBe("Jane Doe");
  });

  it("updates the email field value when the user types", () => {
    render(<ContactSection />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "jane@example.com" } });
    expect(input.value).toBe("jane@example.com");
  });

  it("updates the message field value when the user types", () => {
    render(<ContactSection />);
    const textarea = screen.getByLabelText("Message") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Hello, I need a website." } });
    expect(textarea.value).toBe("Hello, I need a website.");
  });

  // ── Form submission ───────────────────────────────────────────────────────
  it("does not throw when the form is submitted (e.preventDefault is called)", () => {
    render(<ContactSection />);
    const form = screen.getByRole("button", { name: /send message/i }).closest("form")!;
    expect(() => fireEvent.submit(form)).not.toThrow();
  });
});
