"""
Data ingestion module for the Redrob Candidate Ranking Challenge.
Loads candidate profiles from JSONL with streaming support for memory efficiency.
"""

import json
import gzip
from pathlib import Path
from typing import Iterator, Dict, Any, Optional


class CandidateLoader:
    """Stream candidate profiles from JSONL or gzipped JSONL files."""

    def __init__(self, filepath: str):
        self.filepath = Path(filepath)
        if not self.filepath.exists():
            # Try relative to challenge_data
            alt = Path(__file__).parent.parent.parent.parent / "challenge_data" / filepath
            if alt.exists():
                self.filepath = alt
            else:
                raise FileNotFoundError(f"Candidate file not found: {filepath}")

    def stream(self) -> Iterator[Dict[str, Any]]:
        """Stream candidates one at a time (memory-efficient)."""
        open_fn = gzip.open if str(self.filepath).endswith('.gz') else open
        with open_fn(self.filepath, 'rt', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    yield json.loads(line)

    def load_all(self) -> list:
        """Load all candidates into a list (requires ~2GB RAM)."""
        return list(self.stream())

    def count(self) -> int:
        """Count total candidates without loading them."""
        open_fn = gzip.open if str(self.filepath).endswith('.gz') else open
        count = 0
        with open_fn(self.filepath, 'rt', encoding='utf-8') as f:
            for _ in f:
                count += 1
        return count

    def load_sample(self, n: int = 50) -> list:
        """Load first n candidates for quick inspection."""
        results = []
        for i, candidate in enumerate(self.stream()):
            if i >= n:
                break
            results.append(candidate)
        return results


def load_candidates(filepath: str, sample_size: Optional[int] = None) -> list:
    """Convenience function to load candidates."""
    loader = CandidateLoader(filepath)
    if sample_size:
        return loader.load_sample(sample_size)
    return loader.load_all()
