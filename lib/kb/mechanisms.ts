import type { MechanismInput } from "./types";

/**
 * The ~16 causal mechanisms of Long COVID.
 *
 * priorLogit  — base-rate as log-odds among people presenting with Long-COVID-type symptoms
 *               (negative = uncommon at baseline). Deliberately modest so reported symptoms /
 *               test results drive the score, not the prior.
 * impactMultiplier — value-of-information weight: how decision-relevant it is to resolve this
 *               mechanism (cheap/safe/effective action available, or high harm-avoidance value).
 *               The two "meta" mechanisms (mistaken attribution, iatrogenic) and cheap-to-confirm,
 *               treatable ones (POTS, sleep) are weighted up so they surface first.
 *
 * All numbers are expert judgment, not fitted values — see /methodology.
 */
export const mechanisms: MechanismInput[] = [
  {
    id: "mistaken_attribution",
    name: "Mistaken attribution (it's something else)",
    shortDescription:
      "Symptoms actually caused by a separate, often treatable condition — and attributed to COVID by timing.",
    detail:
      "Fatigue, brain fog, breathlessness, and palpitations have many common causes. A meaningful share of presumed Long COVID is explained by a separate, treatable condition — thyroid disease, iron deficiency, B12 deficiency, sleep apnea, diabetes, depression, or a medication effect — that happened to surface around the same time. A cheap first-tier workup (TSH, ferritin, B12/folate, vitamin D, HbA1c, CBC, metabolic panel, ESR/CRP) plus a sleep-apnea screen catches most of these. This is the highest-yield, lowest-cost step in the whole assessment: rule out the mimics before attributing everything to COVID.",
    category: "diagnostic",
    priorLogit: -0.9,
    impactMultiplier: 3.0,
    testIds: ["alt_dx_panel", "osa_screen"],
    treatmentIds: ["treat_underlying"],
  },
  {
    id: "iatrogenic",
    name: "Iatrogenic harm (caused by treatment)",
    shortDescription:
      "Symptoms caused or worsened by supplements, medications, or unproven treatments — common in this community.",
    detail:
      "People with Long COVID are at high risk of self-directed polypharmacy. Specific, documented harms include vitamin B6 toxicity causing neuropathy (which can be mistaken for a new symptom), zinc-induced copper deficiency causing a myeloneuropathy, vitamin-D megadosing causing hypercalcemia, serotonin syndrome from 5-HTP with an SSRI, dangerous drug interactions, and outright toxic 'treatments' like chlorine-dioxide/MMS. The fix is cheap and high-value: a full medication-and-supplement reconciliation, then stopping anything unproven and harmful. Subtract before you add.",
    category: "diagnostic",
    priorLogit: -1.0,
    impactMultiplier: 2.6,
    testIds: ["med_review"],
    treatmentIds: ["deprescribe"],
  },
  {
    id: "autonomic_pots",
    name: "Autonomic dysfunction / POTS",
    shortDescription:
      "The autonomic nervous system mis-regulates heart rate and blood flow — racing heart and dizziness on standing.",
    detail:
      "Dysautonomia, including postural orthostatic tachycardia syndrome (POTS), is one of the more confidently identifiable mechanisms because it has a cheap, near-confirmatory test: a sustained heart-rate rise of ≥30 bpm (≥40 in teens) on standing without a big blood-pressure drop, measured by a 10-minute NASA lean test or tilt-table. Treatments are symptomatic rather than curative — salt and fluids, compression, and selectively beta-blockers, ivabradine, or midodrine. Notably, the RECOVER-AUTONOMIC trial found ivabradine lowered heart rate but did not improve symptoms, so drugs target the number more than the suffering.",
    category: "organic",
    priorLogit: -1.3,
    impactMultiplier: 1.9,
    testIds: ["standing_test", "tilt_table"],
    treatmentIds: ["salt_fluids", "compression", "beta_blocker", "ivabradine", "midodrine", "ivig_autonomic"],
  },
  {
    id: "sleep_circadian",
    name: "Sleep & circadian disruption",
    shortDescription:
      "Insomnia, unrefreshing sleep, or circadian misalignment — both a cause and amplifier of fatigue and brain fog.",
    detail:
      "Illness and prolonged time in bed readily upset sleep and circadian rhythm, producing insomnia or hypersomnia that then drives fatigue, brain fog, and low mood. The single highest-yield action here is screening for obstructive sleep apnea (STOP-BANG → a home sleep test), which is common, undiagnosed, treatable, and both mimics and worsens Long COVID. CBT-I has the best evidence for chronic insomnia generally; melatonin, light therapy, and orexin antagonists are low-risk but unproven specifically for Long COVID (RECOVER-SLEEP results are pending). Wakefulness drugs like modafinil can mask exertional limits and should be reserved for true excessive sleepiness.",
    category: "mixed",
    priorLogit: -0.9,
    impactMultiplier: 1.8,
    testIds: ["osa_screen", "sleep_study", "sleep_diary"],
    treatmentIds: ["cbti", "melatonin", "light_therapy", "modafinil", "treat_underlying"],
  },
  {
    id: "deconditioning",
    name: "Deconditioning",
    shortDescription:
      "Loss of cardiovascular and muscular fitness from inactivity — sets in within weeks, faster than people expect.",
    detail:
      "Physical deconditioning develops within a few weeks of reduced activity and produces breathlessness, exercise intolerance, and fatigue that can masquerade as ongoing disease. Where post-exertional malaise (PEM) is absent, cautious, symptom-titrated reconditioning — strength work, inspiratory muscle training, then gentle aerobic activity — genuinely helps capacity (though often not fatigue). The critical safety caveat: if PEM is present, graded or fixed-incremental exercise can cause lasting harm, and pacing within an energy envelope is required instead. Screen for PEM before any exercise advice.",
    category: "mixed",
    priorLogit: -0.7,
    impactMultiplier: 1.3,
    testIds: ["cpet", "two_day_cpet"],
    treatmentIds: ["structured_pacing", "resistance_exercise", "inspiratory_muscle_training", "cardiopulmonary_rehab"],
  },
  {
    id: "false_fatigue_alarms",
    name: "False fatigue alarms / functional disorder",
    shortDescription:
      "An over-protective nervous system generates fatigue and effort signals out of proportion to the body's actual state.",
    detail:
      "This is the idea that, after a prolonged trigger, the nervous system can get 'stuck' over-predicting threat and generating fatigue, effort, and other symptoms disproportionate to any peripheral damage — a predictive-coding or functional-disorder framing. It is the only mechanism with no confirmatory test: it is reached by ruling other things out, and its likelihood rises as organic mechanisms are excluded. This is real and treatable, and it coexists with organic drivers rather than replacing them — it is never 'all in your head.' Pacing, CBT (which helps coping and fatigue but does not assume a psychological cause), and acceptance-based approaches can help; heavily-marketed brain-retraining programs (DNRS, Lightning Process, Gupta) have weak, conflicted evidence and can do harm by implying non-recovery is the patient's fault.",
    category: "brain_based",
    priorLogit: -0.9,
    impactMultiplier: 1.2,
    isExclusionDiagnosis: true,
    testIds: [],
    treatmentIds: ["structured_pacing", "cbt_fatigue", "act_coping"],
  },
  {
    id: "organ_damage",
    name: "Organ damage",
    shortDescription:
      "Direct, structural injury to the heart, lungs, or other organs — more common after severe or hospitalized infection.",
    detail:
      "SARS-CoV-2 can leave structural injury — myocarditis or pericarditis, lung damage with impaired gas transfer, kidney or other organ involvement — particularly after severe or hospitalized infection. It matters not to miss because management is specialist and condition-specific (e.g. guideline care for pericarditis or heart failure). Detection uses targeted imaging and tests: ECG, echocardiography, cardiac MRI with T1/T2 mapping for occult myo/pericarditis, and hyperpolarized 129-Xe MRI for gas-transfer defects invisible on standard CT.",
    category: "organic",
    priorLogit: -1.7,
    impactMultiplier: 1.5,
    testIds: ["ecg", "cardiac_imaging", "pulmonary_function"],
    treatmentIds: ["specialist_care"],
  },
  {
    id: "persistent_virus",
    name: "Persistent virus / viral reservoir",
    shortDescription:
      "SARS-CoV-2 antigen or genetic material persisting in tissue reservoirs months after the acute infection.",
    detail:
      "There is growing biological evidence that viral antigen or RNA can persist in tissue reservoirs for months — circulating spike/nucleocapsid is detectable in a substantial minority of patients on ultra-sensitive (Simoa) assays. Crucially, this is biologically plausible but therapeutically unproven: the best antiviral trials for established Long COVID (Paxlovid in STOP-PASC, PAX-LC, and RECOVER-VITAL) were all null. The most plausible path forward is antigen-enriched subgroup trials, not any currently available 'antiviral protocol.' Be wary of high harm-to-evidence options like off-label high-dose herpesvirus antivirals.",
    category: "organic",
    priorLogit: -1.6,
    impactMultiplier: 0.8,
    testIds: ["antigen_assay", "viral_pcr"],
    treatmentIds: ["paxlovid_lc"],
  },
  {
    id: "ebv_reactivation",
    name: "Epstein-Barr / herpesvirus reactivation",
    shortDescription:
      "Reactivation of latent EBV (or other herpesviruses), associated with fatigue and neurocognitive symptoms.",
    detail:
      "Several studies report recent EBV reactivation (EA-D IgG or VCA IgM positivity) in roughly two-thirds of Long COVID patients versus ~10% of controls, concentrated in fatigue and neurocognitive phenotypes. The serology is cheap, so it is useful for phenotyping — but the association is not proven causation, and there is no completed randomized trial showing that antiviral treatment of EBV helps Long COVID. Valacyclovir is sometimes tried by analogy to ME/CFS work; valganciclovir/ganciclovir carry real toxicity (myelosuppression, nephrotoxicity) and should be approached cautiously given unproven benefit.",
    category: "organic",
    priorLogit: -1.5,
    impactMultiplier: 1.2,
    testIds: ["ebv_serology"],
    treatmentIds: ["valacyclovir"],
  },
  {
    id: "immune_dysfunction",
    name: "Immune dysfunction / autoimmune activation",
    shortDescription:
      "Persistent immune dysregulation or autoantibodies driving inflammation and downstream symptoms.",
    detail:
      "Persistent immune activation, cytokine abnormalities, and functional autoantibodies (e.g. against G-protein-coupled receptors) are among the better-supported biological findings, but no treatment is yet established. The well-designed trials have largely been null — colchicine, the BC007 autoantibody-neutralizing aptamer (company phase II), and leronlimab all disappointed. Low-dose naltrexone is the lowest-risk option with real patient interest and trials ongoing (prioritized by RECOVER-TLC); low-dose rapamycin and baricitinib are in trials. IVIG should be reserved for objectively confirmed autoimmune small-fiber neuropathy, given cost and risk.",
    category: "organic",
    priorLogit: -1.4,
    impactMultiplier: 1.1,
    testIds: ["inflammatory_markers", "autoantibody_panel"],
    treatmentIds: ["ldn", "rapamycin", "ivig_autonomic"],
  },
  {
    id: "mitochondrial",
    name: "Mitochondrial dysfunction",
    shortDescription:
      "Impaired cellular energy production, proposed to underlie fatigue and post-exertional symptoms.",
    detail:
      "Impaired mitochondrial energy production is a plausible driver of fatigue and exertional symptoms, with objective signals on 31-P MRS (slowed phosphocreatine recovery). But the therapeutic story is weak: rigorous trials of CoQ10, NAD+ precursors (NR), oxaloacetate, and AXA1125 all missed their primary endpoints. Several popular supplements (urolithin A, NMN, MitoQ) have no Long COVID trial at all. The best dataset signal in this space was L-arginine plus vitamin C, but only in a single-blind study needing replication. Costs are non-trivial and largely out-of-pocket.",
    category: "organic",
    priorLogit: -1.4,
    impactMultiplier: 0.8,
    testIds: ["mito_mrs"],
    treatmentIds: ["coq10", "l_arginine_vitc", "creatine"],
  },
  {
    id: "microclots",
    name: "Microclots (amyloid fibrin)",
    shortDescription:
      "Abnormal fibrin-amyloid microclots proposed to impair oxygen delivery — biologically intriguing, clinically contested.",
    detail:
      "The fibrinaloid-microclot hypothesis proposes that abnormal, clot-resistant microclots impair tissue oxygen delivery. The mechanism is biologically intriguing and supported by growing imaging and proteomic data, but the treatment evidence is weak and contested, and carries serious harm potential. The best randomized evidence — a trial of therapeutic plasma exchange — was negative; 'triple therapy' anticoagulation rests on a small uncontrolled preprint and risks major bleeding; nattokinase is in-vitro only. The rigorous test (the STIMULATE-ICP anticoagulation arm) has not yet reported. Any anticoagulation/apheresis decision belongs with a physician, never self-directed.",
    category: "organic",
    priorLogit: -1.5,
    impactMultiplier: 1.0,
    testIds: ["microclot_imaging", "d_dimer"],
    treatmentIds: ["antiplatelet", "anticoagulation_trial"],
  },
  {
    id: "bbb_damage",
    name: "Blood-brain barrier damage",
    shortDescription:
      "Leakage of the blood-brain barrier, measurable in brain-fog patients — but with no targeted treatment yet.",
    detail:
      "Imaging work (DCE-MRI) has shown measurable blood-brain-barrier leakage specifically in patients with brain fog, alongside sustained systemic inflammation — making this a real, measurable phenomenon rather than a metaphor. However, there is no proven BBB-targeted therapy; approaches are experimental or borrowed from the immune and microclot toolkits, and 'BBB repair supplements' are unproven. Candidate blood biomarkers (GFAP, neurofilament light) are under study but not yet clinically validated for Long COVID.",
    category: "organic",
    priorLogit: -1.8,
    impactMultiplier: 0.6,
    testIds: ["bbb_mri", "neuro_biomarkers"],
    treatmentIds: [],
  },
  {
    id: "depression",
    name: "Depression",
    shortDescription:
      "A depressive episode — which can be triggered by inflammation and independently worsens fatigue and cognition.",
    detail:
      "Depression can be both a consequence of chronic illness and inflammation and an independent driver of fatigue, poor concentration, and unrefreshing sleep. It is cheap to screen for (PHQ-9 or a clinical interview) and treatable, and treating genuine comorbid depression can lift fatigue and function regardless of the other mechanisms in play. This is identified and treated on its own terms — antidepressants, therapy, exercise as tolerated — not as a claim that the rest of the illness is psychological.",
    category: "mixed",
    priorLogit: -1.0,
    impactMultiplier: 1.5,
    testIds: ["phq9"],
    treatmentIds: ["cbt_fatigue", "antidepressant"],
  },
  {
    id: "anxiety_somatization",
    name: "Anxiety / somatization",
    shortDescription:
      "Anxiety, health anxiety, or symptom amplification — real physiological effects that can mimic organic disease.",
    detail:
      "Anxiety — including health anxiety and somatic symptom amplification — produces real physiological symptoms (palpitations, chest tightness, breathlessness, dizziness) that overlap heavily with organic Long COVID and can amplify the perception of other symptoms. Roughly a third of emergency-room chest pain that looks cardiac is actually anxiety, which gives a sense of how large this overlap can be. Screening is cheap (GAD-7, PHQ-15), and CBT and meditation help. As with depression, this coexists with organic mechanisms rather than replacing them.",
    category: "mixed",
    priorLogit: -1.0,
    impactMultiplier: 1.4,
    testIds: ["gad7"],
    treatmentIds: ["cbt_fatigue", "meditation"],
  },
  {
    id: "high_stress",
    name: "High stress / burnout",
    shortDescription:
      "Sustained stress dysregulating the stress axis — a predisposing and perpetuating contributor to fatigue.",
    detail:
      "Sustained psychological stress can dysregulate the stress (HPA) axis and contribute to fatigue, poor sleep, and burnout, often acting as a predisposing and perpetuating factor that makes recovery harder. It is assessed by history, with cortisol and heart-rate-variability as adjuncts, and addressed with stress-reduction approaches — CBT, mindfulness, and meditation — which are low-risk and benefit the mood-and-stress cluster broadly.",
    category: "mixed",
    priorLogit: -1.1,
    impactMultiplier: 1.2,
    testIds: ["stress_history"],
    treatmentIds: ["meditation", "cbt_fatigue"],
  },
];
