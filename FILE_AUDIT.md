# Repository File & Folder Audit

This document contains the complete structural audit of the Code Liberators Redrob Candidate Ranker repository files, folders, configurations, and dependencies.

---

## 1. Directory Tree Overview

```
code_liberators/
├── .git/                      # Version control database
├── config/                    # Tuning configurations (YAML)
│   └── weights.yaml           # Ensembling weights config (baseline)
├── docs/                      # Presentation decks & documentation
├── frontend/                  # React Vite Frontend Application
│   ├── dist/                  # Compiled production static bundle
│   ├── node_modules/          # Node dependencies
│   ├── src/                   # React source files
│   │   ├── assets/            # Static assets (logos, icons)
│   │   ├── components/        # Reusable component units
│   │   │   ├── common/        # Shared presentation components (Avatar, Skeletons)
│   │   │   ├── dashboard/     # Dashboard metrics & storytelling
│   │   │   ├── layout/        # Shell sidebar, header, command palette
│   │   │   └── rankings/      # Shortlist table and profile drawer
│   │   ├── pages/             # View router page nodes
│   │   ├── App.jsx            # Main app router and coordinator
│   │   ├── index.css          # Design system stylesheet
│   │   └── main.jsx           # React mounting entry point
│   ├── index.html             # Shell index page
│   ├── package.json           # Frontend dependency manifest
│   ├── vercel.json            # Vercel edge reverse proxy routing configs
│   └── vite.config.js         # Vite dev server proxy & chunk bundler configs
├── outputs/                   # Execution CSV exports
│   ├── final_submission.csv   # Calibrated hybrid results (identical to root submission)
│   └── structured_baseline.csv # Baseline structured-only results
├── precomputed/               # Precomputed FAISS index caches (excluded from git)
│   ├── candidate_ids.pkl      # Ordered mapping of FAISS vectors to candidate IDs
│   ├── faiss.index            # Dense vector index flat space (153.6 MB)
│   └── metadata.pkl           # Precomputation runtime specifications
├── src/                       # FastAPI Backend Python Application
│   ├── api/                   # API routes and models
│   │   ├── main.py            # FastAPI entrypoint and router
│   │   └── top100_details.json # PRECOMPUTED: Rich details for top-100 candidates
│   ├── embeddings/            # Dense vector embeddings encoders
│   │   ├── index.py           # FAISS search wrapper
│   │   └── model.py           # SentenceTransformers encoder wrapper
│   ├── evaluation/            # Diagnostics metrics
│   │   └── diagnostics.py     # Pipeline validator & checker
│   ├── explanation/           # Generative ML reasoning
│   │   └── generator.py       # Rule-based candidate justification builder
│   ├── features/              # Feature mining extractor modules
│   │   ├── behavioral.py      # Behavioral signals parser (availability, rr)
│   │   ├── career.py          # Career trajectory & hop auditor
│   │   ├── extractor.py       # Master feature extractor pipeline
│   │   ├── honeypot.py        # Keyword stuffer & fraud filter
│   │   ├── skills.py          # Skills weight & endorsement parser
│   │   └── title.py           # Job title matching semantic classes
│   ├── ingestion/             # JSONL stream parser
│   │   └── loader.py          # Memory-efficient candidates reader
│   ├── output/                # CSV writer & checks
│   │   └── formatter.py       # Submission CSV builder
│   ├── reranking/             # Reranker models (optional)
│   │   └── cross_encoder.py   # CrossEncoder model wrapper
│   └── scoring/               # Scorer ensemble
│       └── ensemble.py        # Ensemble weight mixer & calibration formulas
├── tests/                     # Integration tests
│   ├── test_features.py       # Features unit tests
│   └── test_pipeline.py       # Pipeline flow integration tests
├── .gitignore                 # Excluded directories
├── API_MAPPING.md             # API endpoint mapping
├── precompute.py              # CLI precompute index script
├── rank.py                    # CLI baseline ranker script
├── rank_advanced.py           # CLI advanced hybrid ranker script
├── README.md                  # System setup guide
├── requirements.txt           # Backend python dependencies manifest
├── submission_metadata.yaml   # Registry metadata
├── team_code_liberators.csv   # Final submission CSV (100 rows)
└── UI_AUDIT.md                # UI architecture audit
```

---

## 2. Dependencies & Build Audits

### Backend (`requirements.txt`)
*   `fastapi` & `uvicorn`: Web routing framework & HTTP server.
*   `torch` & `transformers` & `sentence-transformers`: Vector representations (`BAAI/bge-small-en-v1.5`).
*   `numpy` & `pandas`: Numerical feature processing.
*   `faiss-cpu`: Dense vector indexing for similarity retrieval.
*   `scikit-learn`: Feature calibration scaling.

### Frontend (`package.json`)
*   `react` & `react-dom` (v18.2): Rendering engine.
*   `react-router-dom`: SPA path routes routing.
*   `recharts`: Performance visualizer graphs.
*   `lucide-react`: Clean UI SVG vector icons.
*   `vite`: Speed-optimized build bundler.
