"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setStatus("sending");

    try {
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send");
      }
      
      if (data.ok) {
        setStatus("sent");
        const form = e.currentTarget as HTMLFormElement;
        if (form) {
          form.reset();
        }
      } else {
        throw new Error(data.error || "Failed to send");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 w-full">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground/80">Name</label>
        <input id="name" name="name" type="text" required className="mt-1 w-full rounded-md border border-muted/50 bg-background/15 backdrop-blur-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--ring)]" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80">Email</label>
        <input id="email" name="email" type="email" required className="mt-1 w-full rounded-md border border-muted/50 bg-background/15 backdrop-blur-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--ring)]" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-foreground/80">Message</label>
        <textarea id="message" name="message" rows={6} required className="mt-1 w-full rounded-md border border-muted/50 bg-background/15 backdrop-blur-md px-3 py-2 outline-none focus:ring-2 focus:ring-[var(--ring)]" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={status === "sending"} className="inline-flex items-center justify-center rounded-md border border-muted/60 px-4 py-2 hover:border-accent/60 transition-colors disabled:opacity-60">
          {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : "Send message"}
        </button>
        <a href="mailto:mayukh.bagchi@queensu.ca" target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline underline-offset-4">or email me directly</a>
      </div>
    </form>
  );
}


