#!/usr/bin/env python3
"""
Code Liberators — Advanced Candidate Ranker (with Semantic Retrieval)

Three-stage pipeline:
  Stage 1: Structured feature extraction + semantic retrieval (FAISS)
  Stage 2: Cross-encoder reranking (optional)
  Stage 3: Ensemble scoring + behavioral calibration + reasoning

Usage:
    python rank_advanced.py --candidates ./candidates.jsonl \\
                            --precomputed-dir ./precomputed \\
                            --output ./team_code_liberators.csv

Fallback: If precomputed data is missing, falls back to structured features only.
"""

import argparse
import sys
import time
import pickle
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).parent / "src"))

from ingestion.loader import CandidateLoader
from features.extractor import FeatureExtractor
from scoring.ensemble import EnsembleScorer
from explanation.generator import ReasoningGenerator
from output.formatter import SubmissionFormatter
from embeddings.model import EmbeddingModel, build_jd_text
from embeddings.index import VectorIndex
from reranking.cross_encoder import CrossEncoderReranker


def load_precomputed(precomputed_dir: Path):
    """Load precomputed embeddings and index if available."""
    index_path = precomputed_dir / "faiss.index"
    ids_path = precomputed_dir / "candidate_ids.pkl"

    if not index_path.exists():
        return None, None

    print("Loading precomputed FAISS index...")
    index = VectorIndex()
    index.load(str(index_path), str(ids_path))

    with open(ids_path, 'rb') as f:
        candidate_ids = pickle.load(f)

    print(f"Loaded index with {len(candidate_ids)} vectors")
    return index, candidate_ids


def semantic_retrieval(jd_text: str, index: VectorIndex, candidate_map: dict,
                       model: EmbeddingModel, k: int = 500) -> set:
    """Retrieve top-k candidates by semantic similarity."""
    jd_embedding = model.encode_single(build_jd_text(jd_text))
    scores, indices = index.search(jd_embedding, k=k)

    retrieved_ids = set()
    for idx in indices:
        cid = index.get_candidate_id(int(idx))
        if cid and cid in candidate_map:
            retrieved_ids.add(cid)

    return retrieved_ids


