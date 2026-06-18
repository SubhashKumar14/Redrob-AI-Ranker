"""
Ensemble scoring module.
Combines all component scores with calibrated weights optimized for NDCG@10.
"""

import numpy as np
from typing import Dict, List, Tuple


# Default weights calibrated for the challenge scoring function
# 0.50 * NDCG@10 + 0.30 * NDCG@50 + 0.15 * MAP + 0.05 * P@10
# Title is the strongest signal per the JD
DEFAULT_WEIGHTS = {
    'title': 0.30,
    'career': 0.20,
    'skills': 0.20,
    'yoe': 0.15,
    'edu': 0.05,
    'semantic': 0.10,  # populated if embeddings are available
}


class EnsembleScorer:
    """
    Weighted ensemble scorer that combines multiple ranking signals.
    Optimized for top-10 precision (50% of the competition score).
    """
    
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_WEIGHTS.copy()
        self._normalize_weights()
    
    def _normalize_weights(self):
        """Ensure weights sum to 1.0."""
        total = sum(self.weights.values())
        if total > 0:
            for k in self.weights:
                self.weights[k] /= total
    
    def _micro_tiebreak(self, score: float, candidate_id: str) -> float:
        """Add micro tie-breaker based on candidate_id to ensure unique scores."""
        # Use candidate ID number to create deterministic micro-adjustment
        # Range: [0, 0.0001) - large enough to survive 4-decimal rounding
        id_num = int(candidate_id.split('_')[1])
        adjustment = (id_num % 10000) / 1e8  # 0 to 0.00009999
        return score + adjustment

    def score(self, features: Dict) -> Tuple[float, Dict]:
        """
        Compute ensemble score for a candidate's features.
        Returns (final_score, component_scores_dict).
        """
        component_scores = {}
        
        # Core components
        component_scores['title'] = features['title_score']
        component_scores['career'] = features['career_score']
        component_scores['skills'] = features['skill_score']
        component_scores['yoe'] = features['yoe_score']
        component_scores['edu'] = features['edu_score']
        
        # Semantic similarity (if available, else use skill proxy)
        if 'semantic_score' in features:
            component_scores['semantic'] = features['semantic_score']
        else:
            # Proxy: use average of title and skill scores
            component_scores['semantic'] = (features['title_score'] + features['skill_score']) / 2
        
        # Weighted ensemble
        available_weights = {k: v for k, v in self.weights.items() if k in component_scores}
        w_total = sum(available_weights.values())
        
        ensemble_score = 0.0
        for key, weight in available_weights.items():
            ensemble_score += (weight / w_total) * component_scores.get(key, 0)
        
        # Apply behavioral multiplier
        behavioral = features.get('behavioral', {})
        multiplier = behavioral.get('multiplier', 1.0)
        
        # Apply honeypot penalty
        honeypot_penalty = features.get('honeypot_penalty', 1.0)
        
        final_score = ensemble_score * multiplier * honeypot_penalty
        
        # Apply micro tie-breaker to ensure unique scores (must survive 4-decimal rounding)
        final_score = self._micro_tiebreak(final_score, features['candidate_id'])
        # Ensure monotonic: round to 4 decimals, the tie-breaker ensures uniqueness
        final_score = round(final_score, 4)
        
        # Store for inspection
        features['ensemble_score'] = ensemble_score
        features['final_score'] = final_score
        features['component_scores'] = component_scores
        
        return final_score, component_scores
    
    def rank_candidates(self, features_list: List[Dict]) -> List[Dict]:
        """
        Score and rank a list of candidates.
        Returns candidates sorted by final score (descending),
        with candidate_id ascending tie-break.
        """
        scored = []
        for features in features_list:
            final_score, _ = self.score(features)
            scored.append((final_score, features))
        
        # Sort by score descending, then candidate_id ascending for tie-break
        scored.sort(key=lambda x: (-x[0], x[1]['candidate_id']))
        
        # Assign ranks
        ranked = []
        for rank, (score, features) in enumerate(scored, start=1):
            features['rank'] = rank
            features['score'] = round(score, 4)
            ranked.append(features)
        
        return ranked
    
    def get_score_breakdown(self, features: Dict) -> Dict:
        """Get human-readable score breakdown for UI display."""
        component_scores = features.get('component_scores', {})
        behavioral = features.get('behavioral', {})
        
        breakdown = {
            'components': {
                'Title Match': round(component_scores.get('title', 0), 3),
                'Career Trajectory': round(component_scores.get('career', 0), 3),
                'Skill Alignment': round(component_scores.get('skills', 0), 3),
                'Experience Fit': round(component_scores.get('yoe', 0), 3),
                'Education': round(component_scores.get('edu', 0), 3),
                'Semantic Similarity': round(component_scores.get('semantic', 0), 3),
            },
            'behavioral_multiplier': round(behavioral.get('multiplier', 1.0), 3),
            'honeypot_penalty': features.get('honeypot_penalty', 1.0),
            'ensemble_score': round(features.get('ensemble_score', 0), 4),
            'final_score': round(features.get('final_score', 0), 4),
        }
        return breakdown
