#!/usr/bin/env python3
"""
Code Liberators — Redrob Candidate Ranker
Main ranking script that produces submission.csv from candidates.jsonl.

Usage:
    python rank.py --candidates ./candidates.jsonl --output ./team_code_liberators.csv

This script implements a hybrid ranking system optimized for the challenge scoring:
    0.50 * NDCG@10 + 0.30 * NDCG@50 + 0.15 * MAP + 0.05 * P@10

Architecture: Structured Feature Ensemble with Behavioral Calibration
- Stage 1: Feature extraction (title, career, skills, YOE, behavioral)
- Stage 2: Weighted ensemble scoring with honeypot detection
- Stage 3: Behavioral multiplier calibration
- Stage 4: Reasoning generation and CSV output

Runtime target: < 60 seconds on CPU for 100K candidates.
"""

import argparse
import sys
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from ingestion.loader import CandidateLoader
from features.extractor import FeatureExtractor
from scoring.ensemble import EnsembleScorer
from explanation.generator import ReasoningGenerator
from output.formatter import SubmissionFormatter


def main():
    parser = argparse.ArgumentParser(
        description="Rank candidates for the Redrob AI Challenge"
    )
    parser.add_argument(
        "--candidates",
        required=True,
        help="Path to candidates.jsonl (or .jsonl.gz) file",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Path for output CSV (e.g., team_code_liberators.csv)",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=100,
        help="Number of top candidates to output (default: 100)",
    )
    parser.add_argument(
        "--yoe-min",
        type=float,
        default=4.0,
        help="Minimum years of experience (default: 4.0)",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed progress information",
    )
    args = parser.parse_args()

    start_time = time.time()
    verbose = args.verbose

    def log(msg: str):
        if verbose:
            elapsed = time.time() - start_time
            print(f"[{elapsed:6.2f}s] {msg}")

    log("=" * 60)
    log("Code Liberators — Redrob Candidate Ranker")
    log("=" * 60)

    # ------------------------------------------------------------------
    # Stage 1: Load candidates
    # ------------------------------------------------------------------
    log("Loading candidates...")
    loader = CandidateLoader(args.candidates)
    total_candidates = loader.count()
    log(f"Total candidates to rank: {total_candidates:,}")

    # ------------------------------------------------------------------
    # Stage 2: Feature extraction
    # ------------------------------------------------------------------
    log("Initializing feature extractor...")
    extractor = FeatureExtractor()

    log("Extracting features for all candidates...")
    all_features = []
    processed = 0
    prefiltered = 0

    for candidate in loader.stream():
        processed += 1

        # Quick pre-filter: skip candidates with < min YOE unless they have strong signals
        yoe = candidate['profile']['years_of_experience']
        if yoe < args.yoe_min:
            # Exception: very strong AI title with some YOE
            title = candidate['profile']['current_title'].lower()
            if yoe < 3 or not any(t in title for t in ['ai engineer', 'ml engineer', 'data scientist']):
                prefiltered += 1
                continue

        features = extractor.extract(candidate)
        all_features.append(features)

        if processed % 10000 == 0:
            log(f"  Processed {processed:,} / {total_candidates:,} candidates...")

    log(f"Feature extraction complete: {len(all_features):,} candidates retained ({prefiltered:,} pre-filtered)")

    # ------------------------------------------------------------------
    # Stage 3: Ensemble scoring
    # ------------------------------------------------------------------
    log("Scoring candidates with ensemble model...")
    scorer = EnsembleScorer()
    ranked = scorer.rank_candidates(all_features)

    # Take top-K
    top_k = ranked[:args.top_k]
    log(f"Top {args.top_k} candidates selected")

    # ------------------------------------------------------------------
    # Stage 4: Reasoning generation
    # ------------------------------------------------------------------
    log("Generating reasoning for top candidates...")
    generator = ReasoningGenerator()
    reasonings = generator.generate_batch(top_k)
    log(f"Reasoning generated for {len(reasonings)} candidates")

    # ------------------------------------------------------------------
    # Stage 5: CSV output
    # ------------------------------------------------------------------
    log("Writing submission CSV...")
    formatter = SubmissionFormatter()
    output_path = formatter.write_csv(top_k, reasonings, args.output)
    log(f"Submission written to: {output_path}")

    # ------------------------------------------------------------------
    # Stage 6: Validation
    # ------------------------------------------------------------------
    log("Validating output...")
    issues = formatter.validate_output(output_path)
    if issues:
        log(f"WARNING: {len(issues)} validation issues found:")
        for issue in issues:
            log(f"  - {issue}")
    else:
        log("Output validation passed!")

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    elapsed = time.time() - start_time
    log("=" * 60)
    log(f"RANKING COMPLETE in {elapsed:.2f} seconds")
    log("=" * 60)
    log(f"Total candidates processed: {total_candidates:,}")
    log(f"Candidates scored: {len(all_features):,}")
    log(f"Top-{args.top_k} written to: {output_path}")

    # Show top 10 preview
    log("\nTop 10 Preview:")
    log(f"{'Rank':>5} | {'Score':>7} | {'ID':>12} | {'Title':<30} | {'Reasoning'}")
    log("-" * 120)
    for i in range(min(10, len(top_k))):
        f = top_k[i]
        r = reasonings[i][:60] + "..." if len(reasonings[i]) > 60 else reasonings[i]
        log(f"{f['rank']:>5} | {f['score']:>7.4f} | {f['candidate_id']:>12} | {f['current_title']:<30} | {r}")

    print(f"\nSubmission saved to: {output_path}")
    print(f"Total runtime: {elapsed:.2f}s")

    return 0


if __name__ == "__main__":
    sys.exit(main())
