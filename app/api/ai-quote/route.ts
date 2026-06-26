// app/api/ai-quote/route.ts
// Pro-tier AI quoting assistant for FenceQuoteHQ
// Requires: ANTHROPIC_API_KEY in .env.local
// Gate with Supabase session check so only Pro subscribers can call this

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────────────

type MaterialKey = "cedar" | "pine" | "vinyl" | "chain" | "metal";
type TerrainKey  = "normal" | "sloped" | "rocky";
type LaborKey    = "budget" | "standard" | "premium";
type PostKey     = "standard" | "steel" | "reinforced";

interface QuoteInput {
  length: number;
  height: 4 | 6 | 8;
  material: MaterialKey;
  terrain: TerrainKey;
  labor: LaborKey;
  postType: PostKey;
  gates: number;
  corners: number;
  removal: boolean;
  stain: boolean;
  zip: string;
}

interface QuoteResult {
  low: number;
  high: number;
  midpoint: number;
  costPerFoot: number;
  confidence: number;
  breakdown: {
    baseMaterial: number;
    laborEstimate: number;
    gates: number;
    corners: number;
    removal: number;
    stain: number;
    postUpgrade: number;
    terrainAdder: number;
  };
}

interface BidResult {
  bidPrice: number;
  materialCost: number;
  laborCost: number;
  overhead: number;
  profit: number;
  deposit: number;
  estimatedDays: number;
}

// ── Data (mirrors lib/fenceData.ts) ──────────────────────────────────────────

const MATERIALS = {
  cedar:  { label: "Cedar Privacy",         low: 34, high: 52, curb: 9  },
  pine:   { label: "Pressure-Treated Pine", low: 26, high: 42, curb: 7  },
  vinyl:  { label: "Vinyl",                 low: 40, high: 65, curb: 8  },
  chain:  { label: "Chain Link",            low: 18, high: 32, curb: 4  },
  metal:  { label: "Ornamental Metal",      low: 45, high: 80, curb: 10 },
};

const LABOR_MULTIPLIER   = { budget: 0.9,  standard: 1.0, premium: 1.18 };
const TERRAIN_MULTIPLIER = { normal: 1.0,  sloped: 1.22,  rocky: 1.35   };
const POST_MULTIPLIER    = { standard: 1.0, steel: 1.12,  reinforced: 1.28 };

const PRO_DEFAULTS = {
  hourlyRate: 55,
  crewSize: 3,
  overheadPercent: 12,
  profitPercent: 18,
  depositPercent: 40,
};

// ── Core calculation functions ────────────────────────────────────────────────

function calculateQuote(input: QuoteInput): QuoteResult {
  const mat     = MATERIALS[input.material];
  const labor   = LABOR_MULTIPLIER[input.labor];
  const terrain = TERRAIN_MULTIPLIER[input.terrain];
  const post    = POST_MULTIPLIER[input.postType];
  const heightMult = input.height === 4 ? 0.85 : input.height === 8 ? 1.2 : 1.0;

  const baseLow  = mat.low  * input.length * labor * terrain * post * heightMult;
  const baseHigh = mat.high * input.length * labor * terrain * post * heightMult;

  const gateCost    = input.gates   * 320;
  const cornerCost  = input.corners * 85;
  const removalCost = input.removal ? input.length * 3.5 : 0;
  const stainCost   = input.stain   ? input.length * 4.2 : 0;

  const low  = Math.round(baseLow  + gateCost + cornerCost + removalCost + stainCost);
  const high = Math.round(baseHigh + gateCost + cornerCost + removalCost + stainCost);
  const midpoint = Math.round((low + high) / 2);

  const filledInputs = [input.zip, input.terrain !== "normal", input.postType !== "standard"]
    .filter(Boolean).length;
  const confidence = Math.min(95, 70 + filledInputs * 8);

  return {
    low, high, midpoint,
    costPerFoot: Math.round(midpoint / input.length),
    confidence,
    breakdown: {
      baseMaterial:  Math.round(baseLow),
      laborEstimate: Math.round(baseLow * 0.4),
      gates:         gateCost,
      corners:       cornerCost,
      removal:       Math.round(removalCost),
      stain:         Math.round(stainCost),
      postUpgrade:   Math.round(baseLow * (post - 1)),
      terrainAdder:  Math.round(baseLow * (terrain - 1)),
    },
  };
}

