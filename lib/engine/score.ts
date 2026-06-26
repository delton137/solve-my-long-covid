import { KB } from "../kb";
import {
  sigmoid,
  strengthToLogit,
  bandFor,
  BAND_THRESHOLDS,
  type EvidenceStrength,
} from "../kb/strengths";
import type { Answers, AnswerValue, Question, WhenAnswer, MechanismId } from "../kb/types";
import type { Contribution, MechanismScore, ScoreResult } from "./types";

/**
 * The inference engine: a transparent weighted log-odds model.
 *
 *   logit(m) = prior + Σ(evidence weights from matched answers)
 *              + Σ(causal-web propagation) + Σ(exclusion-diagnosis boost)
 *   P(m)     = sigmoid(logit(m))
 *
 * Pure and deterministic. Every contribution is recorded so the "why this scored" ledger is
 * just the (sorted) list of contributions — no separate explanation logic.
 */

// ── Answer matching ─────────────────────────────────────────────────────

/** Does `answer` satisfy an EvidenceLink / dependsOn `whenAnswer` condition? */
export function answerMatches(answer: AnswerValue | undefined, when: WhenAnswer): boolean {
  if (answer === undefined || answer === null) return false;
  if (when === true) return answer === true;
  if (typeof when === "string") {
    if (Array.isArray(answer)) return answer.includes(when);
    return answer === when;
  }
  // numeric range
  if (typeof answer !== "number") return false;
  if (when.gte !== undefined && answer < when.gte) return false;
  if (when.lte !== undefined && answer > when.lte) return false;
  return when.gte !== undefined || when.lte !== undefined;
}

/** Is a question shown, given its dependsOn and current answers? */
export function isQuestionApplicable(q: Question, answers: Answers): boolean {
  if (!q.dependsOn) return true;
  const dep = answers[q.dependsOn.questionId];
  if (dep === undefined) return false;
  const { equals } = q.dependsOn;
  if (equals === true) return dep === true;
  const wanted = Array.isArray(equals) ? equals : [equals];
  if (Array.isArray(dep)) return dep.some((d) => wanted.includes(d));
  return typeof dep === "string" && wanted.includes(dep);
}

/** Has a question been meaningfully answered (non-empty)? */
export function isAnswered(answer: AnswerValue | undefined): boolean {
  if (answer === undefined || answer === null) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "string") return answer.length > 0;
  return true; // boolean false and numeric 0 still count as answered
}

// ── Scoring ─────────────────────────────────────────────────────────────

interface Accumulator {
  prior: number;
  evidence: number;
  contributions: Contribution[];
}

export function score(answers: Answers): ScoreResult {
  const acc = new Map<MechanismId, Accumulator>();
  for (const m of KB.mechanisms) {
    acc.set(m.id, {
      prior: m.priorLogit,
      evidence: 0,
      contributions: [
        {
          source: "Base rate",
          detail: "How common this mechanism is before considering your answers.",
          delta: m.priorLogit,
          isPrior: true,
        },
      ],
    });
  }

  // 1. Independent evidence from matched answers.
  let answeredCount = 0;
  let applicableCount = 0;
  for (const q of KB.questions) {
    if (!isQuestionApplicable(q, answers)) continue;
    applicableCount += 1;
    const answer = answers[q.id];
    if (!isAnswered(answer)) continue;
    answeredCount += 1;
    for (const link of q.evidence) {
      if (!answerMatches(answer, link.whenAnswer)) continue;
      const a = acc.get(link.mechanismId)!;
      const delta = strengthToLogit(link.strength);
      a.evidence += delta;
      a.contributions.push({
        source: q.prompt,
        detail: link.rationale,
        delta,
        strength: link.strength,
        factorType: link.factorType,
      });
    }
  }

  // Pre-propagation probabilities (used to decide which influence edges fire — order-independent).
  const independentP = new Map<MechanismId, number>();
  for (const m of KB.mechanisms) {
    const a = acc.get(m.id)!;
    independentP.set(m.id, sigmoid(a.prior + a.evidence));
  }

  // 2. Causal-web propagation: one bounded pass.
  for (const edge of KB.influences) {
    if ((independentP.get(edge.source) ?? 0) <= 0.6) continue;
    const target = acc.get(edge.target)!;
    const delta = strengthToLogit(edge.strength);
    target.evidence += delta;
    target.contributions.push({
      source: `Linked to: ${KB.mechanismById.get(edge.source)!.name}`,
      detail: edge.rationale,
      delta,
      strength: edge.strength,
      fromPropagation: true,
    });
  }

  // 3. Exclusion-diagnosis boost for false_fatigue_alarms: it rises as organic mechanisms are
  //    ACTIVELY ruled out (the user supplied against-evidence that drove them low), not merely
  //    when they're absent. Capped to avoid runaway.
  const ffa = acc.get("false_fatigue_alarms");
  if (ffa) {
    let boosts = 0;
    const MAX_BOOSTS = 4;
    for (const m of KB.mechanisms) {
      if (boosts >= MAX_BOOSTS) break;
      if (m.id === "false_fatigue_alarms") continue;
      if (m.category !== "organic") continue;
      const a = acc.get(m.id)!;
      const ruledOut = a.evidence < -0.3 && sigmoid(a.prior + a.evidence) < BAND_THRESHOLDS.possible;
      if (!ruledOut) continue;
      const delta = strengthToLogit("weak_for");
      ffa.evidence += delta;
      ffa.contributions.push({
        source: `Ruled out: ${m.name}`,
        detail: `${m.name} appears unlikely, which raises the chance that an over-protective nervous system is contributing. This is reached by exclusion, not a positive test.`,
        delta,
        strength: "weak_for",
        fromExclusion: true,
      });
      boosts += 1;
    }
  }

  // 4. Finalize.
  const scores: MechanismScore[] = KB.mechanisms.map((m) => {
    const a = acc.get(m.id)!;
    const logit = a.prior + a.evidence;
    const probability = sigmoid(logit);
    const contributions = [...a.contributions].sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
    return {
      mechanismId: m.id,
      name: m.name,
      category: m.category,
      isExclusionDiagnosis: m.isExclusionDiagnosis,
      logit,
      probability,
      band: bandFor(probability),
      evidenceLogit: a.evidence,
      hasEvidence: Math.abs(a.evidence) > 1e-9,
      contributions,
    };
  });

  scores.sort((x, y) => y.probability - x.probability);

  const pemAnswer = answers[KB.pemScreenId];
  const pemAnswered = isAnswered(pemAnswer);
  const pemActive = pemAnswer === "yes_clearly" || pemAnswer === "sometimes";

  return { scores, pemActive, pemAnswered, answeredCount, applicableCount };
}

// Re-export for convenience in the UI.
export type { MechanismScore, ScoreResult, Contribution } from "./types";
export type { EvidenceStrength };
