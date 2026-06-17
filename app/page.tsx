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

import Link from "next/link";

export default function Home() {
  return (
    <>
      <FenceQuoteApp />
      <section className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
          <p className="text-slate-400">
            Want to understand fence pricing better?{" "}
            <Link href="/blog/why-my-fence-quote-expensive" className="font-bold text-orange-400 hover:text-orange-300 underline">
              Read: Why Is My Fence Quote So Expensive?
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
