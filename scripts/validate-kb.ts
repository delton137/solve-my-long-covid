/**
 * Standalone KB validation — used by CI (`npm run validate:kb`) so a malformed knowledge-base
 * edit fails fast with a clear message. Importing the KB runs all zod + referential checks.
 */
import { KB } from "../lib/kb";

console.log(
  `✓ Knowledge base valid: ${KB.mechanisms.length} mechanisms, ${KB.questions.length} questions, ` +
    `${KB.diagnosticTests.length} tests, ${KB.treatments.length} treatments, ${KB.influences.length} influence edges.`,
);
