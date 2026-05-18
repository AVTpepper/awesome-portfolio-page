import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ContactSection from "../ContactSection";

describe("ContactSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: true }),
      }),
    );
  });
  // ── Form fields ───────────────────────────────────────────────────────────
  it("renders the Name field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Name", { exact: false })).toBeInTheDocument();
  });

  it("renders the Email field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Email", { exact: false })).toBeInTheDocument();
  });

  it("renders the Subject field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
  });

  it("renders the Message field", () => {
    render(<ContactSection />);
    expect(screen.getByLabelText("Message", { exact: false })).toBeInTheDocument();
  });

  // ── Submit button state ───────────────────────────────────────────────────
  it("renders a submit button", () => {
    render(<ContactSection />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("submit button is enabled by default (form is live)", () => {
    render(<ContactSection />);
    expect(screen.getByRole("button", { name: /send message/i })).not.toBeDisabled();
  });

  // ── Controlled inputs ─────────────────────────────────────────────────────
  it("updates the name field value when the user types", () => {
    render(<ContactSection />);
    const input = screen.getByLabelText("Name", { exact: false }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jane Doe" } });
    expect(input.value).toBe("Jane Doe");
  });

  it("updates the email field value when the user types", () => {
    render(<ContactSection />);
    const input = screen.getByLabelText("Email", { exact: false }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "jane@example.com" } });
    expect(input.value).toBe("jane@example.com");
  });

  it("updates the message field value when the user types", () => {
    render(<ContactSection />);
    const textarea = screen.getByLabelText("Message", { exact: false }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Hello, I need a website." } });
    expect(textarea.value).toBe("Hello, I need a website.");
  });

  // ── Form submission ───────────────────────────────────────────────────────
  it("does not throw when the form is submitted (e.preventDefault is called)", () => {
    render(<ContactSection />);
    const form = screen.getByRole("button", { name: /send message/i }).closest("form")!;
    expect(() => fireEvent.submit(form)).not.toThrow();
  });

  // ── Live form behaviour ───────────────────────────────────────────────────
  it("shows 'Sending…' while the request is in-flight", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})), // never resolves
    );
    render(<ContactSection />);
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    expect(await screen.findByText("Sending…")).toBeInTheDocument();
  });

  it("disables the submit button while pending", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<ContactSection />);
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled(),
    );
  });

  it("shows the success message after a successful submission", async () => {
    render(<ContactSection />);
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
  });

  it("clears the form inputs after a successful submission", async () => {
    render(<ContactSection />);
    const nameInput = screen.getByLabelText("Name", { exact: false }) as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Jane" } });
    fireEvent.submit(nameInput.closest("form")!);
    await screen.findByText(/message sent/i);
    // After success, the form is replaced by the success view — inputs gone
    expect(screen.queryByLabelText("Name", { exact: false })).not.toBeInTheDocument();
  });

  it("shows the form again after clicking 'Send another message'", async () => {
    render(<ContactSection />);
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    await screen.findByText(/message sent/i);
    fireEvent.click(screen.getByRole("button", { name: /send another/i }));
    expect(screen.getByLabelText("Name", { exact: false })).toBeInTheDocument();
  });

  it("shows the API error message when the server returns ok: false", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ ok: false, error: "Name is required." }),
      }),
    );
    render(<ContactSection />);
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it("shows a network error message when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    render(<ContactSection />);
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  it("POSTs to /api/contact with form fields and honeypot", async () => {
    render(<ContactSection />);
    fireEvent.change(screen.getByLabelText("Name", { exact: false }), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("Email", { exact: false }), { target: { value: "alice@example.com" } });
    fireEvent.change(screen.getByLabelText("Message", { exact: false }), { target: { value: "Hello!" } });
    fireEvent.submit(
      screen.getByRole("button", { name: /send message/i }).closest("form")!,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(options.method).toBe("POST");
    const body = JSON.parse(options.body);
    expect(body.name).toBe("Alice");
    expect(body.email).toBe("alice@example.com");
    expect(body.message).toBe("Hello!");
    expect("website" in body).toBe(true); // honeypot field always sent
  });

  it("honeypot input is hidden from real users (aria-hidden container)", () => {
    const { container } = render(<ContactSection />);
    const honeypotWrapper = container.querySelector("[aria-hidden='true']");
    expect(honeypotWrapper).toBeInTheDocument();
    const honeypotInput = honeypotWrapper?.querySelector("input[name='website']");
    expect(honeypotInput).toBeInTheDocument();
  });
});
