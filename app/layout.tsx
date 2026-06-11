import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ACT — Aircon Cleaning & Technician | South Metro Manila & Laguna',
  description: 'The reliability-first aircon service for South Metro Manila and South Laguna. Accredited technicians, transparent pricing, and guaranteed quality. Book online in minutes.',
  keywords: 'aircon cleaning, aircon service, South Metro Manila, South Laguna, TESDA certified, Biñan, San Pedro, Sta. Rosa, Cabuyao, Muntinlupa, Carmona, GMA Cavite',
  openGraph: {
    title: 'ACT — Aircon Cleaning & Technician',
    description: 'Accredited aircon services across South Metro Manila & South Laguna. Book in 3 minutes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
