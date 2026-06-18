import React, { useState, useMemo } from 'react';
import Avatar from '../components/common/Avatar';
import CandidateDrawer from '../components/rankings/CandidateDrawer';
import { Search, Grid, Compass } from 'lucide-react';

export default function Explorer({ candidates = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates.slice(0, 12);
    const q = searchTerm.toLowerCase();
    return candidates.filter(c => 
      c.candidate_id.toLowerCase().includes(q) ||
      (c.current_title && c.current_title.toLowerCase().includes(q)) ||
      (c.reasoning && c.reasoning.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [candidates, searchTerm]);

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Candidate Explorer</h1>
        </div>
        <p>Interactive catalog of candidate profiles with detailed feature cards</p>
      </div>

      {/* Search Bar */}
      <div className="search-controls" style={{ marginBottom: '20px' }}>
        <div className="search-field">
          <Search className="search-field-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search by candidate ID, core skills (e.g. PyTorch, NLP), or titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {filteredCandidates.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
            No candidates match the query.
          </div>
        ) : (
          filteredCandidates.map(c => (
            <div 
              key={c.candidate_id} 
              className="card"
              onClick={() => setSelectedCandidate(c)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar id={c.candidate_id} size={36} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.candidate_id}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Rank #{c.rank}</span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-accent-light)' }}>{c.score.toFixed(4)}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <span className="typography-label">Current Role</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
                  {c.current_title || "AI Engineer"}
                </div>
              </div>

              <div>
                <span className="typography-label">AI Match Overview</span>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: '2px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.reasoning || "Highly qualified AI Specialist ensembled with custom experience metrics."}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-over Drawer */}
      {selectedCandidate && (
        <CandidateDrawer
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
