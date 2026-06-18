"""
BGE Embedding Model wrapper for semantic retrieval.
Uses sentence-transformers with BAAI/bge-small-en-v1.5 (fast, accurate, CPU-friendly).

Falls back gracefully if sentence-transformers is not installed.
"""

import logging
from typing import List, Optional
import numpy as np

logger = logging.getLogger(__name__)

# Model selection: bge-small-en-v1.5 balances speed and quality for CPU
BGE_MODEL = "BAAI/bge-small-en-v1.5"
# Prefix required by BGE for queries (not for corpus documents)
BGE_QUERY_PREFIX = "Represent this sentence for searching relevant passages: "


def build_jd_text(jd_raw: str = None) -> str:
    """
    Build the job description text used for semantic retrieval.
    Uses the actual JD content from the challenge.
    """
    if jd_raw:
        return jd_raw
    
    # Hard-coded JD summary for reproducibility (from job_description.docx analysis)
    return """
    Senior AI Engineer — Founding Team
    
    We are looking for a senior AI/ML engineer to join our founding team and build
    state-of-the-art information retrieval, ranking, and recommendation systems.
    
    Required skills: Python, embeddings, vector search, LLMs, information retrieval,
    NDCG, MRR, MAP, sentence transformers, FAISS, hybrid search, RAG, fine-tuning LLMs,
    Hugging Face Transformers.
    
    Preferred skills: Pinecone, Weaviate, Qdrant, Elasticsearch, OpenSearch, LangChain,
    LlamaIndex, MLflow, MLOps, PyTorch, TensorFlow, NLP, machine learning, deep learning,
    recommendation systems, prompt engineering.
    
    Experience: 5-9 years preferred in AI/ML product companies.
    Role: Build production AI systems, not POCs. Strong ownership mentality required.
    Company type: Product company experience strongly preferred over services.
    """


class EmbeddingModel:
    """
    Wrapper for sentence-transformers embedding model.
    Designed for CPU inference with batch processing.
    """
    
    def __init__(self, model_name: str = BGE_MODEL):
        self.model_name = model_name
        self.model = None
        self.available = False
        self._load_model()
    
    def _load_model(self):
        """Load the embedding model, set available=False if not possible."""
        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(self.model_name)
            self.model.max_seq_length = 256  # cap for speed
            self.available = True
            logger.info(f"Embedding model loaded: {self.model_name}")
        except ImportError:
            logger.warning("sentence-transformers not installed. Semantic retrieval disabled.")
        except Exception as e:
            logger.warning(f"Could not load embedding model: {e}. Semantic retrieval disabled.")
    
    def encode(self, texts: List[str], batch_size: int = 64, show_progress: bool = False) -> np.ndarray:
        """
        Encode a list of texts to embeddings.
        Returns numpy array of shape (n, embedding_dim).
        """
        if not self.available:
            raise RuntimeError("Embedding model not available")
        
        # BGE requires no prefix for corpus documents
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=show_progress,
            normalize_embeddings=True,  # L2 normalize for cosine similarity via dot product
            convert_to_numpy=True,
        )
        return embeddings
    
    def encode_single(self, text: str) -> np.ndarray:
        """Encode a single text (e.g., query) with BGE query prefix."""
        if not self.available:
            raise RuntimeError("Embedding model not available")
        
        query_text = BGE_QUERY_PREFIX + text
        embedding = self.model.encode(
            [query_text],
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return embedding[0]
    
    def build_candidate_text(self, candidate: dict) -> str:
        """
        Build a text representation of a candidate for embedding.
        Uses profile summary + current title + top skills + career headline.
        """
        profile = candidate.get('profile', {})
        skills = candidate.get('skills', [])
        career = candidate.get('career_history', [])
        
        # Sort skills by endorsements (best ones first)
        top_skills = sorted(skills, key=lambda s: s.get('endorsements', 0), reverse=True)[:10]
        skill_text = ', '.join(s['name'] for s in top_skills)
        
        # Career summary (last 2 jobs)
        career_text = '; '.join(
            f"{j['title']} at {j['company']}" 
            for j in career[:2]
        )
        
        parts = [
            profile.get('current_title', ''),
            profile.get('headline', ''),
            profile.get('summary', '')[:200],  # cap summary length
            f"Skills: {skill_text}",
            f"Career: {career_text}",
            f"YOE: {profile.get('years_of_experience', 0)} years",
        ]
        
        return ' | '.join(p for p in parts if p.strip())
