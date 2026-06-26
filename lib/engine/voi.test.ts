import { describe, it, expect } from "vitest";
import { score } from "./score";
import { recommendTests, isTestDone } from "./voi";
import { KB } from "../kb";
import type { Answers } from "../kb/types";

const patient: Answers = {
  confirmed_infection: "confirmed",
  acute_severity: "moderate",
  prior_mood_history: "neither",
  onset_timing: "during_after",
  trajectory: "relapsing",
  pem: "yes_clearly",
  orthostatic: "yes_strongly",
  symptoms_core: ["palpitations", "brain_fog", "unrefreshing_sleep", "fatigue"],
  lab_standing_hr: 35,
  supplement_count: "many",
};

describe("isTestDone", () => {
  it("treats a test as done once its result question has a real answer", () => {
    const standing = KB.testById.get("standing_test")!;
    expect(isTestDone(standing, {})).toBe(false);
    expect(isTestDone(standing, { lab_standing_hr: 35 })).toBe(true);
  });
  it("treats 'not_done' as not done", () => {
    const altDx = KB.testById.get("alt_dx_panel")!;
    expect(isTestDone(altDx, { lab_alt_dx: "not_done" })).toBe(false);
    expect(isTestDone(altDx, { lab_alt_dx: "all_normal" })).toBe(true);
  });
});

describe("recommendTests", () => {
  it("excludes tests already done", () => {
    const result = score(patient);
    const recs = recommendTests(result, patient).recommendations;
    // standing HR already entered → standing_test should not be recommended
    expect(recs.some((r) => r.testId === "standing_test")).toBe(false);
  });

  it("ranks by value per dollar — top pick is cheap and accessible", () => {
    const result = score(patient);
    const { recommendations } = recommendTests(result, patient, { rankBy: "per_dollar" });
    expect(recommendations.length).toBeGreaterThan(0);
    const top = recommendations[0];
    expect(["home", "gp_orderable"]).toContain(top.accessibility);
    // sorted descending
    for (let i = 1; i < recommendations.length; i++) {
      expect(recommendations[i - 1].voiScore).toBeGreaterThanOrEqual(recommendations[i].voiScore);
    }
  });

  it("does not over-recommend confirming an already-likely mechanism", () => {
    const result = score(patient);
    const recs = recommendTests(result, patient, { limit: 5 }).recommendations;
    // POTS is already very likely, so the tilt-table shouldn't be a top recommendation.
    const tiltRank = recs.findIndex((r) => r.testId === "tilt_table");
    expect(tiltRank === -1 || tiltRank > 0).toBe(true);
  });

  it("offers a cheapest-meaningful option", () => {
    const result = score(patient);
    const { cheapest } = recommendTests(result, patient);
    expect(cheapest).toBeDefined();
    expect(cheapest!.infoValue).toBeGreaterThan(0);
  });

  it("information ranking and per-dollar ranking can both produce results", () => {
    const result = score(patient);
    const perDollar = recommendTests(result, patient, { rankBy: "per_dollar" }).recommendations;
    const info = recommendTests(result, patient, { rankBy: "information" }).recommendations;
    expect(perDollar.length).toBeGreaterThan(0);
    expect(info.length).toBeGreaterThan(0);
  });

  it("each recommendation's targets carry coherent posterior probabilities", () => {
    const result = score(patient);
    const recs = recommendTests(result, patient, { limit: 6 }).recommendations;
    for (const r of recs) {
      for (const t of r.targets) {
        expect(t.pIfPositive).toBeGreaterThanOrEqual(0);
        expect(t.pIfPositive).toBeLessThanOrEqual(1);
        expect(t.pIfNegative).toBeGreaterThanOrEqual(0);
        expect(t.pIfNegative).toBeLessThanOrEqual(1);
      }
    }
  });
});
