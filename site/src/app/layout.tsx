import type { Metadata } from "next";
import { Space_Grotesk, Chivo_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { generateWebsiteStructuredData, generatePersonStructuredData } from "@/lib/structured-data";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

const chivoMono = Chivo_Mono({
  variable: "--font-chivo-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'monospace'],
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
  const websiteStructuredData = generateWebsiteStructuredData();
  const personStructuredData = generatePersonStructuredData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0ea5e9" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('SW registered: ', registration);
                  }).catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
                });
              }
            `,
          }}
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
