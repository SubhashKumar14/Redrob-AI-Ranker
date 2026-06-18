"""
Skill alignment module — matches candidate skills against JD skill ontology.
Designed to penalize keyword stuffing while rewarding deep, endorsed skills.
"""

import yaml
from pathlib import Path
from typing import Dict, List, Tuple


def load_skill_ontology(config_path: str = None) -> Dict:
    """Load skill ontology from YAML config."""
    if config_path is None:
        config_path = Path(__file__).parent.parent.parent / "config" / "skill_ontology.yaml"
    with open(config_path, 'r') as f:
        data = yaml.safe_load(f)
    
    skill_weights = {}
    skill_tiers = {}
    for tier_name, tier_data in data['tiers'].items():
        weight = tier_data['weight']
        for skill in tier_data['skills']:
            skill_lower = skill.lower()
            skill_weights[skill_lower] = weight
            skill_tiers[skill_lower] = tier_name
    
    anti_signals = [s.lower() for s in data.get('anti_signals', [])]
    return skill_weights, skill_tiers, anti_signals


# Pre-compute for speed
_SKILL_WEIGHTS = None
_SKILL_TIERS = None
_ANTI_SIGNALS = None


def get_skill_data():
    global _SKILL_WEIGHTS, _SKILL_TIERS, _ANTI_SIGNALS
    if _SKILL_WEIGHTS is None:
        _SKILL_WEIGHTS, _SKILL_TIERS, _ANTI_SIGNALS = load_skill_ontology()
    return _SKILL_WEIGHTS, _SKILL_TIERS, _ANTI_SIGNALS


class SkillAnalyzer:
    """Analyzes candidate skills against JD requirements."""
    
    def __init__(self):
        self.skill_weights, self.skill_tiers, self.anti_signals = get_skill_data()
        
        self.proficiency_weights = {
            'expert': 1.0,
            'advanced': 0.85,
            'intermediate': 0.6,
            'beginner': 0.3,
        }
    
    def skill_quality_score(self, skill: dict) -> float:
        """
        Compute quality-adjusted score for a single skill.
        Penalizes keyword stuffing: skills with 0 endorsements and short duration get minimal weight.
        """
        proficiency = skill.get('proficiency', 'beginner')
        endorsements = skill.get('endorsements', 0)
        duration = skill.get('duration_months', 0)
        
        prof_weight = self.proficiency_weights.get(proficiency, 0.3)
        
        # Trust signal: endorsements × duration
        trust = min(1.0, (endorsements * max(1, duration)) / 500)
        
        # Heavy penalty for likely keyword stuffing
        if endorsements == 0 and duration < 6:
            trust *= 0.1
        
        # Penalty for expert skills with very short duration
        if proficiency == 'expert' and duration < 6:
            trust *= 0.2
        
        return prof_weight * trust
    
    def analyze_skills(self, candidate: dict) -> Dict:
        """
        Analyze all candidate skills and return comprehensive features.
        """
        skills = candidate.get('skills', [])
        
        core_matches = []
        relevant_matches = []
        nice_matches = []
        anti_matches = []
        total_weighted_score = 0.0
        total_quality_score = 0.0
        
        for skill in skills:
            skill_name = skill['name'].lower()
            quality = self.skill_quality_score(skill)
            total_quality_score += quality
            
            # Match against ontology
            matched = False
            for ont_skill, weight in self.skill_weights.items():
                if ont_skill in skill_name or skill_name in ont_skill:
                    weighted = weight * quality
                    total_weighted_score += weighted
                    
                    tier = self.skill_tiers.get(ont_skill, 'unknown')
                    match_info = {
                        'name': skill['name'],
                        'proficiency': skill['proficiency'],
                        'weight': weight,
                        'quality': quality,
                        'weighted': weighted,
                        'tier': tier,
                    }
                    
                    if tier == 'core':
                        core_matches.append(match_info)
                    elif tier == 'relevant':
                        relevant_matches.append(match_info)
                    elif tier == 'nice_to_have':
                        nice_matches.append(match_info)
                    
                    matched = True
                    break
            
            if not matched:
                # Check anti-signals
                for anti in self.anti_signals:
                    if anti in skill_name:
                        anti_matches.append(skill['name'])
                        break
        
        # Sort matches by weighted score
        core_matches.sort(key=lambda x: x['weighted'], reverse=True)
        relevant_matches.sort(key=lambda x: x['weighted'], reverse=True)
        
        return {
            'core_skill_count': len(core_matches),
            'relevant_skill_count': len(relevant_matches),
            'nice_skill_count': len(nice_matches),
            'anti_skill_count': len(anti_matches),
            'core_matches': core_matches,
            'relevant_matches': relevant_matches,
            'total_weighted_score': total_weighted_score,
            'total_quality_score': total_quality_score,
            'avg_skill_quality': total_quality_score / len(skills) if skills else 0,
            'top_core_skill': core_matches[0] if core_matches else None,
            'top_relevant_skill': relevant_matches[0] if relevant_matches else None,
        }
    
    def score_skills(self, candidate: dict) -> float:
        """
        Compute overall skill alignment score [0, 1].
        Rewards candidates with core skills at high proficiency.
        """
        analysis = self.analyze_skills(candidate)
        
        # Core skills are most important
        core_score = min(1.0, analysis['core_skill_count'] / 3) * 0.5
        
        # Relevant skills add value
        relevant_score = min(1.0, analysis['relevant_skill_count'] / 5) * 0.25
        
        # Weighted quality score
        quality_score = min(1.0, analysis['total_weighted_score'] / 5) * 0.25
        
        return core_score + relevant_score + quality_score
    
    def get_top_skills_text(self, candidate: dict, n: int = 3) -> str:
        """Get top N skill names for reasoning generation."""
        analysis = self.analyze_skills(candidate)
        all_matches = analysis['core_matches'] + analysis['relevant_matches']
        all_matches.sort(key=lambda x: x['weighted'], reverse=True)
        top = [m['name'] for m in all_matches[:n]]
        return ', '.join(top) if top else 'general technical skills'
