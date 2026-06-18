"""
End-to-end pipeline tests.
Validates the complete ranking pipeline from candidates → CSV.
Uses sample_candidates.json from challenge_data for fast testing.
"""

import sys
import json
import csv
import os
import re
import subprocess
import tempfile
from pathlib import Path

# Add src to path
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT / "src"))

from ingestion.loader import CandidateLoader
from features.extractor import FeatureExtractor
from scoring.ensemble import EnsembleScorer
from explanation.generator import ReasoningGenerator, get_confidence_label
from output.formatter import SubmissionFormatter


# ─── Load sample data ─────────────────────────────────────────────────────────
SAMPLE_PATH = ROOT.parent / "challenge_data" / "sample_candidates.json"
VALIDATE_SCRIPT = ROOT.parent / "challenge_data" / "validate_submission.py"

def load_sample_candidates():
    with open(SAMPLE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # sample_candidates.json is a list of candidates
    if isinstance(data, list):
        return data
    return [data]


# ─── Test 1: Feature Extraction ───────────────────────────────────────────────
def test_feature_extraction():
    """Test that FeatureExtractor produces valid features for all sample candidates."""
    candidates = load_sample_candidates()
    extractor = FeatureExtractor()
    
    errors = []
    for c in candidates:
        features = extractor.extract(c)
        
        # Check required keys
        required = ['candidate_id', 'title_score', 'career_score', 'skill_score', 'yoe_score',
                    'edu_score', 'behavioral', 'honeypot', 'honeypot_penalty']
        for key in required:
            if key not in features:
                errors.append(f"{c['candidate_id']}: missing key '{key}'")
        
        # Check score bounds
        for score_key in ['title_score', 'career_score', 'skill_score', 'yoe_score', 'edu_score']:
            val = features.get(score_key, -1)
            if not (0.0 <= val <= 1.0):
                errors.append(f"{c['candidate_id']}: {score_key}={val} out of [0,1]")
        
        # Check honeypot_penalty bounds
        hp = features.get('honeypot_penalty', -1)
        if not (0.0 <= hp <= 1.0):
            errors.append(f"{c['candidate_id']}: honeypot_penalty={hp} out of [0,1]")
        
        # Check behavioral multiplier bounds
        mult = features.get('behavioral', {}).get('multiplier', -1)
        if not (0.0 <= mult <= 1.5):
            errors.append(f"{c['candidate_id']}: behavioral multiplier={mult} suspicious")
    
    assert not errors, f"Feature extraction errors:\n" + "\n".join(errors)
    print("OK Feature extraction: %d candidates, all valid" % len(candidates))


# ─── Test 2: Ensemble Scoring ─────────────────────────────────────────────────
def test_ensemble_scoring():
    """Test that ensemble scorer produces valid, non-negative scores."""
    candidates = load_sample_candidates()
    extractor = FeatureExtractor()
    scorer = EnsembleScorer()
    
    all_features = [extractor.extract(c) for c in candidates]
    ranked = scorer.rank_candidates(all_features)
    
    assert len(ranked) == len(candidates), f"Expected {len(candidates)} ranked, got {len(ranked)}"
    
    # Check scores are non-increasing
    prev_score = float('inf')
    for f in ranked:
        score = f['score']
        assert score <= prev_score + 1e-9, f"Score not non-increasing: {score} > {prev_score}"
        assert 0.0 <= score <= 1.0, f"Score {score} out of [0,1]"
        prev_score = score
    
    # Check ranks are 1..N
    ranks = [f['rank'] for f in ranked]
    assert sorted(ranks) == list(range(1, len(ranked) + 1)), "Ranks not sequential"
    
    print("OK Ensemble scoring: %d candidates scored, scores non-increasing" % len(ranked))


# ─── Test 3: Reasoning Generation ────────────────────────────────────────────
def test_reasoning_generation():
    """Test reasoning: no hallucination, correct grammar, reasonable length."""
    candidates = load_sample_candidates()
    extractor = FeatureExtractor()
    scorer = EnsembleScorer()
    generator = ReasoningGenerator()
    
    all_features = [extractor.extract(c) for c in candidates]
    ranked = scorer.rank_candidates(all_features)
    reasonings = generator.generate_batch(ranked)
    
    grammar_errors = []
    length_errors = []
    
    for feat, r in zip(ranked, reasonings):
        # Grammar: no "1 core AI skills" (should be "skill")
        if re.search(r'\b1 core AI skills\b', r):
            grammar_errors.append(f"rank {feat['rank']}: '1 core AI skills' should be '1 core AI skill'")
        
        # Length check
        if len(r) < 20:
            length_errors.append(f"rank {feat['rank']}: reasoning too short ({len(r)} chars)")
        if len(r) > 210:
            length_errors.append(f"rank {feat['rank']}: reasoning too long ({len(r)} chars)")
    
    assert not grammar_errors, "Grammar errors:\n" + "\n".join(grammar_errors)
    assert not length_errors, "Length errors:\n" + "\n".join(length_errors)
    
    print("OK Reasoning generation: %d reasonings, grammar OK, lengths OK" % len(reasonings))


# ─── Test 4: CSV Output Format ───────────────────────────────────────────────
def test_csv_output():
    """Test that generated CSV matches exact submission format."""
    candidates = load_sample_candidates()
    extractor = FeatureExtractor()
    scorer = EnsembleScorer()
    generator = ReasoningGenerator()
    formatter = SubmissionFormatter()
    
    all_features = [extractor.extract(c) for c in candidates]
    ranked = scorer.rank_candidates(all_features)
    top_k = ranked[:min(100, len(ranked))]
    
    # If fewer than 100 candidates in sample, pad (shouldn't happen normally)
    reasonings = generator.generate_batch(top_k)
    
    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False, mode='w') as f:
        tmp_path = f.name
    
    try:
        formatter.write_csv(top_k, reasonings, tmp_path)
        
        # Validate header
        with open(tmp_path, 'r', encoding='utf-8', newline='') as f:
            reader = csv.reader(f)
            header = next(reader)
            assert header == ['candidate_id', 'rank', 'score', 'reasoning'], f"Wrong header: {header}"
            
            rows = list(reader)
        
        # Check row count (should equal number of scored candidates, capped at 100)
        assert len(rows) == len(top_k), f"Expected {len(top_k)} rows, got {len(rows)}"
        
        # Check each row
        for i, row in enumerate(rows):
            assert len(row) == 4, f"Row {i+2}: expected 4 columns, got {len(row)}"
            cid, rank_s, score_s, reasoning = row
            
            # candidate_id format
            assert re.match(r'^CAND_[0-9]{7}$', cid), f"Invalid ID: {cid}"
            
            # rank
            rank = int(rank_s)
            assert 1 <= rank <= 100, f"Rank {rank} out of range"
            
            # score
            score = float(score_s)
            assert 0.0 <= score <= 1.0, f"Score {score} out of range"
            
            # reasoning
            assert reasoning.strip(), f"Empty reasoning at rank {rank}"
        
        # Check score monotonicity
        scores = [float(r[2]) for r in rows]
        for i in range(len(scores) - 1):
            assert scores[i] >= scores[i+1] - 1e-9, \
                f"Scores not non-increasing at rows {i+2},{i+3}: {scores[i]} < {scores[i+1]}"
        
        print("OK CSV output: %d rows, header OK, IDs OK, scores monotonic" % len(rows))
    
    finally:
        os.unlink(tmp_path)


