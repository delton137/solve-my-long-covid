import { describe, it, expect } from "vitest";
import { score, answerMatches, isQuestionApplicable } from "./score";
import { KB } from "../kb";
import { strengthToLogit } from "../kb/strengths";
import type { Answers } from "../kb/types";

function byId(result: ReturnType<typeof score>, id: string) {
  return result.scores.find((s) => s.mechanismId === id)!;
}

describe("answerMatches", () => {
  it("matches boolean true", () => {
    expect(answerMatches(true, true)).toBe(true);
    expect(answerMatches(false, true)).toBe(false);
    expect(answerMatches(undefined, true)).toBe(false);
  });
  it("matches single string equality and multi inclusion", () => {
    expect(answerMatches("yes", "yes")).toBe(true);
    expect(answerMatches("no", "yes")).toBe(false);
    expect(answerMatches(["a", "b"], "b")).toBe(true);
    expect(answerMatches(["a"], "b")).toBe(false);
  });
  it("matches numeric ranges inclusively", () => {
    expect(answerMatches(35, { gte: 30 })).toBe(true);
    expect(answerMatches(30, { gte: 30 })).toBe(true);
    expect(answerMatches(29, { gte: 30 })).toBe(false);
    expect(answerMatches(10, { lte: 15 })).toBe(true);
    expect(answerMatches(20, { lte: 15 })).toBe(false);
  });
});

describe("isQuestionApplicable", () => {
  const risky = KB.questionById.get("risky_meds")!;
  it("hides dependent question until its dependency matches", () => {
    expect(isQuestionApplicable(risky, {})).toBe(false);
    expect(isQuestionApplicable(risky, { supplement_count: "none" })).toBe(false);
    expect(isQuestionApplicable(risky, { supplement_count: "many" })).toBe(true);
  });
});

describe("score — baseline", () => {
  it("is deterministic", () => {
    const a: Answers = { orthostatic: "yes_strongly", pem: "yes_clearly" };
    expect(score(a)).toEqual(score(a));
  });

  it("with no answers, every mechanism sits at its prior with no evidence", () => {
    const r = score({});
    expect(r.answeredCount).toBe(0);
    expect(r.pemAnswered).toBe(false);
    for (const s of r.scores) {
      expect(s.hasEvidence).toBe(false);
      expect(s.evidenceLogit).toBeCloseTo(0, 9);
      // contributions contains only the prior
      expect(s.contributions.every((c) => c.isPrior)).toBe(true);
    }
  });
});

describe("score — additivity", () => {
  it("adds exactly the strong_for logit for a single strong orthostatic answer", () => {
    const mech = KB.mechanismById.get("autonomic_pots")!;
    const r = score({ orthostatic: "yes_strongly" });
    const s = byId(r, "autonomic_pots");
    // No propagation (P stays < 0.6) and no exclusion, so logit = prior + strong_for.
    expect(s.logit).toBeCloseTo(mech.priorLogit + strengthToLogit("strong_for"), 6);
    expect(s.evidenceLogit).toBeCloseTo(strengthToLogit("strong_for"), 6);
    expect(s.hasEvidence).toBe(true);
  });
});

describe("score — worked sample patient", () => {
  // 8mo post-confirmed infection; relapsing with PEM crashes; racing heart + dizziness on
  // standing (HR +35); brain fog; unrefreshing sleep; no prior mental-health history; 6
  // post-onset supplements.
  const patient: Answers = {
    confirmed_infection: "confirmed",
    acute_severity: "moderate",
    prior_mood_history: "neither",
    prior_ebv: false,
    ongoing_stress: false,
    onset_timing: "during_after",
    trajectory: "relapsing",
    inactive_weeks: true,
    pem: "yes_clearly",
    orthostatic: "yes_strongly",
    symptoms_core: ["palpitations", "brain_fog", "unrefreshing_sleep", "fatigue"],
    lab_standing_hr: 35,
    supplement_count: "many",
    risky_meds: ["other_unproven"],
    lab_med_review: "not_done",
  };

  it("flags POTS as very likely", () => {
    const s = byId(score(patient), "autonomic_pots");
    expect(s.band).toBe("very_likely");
    expect(s.probability).toBeGreaterThan(0.8);
  });

  it("detects active PEM (the safety hard-branch trigger)", () => {
    const r = score(patient);
    expect(r.pemAnswered).toBe(true);
    expect(r.pemActive).toBe(true);
  });

  it("surfaces iatrogenic harm as a real possibility with evidence", () => {
    const s = byId(score(patient), "iatrogenic");
    expect(s.hasEvidence).toBe(true);
    expect(s.probability).toBeGreaterThan(0.35);
  });

  it("leaves mitochondrial in the muddy middle (possible, not confident)", () => {
    const s = byId(score(patient), "mitochondrial");
    expect(s.band).toBe("possible");
  });

  it("every contribution sums to the mechanism logit (ledger is faithful)", () => {
    const r = score(patient);
    for (const s of r.scores) {
      const sum = s.contributions.reduce((acc, c) => acc + c.delta, 0);
      expect(sum).toBeCloseTo(s.logit, 6);
    }
  });
});

describe("score — exclusion diagnosis", () => {
  it("false_fatigue_alarms rises as organic mechanisms are actively ruled out", () => {
    const base = byId(score({}), "false_fatigue_alarms");
    // Rule out EBV (negative serology) and POTS (tiny standing HR rise).
    const ruled = score({ lab_ebv: "negative", lab_standing_hr: 5 });
    const ffa = byId(ruled, "false_fatigue_alarms");
    const exclusionContribs = ffa.contributions.filter((c) => c.fromExclusion);
    expect(exclusionContribs.length).toBeGreaterThanOrEqual(1);
    expect(ffa.probability).toBeGreaterThan(base.probability);
  });

  it("does not boost from mere absence of evidence (no answers → no exclusion)", () => {
    const ffa = byId(score({}), "false_fatigue_alarms");
    expect(ffa.contributions.some((c) => c.fromExclusion)).toBe(false);
  });
});

describe("score — propagation", () => {
  it("boosts a target only when the source is likely (>0.6), once", () => {
    // Drive high_stress likely; expect a propagation contribution on sleep_circadian.
    const r = score({ ongoing_stress: true });
    const stress = byId(r, "high_stress");
    const sleep = byId(r, "sleep_circadian");
    if (stress.probability > 0.6) {
      const prop = sleep.contributions.filter((c) => c.fromPropagation);
      expect(prop.length).toBe(1);
    } else {
      // If not likely, no propagation should fire.
      expect(sleep.contributions.some((c) => c.fromPropagation)).toBe(false);
    }
  });
});
