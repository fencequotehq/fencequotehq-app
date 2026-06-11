import type { Metadata } from "next";
import FenceQuoteApp from "@/components/FenceQuoteApp";

export const metadata: Metadata = {
  title: "Fence Cost Calculator Texas | Free Instant Estimate | FenceQuoteHQ",
  description: "Get an instant fence installation cost estimate for your Texas home. Serving DFW, Houston, Austin, San Antonio & all of Texas.",
  openGraph: {
    title: "Fence Cost Calculator Texas | FenceQuoteHQ",
    description: "Instant fence installation estimates for Texas homeowners.",
    url: "https://fencequotehq.com",
    siteName: "FenceQuoteHQ",
    type: "website",
  },
  alternates: {
    canonical: "https://fencequotehq.com",
  },
};

export default function Home() {
  return <FenceQuoteApp />;
}
