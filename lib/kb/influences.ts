import type { InfluenceEdgeInput } from "./types";

/**
 * Causal-web edges. After independent scoring, the engine runs ONE bounded propagation pass:
 * for each edge whose SOURCE is likely (independent P > 0.6), the target gets the edge's
 * log-odds delta, labeled in the ledger ("boosted because X is likely").
 *
 * Edges fire off the pre-propagation probabilities, so the pass is order-independent and cannot
 * run away even when two mechanisms point at each other.
 */
export const influences: InfluenceEdgeInput[] = [
  {
    source: "persistent_virus",
    target: "immune_dysfunction",
    strength: "moderate_for",
    rationale: "Persistent viral antigen is a plausible driver of ongoing immune activation.",
  },
  {
    source: "ebv_reactivation",
    target: "immune_dysfunction",
    strength: "weak_for",
    rationale: "Herpesvirus reactivation can sustain immune activation.",
  },
  {
    source: "immune_dysfunction",
    target: "depression",
    strength: "weak_for",
    rationale: "Inflammatory cytokines can trigger or worsen depression.",
  },
  {
    source: "immune_dysfunction",
    target: "bbb_damage",
    strength: "weak_for",
    rationale: "Systemic inflammation is associated with blood-brain-barrier leakage.",
  },
  {
    source: "microclots",
    target: "organ_damage",
    strength: "weak_for",
    rationale: "Impaired microvascular perfusion can contribute to tissue injury.",
  },
  {
    source: "autonomic_pots",
    target: "deconditioning",
    strength: "weak_for",
    rationale: "Orthostatic intolerance limits upright activity, accelerating deconditioning.",
  },
  {
    source: "high_stress",
    target: "sleep_circadian",
    strength: "moderate_for",
    rationale: "Sustained stress commonly disrupts sleep.",
  },
  {
    source: "high_stress",
    target: "anxiety_somatization",
    strength: "weak_for",
    rationale: "High stress and anxiety frequently co-occur and reinforce each other.",
  },
  {
    source: "sleep_circadian",
    target: "depression",
    strength: "weak_for",
    rationale: "Chronic poor sleep worsens mood.",
  },
  {
    source: "depression",
    target: "false_fatigue_alarms",
    strength: "weak_for",
    rationale: "Depression can amplify the perception of fatigue and effort.",
  },
  {
    source: "anxiety_somatization",
    target: "false_fatigue_alarms",
    strength: "weak_for",
    rationale: "Symptom-focused anxiety can amplify fatigue and bodily alarm signals.",
  },
];
