"""
Unit tests for feature extraction modules.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from features.title import TitleMatcher
from features.career import CareerAnalyzer
from features.skills import SkillAnalyzer
from features.behavioral import BehavioralScorer
from features.honeypot import HoneypotDetector
from features.extractor import FeatureExtractor


def test_title_matcher():
    matcher = TitleMatcher()
    
    # Test ideal titles
    for title in ['AI Engineer', 'ML Engineer', 'Data Scientist']:
        candidate = {'profile': {'current_title': title}}
        score, label = matcher.score_title(candidate)
        assert score > 0.5, f"{title} should score > 0.5"
    
    # Test mismatch titles
    for title in ['HR Manager', 'Graphic Designer', 'Mechanical Engineer']:
        candidate = {'profile': {'current_title': title}}
        score, label = matcher.score_title(candidate)
        assert score < 0.3, f"{title} should score < 0.3"
    
    print("Title matcher: PASSED")


def test_career_analyzer():
    analyzer = CareerAnalyzer()
    
    # Test services-only penalty
    candidate = {
        'profile': {'current_company': 'TCS'},
        'career_history': [
            {'company': 'TCS', 'title': 'Software Engineer', 'duration_months': 36, 
             'description': 'Java development', 'industry': 'IT Services'},
            {'company': 'Infosys', 'title': 'Senior Engineer', 'duration_months': 24,
             'description': 'Python development', 'industry': 'IT Services'},
        ]
    }
    features = analyzer.analyze(candidate)
    assert features['is_services_only'] == True
    
    score = analyzer.score_career(candidate)
    assert score < 0.5, "Services-only should score low"
    
    print("Career analyzer: PASSED")


def test_skill_analyzer():
    analyzer = SkillAnalyzer()
    
    # Test keyword stuffing detection
    candidate = {
        'skills': [
            {'name': 'Python', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 1},
            {'name': 'TensorFlow', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'PyTorch', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
        ]
    }
    quality = analyzer.skill_quality_score(candidate['skills'][0])
    assert quality < 0.5, "Expert skill with 0 endorsements and 1 month should score low"
    
    print("Skill analyzer: PASSED")


def test_honeypot_detector():
    detector = HoneypotDetector()
    
    # Test non-tech with many AI skills
    candidate = {
        'profile': {'current_title': 'HR Manager', 'years_of_experience': 5},
        'skills': [
            {'name': 'Python', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'TensorFlow', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'PyTorch', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'LLMs', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'RAG', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'Embeddings', 'proficiency': 'advanced', 'endorsements': 0, 'duration_months': 0},
        ],
        'career_history': [
            {'title': 'HR Manager', 'company': 'ABC Corp', 'description': 'Managed HR operations', 
             'duration_months': 36, 'industry': 'HR'},
        ],
        'redrob_signals': {'recruiter_response_rate': 0.5},
    }
    
    result = detector.detect(candidate)
    assert result['is_honeypot'] == True, "HR Manager with 5 AI expert skills should be flagged"
    
    print("Honeypot detector: PASSED")


def test_full_extraction():
    extractor = FeatureExtractor()
    
    candidate = {
        'candidate_id': 'CAND_0000001',
        'profile': {
            'current_title': 'AI Engineer',
            'years_of_experience': 6.5,
            'current_company': 'Google',
            'country': 'India',
            'headline': 'AI Engineer',
            'summary': 'Building ML systems',
            'location': 'Bangalore',
        },
        'career_history': [
            {'company': 'Google', 'title': 'AI Engineer', 'duration_months': 24,
             'description': 'Building recommendation systems with TensorFlow', 'industry': 'Technology'},
        ],
        'education': [
            {'institution': 'IIT Bombay', 'degree': 'B.Tech', 'field_of_study': 'Computer Science',
             'tier': 'tier_1'},
        ],
        'skills': [
            {'name': 'Python', 'proficiency': 'expert', 'endorsements': 15, 'duration_months': 60},
            {'name': 'TensorFlow', 'proficiency': 'advanced', 'endorsements': 10, 'duration_months': 36},
        ],
        'redrob_signals': {
            'open_to_work_flag': True,
            'recruiter_response_rate': 0.8,
            'notice_period_days': 30,
            'profile_completeness_score': 85,
            'last_active_date': '2026-06-01',
            'profile_views_received_30d': 50,
            'saved_by_recruiters_30d': 5,
            'search_appearance_30d': 30,
            'github_activity_score': 60,
            'interview_completion_rate': 0.9,
        },
    }
    
    features = extractor.extract(candidate)
    assert features['title_score'] > 0.8
    assert features['yoe_score'] > 0.6
    assert features['honeypot']['is_honeypot'] == False
    assert features['behavioral']['multiplier'] > 0.5
    
    print("Full feature extraction: PASSED")


if __name__ == '__main__':
    test_title_matcher()
    test_career_analyzer()
    test_skill_analyzer()
    test_honeypot_detector()
    test_full_extraction()
    print("\nAll tests PASSED!")
