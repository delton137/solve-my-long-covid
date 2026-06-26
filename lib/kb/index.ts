import { z } from "zod";
import {
  mechanismSchema,
  questionSchema,
  diagnosticTestSchema,
  treatmentSchema,
  influenceEdgeSchema,
  type Mechanism,
  type Question,
  type DiagnosticTest,
  type Treatment,
  type InfluenceEdge,
} from "./types";
import { mechanisms as rawMechanisms } from "./mechanisms";
import { questions as rawQuestions } from "./questions";
import { diagnosticTests as rawTests } from "./tests";
import { treatments as rawTreatments } from "./treatments";
import { influences as rawInfluences } from "./influences";

/**
 * Single entry point for the knowledge base. Validates every authored module against its zod
 * schema AND checks referential integrity (ids that point at each other actually exist), then
 * exports typed, frozen collections + lookup maps. A malformed edit throws here — which fails the
 * build, the KB-validation test, and CI — instead of silently shipping a wrong assessment.
 */

function fail(errors: string[]): never {
  throw new Error(`Knowledge base validation failed:\n - ${errors.join("\n - ")}`);
}

// Schemas use `.default()`, so their input type differs from their output type; accept ZodTypeAny
// and cast the validated output to the (output) type T.
function parseArray<T>(schema: z.ZodTypeAny, items: unknown[], label: string, errors: string[]): T[] {
  const out: T[] = [];
  items.forEach((item, i) => {
    const r = schema.safeParse(item);
    if (!r.success) {
      const id = (item as { id?: string })?.id ?? `#${i}`;
      errors.push(`${label}[${id}]: ${r.error.issues.map((e) => `${e.path.join(".")} ${e.message}`).join("; ")}`);
    } else {
      out.push(r.data as T);
    }
  });
  return out;
}

function uniqueIds<T extends { id: string }>(items: T[], label: string, errors: string[]) {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) errors.push(`${label}: duplicate id "${item.id}"`);
    seen.add(item.id);
  }
}

const errors: string[] = [];

const mechanisms = parseArray<Mechanism>(mechanismSchema, rawMechanisms, "mechanism", errors);
const questions = parseArray<Question>(questionSchema, rawQuestions, "question", errors);
const diagnosticTests = parseArray<DiagnosticTest>(diagnosticTestSchema, rawTests, "test", errors);
const treatments = parseArray<Treatment>(treatmentSchema, rawTreatments, "treatment", errors);
const influences = parseArray<InfluenceEdge>(influenceEdgeSchema, rawInfluences, "influence", errors);

uniqueIds(mechanisms, "mechanism", errors);
uniqueIds(questions, "question", errors);
uniqueIds(diagnosticTests, "test", errors);
uniqueIds(treatments, "treatment", errors);

const mechanismIds = new Set(mechanisms.map((m) => m.id));
const questionIds = new Set(questions.map((q) => q.id));
const testIds = new Set(diagnosticTests.map((t) => t.id));
const treatmentIds = new Set(treatments.map((t) => t.id));

// zod enum already constrains ids to the canonical 16; this just ensures none are missing/dupes.
const MECHANISM_COUNT_EXPECTED = 16;
if (mechanisms.length !== MECHANISM_COUNT_EXPECTED) {
  errors.push(`expected ${MECHANISM_COUNT_EXPECTED} mechanisms, found ${mechanisms.length}`);
}

// Referential integrity: mechanism → tests/treatments
for (const m of mechanisms) {
  for (const tid of m.testIds) {
    if (!testIds.has(tid)) errors.push(`mechanism[${m.id}]: unknown testId "${tid}"`);
  }
  for (const tid of m.treatmentIds) {
    if (!treatmentIds.has(tid)) errors.push(`mechanism[${m.id}]: unknown treatmentId "${tid}"`);
  }
}

// Tests → labs questions (resultQuestionId)
for (const t of diagnosticTests) {
  for (const e of t.effects) {
    if (e.resultQuestionId && !questionIds.has(e.resultQuestionId)) {
      errors.push(`test[${t.id}]: unknown resultQuestionId "${e.resultQuestionId}"`);
    }
  }
}

// Questions → dependsOn target exists
for (const q of questions) {
  if (q.dependsOn && !questionIds.has(q.dependsOn.questionId)) {
    errors.push(`question[${q.id}]: dependsOn unknown question "${q.dependsOn.questionId}"`);
  }
  // multi/single questions referenced by evidence must have option values that exist
  if ((q.answerType === "single" || q.answerType === "multi") && q.options) {
    const optionValues = new Set(q.options.map((o) => o.value));
    for (const e of q.evidence) {
      if (typeof e.whenAnswer === "string" && !optionValues.has(e.whenAnswer)) {
        errors.push(`question[${q.id}]: evidence whenAnswer "${e.whenAnswer}" is not an option value`);
      }
    }
  }
}

// Exactly one PEM screen — the safety hard-branch depends on it.
const pemScreens = questions.filter((q) => q.isPemScreen);
if (pemScreens.length !== 1) {
  errors.push(`expected exactly one question with isPemScreen, found ${pemScreens.length}`);
}

if (errors.length) fail(errors);

export const KB = Object.freeze({
  mechanisms,
  questions,
  diagnosticTests,
  treatments,
  influences,
  mechanismById: new Map(mechanisms.map((m) => [m.id, m])),
  questionById: new Map(questions.map((q) => [q.id, q])),
  testById: new Map(diagnosticTests.map((t) => [t.id, t])),
  treatmentById: new Map(treatments.map((t) => [t.id, t])),
  pemScreenId: pemScreens[0].id,
});

export type KnowledgeBase = typeof KB;