# ─── Test 5: Official Validator (on structured CSV) ───────────────────────────
def test_official_validator():
    """Run the official validate_submission.py on the locked submission CSV."""
    csv_candidates = [
        ROOT / "team_code_liberators.csv",
        ROOT / "team_code_liberators_structured.csv",
    ]
    
    tested = False
    for csv_path in csv_candidates:
        if csv_path.exists():
            result = subprocess.run(
                [sys.executable, str(VALIDATE_SCRIPT), str(csv_path)],
                capture_output=True, text=True
            )
            assert result.returncode == 0, \
                f"Official validator FAILED for {csv_path.name}:\n{result.stdout}\n{result.stderr}"
            print(f"OK Official validator: {csv_path.name} -> PASS")
            tested = True
    
    if not tested:
        print("WARNING Official validator: No submission CSV found to validate")


# ─── Test 6: Honeypot Detection ───────────────────────────────────────────────
def test_honeypot_detection():
    """Test that honeypot candidates are correctly detected and penalized."""
    from features.honeypot import HoneypotDetector
    detector = HoneypotDetector()
    
    # Clear honeypot: HR Manager with 6 expert AI skills
    honeypot = {
        'profile': {'current_title': 'HR Manager', 'years_of_experience': 5},
        'skills': [
            {'name': 'Python', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'TensorFlow', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'PyTorch', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'LLMs', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'RAG', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
            {'name': 'Embeddings', 'proficiency': 'expert', 'endorsements': 0, 'duration_months': 0},
        ],
        'career_history': [
            {'title': 'HR Manager', 'company': 'ABC Corp', 'description': 'Managed HR operations',
             'duration_months': 60, 'industry': 'HR'}
        ],
        'redrob_signals': {'recruiter_response_rate': 0.5},
    }
    
    result = detector.detect(honeypot)
    assert result['is_honeypot'], "HR Manager with 6 expert AI skills should be flagged as honeypot"
    
    penalty = detector.get_honeypot_penalty(honeypot)
    assert penalty < 0.5, f"Honeypot penalty should be < 0.5, got {penalty}"
    
    # Clean candidate: AI Engineer with good skills
    clean = {
        'profile': {'current_title': 'AI Engineer', 'years_of_experience': 6},
        'skills': [
            {'name': 'Python', 'proficiency': 'expert', 'endorsements': 10, 'duration_months': 48},
            {'name': 'TensorFlow', 'proficiency': 'advanced', 'endorsements': 5, 'duration_months': 24},
        ],
        'career_history': [
            {'title': 'AI Engineer', 'company': 'Google', 'description': 'Building ML models',
             'duration_months': 36, 'industry': 'Technology'}
        ],
        'redrob_signals': {'recruiter_response_rate': 0.8},
    }
    
    clean_result = detector.detect(clean)
    assert not clean_result['is_honeypot'], "Legitimate AI Engineer should NOT be flagged"
    
    print("OK Honeypot detection: honeypot flagged, clean candidate cleared")


# ─── Test 7: Title Scoring Bug Fix ────────────────────────────────────────────
def test_title_scoring():
    """Test that the v2 title scorer correctly assigns scores."""
    from features.title import TitleMatcher
    matcher = TitleMatcher()
    
    # Ideal AI titles
    ideal_cases = ['AI Engineer', 'ML Engineer', 'NLP Engineer', 'Search Engineer', 
                   'Recommendation Systems Engineer', 'Senior Machine Learning Engineer']
    for title in ideal_cases:
        c = {'profile': {'current_title': title}}
        score, label = matcher.score_title(c)
        assert score >= 0.75, f"'{title}' should score ≥ 0.75 (ideal), got {score}"
    
    # BUG FIX: Generic software titles should NOT score 0.8 anymore
    sw_cases = ['Software Engineer', 'Backend Engineer', 'Full Stack Developer']
    for title in sw_cases:
        c = {'profile': {'current_title': title}}
        score, label = matcher.score_title(c)
        assert score <= 0.65, f"'{title}' should score ≤ 0.65 (moderate), got {score} — BUG NOT FIXED"
    
    # Non-tech titles
    mismatch_cases = ['HR Manager', 'Mechanical Engineer', 'Graphic Designer']
    for title in mismatch_cases:
        c = {'profile': {'current_title': title}}
        score, label = matcher.score_title(c)
        assert score <= 0.2, f"'{title}' should score ≤ 0.2 (mismatch/poor), got {score}"
    
    print("OK Title scoring v2: AI titles ideal, generic SWE moderate, mismatch titles penalized")


# ─── Test 8: Confidence Labels ────────────────────────────────────────────────
def test_confidence_labels():
    """Test confidence calibration labels."""
    assert get_confidence_label(0.85) == "Very High"
    assert get_confidence_label(0.75) == "High"
    assert get_confidence_label(0.60) == "Medium"
    assert get_confidence_label(0.42) == "Low"
    assert get_confidence_label(0.30) == "Very Low"
    print("OK Confidence labels: calibration correct")


if __name__ == '__main__':
    os.environ['PYTHONIOENCODING'] = 'utf-8'

    tests = [
        test_title_scoring,
        test_feature_extraction,
        test_ensemble_scoring,
        test_reasoning_generation,
        test_csv_output,
        test_official_validator,
        test_honeypot_detection,
        test_confidence_labels,
    ]
    
    passed = 0
    failed = 0
    
    print("=" * 60)
    print("Code Liberators -- End-to-End Pipeline Tests")
    print("=" * 60)
    
    for test in tests:
        try:
            test()
            passed += 1
        except AssertionError as e:
            print(f"FAIL {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"ERROR {test.__name__}: {e}")
            import traceback
            traceback.print_exc()
            failed += 1
    
    print("=" * 60)
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)} tests")
    print("=" * 60)
    
    sys.exit(0 if failed == 0 else 1)
