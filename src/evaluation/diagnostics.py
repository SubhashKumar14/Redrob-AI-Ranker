"""
Evaluation and diagnostics module.
Provides sanity checks, score distribution analysis, and honeypot detection
validation for the ranked output.
"""

import csv
from pathlib import Path
from typing import Dict, List
from collections import Counter


class RankingDiagnostics:
    """Diagnostics toolkit for evaluating ranking quality."""
    
    def __init__(self, submission_path: str, candidates_path: str = None):
        self.submission_path = Path(submission_path)
        self.candidates_path = candidates_path
        self.submissions = self._load_submission()
        self.candidates = None
        if candidates_path:
            self.candidates = self._load_candidates()
    
    def _load_submission(self) -> List[Dict]:
        """Load submission CSV."""
        with open(self.submission_path, 'r', encoding='utf-8') as f:
            return list(csv.DictReader(f))
    
    def _load_candidates(self) -> Dict:
        """Load candidates into a dict keyed by candidate_id."""
        import json
        candidates = {}
        with open(self.candidates_path, 'r') as f:
            for line in f:
                c = json.loads(line.strip())
                candidates[c['candidate_id']] = c
        return candidates
    
    def run_all_checks(self) -> Dict:
        """Run all diagnostic checks and return report."""
        checks = {
            'format_valid': self.check_format(),
            'score_distribution': self.check_score_distribution(),
            'title_distribution': self.check_title_distribution(),
            'yoe_distribution': self.check_yoe_distribution(),
            'honeypot_check': self.check_honeypots(),
            'reasoning_quality': self.check_reasoning_quality(),
        }
        return checks
    
    def check_format(self) -> Dict:
        """Check basic format compliance."""
        issues = []
        
        if len(self.submissions) != 100:
            issues.append(f"Expected 100 rows, got {len(self.submissions)}")
        
        # Check unique IDs and ranks
        ids = [s['candidate_id'] for s in self.submissions]
        ranks = [int(s['rank']) for s in self.submissions]
        
        if len(set(ids)) != 100:
            issues.append(f"Duplicate candidate_ids found")
        
        if set(ranks) != set(range(1, 101)):
            issues.append(f"Ranks not 1-100 exactly once")
        
        # Check score monotonicity
        scores = [float(s['score']) for s in self.submissions]
        for i in range(len(scores) - 1):
            if scores[i] < scores[i + 1]:
                issues.append(f"Score not non-increasing at rank {i+1}")
                break
        
        # Check reasoning
        empty_reasoning = sum(1 for s in self.submissions if not s.get('reasoning', '').strip())
        if empty_reasoning > 0:
            issues.append(f"{empty_reasoning} candidates have empty reasoning")
        
        return {
            'passed': len(issues) == 0,
            'issues': issues,
        }
    
    def check_score_distribution(self) -> Dict:
        """Analyze score distribution."""
        scores = [float(s['score']) for s in self.submissions]
        
        return {
            'min': min(scores),
            'max': max(scores),
            'mean': sum(scores) / len(scores),
            'range': max(scores) - min(scores),
            'top_10_avg': sum(scores[:10]) / 10,
            'top_50_avg': sum(scores[:50]) / 50,
            'bottom_50_avg': sum(scores[50:]) / 50,
        }
    
    def check_title_distribution(self) -> Dict:
        """Check title distribution in top-K."""
        if not self.candidates:
            return {'error': 'Candidate data not loaded'}
        
        ai_titles = 0
        ideal_titles = 0
        title_counts = Counter()
        
        for sub in self.submissions:
            cid = sub['candidate_id']
            candidate = self.candidates.get(cid)
            if candidate:
                title = candidate['profile']['current_title']
                title_counts[title] += 1
                
                title_lower = title.lower()
                if any(t in title_lower for t in ['ai engineer', 'ml engineer', 'machine learning engineer',
                                                    'data scientist', 'nlp engineer', 'recommendation',
                                                    'search engineer', 'computer vision']):
                    ai_titles += 1
                if any(t in title_lower for t in ['ai engineer', 'ml engineer', 'machine learning engineer',
                                                    'senior ai', 'senior ml', 'lead ai', 'staff ml']):
                    ideal_titles += 1
        
        return {
            'ai_titles_in_top_100': ai_titles,
            'ideal_titles_in_top_100': ideal_titles,
            'ai_title_ratio': ai_titles / 100,
            'top_10_titles': title_counts.most_common(10),
        }
    
    def check_yoe_distribution(self) -> Dict:
        """Check YOE distribution in top-K."""
        if not self.candidates:
            return {'error': 'Candidate data not loaded'}
        
        yoe_values = []
        for sub in self.submissions:
            cid = sub['candidate_id']
            candidate = self.candidates.get(cid)
            if candidate:
                yoe_values.append(candidate['profile']['years_of_experience'])
        
        in_5_9_band = sum(1 for y in yoe_values if 5 <= y <= 9)
        above_9 = sum(1 for y in yoe_values if y > 9)
        below_5 = sum(1 for y in yoe_values if y < 5)
        
        return {
            'avg_yoe': sum(yoe_values) / len(yoe_values) if yoe_values else 0,
            'in_5_9_band': in_5_9_band,
            'above_9': above_9,
            'below_5': below_5,
        }
    
    def check_honeypots(self) -> Dict:
        """Check for honeypots in the top-100."""
        if not self.candidates:
            return {'error': 'Candidate data not loaded'}
        
        import sys
        from pathlib import Path
        sys.path.insert(0, str(Path(__file__).parent.parent))
        from features.honeypot import HoneypotDetector
        detector = HoneypotDetector()
        
        honeypot_count = 0
        honeypot_in_top_10 = 0
        detected = []
        
        for i, sub in enumerate(self.submissions):
            cid = sub['candidate_id']
            candidate = self.candidates.get(cid)
            if candidate:
                result = detector.detect(candidate)
                if result['is_honeypot']:
                    honeypot_count += 1
                    if i < 10:
                        honeypot_in_top_10 += 1
                    detected.append({
                        'rank': i + 1,
                        'candidate_id': cid,
                        'title': candidate['profile']['current_title'],
                        'issues': result['issues'],
                    })
        
        return {
            'honeypot_count_top_100': honeypot_count,
            'honeypot_rate': honeypot_count / 100,
            'honeypot_in_top_10': honeypot_in_top_10,
            'passes_threshold': honeypot_count <= 10,  # < 10% threshold
            'detected': detected,
        }
    
    def check_reasoning_quality(self) -> Dict:
        """Check reasoning quality metrics."""
        reasonings = [s['reasoning'] for s in self.submissions]
        
        lengths = [len(r) for r in reasonings]
        
        # Check for templated reasonings (high similarity)
        from collections import Counter
        first_words = [r.split()[0] if r.split() else '' for r in reasonings]
        word_patterns = Counter(first_words)
        
        return {
            'avg_length': sum(lengths) / len(lengths),
            'min_length': min(lengths),
            'max_length': max(lengths),
            'all_nonempty': all(len(r.strip()) > 0 for r in reasonings),
            'pattern_diversity': len(word_patterns),
        }
    
    def print_report(self):
        """Print a formatted diagnostic report."""
        print("=" * 60)
        print("CODE LIBERATORS — RANKING DIAGNOSTICS REPORT")
        print("=" * 60)
        
        checks = self.run_all_checks()
        
        # Format check
        fmt = checks['format_valid']
        status = "PASS" if fmt['passed'] else "FAIL"
        print(f"\n[FORMAT] {status}")
        for issue in fmt['issues']:
            print(f"  - {issue}")
        
        # Score distribution
        dist = checks['score_distribution']
        print(f"\n[SCORE DISTRIBUTION]")
        print(f"  Range: {dist['min']:.4f} - {dist['max']:.4f}")
        print(f"  Mean: {dist['mean']:.4f}")
        print(f"  Top-10 avg: {dist['top_10_avg']:.4f}")
        print(f"  Top-50 avg: {dist['top_50_avg']:.4f}")
        
        # Title distribution
        titles = checks['title_distribution']
        if 'error' not in titles:
            print(f"\n[TITLE DISTRIBUTION]")
            print(f"  AI titles in top-100: {titles['ai_titles_in_top_100']}/100")
            print(f"  Ideal titles in top-100: {titles['ideal_titles_in_top_100']}/100")
            print(f"  Top titles: {', '.join(t[0] for t in titles['top_10_titles'][:5])}")
        
        # YOE distribution
        yoe = checks['yoe_distribution']
        if 'error' not in yoe:
            print(f"\n[YOE DISTRIBUTION]")
            print(f"  Avg YOE: {yoe['avg_yoe']:.1f}")
            print(f"  In 5-9 band: {yoe['in_5_9_band']}/100")
        
        # Honeypot check
        hp = checks['honeypot_check']
        if 'error' not in hp:
            status = "PASS" if hp['passes_threshold'] else "FAIL"
            print(f"\n[HONEYPOT CHECK] {status}")
            print(f"  Honeypots in top-100: {hp['honeypot_count_top_100']}/100 ({hp['honeypot_rate']*100:.1f}%)")
            print(f"  Honeypots in top-10: {hp['honeypot_in_top_10']}/10")
            if hp['detected']:
                print(f"  Detected honeypots:")
                for h in hp['detected'][:5]:
                    print(f"    Rank {h['rank']}: {h['candidate_id']} ({h['title']}) - {', '.join(h['issues'])}")
        
        # Reasoning quality
        rq = checks['reasoning_quality']
        print(f"\n[REASONING QUALITY]")
        print(f"  Avg length: {rq['avg_length']:.0f} chars")
        print(f"  All non-empty: {rq['all_nonempty']}")
        print(f"  Pattern diversity: {rq['pattern_diversity']} unique opening patterns")
        
        print("\n" + "=" * 60)


if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("Usage: python diagnostics.py <submission.csv> [candidates.jsonl]")
        sys.exit(1)
    
    submission = sys.argv[1]
    candidates = sys.argv[2] if len(sys.argv) > 2 else None
    
    diag = RankingDiagnostics(submission, candidates)
    diag.print_report()
