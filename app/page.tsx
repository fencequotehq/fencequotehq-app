I can see exactly what happened — my chat instructions got pasted into the file instead of the actual code. The same problem as before.

Let's fix it right now. Go to GitHub → `app/page.tsx` → click the **pencil icon** to edit → **Ctrl+A → Delete** → then paste this code directly:

```tsx
import type { Metadata } from "next";
import FenceQuoteApp from "@/components/FenceQuoteApp";

export const metadata: Metadata = {
  title: "Fence Cost Calculator Texas | Free Instant Estimate | FenceQuoteHQ",
  description: "Get an instant fence installation cost estimate for your Texas home. Cedar, vinyl, chain link & metal fencing. See material takeoff, contractor quote scoring, and download a free PDF estimate. Serving DFW, Houston, Austin, San Antonio & all of Texas.",
  openGraph: {
    title: "Fence Cost Calculator Texas | FenceQuoteHQ",
    description: "Instant fence installation estimates for Texas homeowners. Know your fence cost before contractors call back.",
    url: "https://fencequotehq.com",
    siteName: "FenceQuoteHQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fence Cost Calculator Texas | FenceQuoteHQ",
    description: "Instant fence installation estimates for Texas homeowners. Know your fence cost before contractors call back.",
  },
  alternates: {
    canonical: "https://fencequotehq.com",
  },
};

export default function Home() {
  return (
    <>
      <FenceQuoteApp />
      <section className="bg-slate-950 px-5 py-12 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-black text-white">Fence Cost Estimator for Texas Homeowners</h2>
              <p className="text-slate-400 leading-relaxed">FenceQuoteHQ is a free fence cost calculator built specifically for Texas homeowners in the DFW Metroplex, Houston, Austin, San Antonio, and surrounding areas. Get an instant estimate for cedar privacy fence, pressure-treated pine, vinyl, chain link, or ornamental metal fencing — including labor, removal of old fencing, gates, post systems, and terrain adjustments.</p>
              <p className="mt-4 text-slate-400 leading-relaxed">Our fence installation cost calculator uses real local market data to give you a planning range you can trust before you ever call a contractor. The average 150-foot cedar privacy fence in the DFW area costs between $7,000 and $12,000 installed.</p>
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-black text-white">Fence Contractor Proposal Software</h2>
              <p className="text-slate-400 leading-relaxed">FenceQuoteHQ Pro Mode is free contractor proposal software for Texas fence contractors. Generate professional bid proposals with material takeoff, labor hours, overhead, profit margin, and deposit calculations — then download a signed PDF proposal to send to customers. Built for solo operators and small fence crews across Arlington, Dallas, Fort Worth, Plano, Frisco, McKinney, and all of North Texas.</p>
              <p className="mt-4 text-slate-400 leading-relaxed">Use the Contractor Quote Score to evaluate bids — instantly see if a quote is fair, slightly high, or suspiciously low based on real market data for your zip code.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { title: "Cedar Privacy Fence Cost Texas", text: "$34–$52 per linear foot installed. Most popular choice for Texas homeowners. 15–25 year lifespan." },
              { title: "Vinyl Fence Cost Texas", text: "$40–$65 per linear foot installed. Low maintenance, 20–30 year lifespan." },
              { title: "Chain Link Fence Cost Texas", text: "$18–$32 per linear foot installed. Most affordable option for pets and boundaries." },
              { title: "Ornamental Metal Fence Cost Texas", text: "$45–$80 per linear foot installed. Premium curb appeal, 25+ year lifespan." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-2 font-black text-white">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-black text-white">Frequently Asked Questions — Fence Cost in Texas</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { q: "How much does a fence cost in Texas?", a: "A typical 150-foot privacy fence in Texas costs between $6,000 and $12,000 installed, depending on material, terrain, gates, and contractor tier." },
                { q: "How much does it cost to fence a backyard in DFW?", a: "For a standard DFW backyard expect $5,000–$9,000 for cedar privacy fencing installed, including one gate and standard flat terrain." },
                { q: "How do I get a fence estimate?", a: "Use the FenceQuoteHQ calculator above to get an instant planning estimate. Enter your zip code, fence length, height, material, and options." },
                { q: "What is the cheapest fence option in Texas?", a: "Chain link fencing is the most affordable at $18–$32 per linear foot installed. Pressure-treated pine is the most affordable wood option at $26–$42 per linear foot." },
                { q: "How long does fence installation take in Texas?", a: "A typical residential fence job takes 1–3 working days for a standard crew of 3. Rocky terrain or large gates can add time." },
                { q: "Do I need a permit for a fence in Texas?", a: "Most Texas cities require a permit for fences over 6 feet tall or over 200 linear feet. FenceQuoteHQ automatically adds a $125 permit allowance for qualifying projects." },
              ].map((item) => (
                <div key={item.q} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h3 className="mb-2 font-bold text-white">{item.q}</h3>
                  <p className="text-sm text-slate-400">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", "name": "FenceQuoteHQ", "description": "Free fence cost calculator and contractor proposal software for Texas homeowners and fence contractors.", "url": "https://fencequotehq.com", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Web", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }, "areaServed": { "@type": "State", "name": "Texas" } }) }} />
    </>
  );
}
```

Copy everything between the triple backticks and paste it into the GitHub editor. Commit when done.
