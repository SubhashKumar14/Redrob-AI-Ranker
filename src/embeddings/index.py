"""
FAISS Vector Index for fast semantic retrieval.
Wraps faiss-cpu with save/load and candidate ID mapping.
Falls back gracefully if faiss is not available.
"""

import logging
import pickle
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional

logger = logging.getLogger(__name__)


class VectorIndex:
    """
    FAISS flat L2 index for candidate embeddings.
    Uses IndexFlatIP (inner product) since embeddings are L2-normalized,
    making IP equivalent to cosine similarity.
    """
    
    def __init__(self, dim: int = 384):
        self.dim = dim
        self.index = None
        self.candidate_ids: List[str] = []
        self.available = False
        self._init_faiss()
    
    def _init_faiss(self):
        """Initialize FAISS, set available=False if not installed."""
        try:
            import faiss
            self.faiss = faiss
            self.available = True
        except ImportError:
            logger.warning("faiss-cpu not installed. Semantic retrieval disabled.")
            self.faiss = None
    
    def build(self, embeddings: np.ndarray, candidate_ids: List[str]):
        """
        Build the FAISS index from embeddings.
        embeddings: (n, dim) float32 array, L2 normalized
        candidate_ids: list of candidate ID strings
        """
        if not self.available:
            raise RuntimeError("FAISS not available")
        
        assert len(embeddings) == len(candidate_ids), "Embedding count must match ID count"
        
        n, dim = embeddings.shape
        self.dim = dim
        
        # Use IndexFlatIP for cosine similarity (embeddings must be L2-normalized)
        self.index = self.faiss.IndexFlatIP(dim)
        
        # Convert to float32 if needed
        emb_f32 = embeddings.astype(np.float32)
        self.index.add(emb_f32)
        self.candidate_ids = list(candidate_ids)
        
        logger.info(f"Built FAISS index with {n} vectors of dim {dim}")
    
    def search(self, query_embedding: np.ndarray, k: int = 500) -> Tuple[np.ndarray, np.ndarray]:
        """
        Search for top-k candidates similar to the query.
        Returns (scores, indices).
        """
        if not self.available or self.index is None:
            raise RuntimeError("Index not available or not built")
        
        q = query_embedding.astype(np.float32).reshape(1, -1)
        scores, indices = self.index.search(q, k)
        return scores[0], indices[0]
    
    def get_candidate_id(self, idx: int) -> Optional[str]:
        """Get candidate ID for an index position."""
        if 0 <= idx < len(self.candidate_ids):
            return self.candidate_ids[idx]
        return None
    
    def get_top_k_ids(self, query_embedding: np.ndarray, k: int = 500) -> List[Tuple[str, float]]:
        """
        Get top-k candidate IDs with their similarity scores.
        Returns list of (candidate_id, score) tuples.
        """
        scores, indices = self.search(query_embedding, k=k)
        results = []
        for score, idx in zip(scores, indices):
            if idx >= 0:  # FAISS returns -1 for invalid
                cid = self.get_candidate_id(int(idx))
                if cid:
                    results.append((cid, float(score)))
        return results
    
    def save(self, index_path: str, ids_path: str = None):
        """Save FAISS index and candidate ID list to disk."""
        if not self.available or self.index is None:
            raise RuntimeError("Nothing to save")
        
        self.faiss.write_index(self.index, str(index_path))
        
        if ids_path is None:
            ids_path = str(index_path).replace('.index', '_ids.pkl')
        
        with open(ids_path, 'wb') as f:
            pickle.dump(self.candidate_ids, f)
        
        logger.info(f"Saved index to {index_path}, IDs to {ids_path}")
    
    def load(self, index_path: str, ids_path: str = None):
        """Load FAISS index and candidate IDs from disk."""
        if not self.available:
            raise RuntimeError("FAISS not available")
        
        self.index = self.faiss.read_index(str(index_path))
        
        if ids_path is None:
            ids_path = str(index_path).replace('.index', '_ids.pkl')
        
        with open(ids_path, 'rb') as f:
            self.candidate_ids = pickle.load(f)
        
        logger.info(f"Loaded index with {self.index.ntotal} vectors")
    
    @property
    def size(self) -> int:
        """Number of vectors in the index."""
        if self.index is None:
            return 0
        return self.index.ntotal
