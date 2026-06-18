"""
Reasoning generation module — v2.
Generates human-readable explanations for each ranked candidate.
Uses template-based generation from actual scored features to avoid hallucination.

Fixes in v2:
- Grammar: "1 core AI skills" → "1 core AI skill" (singular/plural)
- More varied templates for ranks 50-100 (previously too generic)
- Added concern/strength specificity for all template families
- Added confidence calibration label
"""

import random
from typing import Dict, List


# Confidence calibration based on score
def get_confidence_label(score: float) -> str:
    if score >= 0.80:
        return "Very High"
    elif score >= 0.70:
        return "High"
    elif score >= 0.55:
        return "Medium"
    elif score >= 0.40:
        return "Low"
    else:
        return "Very Low"


# Template families keyed by score quality
TEMPLATES = {
    'ideal': [
        "{title} with {yoe} years of experience; strong match on {top_skills}; {notice}-day notice period and {response_rate:.0%} recruiter response rate.",
        "{title} with {yoe} yrs; {core_skill_count} core AI {skill_word} including {top_skills}; actively engaged ({response_rate:.0%} response rate, {notice}-day notice).",
        "Experienced {title} ({yoe} yrs) at {company_type} companies; expertise in {top_skills}; available in {notice} days with {response_rate:.0%} response rate.",
        "Top-ranked {title} ({yoe} yrs, {title_label} title): {top_skills}; {response_rate:.0%} response rate; {company_type}-company background.",
    ],
    'strong': [
        "{title} with {yoe} years; solid skill match including {top_skills}; {response_rate:.0%} response rate and {notice}-day notice.",
        "{title} ({yoe} yrs) with relevant AI/ML background in {top_skills}; {notice}-day notice period.",
        "{title} with {yoe} years experience; {core_skill_count} core {skill_word} matched; strong behavioral signals ({response_rate:.0%} response rate).",
        "{title} ({yoe} yrs) at {company_type} companies; skills include {top_skills}; {notice}-day notice and {response_rate:.0%} response rate.",
        "Strong-fit {title}: {yoe} years, {top_skills}; {response_rate:.0%} recruiter engagement; {notice}-day availability.",
    ],
    'moderate': [
        "{title} with {yoe} years; some relevant skills ({top_skills}); concern: {concern}.",
        "{title} ({yoe} yrs) with adjacent experience; {notice}-day notice; moderate recruiter engagement ({response_rate:.0%}).",
        "{title} with {yoe} years; {core_skill_count} core skill {match_word}; {concern} but included due to {strength}.",
        "Included as rank {rank}: {title} ({yoe} yrs) with skills in {top_skills}; concern: {concern}.",
    ],
    'weak': [
        "{title} with {yoe} years; limited direct AI experience; {concern}; included due to {strength}.",
        "Adjacent profile ({title}, {yoe} yrs); {concern}; behavioral signals partially offset gaps.",
        "{title} ({yoe} yrs); skill coverage: {top_skills}; primary concern: {concern}.",
    ],
    'filler': [
        "{title} with {yoe} years; limited fit for this AI role; included as rank {rank} based on {strength}.",
        "Marginal fit ({title}, {yoe} yrs); {concern}; weakest candidate in the shortlist.",
        "Rank {rank}: {title} ({yoe} yrs); best available given {strength}; concern: {concern}.",
    ],
}


