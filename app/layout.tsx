import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ACT — Aircon Cleaning & Technician | Metro Manila',
  description: 'Metro Manila\'s reliability-first aircon service. Accredited technicians, transparent pricing, and guaranteed quality. Book online in minutes.',
  keywords: 'aircon cleaning, aircon service, Metro Manila, TESDA certified, Quezon City, Makati, Pasig, Taguig, Mandaluyong, Parañaque',
  openGraph: {
    title: 'ACT — Aircon Cleaning & Technician',
    description: 'Accredited aircon services across Metro Manila. Book in 3 minutes.',
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
