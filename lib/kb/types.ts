import { z } from "zod";
import { EVIDENCE_STRENGTHS } from "./strengths";

/**
 * Typed, zod-validated knowledge-base schema. Every authored KB module is validated
 * against these at load (see ./index.ts) so a malformed edit fails loudly at build/test
 * time instead of silently producing a wrong assessment.
 */

// ── Mechanisms ──────────────────────────────────────────────────────────

export const MECHANISM_IDS = [
  "organ_damage",
  "bbb_damage",
  "ebv_reactivation",
  "persistent_virus",
  "immune_dysfunction",
  "mitochondrial",
  "microclots",
  "false_fatigue_alarms",
  "autonomic_pots",
  "depression",
  "anxiety_somatization",
  "high_stress",
  "deconditioning",
  "sleep_circadian",
  "mistaken_attribution",
  "iatrogenic",
] as const;

export const mechanismIdSchema = z.enum(MECHANISM_IDS);
export type MechanismId = z.infer<typeof mechanismIdSchema>;

export const evidenceStrengthSchema = z.enum(EVIDENCE_STRENGTHS);

export const factorTypeSchema = z.enum(["predisposing", "precipitating", "perpetuating"]);
export type FactorType = z.infer<typeof factorTypeSchema>;

export const mechanismSchema = z.object({
  id: mechanismIdSchema,
  name: z.string().min(1),
  /** One-line summary shown in lists. */
  shortDescription: z.string().min(1),
  /** Longer markdown explanation for the reference page. */
  detail: z.string().min(1),
  category: z.enum(["organic", "brain_based", "mixed", "diagnostic"]),
  /** Base-rate prior as log-odds (negative = uncommon). */
  priorLogit: z.number(),
  /** Only true for false_fatigue_alarms: reached by exclusion, no confirmatory test. */
  isExclusionDiagnosis: z.boolean().default(false),
  /**
   * Actionability multiplier used by the value-of-information engine. Higher = resolving
   * this mechanism is more decision-relevant (cheap/safe/effective action available, or
   * high harm-avoidance value).
   */
  impactMultiplier: z.number().positive().default(1),
  testIds: z.array(z.string()).default([]),
  treatmentIds: z.array(z.string()).default([]),
});
export type Mechanism = z.infer<typeof mechanismSchema>;

// ── Questions / inputs ──────────────────────────────────────────────────

export const answerTypeSchema = z.enum([
  "boolean",
  "single",
  "multi",
  "scale",
  "numeric",
  "duration",
]);
export type AnswerType = z.infer<typeof answerTypeSchema>;

export const sectionSchema = z.enum(["history", "symptoms", "timecourse", "labs", "meds"]);
export type Section = z.infer<typeof sectionSchema>;

/**
 * Condition under which an EvidenceLink fires, matched against the user's answer:
 *  - `true`           → boolean question answered true
 *  - a string         → single-choice equals it, OR multi-choice includes it
 *  - { gte?, lte? }   → numeric/scale/duration within range (inclusive)
 */
export const whenAnswerSchema = z.union([
  z.literal(true),
  z.string(),
  z.object({ gte: z.number().optional(), lte: z.number().optional() }).strict(),
]);
export type WhenAnswer = z.infer<typeof whenAnswerSchema>;

export const evidenceLinkSchema = z.object({
  whenAnswer: whenAnswerSchema,
  mechanismId: mechanismIdSchema,
  strength: evidenceStrengthSchema,
  factorType: factorTypeSchema.optional(),
  /** Human sentence shown in the "why this scored" ledger. */
  rationale: z.string().min(1),
});
export type EvidenceLink = z.infer<typeof evidenceLinkSchema>;

export const optionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  help: z.string().optional(),
});

export const questionSchema = z.object({
  id: z.string().min(1),
  section: sectionSchema,
  prompt: z.string().min(1),
  help: z.string().optional(),
  answerType: answerTypeSchema,
  options: z.array(optionSchema).optional(),
  unit: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  /** Only show this question when another answer matches (adaptive flow). */
  dependsOn: z
    .object({
      questionId: z.string(),
      equals: z.union([z.string(), z.array(z.string()), z.literal(true)]),
    })
    .optional(),
  /** Marks the canonical PEM screen — drives the hard safety branch. */
  isPemScreen: z.boolean().default(false),
  evidence: z.array(evidenceLinkSchema).default([]),
});
export type Question = z.infer<typeof questionSchema>;

// ── Diagnostic tests (used by VOI + the tests catalog) ──────────────────

export const testEffectSchema = z.object({
  mechanismId: mechanismIdSchema,
  ifPositive: evidenceStrengthSchema,
  ifNegative: evidenceStrengthSchema,
  /** The labs-section question that records this test's result, if the user already has it. */
  resultQuestionId: z.string().optional(),
});
export type TestEffect = z.infer<typeof testEffectSchema>;

export const diagnosticTestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  costLow: z.number().nonnegative(),
  costHigh: z.number().nonnegative(),
  accessibility: z.enum(["home", "gp_orderable", "specialist", "research_only"]),
  effects: z.array(testEffectSchema).min(1),
});
export type DiagnosticTest = z.infer<typeof diagnosticTestSchema>;

// ── Treatments ──────────────────────────────────────────────────────────

export const evidenceLevelSchema = z.enum([
  "strong_rct",
  "mixed",
  "weak",
  "anecdotal",
  "rct_negative", // tested in good RCT(s) and FAILED — important to surface honestly
]);
export type EvidenceLevel = z.infer<typeof evidenceLevelSchema>;

export const treatmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mechanismIds: z.array(mechanismIdSchema).min(1),
  modality: z.enum(["drug", "supplement", "device", "behavioral", "procedure", "lifestyle"]),
  evidenceLevel: evidenceLevelSchema,
  /** One-line evidence summary authored from the research briefs. */
  keyFinding: z.string().min(1),
  harmSeverity: z.enum(["none", "low", "moderate", "high"]).default("low"),
  cautions: z.string().optional(),
  /** Optional promise score (0–~3 dataset scale) and RCT count for treatments the dataset covers. */
  promiseScore: z.number().optional(),
  nRct: z.number().int().nonnegative().optional(),
  sources: z.array(z.string()).default([]),
});
export type Treatment = z.infer<typeof treatmentSchema>;

// ── Causal-web influence edges ──────────────────────────────────────────

export const influenceEdgeSchema = z.object({
  source: mechanismIdSchema,
  target: mechanismIdSchema,
  strength: evidenceStrengthSchema,
  rationale: z.string().min(1),
});
export type InfluenceEdge = z.infer<typeof influenceEdgeSchema>;

// ── Authoring (input) types ─────────────────────────────────────────────
// Schemas use `.default()`, so the *output* types make defaulted fields required. Authored KB
// content is typed with these *input* types, where defaulted/optional fields can be omitted.

export type MechanismInput = z.input<typeof mechanismSchema>;
export type QuestionInput = z.input<typeof questionSchema>;
export type DiagnosticTestInput = z.input<typeof diagnosticTestSchema>;
export type TreatmentInput = z.input<typeof treatmentSchema>;
export type InfluenceEdgeInput = z.input<typeof influenceEdgeSchema>;

// ── Answers (user input) ────────────────────────────────────────────────

export type AnswerValue = boolean | string | string[] | number;
export type Answers = Record<string, AnswerValue>;
