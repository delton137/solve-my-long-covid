import type { EvidenceStrength, Band } from "../kb/strengths";
import type { MechanismId, FactorType } from "../kb/types";

/** One line in a mechanism's "why did this score?" ledger. */
export interface Contribution {
  /** What produced this contribution (the question prompt, a linked mechanism, the base rate). */
  source: string;
  /** Human rationale shown to the user. */
  detail: string;
  /** Log-odds added (signed). */
  delta: number;
  strength?: EvidenceStrength;
  factorType?: FactorType;
  /** Came from the causal-web propagation pass. */
  fromPropagation?: boolean;
  /** Came from the exclusion-diagnosis boost (false_fatigue_alarms). */
  fromExclusion?: boolean;
  /** This is the base-rate prior, not user evidence. */
  isPrior?: boolean;
}

export interface MechanismScore {
  mechanismId: MechanismId;
  name: string;
  category: "organic" | "brain_based" | "mixed" | "diagnostic";
  isExclusionDiagnosis: boolean;
  /** Total log-odds. */
  logit: number;
  probability: number;
  band: Band;
  /** Sum of log-odds from user evidence only (excludes the prior). Drives "insufficient info". */
  evidenceLogit: number;
  /** True if any user answer contributed (not just the prior). */
  hasEvidence: boolean;
  /** Contributions sorted by descending |delta|. */
  contributions: Contribution[];
}

export interface ScoreResult {
  /** All mechanisms, sorted by probability (descending). */
  scores: MechanismScore[];
  /** Post-exertional malaise reported — drives the safety hard-branch. */
  pemActive: boolean;
  /** Whether the PEM screen has been answered at all. */
  pemAnswered: boolean;
  /** How many applicable questions the user has answered, of how many apply. */
  answeredCount: number;
  applicableCount: number;
}