class ReasoningGenerator:
    """Generates reasoning strings from scored features."""
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
    
    def generate(self, features: Dict) -> str:
        """
        Generate reasoning string for a single candidate.
        Uses template-based generation from actual features.
        """
        final_score = features.get('final_score', 0)
        rank = features.get('rank', 0)
        behavioral = features.get('behavioral', {})
        skill_features = features.get('skill_features', {})
        career_features = features.get('career_features', {})
        
        # Select template family based on score
        if final_score >= 0.75:
            family = 'ideal'
        elif final_score >= 0.55:
            family = 'strong'
        elif final_score >= 0.40:
            family = 'moderate'
        elif final_score >= 0.25:
            family = 'weak'
        else:
            family = 'filler'
        
        # Select specific template (vary by rank for diversity)
        templates = TEMPLATES[family]
        template = templates[rank % len(templates)]
        
        # Build format arguments from actual data
        args = self._build_args(features)
        
        try:
            reasoning = template.format(**args)
        except (KeyError, ValueError):
            # Fallback if formatting fails
            reasoning = self._fallback_reasoning(features)
        
        # Ensure reasonable length (50-200 chars)
        if len(reasoning) > 200:
            reasoning = reasoning[:197] + '...'
        if len(reasoning) < 30:
            reasoning = self._fallback_reasoning(features)
        
        return reasoning
    
    def _build_args(self, features: Dict) -> Dict:
        """Build format arguments from actual candidate features."""
        behavioral = features.get('behavioral', {})
        skill_features = features.get('skill_features', {})
        career_features = features.get('career_features', {})
        title_features = features.get('title_features', {})
        
        # Get top skills
        all_matches = skill_features.get('core_matches', []) + skill_features.get('relevant_matches', [])
        all_matches.sort(key=lambda x: x.get('weighted', 0), reverse=True)
        top_skills = ', '.join(m['name'] for m in all_matches[:3]) if all_matches else 'relevant technical skills'
        
        # Company type
        company_type = 'product' if career_features.get('has_product_exp', False) else 'mixed/services'
        
        # Concern and Strength
        concern = self._identify_concern(features)
        strength = self._identify_strength(features)
        
        # Grammar fixes: singular/plural
        core_count = skill_features.get('core_skill_count', 0)
        skill_word = 'skill' if core_count == 1 else 'skills'
        
        rank = features.get('rank', 0)
        match_word = 'match' if core_count <= 1 else 'matches'
        
        return {
            'title': features.get('current_title', 'Unknown'),
            'yoe': round(features.get('years_of_experience', 0), 1),
            'top_skills': top_skills,
            'core_skill_count': core_count,
            'skill_word': skill_word,
            'match_word': match_word,
            'notice': behavioral.get('notice_period_days', 90),
            'response_rate': behavioral.get('recruiter_response_rate', 0),
            'company_type': company_type,
            'concern': concern,
            'strength': strength,
            'rank': rank,
            'title_label': title_features.get('title_label', 'relevant'),
            'confidence': get_confidence_label(features.get('final_score', 0)),
        }
    
    def _identify_concern(self, features: Dict) -> str:
        """Identify the main concern for this candidate."""
        concerns = []
        
        if features.get('honeypot', {}).get('is_honeypot', False):
            concerns.append("possible profile inconsistencies detected")
        
        behavioral = features.get('behavioral', {})
        if not behavioral.get('is_open_to_work', True):
            concerns.append("not actively seeking new opportunities")
        if behavioral.get('notice_period_days', 90) > 90:
            np = behavioral.get('notice_period_days', 90)
            concerns.append(f"{np}-day notice period")
        if behavioral.get('recruiter_response_rate', 0) < 0.3:
            concerns.append("low recruiter response rate")
        
        career_features = features.get('career_features', {})
        if career_features.get('is_services_only', False):
            concerns.append("services-only background")
        if career_features.get('is_job_hopper', False):
            concerns.append("frequent job changes")
        
        if features.get('yoe_score', 0) < 0.3:
            yoe = features.get('years_of_experience', 0)
            concerns.append(f"experience ({yoe} yrs) outside preferred 5-9 year range")
        
        title_score = features.get('title_score', 0)
        if title_score < 0.5:
            title = features.get('current_title', 'title')
            concerns.append(f"{title} not closely aligned with AI Engineer role")
        
        return concerns[0] if concerns else "some gaps vs ideal AI Engineer profile"
    
    def _identify_strength(self, features: Dict) -> str:
        """Identify the main strength for this candidate."""
        strengths = []
        
        title_score = features.get('title_score', 0)
        if title_score >= 0.9:
            strengths.append("ideal AI/ML title match")
        elif title_score >= 0.75:
            strengths.append("strong title match")
        
        skill_features = features.get('skill_features', {})
        core_count = skill_features.get('core_skill_count', 0)
        if core_count >= 4:
            strengths.append(f"{core_count} core AI skills with quality endorsements")
        elif core_count >= 2:
            strengths.append("solid core AI skill coverage")
        
        behavioral = features.get('behavioral', {})
        if behavioral.get('is_open_to_work', False) and behavioral.get('notice_period_days', 90) <= 30:
            strengths.append("immediately available")
        elif behavioral.get('is_open_to_work', False) and behavioral.get('notice_period_days', 90) <= 60:
            strengths.append("available within 60 days")
        if behavioral.get('recruiter_response_rate', 0) > 0.8:
            strengths.append("high recruiter responsiveness")
        
        career_features = features.get('career_features', {})
        if career_features.get('has_product_exp', False) and not career_features.get('is_services_only', False):
            strengths.append("product-company experience")
        if career_features.get('is_progressive', False):
            strengths.append("progressive career trajectory")
        
        yoe = features.get('years_of_experience', 0)
        if 5 <= yoe <= 9:
            strengths.append("ideal 5-9 year experience range")
        
        return strengths[0] if strengths else "relevant technical background"
    
    def _fallback_reasoning(self, features: Dict) -> str:
        """Simple fallback reasoning if template fails."""
        title = features.get('current_title', 'Candidate')
        yoe = features.get('years_of_experience', 0)
        score = features.get('final_score', 0)
        
        skill_features = features.get('skill_features', {})
        core_count = skill_features.get('core_skill_count', 0)
        skill_word = 'skill' if core_count == 1 else 'skills'
        
        behavioral = features.get('behavioral', {})
        notice = behavioral.get('notice_period_days', 90)
        
        if score >= 0.6:
            return f"{title} with {yoe} yrs and {core_count} core AI {skill_word}; {notice}-day notice."
        else:
            return f"{title} with {yoe} yrs; limited AI fit for this role."
    
    def get_confidence_label(self, features: Dict) -> str:
        """Get confidence calibration label for this candidate."""
        return get_confidence_label(features.get('final_score', 0))
    
    def generate_batch(self, ranked_features: List[Dict]) -> List[str]:
        """Generate reasoning for a batch of ranked candidates."""
        return [self.generate(f) for f in ranked_features]
