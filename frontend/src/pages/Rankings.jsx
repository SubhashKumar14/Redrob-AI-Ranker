import React, { useEffect } from 'react';
import CandidateTable from '../components/rankings/CandidateTable';
import CandidateDrawer from '../components/rankings/CandidateDrawer';
import { ListOrdered } from 'lucide-react';

export default function Rankings({ candidates = [], selectedCandidate, setSelectedCandidate }) {
  // Listen for custom event from Command Palette
  useEffect(() => {
    const handleSelectCandidate = (e) => {
      if (e.detail) {
        setSelectedCandidate(e.detail);
      }
    };
    window.addEventListener('selectCandidate', handleSelectCandidate);
    return () => window.removeEventListener('selectCandidate', handleSelectCandidate);
  }, [setSelectedCandidate]);

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListOrdered size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Candidate Rankings</h1>
        </div>
        <p>Verified shortlist of top-100 candidates ranked against your Job Description</p>
      </div>

      {/* Main Table Grid */}
      <div className="card" style={{ padding: '20px' }}>
        <CandidateTable
          candidates={candidates}
          selectedId={selectedCandidate?.candidate_id}
          onSelectCandidate={setSelectedCandidate}
        />
      </div>

      {/* Slide-over drawer overlay */}
      {selectedCandidate && (
        <CandidateDrawer
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
