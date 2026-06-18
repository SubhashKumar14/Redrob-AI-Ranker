"""
Enhanced FastAPI backend for the Redrob Candidate Ranker sandbox.
Provides comprehensive endpoints for ranking, candidate exploration,
score breakdown, diagnostics, and comparison.

Endpoints:
  GET  /                      → API info
  GET  /health                → Health check
  GET  /jd                    → Parsed job description summary
  GET  /candidates            → Pre-ranked top-100 from locked submission CSV
  GET  /candidates/{id}       → Detailed features for a specific candidate
  GET  /diagnostics           → Pipeline status, runtime, dataset info
  GET  /comparison            → Structured vs hybrid comparison (if both exist)
  POST /rank/sample           → Rank a small uploaded sample (max 1000)
  POST /rank/json             → Rank uploaded candidates, return JSON
"""

import sys
import csv
import json
import time
import tempfile
import logging
import pickle
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ingestion.loader import CandidateLoader
from features.extractor import FeatureExtractor
from scoring.ensemble import EnsembleScorer
from explanation.generator import ReasoningGenerator
from output.formatter import SubmissionFormatter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────
# App configuration
# ─────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Code Liberators — Redrob Candidate Ranker",
    description="""
AI-powered candidate ranking for the Redrob INDIA.RUNS Hackathon.

Team: Code Liberators | Challenge: Intelligent Candidate Discovery & Ranking

**Architecture:** Structured Feature Ensemble + BGE Semantic Retrieval + Behavioral Calibration
**Runtime:** ~32 seconds for 100K candidates on CPU
""",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────
# Paths
# ─────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent.parent
SUBMISSION_CSV = BASE_DIR / "team_code_liberators.csv"
STRUCTURED_CSV = BASE_DIR / "team_code_liberators_structured.csv"
HYBRID_CSV = BASE_DIR / "team_code_liberators_hybrid.csv"
PRECOMPUTED_DIR = BASE_DIR / "precomputed"

# ─────────────────────────────────────────────────────────────────────
# Cached data
# ─────────────────────────────────────────────────────────────────────
_cached_top100: Optional[List[Dict]] = None
_structured_top100: Optional[List[Dict]] = None
_hybrid_top100: Optional[List[Dict]] = None
_startup_time = time.time()


def _load_csv_ranking(csv_path: Path) -> List[Dict]:
    """Load a submission CSV into a list of row dicts."""
    if not csv_path.exists():
        return []
    rows = []
    with open(csv_path, 'r', encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                'candidate_id': row['candidate_id'],
                'rank': int(row['rank']),
                'score': float(row['score']),
                'reasoning': row['reasoning'],
            })
    return rows


def _get_top100() -> List[Dict]:
    """Return cached top-100 from the primary submission CSV."""
    global _cached_top100
    if _cached_top100 is None:
        path = SUBMISSION_CSV if SUBMISSION_CSV.exists() else STRUCTURED_CSV
        _cached_top100 = _load_csv_ranking(path)
    return _cached_top100


def _get_structured() -> List[Dict]:
    global _structured_top100
    if _structured_top100 is None:
        _structured_top100 = _load_csv_ranking(STRUCTURED_CSV)
    return _structured_top100


def _get_hybrid() -> List[Dict]:
    global _hybrid_top100
    if _hybrid_top100 is None:
        _hybrid_top100 = _load_csv_ranking(HYBRID_CSV)
    return _hybrid_top100


# ─────────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────────
class CandidateResult(BaseModel):
    candidate_id: str
    rank: int
    score: float
    reasoning: str


class RankResponse(BaseModel):
    results: List[CandidateResult]
    total_candidates: int
    runtime_seconds: float
    pipeline: str


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float
    submission_csv_exists: bool
    structured_csv_exists: bool
    hybrid_csv_exists: bool
    precomputed_index_exists: bool


class DiagnosticsResponse(BaseModel):
    pipeline: str
    dataset_size: str
    runtime_seconds: Optional[float]
    embedding_model: str
    faiss_index_status: str
    faiss_index_size: Optional[int]
    structured_csv_exists: bool
    hybrid_csv_exists: bool
    validator_status: str
    memory_note: str
    build_date: str


class JDResponse(BaseModel):
    role: str
    seniority: str
    experience_range: str
    company_type: str
    required_skills: List[str]
    preferred_skills: List[str]
    behavioral_signals: List[str]
    scoring_weights: Dict[str, str]


