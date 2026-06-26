import type { DiagnosticTestInput } from "./types";

/**
 * Diagnostic-test catalog. Two jobs:
 *  1. The value-of-information engine simulates each test's `effects` (ifPositive / ifNegative
 *     strengths) to decide which test would most reduce uncertainty per dollar.
 *  2. The /tests reference page lists cost, accessibility, and what each test discriminates.
 *
 * Costs are rough USD ranges (from the essay + research). `accessibility` flags whether a test is
 * orderable in normal care or still research-grade — surfaced so we don't recommend the
 * inaccessible.
 *
 * `resultQuestionId` links a test to the labs-section question that records its result, so that
 * a user who already has the result feeds it into scoring via the normal question path.
 */
export const diagnosticTests: DiagnosticTestInput[] = [
  // ── Cheap, high-yield "meta" checks ──────────────────────────────────
  {
    id: "alt_dx_panel",
    name: "First-tier blood panel (alternative-diagnosis screen)",
    description:
      "TSH, ferritin, B12/folate, vitamin D, HbA1c, CBC, metabolic panel, ESR/CRP. Catches the common, treatable conditions that masquerade as Long COVID.",
    costLow: 100,
    costHigh: 300,
    accessibility: "gp_orderable",
    effects: [
      { mechanismId: "mistaken_attribution", ifPositive: "strong_for", ifNegative: "moderate_against", resultQuestionId: "lab_alt_dx" },
    ],
  },
  {
    id: "osa_screen",
    name: "Sleep-apnea screen (STOP-BANG → home sleep test)",
    description:
      "A free questionnaire that, if positive, leads to an inexpensive home sleep apnea test. Sleep apnea is common, undiagnosed, treatable, and both mimics and worsens Long COVID.",
    costLow: 0,
    costHigh: 300,
    accessibility: "home",
    effects: [
      { mechanismId: "sleep_circadian", ifPositive: "strong_for", ifNegative: "moderate_against", resultQuestionId: "lab_osa" },
      { mechanismId: "mistaken_attribution", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
  {
    id: "med_review",
    name: "Medication & supplement reconciliation",
    description:
      "An expert reviews every prescription, over-the-counter drug, and supplement for toxicity, interactions, and unproven/harmful agents. Cheap, fast, and frequently missed.",
    costLow: 0,
    costHigh: 300,
    accessibility: "gp_orderable",
    effects: [
      { mechanismId: "iatrogenic", ifPositive: "strong_for", ifNegative: "moderate_against", resultQuestionId: "lab_med_review" },
    ],
  },

  // ── Autonomic / POTS ─────────────────────────────────────────────────
  {
    id: "standing_test",
    name: "10-minute standing (NASA lean) test",
    description:
      "Measure heart rate lying down and across 10 minutes of standing. A sustained rise of ≥30 bpm (≥40 in teens) without a large blood-pressure drop suggests POTS. Doable at home with a heart-rate monitor.",
    costLow: 0,
    costHigh: 100,
    accessibility: "home",
    effects: [
      { mechanismId: "autonomic_pots", ifPositive: "strong_for", ifNegative: "moderate_against", resultQuestionId: "lab_standing_hr" },
    ],
  },
  {
    id: "tilt_table",
    name: "Tilt-table test",
    description:
      "The clinical reference test for orthostatic intolerance and POTS, performed in a specialist autonomic lab.",
    costLow: 300,
    costHigh: 1000,
    accessibility: "specialist",
    effects: [
      { mechanismId: "autonomic_pots", ifPositive: "pathognomonic", ifNegative: "strong_against" },
    ],
  },

  // ── Sleep ────────────────────────────────────────────────────────────
  {
    id: "sleep_study",
    name: "In-lab sleep study (polysomnography)",
    description:
      "Comprehensive overnight study for sleep apnea and other sleep disorders when a home test is inconclusive.",
    costLow: 1000,
    costHigh: 2000,
    accessibility: "specialist",
    effects: [
      { mechanismId: "sleep_circadian", ifPositive: "strong_for", ifNegative: "moderate_against" },
    ],
  },
  {
    id: "sleep_diary",
    name: "Sleep diary / wearable tracking",
    description:
      "Two weeks of self-tracked sleep timing and quality. Useful for circadian patterns and to triage, but wearables are unreliable for staging.",
    costLow: 0,
    costHigh: 100,
    accessibility: "home",
    effects: [
      { mechanismId: "sleep_circadian", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },

  // ── Deconditioning / exertional ──────────────────────────────────────
  {
    id: "cpet",
    name: "Cardiopulmonary exercise test (CPET)",
    description:
      "Measures cardiovascular and pulmonary capacity during exercise; a deconditioning pattern supports reversible fitness loss. Caution: maximal CPET can trigger post-exertional malaise.",
    costLow: 500,
    costHigh: 1500,
    accessibility: "specialist",
    effects: [
      { mechanismId: "deconditioning", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
  {
    id: "two_day_cpet",
    name: "2-day CPET (post-exertional malaise biomarker)",
    description:
      "Repeating CPET on consecutive days; a reproducible drop in capacity on day 2 objectively documents post-exertional malaise. Caution: can itself trigger a crash — submaximal protocols are preferred.",
    costLow: 1000,
    costHigh: 3000,
    accessibility: "research_only",
    effects: [
      { mechanismId: "deconditioning", ifPositive: "moderate_against", ifNegative: "weak_for" },
      { mechanismId: "mitochondrial", ifPositive: "weak_for", ifNegative: "weak_against" },
    ],
  },

  // ── Organ damage ─────────────────────────────────────────────────────
  {
    id: "ecg",
    name: "ECG (electrocardiogram)",
    description: "A quick, cheap recording of the heart's rhythm and electrical activity.",
    costLow: 100,
    costHigh: 300,
    accessibility: "gp_orderable",
    effects: [
      { mechanismId: "organ_damage", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
  {
    id: "cardiac_imaging",
    name: "Echocardiogram / cardiac MRI",
    description:
      "Imaging for myocarditis, pericarditis, or impaired heart function. Cardiac MRI with T1/T2 mapping detects occult inflammation.",
    costLow: 500,
    costHigh: 5000,
    accessibility: "specialist",
    effects: [
      { mechanismId: "organ_damage", ifPositive: "strong_for", ifNegative: "moderate_against" },
    ],
  },
  {
    id: "pulmonary_function",
    name: "Pulmonary function tests / chest imaging",
    description:
      "Spirometry, diffusion testing, and imaging for lung damage. Hyperpolarized 129-Xe MRI can reveal gas-transfer defects invisible on standard CT.",
    costLow: 200,
    costHigh: 4000,
    accessibility: "specialist",
    effects: [
      { mechanismId: "organ_damage", ifPositive: "strong_for", ifNegative: "moderate_against" },
    ],
  },

  // ── Viral ────────────────────────────────────────────────────────────
  {
    id: "antigen_assay",
    name: "Ultra-sensitive antigen assay (Simoa)",
    description:
      "Single-molecule detection of circulating spike/nucleocapsid antigen months after infection — the leading research biomarker of a viral reservoir. Not yet a validated clinical test.",
    costLow: 200,
    costHigh: 1500,
    accessibility: "research_only",
    effects: [
      { mechanismId: "persistent_virus", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
  {
    id: "viral_pcr",
    name: "PCR (saliva / stool / blood)",
    description: "Tests for residual viral genetic material in body fluids.",
    costLow: 100,
    costHigh: 3000,
    accessibility: "specialist",
    effects: [
      { mechanismId: "persistent_virus", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
  {
    id: "ebv_serology",
    name: "EBV antibody panel",
    description:
      "VCA IgM and EA-D IgG titres indicating recent Epstein-Barr reactivation. Cheap and useful for phenotyping (association, not proof of causation).",
    costLow: 100,
    costHigh: 300,
    accessibility: "gp_orderable",
    effects: [
      { mechanismId: "ebv_reactivation", ifPositive: "moderate_for", ifNegative: "moderate_against", resultQuestionId: "lab_ebv" },
    ],
  },

  // ── Immune ───────────────────────────────────────────────────────────
  {
    id: "inflammatory_markers",
    name: "Inflammatory markers (CRP, cytokine profile)",
    description:
      "CRP is cheap and widely available; a fuller cytokine profile is pricier. Elevated markers support ongoing immune activation.",
    costLow: 100,
    costHigh: 1000,
    accessibility: "gp_orderable",
    effects: [
      { mechanismId: "immune_dysfunction", ifPositive: "moderate_for", ifNegative: "weak_against", resultQuestionId: "lab_crp" },
    ],
  },
  {
    id: "autoantibody_panel",
    name: "Autoantibody panel (incl. GPCR autoantibodies)",
    description:
      "Functional autoantibodies against G-protein-coupled receptors and others. Commercially available but not validated as a clinical diagnostic.",
    costLow: 300,
    costHigh: 1000,
    accessibility: "research_only",
    effects: [
      { mechanismId: "immune_dysfunction", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },

  // ── Mitochondrial ────────────────────────────────────────────────────
  {
    id: "mito_mrs",
    name: "31-P MRS muscle spectroscopy",
    description:
      "Measures phosphocreatine recovery time as an objective readout of mitochondrial capacity. Research-grade; note it does not track well with symptom severity.",
    costLow: 500,
    costHigh: 10000,
    accessibility: "research_only",
    effects: [
      { mechanismId: "mitochondrial", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },

  // ── Microclots ───────────────────────────────────────────────────────
  {
    id: "microclot_imaging",
    name: "Microclot imaging (fluorescence / flow cytometry)",
    description:
      "Thioflavin-T staining of a blood smear to quantify fibrin-amyloid microclots. Promising but not yet standardized or validated against healthy-control thresholds.",
    costLow: 200,
    costHigh: 1000,
    accessibility: "research_only",
    effects: [
      { mechanismId: "microclots", ifPositive: "moderate_for", ifNegative: "moderate_against" },
    ],
  },
  {
    id: "d_dimer",
    name: "D-dimer",
    description:
      "A cheap, GP-orderable blood marker of clot breakdown. A weak, indirect signal for the microclot hypothesis but inexpensive.",
    costLow: 20,
    costHigh: 80,
    accessibility: "gp_orderable",
    effects: [
      { mechanismId: "microclots", ifPositive: "weak_for", ifNegative: "weak_against", resultQuestionId: "lab_dimer" },
    ],
  },

  // ── Blood-brain barrier ──────────────────────────────────────────────
  {
    id: "bbb_mri",
    name: "DCE-MRI (blood-brain barrier integrity)",
    description:
      "Dynamic contrast-enhanced MRI quantifies contrast leakage across the blood-brain barrier. Research-grade.",
    costLow: 200,
    costHigh: 4000,
    accessibility: "research_only",
    effects: [
      { mechanismId: "bbb_damage", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
  {
    id: "neuro_biomarkers",
    name: "Neuro blood biomarkers (GFAP, NfL)",
    description:
      "Blood markers of glial activation and neuronal injury, under study as cheaper proxies for brain involvement. Not yet validated for Long COVID.",
    costLow: 100,
    costHigh: 600,
    accessibility: "research_only",
    effects: [
      { mechanismId: "bbb_damage", ifPositive: "weak_for", ifNegative: "weak_against" },
    ],
  },

  // ── Mood / stress (cheap screens) ────────────────────────────────────
  {
    id: "phq9",
    name: "Depression screen (PHQ-9)",
    description: "A short validated questionnaire for depressive symptoms.",
    costLow: 0,
    costHigh: 100,
    accessibility: "home",
    effects: [
      { mechanismId: "depression", ifPositive: "strong_for", ifNegative: "moderate_against", resultQuestionId: "lab_phq9" },
    ],
  },
  {
    id: "gad7",
    name: "Anxiety screen (GAD-7 / PHQ-15)",
    description: "Short validated questionnaires for anxiety and somatic symptom burden.",
    costLow: 0,
    costHigh: 100,
    accessibility: "home",
    effects: [
      { mechanismId: "anxiety_somatization", ifPositive: "strong_for", ifNegative: "moderate_against", resultQuestionId: "lab_gad7" },
    ],
  },
  {
    id: "stress_history",
    name: "Stress / HRV assessment",
    description:
      "Structured history of life stressors, optionally with cortisol and heart-rate-variability measures.",
    costLow: 0,
    costHigh: 300,
    accessibility: "home",
    effects: [
      { mechanismId: "high_stress", ifPositive: "moderate_for", ifNegative: "weak_against" },
    ],
  },
];
