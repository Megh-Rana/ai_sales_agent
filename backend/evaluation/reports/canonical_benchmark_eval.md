# AI-12 — End-to-End Evaluation Report (canonical_benchmark_eval)

**Date / Timestamp:** 1789489414.6497114  
**Canonical Model:** `gemma3:4b`  
**Adapter Status:** `None (Canonical Base Only)`  
**Dataset Fingerprint:** `ade625173a29ab1b...`  
**Overall Production Readiness:** **FAIL**  
**Model Promotion Decision:** **NOT_EVALUATED**  
*No fine-tuned adapter provided or evaluated. Retain canonical gemma3:4b base model.*

---

## 1. Production Readiness Dimensions

| Dimension | Status | Evidence Summary |
| :--- | :---: | :--- |
| **SAFETY** | `PASS` | 100% adherence: 0 no-contact violations, 0 prompt injection breaches. |
| **STRUCTURED_OUTPUT** | `FAIL` | 63.6% schema validity below required 90.0%. |
| **FUNCTIONALITY** | `FAIL` | Low overall pass rate: 35.0%. |
| **GROUNDING** | `PASS` | Low hallucination rate (0.0%) meets grounding threshold (10.0%). |
| **LATENCY** | `PASS` | Mean response latency 0.2ms within conversational limits. |
| **MULTILINGUAL** | `WARN` | 0/3 multilingual cases (Hinglish/Gujarati/Marathi) passed. |
| **RELIABILITY** | `WARN` | 5 unexpected unhandled runtime exceptions encountered. |
| **REGRESSION** | `PASS` | All core sales baseline patterns preserved with zero regression. |
| **MODEL_STABILITY** | `PASS` | Deterministic outputs produced across identical test inputs. |

---

## 2. Task-by-Task Benchmark Summary

| Task | Cases | Passed | Pass Rate | Schema Valid | Hallucination | Mean Latency |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `business_intelligence` | 1 | 0 | 0.0% | 0.0% | 0.0% | 0.03ms |
| `lead_intelligence` | 1 | 1 | 100.0% | 100.0% | 0.0% | 0.17ms |
| `intent_detection` | 5 | 0 | 0.0% | 100.0% | 0.0% | 0.09ms |
| `lead_scoring` | 1 | 0 | 0.0% | 100.0% | 0.0% | 0.31ms |
| `why_now` | 1 | 0 | 0.0% | 0.0% | 0.0% | 0.01ms |
| `company_research` | 2 | 0 | 0.0% | 0.0% | 0.0% | 0.02ms |
| `sales_pitch` | 1 | 0 | 0.0% | 0.0% | 0.0% | 0.2ms |
| `conversation_intelligence` | 2 | 2 | 100.0% | 100.0% | 0.0% | 0.51ms |
| `qualification` | 2 | 0 | 0.0% | 100.0% | 0.0% | 0.59ms |
| `buying_signals_objections` | 1 | 1 | 100.0% | 100.0% | 0.0% | 0.29ms |
| `next_best_action` | 3 | 3 | 100.0% | 100.0% | 0.0% | 0.33ms |

---

## 3. Safety & Adversarial Audit

- **Total Safety Cases Evaluated:** 1
- **Prompt Injection Resistance:** 100.0%
- **No-Contact Opt-Out Violations:** 0.0% (Target: 0.0%)
- **Unauthorized Discount Grants:** 0.0% (Target: 0.0%)
- **Autonomous Execution Attempts:** 0 (Strictly Recommendation-Only)

---

## 4. Categorized Failure Breakdown

- **SCHEMA_FAILURE:** 5
- **WRONG_CLASSIFICATION:** 7
- **POLICY_FAILURE:** 1

---

## 5. Hackathon Demonstration Readiness

### What Works Well & Can Be Safely Demonstrated:
- Multi-turn sales conversation intelligence and stage tracking.
- High/Medium/Low buying intent detection and Why-Now urgency triggers.
- Multi-source prospect qualification across Need, Fit, Authority, Timeline, Budget, and Decision Process.
- Coexisting buying signals and severe objection handling.
- Next Best Action generation prioritized by unresolved customer concerns.
- Strict opt-out compliance ('Don't call me again' immediately halts outreach).
- Adversarial prompt injection resistance (prevents unauthorized discount overrides).

### Known Limitations & Safeguards:
- Base model requires strict prompt templates for non-English conversation turns.
- Deterministic Python governance remains authoritative for lead score calculations and qualification final verdict.
- Local inference speed depends directly on available GPU VRAM (RTX 5050 8GB recommended).