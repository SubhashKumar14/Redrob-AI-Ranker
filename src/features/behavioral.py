"""
Behavioral signal processing module.
Computes the behavioral multiplier B(c) that calibrates final scores
based on candidate availability, responsiveness, and engagement.
"""

import math
from datetime import datetime, timedelta
from typing import Dict


class BehavioralScorer:
    """Computes behavioral multiplier and related features."""
    
    def __init__(self):
        pass
    
    def compute(self, candidate: dict) -> Dict:
        """
        Compute all behavioral signals and the final multiplier.
        Returns dict with individual signals and the combined multiplier.
        """
        signals = candidate['redrob_signals']
        
        # 1. Open to work
        otw = signals['open_to_work_flag']
        otw_score = 1.0 if otw else 0.6
        
        # 2. Response rate
        rr = signals['recruiter_response_rate']
        response_score = 0.3 + 0.7 * rr
        
        # 3. Notice period
        notice = signals['notice_period_days']
        if notice <= 30:
            notice_score = 1.0
        elif notice <= 60:
            notice_score = 0.85
        elif notice <= 90:
            notice_score = 0.70
        elif notice <= 120:
            notice_score = 0.55
        elif notice <= 150:
            notice_score = 0.40
        else:
            notice_score = 0.25
        
        # 4. Engagement score
        views = signals['profile_views_received_30d']
        saved = signals['saved_by_recruiters_30d']
        search_app = signals['search_appearance_30d']
        engagement_raw = (views * 0.3 + saved * 0.4 + search_app * 0.3) / 50
        engagement_score = min(1.0, max(0.5, engagement_raw))
        
        # 5. Activity score (days since last active)
        try:
            last_active = datetime.strptime(signals['last_active_date'], '%Y-%m-%d')
            days_since = (datetime(2026, 6, 18) - last_active).days  # current date
        except:
            days_since = 90  # default
        activity_score = math.exp(-days_since / 90)
        activity_score = max(0.5, min(1.0, activity_score))
        
        # 6. Profile completeness
        completeness = signals['profile_completeness_score'] / 100
        completeness_score = max(0.5, min(1.0, completeness))
        
        # 7. GitHub activity
        github = signals['github_activity_score']
        if github == -1:
            github_score = 0.5  # neutral for no GitHub
        else:
            github_score = 0.5 + 0.5 * min(1.0, github / 50)
        
        # 8. Interview completion rate
        icr = signals['interview_completion_rate']
        interview_score = 0.5 + 0.5 * icr
        
        # Combined multiplier
        # Use geometric mean to ensure candidates need to be strong across dimensions
        multiplier = (
            otw_score * 
            response_score * 
            notice_score * 
            engagement_score * 
            activity_score
        ) ** 0.2  # geometric mean^5 ≈ product^(1/5)
        
        # Additional modifiers
        multiplier *= (0.7 + 0.3 * completeness)
        multiplier *= (0.8 + 0.2 * github_score)
        
        # Cap at reasonable bounds
        multiplier = max(0.15, min(1.0, multiplier))
        
        return {
            'multiplier': multiplier,
            'open_to_work_score': otw_score,
            'response_score': response_score,
            'notice_score': notice_score,
            'engagement_score': engagement_score,
            'activity_score': activity_score,
            'completeness_score': completeness_score,
            'github_score': github_score,
            'interview_score': interview_score,
            'notice_period_days': notice,
            'is_open_to_work': otw,
            'recruiter_response_rate': rr,
            'days_since_active': days_since,
        }
    
    def get_behavioral_label(self, behavioral: Dict) -> str:
        """Get a human-readable label for behavioral quality."""
        m = behavioral['multiplier']
        if m >= 0.8:
            return "Highly engaged and available"
        elif m >= 0.6:
            return "Moderately available"
        elif m >= 0.4:
            return "Limited availability"
        else:
            return "Poor availability signals"
