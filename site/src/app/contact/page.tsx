import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Mayukh Bagchi for research collaboration, speaking engagements, or astronomy consultation. PhD astronomy researcher specializing in VLBI instrumentation.",
  keywords: [
    "Mayukh Bagchi contact",
    "astronomy research collaboration",
    "VLBI instrumentation consultation",
    "black hole imaging research",
    "radio astronomy expert contact",
    "PhD astronomy collaboration",
    "research speaking engagements",
    "astronomy consultation services"
  ],
  openGraph: {
    title: "Contact Mayukh Bagchi - Astronomy Research Collaboration",
    description: "Get in touch with Mayukh Bagchi for research collaboration, speaking engagements, or astronomy consultation.",
    type: "website",
  },
};

import Image from "next/image";
import dynamic from "next/dynamic";
import { ContactForm } from "@/components/contact-form";

// Lazy load VLBI background
const VLBIBackground = dynamic(() => import("@/components/vlbi-background"), {
  loading: () => null,
});

export default function ContactPage() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <VLBIBackground mode="contact" targetSelector="#contact-form-panel" />
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 md:px-8 py-6 md:py-8">
        <h1 className="font-sans text-4xl md:text-5xl font-semibold tracking-tight">Contact me</h1>
        <p className="mt-3 text-foreground/80 max-w-2xl">
          I read everything that comes in. You can also email me directly at {" "}
          <a className="text-accent underline underline-offset-4" href="mailto:mayukh.bagchi@queensu.ca" target="_blank" rel="noreferrer">mayukh.bagchi@queensu.ca</a>.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
          <div className="relative rounded-2xl overflow-hidden border border-muted/40 shadow-2xl md:h-[62vh]">
            <Image
              src="/contact_page_mayukh_bagchi.webp"
              width={900}
              height={1200}
              alt="Mayukh Bagchi"
              className="w-full h-full object-cover select-none"
              priority
            />
          </div>
          <div
            id="contact-form-panel"
            className="relative rounded-2xl border p-6 md:p-7 md:h-[62vh] flex items-center backdrop-blur-2xl border-[hsl(var(--muted)/0.18)] bg-[hsl(var(--background)/0.02)]"
          >
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}


