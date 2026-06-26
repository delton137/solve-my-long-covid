import { KB } from "../kb";
import { sigmoid, logitOf, strengthToLogit, bandFor, BAND_LABELS } from "../kb/strengths";
import type { Answers, DiagnosticTest } from "../kb/types";
import type { ScoreResult } from "./types";
import { isAnswered } from "./score";

/**
 * Value-of-information "critical test" recommender.
 *
 * For each not-yet-done test, simulate both outcomes against current beliefs:
 *   uncertainty(m) = 4·P(m)·(1−P(m))                         // entropy proxy, peaks at 0.5
 *   swing(m)       = P·|P(+)−P| + (1−P)·|P(−)−P|             // expected belief movement
 *   value(T)       = Σ uncertainty·swing·impactMultiplier·accessibility
 *   score(T)       = value(T) / max(costMidpoint, $25)        // value per dollar
 *
 * The uncertainty weight smoothly concentrates value on muddy-middle mechanisms; no hard cutoff.
 */

export interface TestTarget {
  mechanismId: string;
  name: string;
  currentP: number;
  pIfPositive: number;
  pIfNegative: number;
  swing: number;
}

export interface TestRecommendation {
  testId: string;
  name: string;
  description: string;
  costLow: number;
  costHigh: number;
  accessibility: DiagnosticTest["accessibility"];
  /** Value per dollar. */
  voiScore: number;
  /** Cost-agnostic information value. */
  infoValue: number;
  targets: TestTarget[];
  rationale: string;
}

export interface VoiResult {
  recommendations: TestRecommendation[];
  /** Cheapest test that still meaningfully moves the needle (for cost-constrained users). */
  cheapest?: TestRecommendation;
}

const ACCESSIBILITY_WEIGHT: Record<DiagnosticTest["accessibility"], number> = {
  home: 1.0,
  gp_orderable: 1.0,
  specialist: 0.85,
  research_only: 0.5,
};

const COST_FLOOR = 25; // treat anything cheaper than this as "very cheap" rather than free.
const MEANINGFUL_INFO = 0.02; // floor below which a test isn't worth surfacing.

/** A test is "done" if a result question for it has a real (non "not_done") answer. */
export function isTestDone(test: DiagnosticTest, answers: Answers): boolean {
  return test.effects.some((e) => {
    if (!e.resultQuestionId) return false;
    const a = answers[e.resultQuestionId];
    return isAnswered(a) && a !== "not_done";
  });
}

export function recommendTests(
  result: ScoreResult,
  answers: Answers,
  opts: { rankBy?: "per_dollar" | "information"; limit?: number } = {},
): VoiResult {
  const { rankBy = "per_dollar", limit = 3 } = opts;
  const pById = new Map(result.scores.map((s) => [s.mechanismId, s]));

  const recs: TestRecommendation[] = [];

  for (const test of KB.diagnosticTests) {
    if (isTestDone(test, answers)) continue;

    let value = 0;
    const targets: TestTarget[] = [];

    for (const effect of test.effects) {
      const s = pById.get(effect.mechanismId);
      if (!s) continue;
      const p = s.probability;
      const baseLogit = logitOf(p);
      const pIfPositive = sigmoid(baseLogit + strengthToLogit(effect.ifPositive));
      const pIfNegative = sigmoid(baseLogit + strengthToLogit(effect.ifNegative));
      const swing = p * Math.abs(pIfPositive - p) + (1 - p) * Math.abs(pIfNegative - p);
      const uncertainty = 4 * p * (1 - p);
      const impact = KB.mechanismById.get(effect.mechanismId)?.impactMultiplier ?? 1;
      value += uncertainty * swing * impact;
      targets.push({
        mechanismId: effect.mechanismId,
        name: s.name,
        currentP: p,
        pIfPositive,
        pIfNegative,
        swing: uncertainty * swing,
      });
    }

    value *= ACCESSIBILITY_WEIGHT[test.accessibility];
    if (value < MEANINGFUL_INFO) continue;

    const costMid = Math.max((test.costLow + test.costHigh) / 2, COST_FLOOR);
    targets.sort((a, b) => b.swing - a.swing);

    recs.push({
      testId: test.id,
      name: test.name,
      description: test.description,
      costLow: test.costLow,
      costHigh: test.costHigh,
      accessibility: test.accessibility,
      voiScore: value / costMid,
      infoValue: value,
      targets,
      rationale: buildRationale(targets),
    });
  }

  const key = rankBy === "information" ? "infoValue" : "voiScore";
  recs.sort((a, b) => b[key] - a[key]);

  // Cheapest test that still meaningfully informs (by upper-bound cost).
  const meaningful = recs.filter((r) => r.infoValue >= MEANINGFUL_INFO);
  const cheapest = meaningful.length
    ? [...meaningful].sort((a, b) => a.costHigh - b.costHigh || b.infoValue - a.infoValue)[0]
    : undefined;

  return { recommendations: recs.slice(0, limit), cheapest };
}

function buildRationale(targets: TestTarget[]): string {
  if (!targets.length) return "";
  const t = targets[0];
  const up = BAND_LABELS[bandFor(t.pIfPositive)].toLowerCase();
  const down = BAND_LABELS[bandFor(t.pIfNegative)].toLowerCase();
  return `If positive, ${t.name} would become ${up}; if negative, it would drop toward ${down}.`;
}