def main():
    parser = argparse.ArgumentParser(
        description="Advanced candidate ranker with semantic retrieval"
    )
    parser.add_argument("--candidates", required=True, help="Path to candidates.jsonl")
    parser.add_argument("--output", required=True, help="Output CSV path")
    parser.add_argument("--precomputed-dir", default="./precomputed",
                        help="Directory with precomputed embeddings")
    parser.add_argument("--jd-text", default=None,
                        help="Job description text (optional, for semantic search)")
    parser.add_argument("--use-semantic", action="store_true",
                        help="Enable semantic retrieval (requires precomputed data)")
    parser.add_argument("--use-reranker", action="store_true",
                        help="Enable cross-encoder reranking")
    parser.add_argument("--top-k", type=int, default=100)
    parser.add_argument("--yoe-min", type=float, default=4.0)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    start_time = time.time()
    verbose = args.verbose

    def log(msg: str):
        if verbose:
            elapsed = time.time() - start_time
            print(f"[{elapsed:6.2f}s] {msg}")

    log("=" * 60)
    log("Code Liberators — Advanced Ranker")
    log("=" * 60)

    # ------------------------------------------------------------------
    # Load candidates
    # ------------------------------------------------------------------
    log("Loading candidates...")
    loader = CandidateLoader(args.candidates)
    total = loader.count()
    log(f"Total candidates: {total:,}")

    # Load all candidates into memory for fast access
    log("Loading candidates into memory...")
    all_candidates = loader.load_all()
    candidate_map = {c['candidate_id']: c for c in all_candidates}
    log(f"Loaded {len(all_candidates):,} candidates into memory")

    # ------------------------------------------------------------------
    # Optional: Load semantic retrieval components
    # ------------------------------------------------------------------
    semantic_available = False
    index = None
    embed_model = None

    if args.use_semantic:
        precomputed_dir = Path(args.precomputed_dir)
        index, _ = load_precomputed(precomputed_dir)

        if index and index.available:
            embed_model = EmbeddingModel()
            if embed_model.available:
                semantic_available = True
                log("Semantic retrieval enabled")
            else:
                log("WARNING: Embedding model not available")
        else:
            log("WARNING: Precomputed index not found. Semantic retrieval disabled.")

    # ------------------------------------------------------------------
    # Optional: Load cross-encoder reranker
    # ------------------------------------------------------------------
    reranker = None
    if args.use_reranker:
        reranker = CrossEncoderReranker()
        if reranker.available:
            log("Cross-encoder reranking enabled")
        else:
            log("WARNING: Cross-encoder not available")

    # ------------------------------------------------------------------
    # Stage 1: Feature extraction (all candidates)
    # ------------------------------------------------------------------
    log("Extracting features...")
    extractor = FeatureExtractor()

    # If semantic retrieval is available, get top candidates from FAISS
    semantic_candidates = None
    if semantic_available:
        log("Running semantic retrieval...")
        semantic_candidates = semantic_retrieval(
            args.jd_text, index, candidate_map, embed_model, k=2000
        )
        log(f"Semantic retrieval returned {len(semantic_candidates)} candidates")

    all_features = []
    for candidate in all_candidates:
        yoe = candidate['profile']['years_of_experience']
        if yoe < args.yoe_min:
            title = candidate['profile']['current_title'].lower()
            if yoe < 3 or not any(t in title for t in ['ai engineer', 'ml engineer', 'data scientist']):
                continue

        features = extractor.extract(candidate)

        # Add semantic score if available
        if semantic_available:
            cid = candidate['candidate_id']
            # Check if this candidate was in semantic top-k
            if semantic_candidates and cid in semantic_candidates:
                features['semantic_score'] = 0.8  # High semantic relevance
            else:
                features['semantic_score'] = 0.2  # Low semantic relevance

        all_features.append(features)

    log(f"Features extracted for {len(all_features):,} candidates")

    # ------------------------------------------------------------------
    # Stage 2: Ensemble scoring
    # ------------------------------------------------------------------
    log("Ensemble scoring...")
    scorer = EnsembleScorer()
    ranked = scorer.rank_candidates(all_features)
    top_500 = ranked[:500]
    log(f"Top 500 selected by ensemble score")

    # ------------------------------------------------------------------
    # Stage 3: Cross-encoder reranking (optional)
    # ------------------------------------------------------------------
    if reranker and reranker.available and args.jd_text:
        log("Cross-encoder reranking top 500...")
        # Get raw candidates for top 500
        top_candidates = [candidate_map[f['candidate_id']] for f in top_500]
        reranked = reranker.rerank(args.jd_text, top_candidates)

        # Update features with reranker scores
        for (candidate, rerank_score), features in zip(reranked, top_500):
            # Blend reranker score with ensemble score
            features['final_score'] = 0.6 * rerank_score + 0.4 * features['final_score']

        # Re-sort
        top_500.sort(key=lambda x: x['final_score'], reverse=True)
        for i, f in enumerate(top_500):
            f['rank'] = i + 1

        log("Reranking complete")

    # Take top-K
    top_k = top_500[:args.top_k]

    # ------------------------------------------------------------------
    # Stage 4: Reasoning generation
    # ------------------------------------------------------------------
    log("Generating reasoning...")
    generator = ReasoningGenerator()
    reasonings = generator.generate_batch(top_k)

    # ------------------------------------------------------------------
    # Stage 5: CSV output
    # ------------------------------------------------------------------
    log("Writing CSV...")
    formatter = SubmissionFormatter()
    output_path = formatter.write_csv(top_k, reasonings, args.output)

    # Validate
    issues = formatter.validate_output(output_path)
    if issues:
        log(f"WARNING: {len(issues)} validation issues:")
        for issue in issues:
            log(f"  - {issue}")
    else:
        log("Validation passed!")

    # Summary
    elapsed = time.time() - start_time
    log("=" * 60)
    log(f"COMPLETE in {elapsed:.2f}s")
    log("=" * 60)

    print(f"\nSubmission saved to: {output_path}")
    print(f"Total runtime: {elapsed:.2f}s")

    return 0


if __name__ == "__main__":
    sys.exit(main())
