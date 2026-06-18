"""
Honeypot detection module.
Identifies candidates with subtly impossible profiles that keyword-based
systems would rank highly but are actually poor fits.
"""

from typing import Dict, List


class HoneypotDetector:
    """Detects honeypot candidates with impossible or inconsistent profiles."""
    
    def __init__(self):
        pass
    
    def detect(self, candidate: dict) -> Dict:
        """
        Run all honeypot checks and return a suspicion score.
        Returns: {'is_honeypot': bool, 'score': int, 'issues': List[str]}
        """
        issues = []
        score = 0
        
        skills = candidate.get('skills', [])
        history = candidate.get('career_history', [])
        profile = candidate['profile']
        
        # Check 1: Expert skills with 0 duration
        expert_zero = sum(1 for s in skills if s['proficiency'] == 'expert' and s['duration_months'] == 0)
        if expert_zero >= 2:
            score += 3
            issues.append(f"{expert_zero}_expert_zero_duration")
        
        # Check 2: Too many expert skills
        expert_count = sum(1 for s in skills if s['proficiency'] == 'expert')
        if expert_count >= 7:
            score += 2
            issues.append(f"{expert_count}_expert_skills")
        
        # Check 3: Title-career mismatch
        mismatch_count = self._check_title_mismatches(history)
        if mismatch_count >= 2:
            score += 3
            issues.append(f"{mismatch_count}_title_desc_mismatches")
        
        # Check 4: All skills have 0 endorsements (keyword stuffer)
        if len(skills) >= 8 and all(s['endorsements'] == 0 for s in skills):
            score += 2
            issues.append("all_zero_endorsements")
        
        # Check 5: Mismatched title with many AI skills (classic honeypot)
        title_lower = profile['current_title'].lower()
        non_tech_titles = ['marketing', 'hr', 'sales', 'accountant', 'graphic', 
                          'content', 'mechanical', 'civil', 'customer support']
        is_non_tech = any(nt in title_lower for nt in non_tech_titles)
        
        ai_keywords = ['machine learning', 'deep learning', 'tensorflow', 'pytorch',
                      'nlp', 'llm', 'rag', 'embeddings', 'vector search', 'neural',
                      'transformer', 'bert', 'hugging face', 'langchain']
        ai_skill_count = sum(1 for s in skills if any(kw in s['name'].lower() for kw in ai_keywords))
        
        if is_non_tech and ai_skill_count >= 5:
            score += 4
            issues.append(f"non_tech_with_{ai_skill_count}_ai_skills")
        
        # Check 6: Impossible timeline
        yoe = profile['years_of_experience']
        total_months = sum(job['duration_months'] for job in history)
        expected_months = yoe * 12
        if total_months > expected_months * 1.5 + 12:  # Allow 50% overlap + 1 year gap
            score += 2
            issues.append("timeline_overflow")
        
        # Check 7: Very high skill count with low quality
        if len(skills) >= 15:
            avg_endorsements = sum(s['endorsements'] for s in skills) / len(skills)
            avg_duration = sum(s['duration_months'] for s in skills) / len(skills)
            if avg_endorsements < 2 and avg_duration < 12:
                score += 2
                issues.append("many_low_quality_skills")
        
        # Check 8: Extreme response rate outliers with perfect profile
        response_rate = candidate['redrob_signals']['recruiter_response_rate']
        if response_rate == 0.0 and len(skills) >= 10:
            score += 1
            issues.append("perfect_skills_zero_response")
        
        is_honeypot = score >= 4
        
        return {
            'is_honeypot': is_honeypot,
            'score': score,
            'issues': issues,
            'ai_skill_count': ai_skill_count,
            'is_non_tech': is_non_tech,
        }
    
    def _check_title_mismatches(self, history: List[dict]) -> int:
        """Check for title-description mismatches in career history."""
        mismatch_count = 0
        
        mismatches = [
            ('mechanical', ['marketing', 'brand strategy', 'seo', 'content', 'social media']),
            ('marketing', ['cad', 'solidworks', 'fea', 'mechanical design']),
            ('civil', ['kubernetes', 'react', 'angular', 'machine learning', 'nlp', 'ai', 'tensorflow']),
            ('graphic', ['machine learning', 'tensorflow', 'pytorch', 'nlp', 'backend', 'api']),
            ('hr', ['machine learning', 'tensorflow', 'pytorch', 'ai engineer', 'deep learning']),
            ('sales', ['tensorflow', 'pytorch', 'neural', 'deep learning', 'nlp']),
            ('accountant', ['tensorflow', 'pytorch', 'neural', 'deep learning']),
            ('content', ['tensorflow', 'pytorch', 'neural', 'deep learning', 'kubernetes']),
        ]
        
        for job in history:
            desc = job['description'].lower()
            title = job['title'].lower()
            
            for title_kw, desc_kws in mismatches:
                if title_kw in title and any(dk in desc for dk in desc_kws):
                    mismatch_count += 1
                    break
        
        return mismatch_count
    
    def get_honeypot_penalty(self, candidate: dict) -> float:
        """
        Get a penalty factor [0, 1] to apply to the candidate's score.
        1.0 = no penalty, 0.0 = maximum penalty.
        """
        result = self.detect(candidate)
        if result['is_honeypot']:
            # Progressive penalty based on honeypot score
            penalty_map = {4: 0.3, 5: 0.15, 6: 0.05, 7: 0.0}
            return penalty_map.get(result['score'], 0.0)
        return 1.0  # No penalty