function calculateProBid(quote: QuoteResult, input: QuoteInput): BidResult {
  const { hourlyRate, crewSize, overheadPercent, profitPercent, depositPercent } = PRO_DEFAULTS;

  const baseHours   = (input.length / 50) * 8;
  const crewHours   = baseHours * TERRAIN_MULTIPLIER[input.terrain];
  const laborCost   = Math.round(crewHours * crewSize * hourlyRate);
  const materialCost = Math.round(quote.midpoint * 0.45);
  const subtotal    = laborCost + materialCost;
  const overhead    = Math.round(subtotal * (overheadPercent / 100));
  const profit      = Math.round(subtotal * (profitPercent / 100));
  const bidPrice    = subtotal + overhead + profit;
  const deposit     = Math.round(bidPrice * (depositPercent / 100));
  const estimatedDays = Math.ceil(crewHours / 8);

  return { bidPrice, materialCost, laborCost, overhead, profit, deposit, estimatedDays };
}

function scoreContractorBid(bidAmount: number, quote: QuoteResult): {
  score: number; rating: string; verdict: string; color: string;
} {
  const { low, high } = quote;
  const buffer_low  = low  * 0.92;
  const buffer_high = high * 1.08;
  const ceiling     = high * 1.20;

  if (bidAmount < buffer_low)
    return { score: 45, rating: "Too Low",       verdict: "Bid is below market — contractor may cut corners or upcharge later.", color: "text-red-400" };
  if (bidAmount <= buffer_high)
    return { score: 95, rating: "Fair Price",    verdict: "Bid falls within the expected market range for this project.",        color: "text-emerald-400" };
  if (bidAmount <= ceiling)
    return { score: 70, rating: "Slightly High", verdict: "Bid is above average — ask for an itemized breakdown.",              color: "text-yellow-400" };
  return   { score: 30, rating: "Overpriced",    verdict: "Bid significantly exceeds market rate. Get at least 2 more quotes.", color: "text-red-500" };
}

// ── Claude tool definitions ───────────────────────────────────────────────────

const tools: Anthropic.Tool[] = [
  {
    name: "get_fence_quote",
    description: "Calculate a detailed fence installation cost estimate using FenceQuoteHQ's pricing engine. Call this whenever the user asks about fence cost, pricing, or how much a fence will cost.",
    input_schema: {
      type: "object" as const,
      properties: {
        length:   { type: "number",  description: "Total linear feet of fence" },
        height:   { type: "number",  description: "Fence height in feet: 4, 6, or 8" },
        material: { type: "string",  description: "Material type: cedar | pine | vinyl | chain | metal" },
        terrain:  { type: "string",  description: "Terrain type: normal | sloped | rocky" },
        labor:    { type: "string",  description: "Labor tier: budget | standard | premium" },
        postType: { type: "string",  description: "Post type: standard | steel | reinforced" },
        gates:    { type: "number",  description: "Number of gates" },
        corners:  { type: "number",  description: "Number of corners or turns" },
        removal:  { type: "boolean", description: "Whether old fence removal is needed" },
        stain:    { type: "boolean", description: "Whether stain/seal is included" },
        zip:      { type: "string",  description: "Customer ZIP code" },
      },
      required: ["length", "material"],
    },
  },
  {
    name: "score_contractor_bid",
    description: "Score a contractor's bid against FenceQuoteHQ market data. Call this when the user provides a contractor's quote and wants to know if it's fair.",
    input_schema: {
      type: "object" as const,
      properties: {
        bidAmount: { type: "number",  description: "The contractor's quoted price in dollars" },
        length:    { type: "number",  description: "Total linear feet of fence" },
        material:  { type: "string",  description: "Material type: cedar | pine | vinyl | chain | metal" },
        terrain:   { type: "string",  description: "Terrain type: normal | sloped | rocky" },
        labor:     { type: "string",  description: "Labor tier: budget | standard | premium" },
        postType:  { type: "string",  description: "Post type: standard | steel | reinforced" },
        gates:     { type: "number",  description: "Number of gates" },
        corners:   { type: "number",  description: "Number of corners or turns" },
        removal:   { type: "boolean", description: "Whether old fence removal is needed" },
        stain:     { type: "boolean", description: "Whether stain/seal is included" },
        zip:       { type: "string",  description: "Customer ZIP code" },
      },
      required: ["bidAmount", "length", "material"],
    },
  },
  {
    name: "generate_pro_bid",
    description: "Generate a contractor-grade bid price for a fence project including labor, materials, overhead, and profit. Call this when a contractor asks what they should charge.",
    input_schema: {
      type: "object" as const,
      properties: {
        length:   { type: "number",  description: "Total linear feet of fence" },
        material: { type: "string",  description: "Material type: cedar | pine | vinyl | chain | metal" },
        terrain:  { type: "string",  description: "Terrain type: normal | sloped | rocky" },
        labor:    { type: "string",  description: "Labor tier: budget | standard | premium" },
        postType: { type: "string",  description: "Post type: standard | steel | reinforced" },
        gates:    { type: "number",  description: "Number of gates" },
        corners:  { type: "number",  description: "Number of corners or turns" },
        removal:  { type: "boolean", description: "Old fence removal needed" },
        stain:    { type: "boolean", description: "Stain/seal included" },
        zip:      { type: "string",  description: "Project ZIP code" },
      },
      required: ["length", "material"],
    },
  },
];

