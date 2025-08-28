import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin - Mayukh Bagchi",
  description: "Administrative interface",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    nocache: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex, nocache" />
      {children}
    </>
  );
}

