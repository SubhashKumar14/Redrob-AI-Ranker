"""
Career trajectory analysis module.
Evaluates career progression, company quality, tenure stability, and
penalizes services-only backgrounds per the JD.
"""

from typing import Dict, List
from collections import Counter

# Services companies (per JD — penalize if career is ONLY these)
SERVICES_COMPANIES = {
    'tcs', 'infosys', 'wipro', 'accenture', 'cognizant', 'capgemini',
    'hcl', 'tech mahindra', 'mindtree', 'l&t infotech', 'mphasis',
    'hexaware', 'persistent', 'zensar', 'birlasoft', 'igate', 'oracle financial services'
}

# Product-company indicators (positive signal)
PRODUCT_INDICATORS = [
    'product', 'platform', 'startup', 'saas', 'app', 'api', 'marketplace',
    'e-commerce', 'fintech', 'healthtech', 'edtech', 'ai', 'ml', 'data'
]


class CareerAnalyzer:
    """Analyzes career history for quality signals."""
    
    def __init__(self):
        pass
    
    def analyze(self, candidate: dict) -> Dict:
        """
        Analyze career trajectory and return comprehensive features.
        """
        history = candidate.get('career_history', [])
        if not history:
            return self._empty_features()
        
        # Tenure analysis
        durations = [job['duration_months'] for job in history]
        avg_tenure = sum(durations) / len(durations) if durations else 0
        total_months = sum(durations)
        num_companies = len(set(job['company'] for job in history))
        
        # Company type analysis
        companies = [job['company'].lower() for job in history]
        is_services_only = all(
            any(svc in comp for svc in SERVICES_COMPANIES)
            for comp in companies
        )
        has_product_exp = any(
            not any(svc in comp for svc in SERVICES_COMPANIES)
            for comp in companies
        )
        services_ratio = sum(
            1 for comp in companies if any(svc in comp for svc in SERVICES_COMPANIES)
        ) / len(companies) if companies else 0
        
        # Progression analysis (check for increasing seniority)
        seniority_order = {
            'intern': 0, 'junior': 1, 'associate': 2, '': 3,
            'engineer': 3, 'developer': 3, 'analyst': 3,
            'senior': 4, 'lead': 5, 'staff': 6, 'principal': 7,
            'manager': 5, 'director': 7, 'head': 7, 'vp': 8, 'cto': 9
        }
        
        seniority_scores = []
        for job in history:
            title_lower = job['title'].lower()
            score = 3  # default
            for keyword, val in seniority_order.items():
                if keyword in title_lower:
                    score = val
                    break
            seniority_scores.append(score)
        
        # Check if progression is upward
        is_progressive = all(
            seniority_scores[i] <= seniority_scores[i+1]
            for i in range(len(seniority_scores)-1)
        ) if len(seniority_scores) > 1 else True
        
        # Job hopping penalty
        is_job_hopper = num_companies > 5 or avg_tenure < 12
        
        # Current role at product company
        current_company = candidate['profile']['current_company'].lower()
        at_product_now = not any(svc in current_company for svc in SERVICES_COMPANIES)
        
        # Industry relevance
        industries = [job.get('industry', '').lower() for job in history]
        tech_industries = sum(1 for ind in industries if any(
            t in ind for t in ['it', 'software', 'technology', 'ai', 'data', 'internet', 'computer']
        ))
        tech_ratio = tech_industries / len(industries) if industries else 0
        
        return {
            'avg_tenure_months': avg_tenure,
            'total_months': total_months,
            'num_companies': num_companies,
            'is_services_only': is_services_only,
            'has_product_exp': has_product_exp,
            'services_ratio': services_ratio,
            'is_progressive': is_progressive,
            'is_job_hopper': is_job_hopper,
            'at_product_now': at_product_now,
            'tech_ratio': tech_ratio,
            'seniority_current': seniority_scores[-1] if seniority_scores else 3,
        }
    
    def score_career(self, candidate: dict) -> float:
        """
        Compute career trajectory score [0, 1].
        Higher = better career fit for the JD.
        """
        features = self.analyze(candidate)
        score = 0.0
        
        # Base score from product experience
        if features['has_product_exp']:
            score += 0.3
        
        # Services-only penalty (HUGE per JD)
        if features['is_services_only']:
            score -= 0.5
        
        # Progressive career bonus
        if features['is_progressive']:
            score += 0.2
        
        # Tenure stability
        if features['avg_tenure_months'] >= 18:
            score += 0.15
        elif features['avg_tenure_months'] < 12:
            score -= 0.1
        
        # Currently at product company
        if features['at_product_now']:
            score += 0.15
        
        # Tech industry ratio
        score += features['tech_ratio'] * 0.2
        
        # Job hopping penalty
        if features['is_job_hopper']:
            score -= 0.15
        
        # Normalize to [0, 1]
        return max(0.0, min(1.0, score))
    
    def _empty_features(self) -> Dict:
        return {
            'avg_tenure_months': 0, 'total_months': 0, 'num_companies': 0,
            'is_services_only': False, 'has_product_exp': False,
            'services_ratio': 0, 'is_progressive': True,
            'is_job_hopper': False, 'at_product_now': False,
            'tech_ratio': 0, 'seniority_current': 3,
        }
