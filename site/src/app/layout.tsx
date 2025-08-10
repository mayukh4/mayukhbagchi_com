import type { Metadata } from "next";
import { Space_Grotesk, Chivo_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const chivoMono = Chivo_Mono({
  variable: "--font-chivo-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mayukh Bagchi - PhD Astronomy Researcher | VLBI Black Hole Imaging Expert",
    template: "%s | Mayukh Bagchi",
  },
  description:
    "Mayukh Bagchi, PhD candidate in astronomy & astrophysics specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies.",
  metadataBase: new URL("https://mayukhbagchi.com"),
  keywords: [
    "Mayukh Bagchi",
    "astronomy researcher",
    "VLBI instrumentation",
    "black hole imaging",
    "photon rings",
    "balloon-borne radio astronomy",
    "radio astronomy research",
    "astrophysics PhD",
    "VLBI expert",
    "black hole researcher",
  ],
  authors: [{ name: "Mayukh Bagchi" }],
  creator: "Mayukh Bagchi",
  publisher: "Mayukh Bagchi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://mayukhbagchi.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mayukhbagchi.com",
    siteName: "Mayukh Bagchi - Astronomy Research",
    title: "Mayukh Bagchi - PhD Astronomy Researcher | VLBI Black Hole Imaging Expert",
    description:
      "Mayukh Bagchi, PhD candidate in astronomy & astrophysics specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies.",
    images: [
      {
        url: "https://mayukhbagchi.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mayukh Bagchi - Astronomy Researcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@mayukh_bagchi",
    title: "Mayukh Bagchi - PhD Astronomy Researcher | VLBI Black Hole Imaging Expert",
    description:
      "Mayukh Bagchi, PhD candidate in astronomy & astrophysics specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies.",
    images: ["https://mayukhbagchi.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Mayukh Bagchi",
    "jobTitle": "PhD Candidate in Astronomy & Astrophysics",
    "description": "PhD candidate specializing in balloon-borne high-frequency VLBI instrumentation for black hole imaging and photon ring studies",
    "url": "https://mayukhbagchi.com",
    "sameAs": [
      "https://github.com/mayukh4",
      "https://www.linkedin.com/in/mayukh-bagchi/",
      "https://www.youtube.com/@mayukh_bagchi",
      "https://scholar.google.com/citations?user=mayukh_bagchi"
    ],
    "email": "mailto:mayukh.bagchi@queensu.ca",
    "affiliation": {
      "@type": "Organization",
      "name": "Queen's University",
      "url": "https://www.queensu.ca"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": "PhD Candidate in Astronomy & Astrophysics",
      "description": "Research in balloon-borne high-frequency VLBI instrumentation",
      "skills": ["VLBI", "Radio Astronomy", "Black Hole Imaging", "Photon Rings", "Balloon-Borne Instrumentation"]
    },
    "knowsAbout": [
      "Astronomy",
      "Astrophysics",
      "VLBI Instrumentation",
      "Black Hole Imaging",
      "Photon Rings",
      "Radio Astronomy",
      "High-Frequency VLBI"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0ea5e9" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body suppressHydrationWarning className={`${spaceGrotesk.variable} ${chivoMono.variable} antialiased min-h-screen font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <main className="px-6 md:px-8 max-w-7xl mx-auto py-8 md:py-12">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
