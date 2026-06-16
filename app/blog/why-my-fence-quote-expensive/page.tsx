import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Why Is My Fence Quote So Expensive? | FenceQuoteHQ",
  description: "Confused why fence quotes vary so much? Learn the hidden costs, material vs labor breakdown, and what contractors don't always explain upfront.",
  alternates: {
    canonical: "https://fencequotehq.com/blog/why-is-my-fence-quote-expensive",
  },
};

export default function BlogPost() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-5 py-12 md:px-10">
      <article className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Fence Costs Explained</p>
        <h1 className="mb-6 text-3xl font-black md:text-5xl">Why Is My Fence Quote So Expensive?</h1>
        <p className="mb-8 text-lg text-slate-400">
          You called two or three fence contractors and got back numbers that don't seem to make sense. One quote is $6,000. Another is $11,000. For the same fence. Here's what's actually driving that gap.
        </p>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">1. Material cost isn't the same everywhere</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          Cedar, vinyl, and metal prices fluctuate based on supplier relationships, current lumber market conditions, and how much a contractor buys in bulk. A contractor with strong supplier relationships might pay 15-20% less for the same cedar board than a smaller operation buying in low volume. That savings either gets passed to you or pocketed as extra margin.
        </p>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">2. Labor is the biggest variable, not materials</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          Most homeowners assume the wood or vinyl panels are the expensive part. They're usually not. Labor — digging post holes, setting concrete, framing, hanging panels, cleanup — typically makes up 40-60% of your total cost. A crew that works faster, has better equipment, or simply prices their time higher will produce a very different number than a one-man operation working slower for less.
        </p>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">3. Removal of your old fence costs extra — and it's often not in the first number you hear</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          If you have an existing fence that needs to come down, that's additional demolition and haul-off labor. Some contractors include it in their initial quote. Others quietly leave it out, give you a lower number to win the job, then add it later as a change order. Always ask directly: "Does this price include removing my old fence?"
        </p>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">4. Terrain and yard conditions change everything</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          A flat, easy-access backyard is fast and cheap to fence. A sloped yard, rocky soil, or a yard with limited equipment access can slow a crew down significantly and increase labor hours. This is one of the most common reasons two quotes for "the same fence" come back wildly different — one contractor walked your yard and accounted for the slope, the other didn't.
        </p>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">5. Post systems aren't all equal</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          Standard wood posts, steel posts, and concrete-reinforced posts all cost differently and take different amounts of time to install. Steel and reinforced posts last longer and resist rot and wind damage better, but they cost more upfront. A lower quote might be using cheaper posts that won't hold up as long.
        </p>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">6. Permits, gates, and corners add up fast</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          Gates aren't just an extra panel — they require additional hardware, framing, and labor. Corners and turns slow installation down compared to a straight run. And depending on your city, fences over a certain height or length may require a permit, which adds cost and time. None of these are hidden fees if a contractor is upfront about them, but they're easy to leave out of a quick verbal estimate.
        </p>

        <div className="my-12 rounded-2xl border border-orange-400/30 bg-orange-500/10 p-6">
          <h3 className="mb-2 text-xl font-black text-white">Not sure if your quote is fair?</h3>
          <p className="mb-4 text-slate-300">
            Use the FenceQuoteHQ Contractor Quote Score to instantly check if a bid is in a reasonable range for your zip code, fence length, and material — or if it's worth getting a second opinion.
          </p>
          <Link
            href="/#calculator"
            className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 font-bold hover:bg-orange-600 transition"
          >
            Check Your Quote Now
          </Link>
        </div>

        <h2 className="mb-3 mt-10 text-2xl font-black text-white">The bottom line</h2>
        <p className="mb-6 text-slate-300 leading-relaxed">
          A fence quote isn't expensive or cheap in a vacuum — it's a reflection of materials, labor rate, yard conditions, post system, and scope. The best way to know if you're being quoted fairly is to compare against real local market data, not just gut feeling. That's exactly what FenceQuoteHQ's calculator and Quote Score tool are built to do.
        </p>
      </article>
    </main>
  );
}