// ── Tool executor ─────────────────────────────────────────────────────────────

function executeTool(name: string, input: Record<string, any>): string {
  const quoteInput: QuoteInput = {
    length:   input.length   ?? 100,
    height:   input.height   ?? 6,
    material: (input.material ?? "cedar") as MaterialKey,
    terrain:  (input.terrain  ?? "normal") as TerrainKey,
    labor:    (input.labor    ?? "standard") as LaborKey,
    postType: (input.postType ?? "standard") as PostKey,
    gates:    input.gates    ?? 0,
    corners:  input.corners  ?? 0,
    removal:  input.removal  ?? false,
    stain:    input.stain    ?? false,
    zip:      input.zip      ?? "",
  };

  if (name === "get_fence_quote") {
    const result = calculateQuote(quoteInput);
    return JSON.stringify(result);
  }

  if (name === "score_contractor_bid") {
    const quote = calculateQuote(quoteInput);
    const score = scoreContractorBid(input.bidAmount, quote);
    return JSON.stringify({ ...score, marketRange: { low: quote.low, high: quote.high } });
  }

  if (name === "generate_pro_bid") {
    const quote = calculateQuote(quoteInput);
    const bid   = calculateProBid(quote, quoteInput);
    return JSON.stringify({ ...bid, marketRange: { low: quote.low, high: quote.high } });
  }

  return JSON.stringify({ error: "Unknown tool" });
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", user.id)
      .single();

    if (!profile?.is_pro) {
      return NextResponse.json(
        { error: "Pro subscription required", upgrade: true },
        { status: 403 }
      );
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    let currentMessages = [...messages];

    while (true) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: `You are FenceQuoteHQ's AI quoting assistant — an expert in fence installation costs for Texas homeowners and contractors.

You have access to three tools powered by FenceQuoteHQ's real pricing engine:
- get_fence_quote: calculate a homeowner's cost estimate
- score_contractor_bid: evaluate whether a contractor's quote is fair
- generate_pro_bid: calculate what a contractor should charge

Always call a tool before giving cost numbers — never guess prices.
When you get tool results, present them clearly with the key numbers bolded.
Keep responses concise and actionable. Use dollar amounts from the tool results only.`,
        tools,
        messages: currentMessages,
      });

      if (response.stop_reason === "end_turn") {
        const text = response.content
          .filter(b => b.type === "text")
          .map(b => b.text)
          .join("");
        return NextResponse.json({ reply: text });
      }

      if (response.stop_reason === "tool_use") {
        const assistantMessage = { role: "assistant" as const, content: response.content };
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type === "tool_use") {
            const result = executeTool(block.name, block.input as Record<string, any>);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: result,
            });
          }
        }

        currentMessages = [
          ...currentMessages,
          assistantMessage,
          { role: "user" as const, content: toolResults },
        ];
        continue;
      }

      break;
    }

    return NextResponse.json({ error: "Unexpected response from Claude" }, { status: 500 });

  } catch (err) {
    console.error("AI quote route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
