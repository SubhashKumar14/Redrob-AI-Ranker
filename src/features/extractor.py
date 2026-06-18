"""
Master feature extractor — combines all feature modules into a single pipeline.
Extracts all structured features for a candidate in one call.
"""

from typing import Dict, List
from .title import TitleMatcher
from .career import CareerAnalyzer
from .skills import SkillAnalyzer
from .behavioral import BehavioralScorer
from .honeypot import HoneypotDetector


class FeatureExtractor:
    """Extracts all structured features from a candidate profile."""
    
    def __init__(self):
        self.title_matcher = TitleMatcher()
        self.career_analyzer = CareerAnalyzer()
        self.skill_analyzer = SkillAnalyzer()
        self.behavioral_scorer = BehavioralScorer()
        self.honeypot_detector = HoneypotDetector()
    
    def extract(self, candidate: dict) -> Dict:
        """
        Extract all features for a single candidate.
        Returns a comprehensive feature dictionary.
        """
        # Title features
        title_features = self.title_matcher.get_title_features(candidate)
        
        # Career features
        career_features = self.career_analyzer.analyze(candidate)
        career_score = self.career_analyzer.score_career(candidate)
        
        # Skill features
        skill_features = self.skill_analyzer.analyze_skills(candidate)
        skill_score = self.skill_analyzer.score_skills(candidate)
        
        # Behavioral features
        behavioral = self.behavioral_scorer.compute(candidate)
        
        # Honeypot detection
        honeypot = self.honeypot_detector.detect(candidate)
        honeypot_penalty = self.honeypot_detector.get_honeypot_penalty(candidate)
        
        # YOE fit (truncated Gaussian centered at 7)
        yoe = candidate['profile']['years_of_experience']
        if yoe < 4:
            yoe_score = 0.1  # Heavy penalty below 4
        elif yoe < 5:
            yoe_score = 0.5
        elif yoe <= 9:
            # Peak fit in 5-9 range
            yoe_score = 0.7 + 0.3 * (1 - abs(yoe - 7) / 2.5)
        elif yoe <= 12:
            yoe_score = 0.7 - (yoe - 9) * 0.1
        else:
            yoe_score = 0.4  # Penalty for very high YOE
        
        # Education score
        education = candidate.get('education', [])
        edu_score = 0.5  # default
        if education:
            tier_scores = {'tier_1': 1.0, 'tier_2': 0.8, 'tier_3': 0.6, 'tier_4': 0.4, 'unknown': 0.5}
            avg_tier = sum(tier_scores.get(e.get('tier', 'unknown'), 0.5) for e in education) / len(education)
            cs_relevant = any('computer' in e.get('field_of_study', '').lower() or 
                             'data' in e.get('field_of_study', '').lower() or
                             'machine learning' in e.get('field_of_study', '').lower() or
                             'ai' in e.get('field_of_study', '').lower()
                             for e in education)
            edu_score = avg_tier * (1.2 if cs_relevant else 1.0)
            edu_score = min(1.0, edu_score)
        
        return {
            # Identifiers
            'candidate_id': candidate['candidate_id'],
            
            # Component scores (for ensemble)
            'title_score': title_features['title_score'],
            'career_score': career_score,
            'skill_score': skill_score,
            'yoe_score': yoe_score,
            'edu_score': edu_score,
            
            # Detailed features
            'title_features': title_features,
            'career_features': career_features,
            'skill_features': skill_features,
            'behavioral': behavioral,
            'honeypot': honeypot,
            'honeypot_penalty': honeypot_penalty,
            
            # Raw data for reasoning
            'current_title': candidate['profile']['current_title'],
            'years_of_experience': yoe,
            'current_company': candidate['profile']['current_company'],
            'country': candidate['profile']['country'],
            'skills': candidate['skills'],
        }
    
    def extract_batch(self, candidates: List[dict]) -> List[Dict]:
        """Extract features for a batch of candidates."""
        return [self.extract(c) for c in candidates]
    
    def get_top_skills_text(self, candidate_features: dict, n: int = 3) -> str:
        """Get top skills text for reasoning."""
        skill_features = candidate_features['skill_features']
        all_matches = skill_features['core_matches'] + skill_features['relevant_matches']
        all_matches.sort(key=lambda x: x['weighted'], reverse=True)
        top = [m['name'] for m in all_matches[:n]]
        return ', '.join(top) if top else 'relevant technical skills'
