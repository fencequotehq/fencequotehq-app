export const MATERIALS = {
  cedar: { label: "Cedar Privacy", low: 34, high: 52, lifespan: "15-25 yrs", maintenance: "Medium", privacy: "High", curb: 9, note: "Best all-around Texas homeowner choice." },
  pine: { label: "Pressure-Treated Pine", low: 26, high: 42, lifespan: "10-15 yrs", maintenance: "Medium", privacy: "High", curb: 7, note: "Budget-friendly wood option." },
  vinyl: { label: "Vinyl", low: 40, high: 65, lifespan: "20-30 yrs", maintenance: "Low", privacy: "High", curb: 8, note: "Higher upfront cost, lower maintenance." },
  chain: { label: "Chain Link", low: 18, high: 32, lifespan: "15-20 yrs", maintenance: "Low", privacy: "Low", curb: 4, note: "Lowest cost, good for pets and boundaries." },
  metal: { label: "Ornamental Metal", low: 45, high: 80, lifespan: "25+ yrs", maintenance: "Low", privacy: "Low", curb: 10, note: "Premium curb appeal and durability." },
} as const;

export const LABOR_MULTIPLIER = {
  budget: { label: "Budget", value: 0.9, badge: "Lowest price" },
  standard: { label: "Standard", value: 1.0, badge: "Best value" },
  premium: { label: "Premium", value: 1.18, badge: "Stronger build" },
} as const;

export const TERRAIN_MULTIPLIER = {
  normal: { label: "Normal Yard", value: 1.0 },
  sloped: { label: "Sloped / Hilly", value: 1.22 },
  rocky: { label: "Rocky / Hard Soil", value: 1.35 },
} as const;

export const POST_OPTIONS = {
  standard: { label: "Standard Wood Posts", value: 1.0 },
  steel: { label: "Steel Posts", value: 1.12 },
  reinforced: { label: "Concrete Reinforced", value: 1.28 },
} as const;

export const PRO_DEFAULTS = {
  hourlyRate: 55,
  crewSize: 3,
  overheadPercent: 12,
  profitPercent: 18,
  contingencyPercent: 5,
  depositPercent: 40,
  warranty: "1 year labor warranty",
  paymentTerms: "40% deposit, 60% on completion",
};

export function currency(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function todayStamp(): string {
  return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
