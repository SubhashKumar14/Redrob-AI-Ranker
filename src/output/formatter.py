"""
Output formatting module.
Generates submission CSV in the exact format required by the challenge.
"""

import csv
from pathlib import Path
from typing import Dict, List


REQUIRED_HEADER = ["candidate_id", "rank", "score", "reasoning"]


class SubmissionFormatter:
    """Formats ranked candidates into submission CSV."""
    
    def __init__(self):
        pass
    
    def format_row(self, features: Dict, reasoning: str) -> Dict:
        """Format a single candidate's data for CSV output."""
        return {
            'candidate_id': features['candidate_id'],
            'rank': features['rank'],
            'score': features['score'],
            'reasoning': reasoning,
        }
    
    def write_csv(self, ranked_features: List[Dict], reasonings: List[str], 
                  output_path: str) -> str:
        """
        Write the top 100 ranked candidates to submission CSV.
        Returns the output file path.
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=REQUIRED_HEADER)
            writer.writeheader()
            
            for features, reasoning in zip(ranked_features, reasonings):
                row = self.format_row(features, reasoning)
                writer.writerow(row)
        
        return str(output_path)
    
    def validate_output(self, output_path: str) -> List[str]:
        """
        Quick validation of the output file.
        Returns list of issues (empty if valid).
        """
        issues = []
        
        try:
            with open(output_path, 'r', encoding='utf-8', newline='') as f:
                reader = csv.reader(f)
                header = next(reader, None)
                if header != REQUIRED_HEADER:
                    issues.append(f"Header mismatch: {header}")
                
                rows = list(reader)
                if len(rows) != 100:
                    issues.append(f"Expected 100 rows, got {len(rows)}")
                
                # Check for duplicate IDs and ranks
                ids = set()
                ranks = set()
                prev_score = float('inf')
                
                for i, row in enumerate(rows):
                    if len(row) != 4:
                        issues.append(f"Row {i+2}: expected 4 columns, got {len(row)}")
                        continue
                    
                    cid, rank_str, score_str, reasoning = row
                    
                    if cid in ids:
                        issues.append(f"Duplicate candidate_id: {cid}")
                    ids.add(cid)
                    
                    try:
                        rank = int(rank_str)
                        if rank in ranks:
                            issues.append(f"Duplicate rank: {rank}")
                        ranks.add(rank)
                    except ValueError:
                        issues.append(f"Invalid rank: {rank_str}")
                    
                    try:
                        score = float(score_str)
                        if score > prev_score + 1e-9:
                            issues.append(f"Score not non-increasing at row {i+2}: {score} > {prev_score}")
                        prev_score = score
                    except ValueError:
                        issues.append(f"Invalid score: {score_str}")
                    
                    if not reasoning or not reasoning.strip():
                        issues.append(f"Empty reasoning at row {i+2}")
                
                missing_ranks = set(range(1, 101)) - ranks
                if missing_ranks:
                    issues.append(f"Missing ranks: {sorted(missing_ranks)}")
        
        except Exception as e:
            issues.append(f"Error reading file: {e}")
        
        return issues
