/**
 * The single source of truth for how qualitative evidence strengths map to log-odds.
 *
 * The whole inference engine accumulates LOG-ODDS (logits). Authors never think in
 * raw logits — they pick a coarse, human-meaningful strength label, and this table
 * converts it. Re-calibrating the entire tool is a one-file edit here.
 *
 * Why log-odds: evidence combines additively, and a single mechanism's score is just
 * the sum of its contributions — which is exactly what makes the "why did this score
 * high?" ledger fall out for free.
 */

export const EVIDENCE_STRENGTHS = [
  "pathognomonic", // near-certain positive (rare): a finding that all-but-confirms the mechanism
  "strong_for",
  "moderate_for",
  "weak_for",
  "weak_against",
  "moderate_against",
  "strong_against",
  "excludes", // a gold-standard negative that all-but-rules the mechanism out
] as const;

export type EvidenceStrength = (typeof EVIDENCE_STRENGTHS)[number];

/** Logit (log-odds) delta contributed by each strength. */
export const STRENGTH_TO_LOGIT: Record<EvidenceStrength, number> = {
  pathognomonic: 3.0,
  strong_for: 1.4,
  moderate_for: 0.7,
  weak_for: 0.3,
  weak_against: -0.3,
  moderate_against: -0.7,
  strong_against: -1.4,
  excludes: -5.0,
};

export function strengthToLogit(s: EvidenceStrength): number {
  return STRENGTH_TO_LOGIT[s];
}

// ── Probability <-> log-odds ────────────────────────────────────────────

export function sigmoid(logit: number): number {
  // numerically stable
  if (logit >= 0) {
    const z = Math.exp(-logit);
    return 1 / (1 + z);
  }
  const z = Math.exp(logit);
  return z / (1 + z);
}

export function logitOf(p: number): number {
  const clamped = Math.min(1 - 1e-9, Math.max(1e-9, p));
  return Math.log(clamped / (1 - clamped));
}

// ── Probability bands (how scores are shown to users) ───────────────────

export const BANDS = ["unlikely", "possible", "likely", "very_likely"] as const;
export type Band = (typeof BANDS)[number];

/** Lower probability bound for each band. */
export const BAND_THRESHOLDS: Record<Band, number> = {
  unlikely: 0,
  possible: 0.3,
  likely: 0.6,
  very_likely: 0.85,
};

export function bandFor(probability: number): Band {
  if (probability >= BAND_THRESHOLDS.very_likely) return "very_likely";
  if (probability >= BAND_THRESHOLDS.likely) return "likely";
  if (probability >= BAND_THRESHOLDS.possible) return "possible";
  return "unlikely";
}

export const BAND_LABELS: Record<Band, string> = {
  unlikely: "Unlikely",
  possible: "Possible",
  likely: "Likely",
  very_likely: "Very likely",
};

/** Mechanisms whose probability sits in this window are the "muddy middle" the VOI engine targets. */
export const MUDDY_MIDDLE = { low: 0.3, high: 0.7 } as const;