class ComparisonItem(BaseModel):
    candidate_id: str
    structured_rank: Optional[int]
    hybrid_rank: Optional[int]
    rank_change: Optional[int]
    structured_score: Optional[float]
    hybrid_score: Optional[float]
    reasoning: Optional[str]


class ComparisonResponse(BaseModel):
    overlap_count: int
    structured_only_count: int
    hybrid_only_count: int
    avg_rank_change: float
    items: List[ComparisonItem]
    recommendation: str


# ─────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────
@app.get("/", summary="API info")
async def root():
    return {
        "name": "Code Liberators — Redrob Candidate Ranker",
        "version": "2.0.0",
        "team": "Code Liberators",
        "challenge": "INDIA.RUNS Data & AI Challenge",
        "endpoints": {
            "health": "GET /health",
            "jd": "GET /jd",
            "candidates": "GET /candidates",
            "candidate_detail": "GET /candidates/{id}",
            "diagnostics": "GET /diagnostics",
            "comparison": "GET /comparison",
            "rank_sample": "POST /rank/sample (multipart/form-data)",
            "rank_json": "POST /rank/json (multipart/form-data)",
            "export_csv": "GET /export/csv",
            "docs": "GET /docs",
        }
    }


@app.get("/health", response_model=HealthResponse, summary="Health check")
async def health_check():
    return HealthResponse(
        status="ok",
        version="2.0.0",
        uptime_seconds=round(time.time() - _startup_time, 1),
        submission_csv_exists=SUBMISSION_CSV.exists(),
        structured_csv_exists=STRUCTURED_CSV.exists(),
        hybrid_csv_exists=HYBRID_CSV.exists(),
        precomputed_index_exists=(PRECOMPUTED_DIR / "faiss.index").exists(),
    )


@app.get("/jd", response_model=JDResponse, summary="Parsed job description")
async def get_jd():
    """Return the parsed job description summary."""
    return JDResponse(
        role="Senior AI Engineer — Founding Team",
        seniority="Senior / Staff",
        experience_range="5-9 years (preferred)",
        company_type="Product company strongly preferred",
        required_skills=[
            "Python", "Embeddings", "Vector Search", "LLMs",
            "Information Retrieval", "Ranking (NDCG/MRR/MAP)",
            "Sentence Transformers", "FAISS", "Hybrid Search",
            "RAG", "Fine-tuning LLMs", "Hugging Face Transformers"
        ],
        preferred_skills=[
            "Pinecone", "Weaviate", "Qdrant", "Elasticsearch", "OpenSearch",
            "LangChain", "LlamaIndex", "MLflow", "MLOps", "PyTorch",
            "TensorFlow", "NLP", "Recommendation Systems", "Prompt Engineering"
        ],
        behavioral_signals=[
            "Open to work", "Short notice period (≤30 days preferred)",
            "High recruiter response rate", "Active GitHub",
            "Recent platform activity", "High profile completeness"
        ],
        scoring_weights={
            "Title Match": "30%",
            "Career Trajectory": "20%",
            "Skill Alignment": "20%",
            "YOE Fit": "15%",
            "Education": "5%",
            "Semantic Similarity": "10%",
            "Behavioral Multiplier": "× B(c)",
            "Honeypot Penalty": "× H(c)"
        }
    )


@app.get("/candidates", summary="Top-100 ranked candidates")
async def get_candidates(
    limit: int = Query(100, ge=1, le=100, description="Number of candidates to return"),
    min_score: float = Query(0.0, ge=0.0, le=1.0, description="Minimum score filter"),
    search: str = Query("", description="Filter by candidate ID or reasoning text"),
):
    """Return the pre-ranked top-100 candidates from the locked submission CSV."""
    rows = _get_top100()
    
    if not rows:
        raise HTTPException(404, detail="No submission CSV found. Run rank.py first.")
    
    # Apply filters
    if min_score > 0:
        rows = [r for r in rows if r['score'] >= min_score]
    if search:
        search_lower = search.lower()
        rows = [r for r in rows if 
                search_lower in r['candidate_id'].lower() or 
                search_lower in r['reasoning'].lower()]
    
    return {
        "total": len(rows),
        "candidates": rows[:limit],
        "source_csv": str(SUBMISSION_CSV if SUBMISSION_CSV.exists() else STRUCTURED_CSV),
    }


