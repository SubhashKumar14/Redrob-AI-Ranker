"""
Title matching module — the MOST IMPORTANT signal per the JD.
Maps candidate current_title to JD relevance tier.

Bug fixed v2: software/backend/full-stack titles dropped from 0.8 → 0.55
(they are adjacent but NOT AI/ML roles; JD explicitly asks for AI specialists).
"""

import yaml
from pathlib import Path
from typing import Dict, Tuple

# Services companies to penalize
SERVICES_COMPANIES = {
    'tcs', 'infosys', 'wipro', 'accenture', 'cognizant', 'capgemini',
    'hcl', 'tech mahindra', 'mindtree', 'l&t infotech', 'mphasis',
    'hexaware', 'persistent', 'zensar', 'birlasoft'
}


def load_title_tiers(config_path: str = None) -> Dict[str, float]:
    """Load title tier mapping from YAML config."""
    if config_path is None:
        config_path = Path(__file__).parent.parent.parent / "config" / "title_tiers.yaml"
    with open(config_path, 'r') as f:
        data = yaml.safe_load(f)
    
    tier_map = {}
    for tier_name, tier_data in data['tiers'].items():
        score = tier_data['score']
        for title in tier_data.get('titles', []):
            tier_map[title.lower()] = score
    return tier_map


# Pre-computed tier map for speed
_TITLE_TIER_MAP = None

def get_tier_map():
    global _TITLE_TIER_MAP
    if _TITLE_TIER_MAP is None:
        _TITLE_TIER_MAP = load_title_tiers()
    return _TITLE_TIER_MAP


class TitleMatcher:
    """Matches candidate titles against the JD target role."""
    
    def __init__(self):
        self.tier_map = get_tier_map()
        self.ideal_titles = [t for t, s in self.tier_map.items() if s >= 1.0]
        self.strong_titles = [t for t, s in self.tier_map.items() if 0.7 <= s < 1.0]
        
    def score_title(self, candidate: dict) -> Tuple[float, str]:
        """
        Score the candidate's title against the JD.
        Returns (score, tier_label).
        
        IMPORTANT: Generic software/backend titles score 0.55 (moderate), NOT 0.8.
        The JD explicitly asks for AI/ML specialists. A plain SWE is adjacent but
        not a target candidate.
        """
        title = candidate['profile']['current_title'].strip().lower()
        
        # Direct lookup
        if title in self.tier_map:
            score = self.tier_map[title]
            # Determine label
            if score >= 1.0:
                return score, 'ideal'
            elif score >= 0.7:
                return score, 'strong'
            elif score >= 0.4:
                return score, 'moderate'
            elif score >= 0.1:
                return score, 'poor'
            else:
                return score, 'mismatch'
        
        # Fuzzy matching for variations
        title_lower = title
        
        # Ideal: AI/ML specialist titles
        if any(kw in title_lower for kw in ['ai engineer', 'ml engineer', 'machine learning engineer']):
            return 1.0, 'ideal'
        if any(kw in title_lower for kw in ['nlp', 'recommendation', 'search engineer', 'recsys']):
            return 1.0, 'ideal'
        if any(kw in title_lower for kw in ['deep learning', 'applied scientist', 'research scientist']):
            return 1.0, 'ideal'
        if any(kw in title_lower for kw in ['computer vision engineer', 'cv engineer']):
            return 1.0, 'ideal'
        
        # Strong: Data scientists and ML-adjacent
        if any(kw in title_lower for kw in ['data scientist', 'data engineer', 'analytics engineer']):
            return 0.75, 'strong'
        if any(kw in title_lower for kw in ['ai specialist', 'ml specialist', 'ai researcher']):
            return 0.75, 'strong'
        
        # Moderate (FIX v2): generic software roles - NOT 0.8, they are adjacent, not target
        if any(kw in title_lower for kw in ['software engineer', 'backend', 'full stack', 'fullstack']):
            return 0.55, 'moderate'
        if any(kw in title_lower for kw in ['platform engineer', 'infrastructure', 'devops', 'sre']):
            return 0.45, 'moderate'
        if any(kw in title_lower for kw in ['analyst', 'cloud', 'qa', 'quality']):
            return 0.35, 'moderate'
        
        # Poor
        if any(kw in title_lower for kw in ['manager', 'support', 'writer', 'sales', 'accountant', 'product manager']):
            return 0.1, 'poor'
        
        # Mismatch
        if any(kw in title_lower for kw in ['mechanical', 'civil', 'graphic', 'hr', 'marketing', 'recruiter']):
            return 0.0, 'mismatch'
        
        # Default for unknown titles
        return 0.3, 'unknown'
    
    def get_title_tier(self, candidate: dict) -> int:
        """
        Return integer tier: 4=ideal, 3=strong, 2=moderate, 1=poor, 0=mismatch.
        """
        score, label = self.score_title(candidate)
        tier_map = {'ideal': 4, 'strong': 3, 'moderate': 2, 'poor': 1, 'mismatch': 0, 'unknown': 1}
        return tier_map.get(label, 1)
    
    def is_ai_title(self, candidate: dict) -> bool:
        """Check if candidate has an AI/ML-related title."""
        score, _ = self.score_title(candidate)
        return score >= 0.75
    
    def get_title_features(self, candidate: dict) -> dict:
        """Extract all title-related features."""
        score, label = self.score_title(candidate)
        return {
            'title_score': score,
            'title_tier': self.get_title_tier(candidate),
            'title_label': label,
            'is_ai_title': score >= 0.75,
            'is_ideal_title': score >= 1.0,
        }
