const STATE_ABBREV: Record<string, string> = {
  texas: "TX",
  california: "CA",
  florida: "FL",
  new: "NY",
  "new york": "NY",
  arizona: "AZ",
  georgia: "GA",
  north: "NC",
  "north carolina": "NC",
  colorado: "CO",
  washington: "WA",
  nevada: "NV",
  oregon: "OR",
};

export function parseLocation(location: string): string[] {
  const normalized = location
    .trim()
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase();
  const parts = normalized.split(" ").filter(Boolean);
  return parts.map((p) => {
    const expanded = STATE_ABBREV[p];
    return expanded ?? p;
  });
}

export function buildPropertyQuery(
  opts: {
    budget_max?: number;
    budget_min?: number;
    location?: string;
    beds_min?: number;
    baths_min?: number;
  }
): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [
    { $or: [{ status: { $exists: false } }, { status: "active" }] },
  ];

  if (opts.budget_max != null) {
    conditions.push({ price: { $lte: opts.budget_max } });
  }
  if (opts.budget_min != null) {
    conditions.push({ price: { $gte: opts.budget_min } });
  }
  if (opts.beds_min != null) {
    conditions.push({ beds: { $gte: opts.beds_min } });
  }
  if (opts.baths_min != null) {
    conditions.push({ baths: { $gte: opts.baths_min } });
  }

  if (opts.location?.trim()) {
    const terms = parseLocation(opts.location);
    const termConditions: Record<string, unknown>[] = [];
    for (const term of terms) {
      const regex = new RegExp(escapeRegex(term), "i");
      termConditions.push({
        $or: [{ city: regex }, { state: regex }, { address: regex }, { zip: regex }],
      });
    }
    conditions.push(termConditions.length > 1 ? { $and: termConditions } : termConditions[0]);
  }

  return conditions.length > 1 ? { $and: conditions } : conditions[0];
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
