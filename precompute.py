#!/usr/bin/env python3
"""
Code Liberators — Precompute Embeddings + Build FAISS Index
Run ONCE before using the advanced ranker.

Usage:
    python precompute.py \
        --candidates ./candidates.jsonl \
        --output-dir ./precomputed \
        --batch-size 64

This script:
1. Loads all candidates
2. Builds text representation for each
3. Computes BGE embeddings in batches
4. Builds FAISS IndexFlatIP
5. Saves index + candidate IDs to disk

Runtime: ~10-25 minutes for 100K candidates on CPU.
Output size: ~150 MB (index + IDs).
"""

import argparse
import sys
import time
import pickle
from pathlib import Path

import numpy as np
from tqdm import tqdm

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from ingestion.loader import CandidateLoader
from embeddings.model import EmbeddingModel, build_jd_text
from embeddings.index import VectorIndex


def main():
    parser = argparse.ArgumentParser(description="Precompute embeddings for semantic retrieval")
    parser.add_argument("--candidates", required=True, help="Path to candidates.jsonl")
    parser.add_argument("--output-dir", default="./precomputed", help="Directory to save index")
    parser.add_argument("--batch-size", type=int, default=64, help="Embedding batch size (default: 64)")
    parser.add_argument("--model", default="BAAI/bge-small-en-v1.5", help="Sentence transformer model")
    parser.add_argument("--max-candidates", type=int, default=None, help="Limit candidates (for testing)")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    start = time.time()
    
    # ----------------------------------------------------------------
    # Step 1: Load embedding model
    # ----------------------------------------------------------------
    print(f"[{time.time()-start:.1f}s] Loading embedding model: {args.model}")
    model = EmbeddingModel(model_name=args.model)
    if not model.available:
        print("ERROR: Embedding model could not be loaded. Install sentence-transformers.")
        sys.exit(1)
    print(f"[{time.time()-start:.1f}s] Model loaded successfully")

    # ----------------------------------------------------------------
    # Step 2: Load candidates
    # ----------------------------------------------------------------
    print(f"[{time.time()-start:.1f}s] Loading candidates from {args.candidates}...")
    loader = CandidateLoader(args.candidates)
    
    texts = []
    candidate_ids = []
    
    for i, candidate in enumerate(tqdm(loader.stream(), desc="Loading candidates")):
        if args.max_candidates and i >= args.max_candidates:
            break
        
        text = model.build_candidate_text(candidate)
        texts.append(text)
        candidate_ids.append(candidate['candidate_id'])
    
    n = len(texts)
    print(f"[{time.time()-start:.1f}s] Loaded {n:,} candidates")

    # ----------------------------------------------------------------
    # Step 3: Compute embeddings in batches
    # ----------------------------------------------------------------
    print(f"[{time.time()-start:.1f}s] Computing embeddings (batch_size={args.batch_size})...")
    
    all_embeddings = []
    batch_size = args.batch_size
    
    for i in tqdm(range(0, n, batch_size), desc="Embedding batches"):
        batch = texts[i:i+batch_size]
        batch_emb = model.encode(batch, batch_size=batch_size, show_progress=False)
        all_embeddings.append(batch_emb)
    
    embeddings = np.vstack(all_embeddings).astype(np.float32)
    print(f"[{time.time()-start:.1f}s] Embeddings computed: shape={embeddings.shape}")

    # ----------------------------------------------------------------
    # Step 4: Build FAISS index
    # ----------------------------------------------------------------
    print(f"[{time.time()-start:.1f}s] Building FAISS index...")
    index = VectorIndex(dim=embeddings.shape[1])
    if not index.available:
        print("ERROR: faiss-cpu not installed. Install with: pip install faiss-cpu")
        sys.exit(1)
    
    index.build(embeddings, candidate_ids)
    print(f"[{time.time()-start:.1f}s] FAISS index built: {index.size:,} vectors")

    # ----------------------------------------------------------------
    # Step 5: Save to disk
    # ----------------------------------------------------------------
    index_path = output_dir / "faiss.index"
    ids_path = output_dir / "candidate_ids.pkl"
    
    index.save(str(index_path), str(ids_path))
    
    # Also save metadata
    meta = {
        'model': args.model,
        'n_candidates': n,
        'embedding_dim': embeddings.shape[1],
        'build_time_seconds': time.time() - start,
        'candidates_file': args.candidates,
    }
    with open(output_dir / "metadata.pkl", 'wb') as f:
        pickle.dump(meta, f)
    
    elapsed = time.time() - start
    print(f"\n{'='*60}")
    print(f"Precomputation COMPLETE in {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
    print(f"{'='*60}")
    print(f"Index: {index_path} ({index_path.stat().st_size / 1e6:.1f} MB)")
    print(f"IDs:   {ids_path}")
    print(f"Model: {args.model}")
    print(f"Candidates: {n:,}")
    print(f"\nNow run:")
    print(f"  python rank_advanced.py --candidates {args.candidates} \\")
    print(f"    --precomputed-dir {args.output_dir} \\")
    print(f"    --output ./team_code_liberators.csv \\")
    print(f"    --use-semantic --verbose")

    return 0


if __name__ == "__main__":
    sys.exit(main())