@app.get("/candidates/{candidate_id}", summary="Candidate detail")
async def get_candidate_detail(candidate_id: str):
    """Return detailed information for a specific candidate by ID."""
    rows = _get_top100()
    
    # Find in top-100
    match = next((r for r in rows if r['candidate_id'] == candidate_id), None)
    if not match:
        raise HTTPException(404, detail=f"Candidate {candidate_id} not found in top-100")
    
    return {
        **match,
        "score_confidence": _get_confidence_label(match['score']),
        "score_breakdown_note": "Run rank.py with --explain flag for full feature breakdown",
    }


def _get_confidence_label(score: float) -> str:
    if score >= 0.80:
        return "Very High"
    elif score >= 0.70:
        return "High"
    elif score >= 0.55:
        return "Medium"
    elif score >= 0.40:
        return "Low"
    return "Very Low"


@app.get("/diagnostics", response_model=DiagnosticsResponse, summary="System diagnostics")
async def get_diagnostics():
    """Return system status, pipeline info, and runtime diagnostics."""
    # Check FAISS index
    index_path = PRECOMPUTED_DIR / "faiss.index"
    faiss_size = None
    faiss_status = "not_built"
    
    if index_path.exists():
        faiss_status = "available"
        meta_path = PRECOMPUTED_DIR / "metadata.pkl"
        if meta_path.exists():
            with open(meta_path, 'rb') as f:
                meta = pickle.load(f)
            faiss_size = meta.get('n_candidates')
    
    # Check pipeline
    pipeline = "hybrid" if HYBRID_CSV.exists() else "structured"
    
    # Check validator
    csv_path = SUBMISSION_CSV if SUBMISSION_CSV.exists() else STRUCTURED_CSV
    validator_status = "not_checked"
    if csv_path.exists():
        import subprocess
        result = subprocess.run(
            ["python", str(BASE_DIR.parent / "challenge_data" / "validate_submission.py"), str(csv_path)],
            capture_output=True, text=True, cwd=str(BASE_DIR)
        )
        validator_status = "PASS" if result.returncode == 0 else f"FAIL: {result.stdout}"
    
    return DiagnosticsResponse(
        pipeline=pipeline,
        dataset_size="100,000 candidates (full official dataset)",
        runtime_seconds=None,
        embedding_model="BAAI/bge-small-en-v1.5",
        faiss_index_status=faiss_status,
        faiss_index_size=faiss_size,
        structured_csv_exists=STRUCTURED_CSV.exists(),
        hybrid_csv_exists=HYBRID_CSV.exists(),
        validator_status=validator_status,
        memory_note="Streaming ingestion keeps memory <2GB",
        build_date="2026-06-18",
    )


@app.get("/comparison", response_model=ComparisonResponse, summary="Structured vs hybrid comparison")
async def get_comparison():
    """Compare structured-only vs hybrid (semantic+FAISS) rankings."""
    structured = _get_structured()
    hybrid = _get_hybrid()
    
    if not structured:
        raise HTTPException(404, detail="Structured CSV not found. Run rank.py first.")
    
    if not hybrid:
        # Return structured-only info
        return ComparisonResponse(
            overlap_count=len(structured),
            structured_only_count=len(structured),
            hybrid_only_count=0,
            avg_rank_change=0.0,
            items=[ComparisonItem(
                candidate_id=r['candidate_id'],
                structured_rank=r['rank'],
                hybrid_rank=None,
                rank_change=None,
                structured_score=r['score'],
                hybrid_score=None,
                reasoning=r['reasoning'],
            ) for r in structured],
            recommendation="Hybrid pipeline not yet run. Using structured-only ranking.",
        )
    
    # Build lookup maps
    s_map = {r['candidate_id']: r for r in structured}
    h_map = {r['candidate_id']: r for r in hybrid}
    
    all_ids = set(list(s_map.keys()) + list(h_map.keys()))
    
    overlap = [cid for cid in all_ids if cid in s_map and cid in h_map]
    structured_only = [cid for cid in all_ids if cid in s_map and cid not in h_map]
    hybrid_only = [cid for cid in all_ids if cid in h_map and cid not in s_map]
    
    rank_changes = []
    items = []
    
    for cid in sorted(all_ids, key=lambda x: h_map.get(x, s_map.get(x, {})).get('rank', 999)):
        sr = s_map.get(cid)
        hr = h_map.get(cid)
        
        rank_change = None
        if sr and hr:
            rank_change = sr['rank'] - hr['rank']  # positive = improved in hybrid
            rank_changes.append(abs(rank_change))
        
        items.append(ComparisonItem(
            candidate_id=cid,
            structured_rank=sr['rank'] if sr else None,
            hybrid_rank=hr['rank'] if hr else None,
            rank_change=rank_change,
            structured_score=sr['score'] if sr else None,
            hybrid_score=hr['score'] if hr else None,
            reasoning=(hr or sr)['reasoning'] if (hr or sr) else None,
        ))
    
    avg_change = sum(rank_changes) / len(rank_changes) if rank_changes else 0.0
    
    # Recommend the better pipeline
    overlap_pct = len(overlap) / max(len(structured), len(hybrid)) * 100
    if overlap_pct >= 90 and avg_change < 5:
        recommendation = "Both pipelines are highly consistent. Hybrid recommended for marginal semantic improvements."
    elif len(hybrid_only) > 5:
        recommendation = "Hybrid pipeline surfaces new candidates. Hybrid recommended."
    else:
        recommendation = "Structured pipeline. Hybrid does not show significant improvement."
    
    return ComparisonResponse(
        overlap_count=len(overlap),
        structured_only_count=len(structured_only),
        hybrid_only_count=len(hybrid_only),
        avg_rank_change=round(avg_change, 2),
        items=items,
        recommendation=recommendation,
    )


