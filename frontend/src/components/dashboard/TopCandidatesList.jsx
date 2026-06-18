import React from 'react';
import Avatar from '../common/Avatar';
import { ChevronRight } from 'lucide-react';

export default function TopCandidatesList({ candidates = [], onSelectCandidate, setActiveTab }) {
  // Helpers
  function getConfidenceClass(score) {
    if (score >= 0.80) return 'score-very-high';
    if (score >= 0.70) return 'score-high';
    if (score >= 0.55) return 'score-medium';
    return 'score-low';
  }

  function getConfidenceLabel(score) {
    if (score >= 0.80) return 'Very High';
    if (score >= 0.70) return 'High';
    if (score >= 0.55) return 'Medium';
    return 'Low';
  }

  function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-top';
  }

  const handleCandidateClick = (c) => {
    setActiveTab('rankings');
    onSelectCandidate(c);
    // Dispatch custom event to select this candidate in rankings page
    setTimeout(() => {
      const event = new CustomEvent('selectCandidate', { detail: c });
      window.dispatchEvent(event);
    }, 50);
  };

  return (
    <div className="card">
      <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div className="card-title">
          <h2>Top Candidates Shortlist</h2>
        </div>
        <button 
          onClick={() => setActiveTab('rankings')}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
        >
          View All Rankings
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '12px' }}>
        {candidates.slice(0, 5).map(c => (
          <div 
            key={c.candidate_id} 
            onClick={() => handleCandidateClick(c)}
            style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '14px 10px', 
              borderBottom: '1px solid var(--border-color)',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* Rank badge */}
            <div className={`rank-badge ${getRankClass(c.rank)}`}>{c.rank}</div>
            
            {/* Avatar */}
            <Avatar id={c.candidate_id} size={32} />

            {/* Candidate ID & reasoning preview */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                {c.candidate_id}
              </div>
              <div style={{ 
                fontSize: '0.78rem', 
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {c.reasoning || "Highly qualified AI Engineer profile ensembled with structured features."}
              </div>
            </div>

            {/* Score & Confidence */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent-light)' }}>
                {c.score.toFixed(4)}
              </span>
              <span className={`score-badge ${getConfidenceClass(c.score)}`}>
                {getConfidenceLabel(c.score)}
              </span>
            </div>
            
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
