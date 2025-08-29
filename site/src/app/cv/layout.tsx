import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "CV",
  description: "Download Mayukh Bagchi's CV - PhD candidate in astronomy specializing in VLBI instrumentation, black hole imaging, and balloon-borne radio astronomy research.",
  keywords: [
    "Mayukh Bagchi CV",
    "astronomy researcher CV",
    "VLBI instrumentation resume", 
    "PhD astronomy CV",
    "radio astronomy researcher profile",
    "black hole imaging expert CV",
    "academic CV astronomy",
    "researcher resume download"
  ],
  authors: [{ name: "Mayukh Bagchi" }],
  creator: "Mayukh Bagchi",
  publisher: "Mayukh Bagchi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "CV - Mayukh Bagchi | PhD Astronomy Researcher",
    description: "Download Mayukh Bagchi's CV - PhD candidate in astronomy specializing in VLBI instrumentation and black hole imaging research.",
    type: "website",
    url: "https://mayukhbagchi.com/cv",
    images: [
      {
        url: "https://mayukhbagchi.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mayukh Bagchi CV",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV - Mayukh Bagchi | PhD Astronomy Researcher", 
    description: "Download academic CV - PhD candidate specializing in VLBI instrumentation and black hole imaging.",
    images: ["https://mayukhbagchi.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://mayukhbagchi.com/cv",
  },
};

export default function CVLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