@app.get("/export/csv", summary="Download submission CSV")
async def export_csv():
    """Download the final submission CSV."""
    csv_path = SUBMISSION_CSV if SUBMISSION_CSV.exists() else STRUCTURED_CSV
    if not csv_path.exists():
        raise HTTPException(404, "No submission CSV found. Run rank.py first.")
    
    return FileResponse(
        str(csv_path),
        filename="team_code_liberators.csv",
        media_type="text/csv",
    )


@app.post("/rank/sample", response_class=FileResponse, summary="Rank a sample of candidates")
async def rank_sample(candidates_file: UploadFile = File(...)):
    """
    Rank uploaded candidates against the Senior AI Engineer JD.
    Accepts JSONL or JSON file. Max 1000 candidates. Returns ranked CSV.
    """
    start = time.time()
    suffix = ".jsonl" if candidates_file.filename.endswith(".jsonl") else ".json"
    
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False, mode='wb') as tmp:
        content = await candidates_file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        loader = CandidateLoader(tmp_path)
        candidates = loader.load_all()

        if len(candidates) > 1000:
            raise HTTPException(400, "Max 1000 candidates allowed for sandbox")

        extractor = FeatureExtractor()
        scorer = EnsembleScorer()
        generator = ReasoningGenerator()
        formatter = SubmissionFormatter()

        all_features = [extractor.extract(c) for c in candidates]
        ranked = scorer.rank_candidates(all_features)
        top_k = ranked[:min(100, len(ranked))]
        reasonings = generator.generate_batch(top_k)

        output_path = tempfile.mktemp(suffix=".csv")
        formatter.write_csv(top_k, reasonings, output_path)

        return FileResponse(output_path, filename="ranked_candidates.csv", media_type="text/csv")

    except Exception as e:
        logger.error(f"Ranking failed: {e}", exc_info=True)
        raise HTTPException(500, f"Ranking failed: {str(e)}")


@app.post("/rank/json", response_model=RankResponse, summary="Rank candidates, return JSON")
async def rank_json(candidates_file: UploadFile = File(...)):
    """Rank uploaded candidates and return JSON results for frontend integration."""
    start = time.time()
    suffix = ".jsonl" if candidates_file.filename.endswith(".jsonl") else ".json"
    
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False, mode='wb') as tmp:
        content = await candidates_file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        loader = CandidateLoader(tmp_path)
        candidates = loader.load_all()

        extractor = FeatureExtractor()
        scorer = EnsembleScorer()
        generator = ReasoningGenerator()

        all_features = [extractor.extract(c) for c in candidates]
        ranked = scorer.rank_candidates(all_features)
        top_k = ranked[:min(100, len(ranked))]
        reasonings = generator.generate_batch(top_k)

        results = [
            CandidateResult(
                candidate_id=f['candidate_id'],
                rank=f['rank'],
                score=f['score'],
                reasoning=r,
            )
            for f, r in zip(top_k, reasonings)
        ]

        return RankResponse(
            results=results,
            total_candidates=len(candidates),
            runtime_seconds=round(time.time() - start, 2),
            pipeline="structured",
        )

    except Exception as e:
        logger.error(f"Ranking failed: {e}", exc_info=True)
        raise HTTPException(500, f"Ranking failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
