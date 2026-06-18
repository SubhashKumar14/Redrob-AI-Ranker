# Code Liberators — Redrob AI Candidate Ranker

**INDIA.RUNS Data & AI Challenge: Intelligent Candidate Discovery & Ranking**

> Ranking 100,000 candidates against an adversarial Senior AI Engineer JD in **~52 seconds on CPU** — with zero honeypots in the top-100, a passing official validator, and factual, score-derived reasoning for every candidate.

---

## Team

| Field | Value |
|---|---|
| Team Name | Code Liberators |
| Lead | Subhash Kumar |
| Email | subhash1403kumar@gmail.com |
| Phone | +91 6302181675 |
| GitHub | [SubhashKumar14/Redrob-AI-Ranker](https://github.com/SubhashKumar14/Redrob-AI-Ranker) |

---
## Quick Start (Structured Pipeline — ~52 seconds)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Rank all 100K candidates (Structured baseline)
python rank.py \
  --candidates /path/to/candidates.jsonl \
  --output outputs/structured_baseline.csv \
  --verbose

# 3. Validate
python /path/to/validate_submission.py outputs/structured_baseline.csv
# Output: Submission is valid.
```

---

## Quick Start (Hybrid Semantic Pipeline — ~25 min precompute, then ~60s)

> [!NOTE]
> The precomputed embeddings and FAISS index (`precomputed/`) are **not** committed to this repository because the FAISS index is **153.6 MB**, which exceeds GitHub's **100 MB per-file size limit**. You must run the precomputation script once locally before executing the advanced hybrid pipeline.

```bash
# 1. Precompute embeddings + FAISS index (run once, takes ~25 minutes on CPU)
python precompute.py \
  --candidates /path/to/candidates.jsonl \
  --output-dir ./precomputed \
  --batch-size 128

# 2. Run hybrid ranker (with vector search retrieval)
python rank_advanced.py \
  --candidates /path/to/candidates.jsonl \
  --precomputed-dir ./precomputed \
  --output team_code_liberators.csv \
  --use-semantic \
  --verbose

# 3. Validate final submission
python /path/to/validate_submission.py team_code_liberators.csv
# Output: Submission is valid.
```

---

## Start the Sandbox API

```bash
# From the code_liberators/ directory
uvicorn src.api.main:app --port 8000 --reload

# API is now at:
#   http://localhost:8000/docs          → Swagger UI
#   http://localhost:8000/candidates    → Top-100 ranked candidates
#   http://localhost:8000/jd            → Parsed job description
#   http://localhost:8000/diagnostics   → Pipeline status
#   http://localhost:8000/export/csv    → Download submission CSV
```

---

## Start the Recruiter Dashboard

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## Repository Structure

```
code_liberators/
├── rank.py                      # Main entry point — structured pipeline
├── rank_advanced.py             # Hybrid pipeline (semantic + FAISS)
├── precompute.py                # One-time embedding precomputation
│
├── team_code_liberators.csv     # Final validated submission (100 rows, hybrid winner)
├── submission_metadata.yaml     # Real submission details
│
├── outputs/                     # Ranked output archives
│   ├── final_submission.csv     # Copy of final winning rankings
│   └── structured_baseline.csv  # Structured baseline rankings
│
├── config/
│   ├── title_tiers.yaml        # v2: Software Eng moved to moderate (0.55)
│   ├── skill_ontology.yaml     # 150+ skills with weighted scoring
│   └── behavioral_thresholds.yaml
│
├── src/
│   ├── ingestion/loader.py     # Streaming JSONL loader
│   ├── features/
│   │   ├── extractor.py        # Aggregator for all feature modules
│   │   ├── title.py            # TitleMatcher (v2, bug-fixed)
│   │   ├── career.py           # CareerAnalyzer
│   │   ├── skills.py           # SkillAnalyzer (quality-weighted)
│   │   ├── behavioral.py       # BehavioralScorer
│   │   └── honeypot.py         # HoneypotDetector (8 checks)
│   ├── scoring/ensemble.py     # Weighted ensemble + B(c) + H(c)
│   ├── explanation/generator.py# Reasoning templates (grammar-fixed, v2)
│   ├── embeddings/
│   │   ├── model.py            # BGE sentence-transformer wrapper
│   │   └── index.py            # FAISS IndexFlatIP wrapper
│   ├── reranking/cross_encoder.py  # Cross-encoder (optional)
│   ├── output/formatter.py     # CSV writer + built-in validation
│   └── api/main.py             # FastAPI: 9 endpoints + Swagger
│
├── frontend/                   # React + Vite recruiter dashboard
│   ├── src/App.jsx             # Full dashboard (4 tabs)
│   └── src/index.css           # Design system (dark theme)
│
├── tests/
│   ├── test_features.py        # Unit tests (5 modules)
│   └── test_pipeline.py        # E2E tests (8 tests, 8/8 PASS)
│
├── docs/
│   ├── FINAL_REPORT.md         # Requirements traceability matrix
│   └── deck.md                 # Marp presentation (15 slides)
│
├── requirements.txt
└── README.md
```

---

## System Architecture

```
Job Description (Senior AI Engineer)
              |
   ┌──────────▼──────────┐
   │   Feature Extraction │  100K candidates → features
   │                     │
   │  TitleMatcher (30%) │  Hierarchical taxonomy: ideal→mismatch
   │  CareerAnalyzer(20%)│  Product vs services, trajectory
   │  SkillAnalyzer (20%)│  endorsements × duration × proficiency
   │  YOE Scorer    (15%)│  Gaussian scoring around 5-9yr band
   │  Edu Scorer     (5%)│  Tier-1/2/3 institution scoring
   │  Semantic      (10%)│  BGE embeddings + FAISS (optional)
   └──────────┬──────────┘
              |
   ┌──────────▼──────────┐
   │   Behavioral × B(c) │  Multiplier: [0.70, 1.10]
   │   Honeypot × H(c)   │  Penalty: [0, 1]
   └──────────┬──────────┘
              |
   ┌──────────▼──────────┐
   │   Ensemble Scoring  │  Final weighted score
   │   + Reasoning Gen   │  20+ template patterns
   └──────────┬──────────┘
              |
         Top-100 CSV  →  validate_submission.py → PASS
```

---

## Performance

| Metric | Value |
|---|---|
| Total candidates | 100,000 |
| Candidates scored | 75,077 |
| Pre-filtered (YOE < 3) | 24,923 |
| **Runtime** | **~52 seconds** |
| Honeypots in top-100 | **0** (0%) |
| Official validator | **PASS** |
| Top-10 avg score | 0.798 |
| Top score | 0.8387 |
| Memory usage | < 2 GB |

---

## Scoring Formula

```
score(c) = B(c) × H(c) × (0.30×T + 0.20×C + 0.20×S + 0.15×Y + 0.05×E + 0.10×Sem)

Where:
  T   = Title score (taxonomy-based)
  C   = Career trajectory score
  S   = Skill quality score (endorsements × duration)
  Y   = YOE fit score (Gaussian around 5-9 years)
  E   = Education tier score
  Sem = Semantic similarity score (BGE, optional)
  B(c) = Behavioral multiplier ∈ [0.70, 1.10]
  H(c) = Honeypot penalty ∈ [0, 1] (1 = not a honeypot)
```

---

## Running Tests

```bash
# Unit tests (features)
python -X utf8 tests/test_features.py

# End-to-end pipeline tests (8 tests)
python -X utf8 tests/test_pipeline.py

# Expected output:
# Results: 8 passed, 0 failed out of 8 tests
```

---

## Design Decisions

### Why NOT keyword matching?
The dataset contains ~80 honeypot profiles with keyword stuffing. Pure keyword matching would place these in the top-100 — causing immediate disqualification.

### Why quality-weighted skill scoring?
`endorsements × duration_months × proficiency_weight` defeats keyword stuffers who list 20+ skills with 0 endorsements and 0 months.

### Why services-only penalty?
The JD explicitly prefers product companies. TCS/Infosys candidates who spent their entire career in maintenance projects are de-prioritized regardless of keyword matches.

### Why template-based reasoning instead of LLM?
- Deterministic: same input always produces same output
- No hallucination: facts derived only from scored features
- Fast: < 0.1 seconds for 100 candidates
- No external dependencies or API costs

---

## Dependencies

```
numpy          # Vectorized scoring
pandas         # Data manipulation
scipy          # Statistical functions (YOE Gaussian)
pyyaml         # Config loading
tqdm           # Progress bars
fastapi        # Sandbox API server
uvicorn        # ASGI server
sentence-transformers  # BGE embedding model (optional)
faiss-cpu      # Vector search (optional)
pytest         # Test framework
```

Install:
```bash
pip install -r requirements.txt
```

---

## Submission Artifacts

| Artifact | Status |
|---|---|
| `team_code_liberators.csv` | ✅ 100 rows, validator PASS |
| `submission_metadata.yaml` | ✅ Real contact info |
| `docs/FINAL_REPORT.md` | ✅ RTM + methodology |
| `docs/deck.md` | ✅ 15-slide Marp deck |
| `src/api/main.py` | ✅ 9 endpoints, Swagger |
| `frontend/src/App.jsx` | ✅ Full recruiter dashboard |
| `tests/test_pipeline.py` | ✅ 8/8 tests pass |

---

*Built by Team Code Liberators for the INDIA.RUNS Data & AI Challenge*
