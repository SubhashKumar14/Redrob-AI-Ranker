"""
Cross-encoder reranking module.
Uses ms-marco-MiniLM-L6-v2 for precise JD-candidate relevance scoring.
This is Stage 2 of the pipeline: reranks top-K candidates from retrieval.
"""

import numpy as np
from typing import List, Dict, Tuple


class CrossEncoderReranker:
    """
    Cross-encoder reranker for precise candidate-JD matching.
    Uses ms-marco-MiniLM-L6-v2 (22M params, fast on CPU).
    """
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        self.available = False
        self._load_model()
    
    def _load_model(self):
        """Lazy-load the cross-encoder model."""
        try:
            from sentence_transformers import CrossEncoder
            print(f"Loading cross-encoder: {self.model_name}")
            self.model = CrossEncoder(self.model_name, max_length=512)
            self.available = True
            print("Cross-encoder loaded successfully")
        except Exception as e:
            print(f"WARNING: Could not load cross-encoder: {e}")
            print("Reranking will be skipped. Using ensemble scores only.")
            self.available = False
    
    def rerank(self, jd_text: str, candidates: List[Dict], 
               batch_size: int = 16) -> List[Tuple[Dict, float]]:
        """
        Rerank candidates using cross-encoder.
        Returns list of (candidate, score) tuples sorted by score desc.
        """
        if not self.available or not candidates:
            # Fallback: return candidates with their existing scores
            return [(c, c.get('final_score', 0)) for c in candidates]
        
        # Build (JD, candidate_text) pairs
        from embeddings.model import build_candidate_text
        pairs = []
        for candidate in candidates:
            cand_text = build_candidate_text(candidate)
            # Truncate to fit model
            pairs.append((jd_text[:1000], cand_text[:1000]))
        
        # Predict relevance scores
        scores = self.model.predict(pairs, batch_size=batch_size, show_progress_bar=False)
        
        # Sort by score descending
        scored = list(zip(candidates, scores))
        scored.sort(key=lambda x: x[1], reverse=True)
        
        return scored
    
    def rerank_features(self, jd_text: str, features_list: List[Dict],
                        batch_size: int = 16) -> List[Dict]:
        """
        Rerank feature dicts and update their semantic scores.
        Returns features sorted by reranker score.
        """
        if not self.available:
            return features_list
        
        # Need to load original candidates for text - use candidate_id
        # For now, skip if we don't have raw candidates
        # This would be integrated with the main pipeline
        return features_list
