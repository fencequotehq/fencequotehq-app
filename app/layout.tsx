import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FenceQuoteHQ | Fence Cost Calculator & Contractor Bid Software",
  description: "FenceQuoteHQ helps Texas homeowners estimate fence costs, compare contractor quotes, and generate contractor-grade fence planning reports.",
  openGraph: {
    title: "FenceQuoteHQ",
    description: "Fence planning, cost estimating, quote scoring, and contractor proposal software.",
    url: "https://fencequotehq.com",
    siteName: "FenceQuoteHQ",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
