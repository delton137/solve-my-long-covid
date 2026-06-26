import type { Answers, Section } from "../kb/types";

/**
 * The wizard's entire state is a single versioned, serializable blob. v1 persists it to
 * localStorage with no account; this is the forward-compat hook for optional account sync later
 * (the same blob syncs to a row). The inference always runs client-side from `answers`.
 */
export const STORAGE_KEY = "smlc.assessment.v1";
export const ASSESSMENT_VERSION = 1;

export interface AssessmentBlob {
  version: number;
  consented: boolean;
  answers: Answers;
}

export function emptyBlob(): AssessmentBlob {
  return { version: ASSESSMENT_VERSION, consented: false, answers: {} };
}

export function loadBlob(): AssessmentBlob {
  if (typeof window === "undefined") return emptyBlob();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBlob();
    const parsed = JSON.parse(raw) as AssessmentBlob;
    if (parsed.version !== ASSESSMENT_VERSION || typeof parsed.answers !== "object") return emptyBlob();
    return { version: ASSESSMENT_VERSION, consented: !!parsed.consented, answers: parsed.answers ?? {} };
  } catch {
    return emptyBlob();
  }
}

export function saveBlob(blob: AssessmentBlob): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    /* storage may be unavailable (private mode) — degrade silently */
  }
}

export function clearBlob(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// ── Step / section structure ─────────────────────────────────────────────

export const SECTION_ORDER: Section[] = ["history", "timecourse", "symptoms", "labs", "meds"];

export const SECTION_META: Record<Section, { title: string; description: string }> = {
  history: {
    title: "Your history",
    description: "A little background about your infection and the lead-up to your symptoms.",
  },
  timecourse: {
    title: "How things have unfolded",
    description: "When your symptoms started and how they've changed over time.",
  },
  symptoms: {
    title: "Your symptoms now",
    description: "What you're experiencing. Two questions here matter a lot, so take your time.",
  },
  labs: {
    title: "Tests you've already had",
    description:
      "Only fill in results you actually have — leave the rest blank. Blanks simply count as unknown.",
  },
  meds: {
    title: "Medications & supplements",
    description: "What you're currently taking. This catches a common, avoidable source of harm.",
  },
};

export type WizardStep = "consent" | Section | "results";

export const STEPS: WizardStep[] = ["consent", ...SECTION_ORDER, "results"];
