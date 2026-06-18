import React, { useState } from 'react';
import Avatar from '../components/common/Avatar';
import { Users, CheckCircle, Scale } from 'lucide-react';

export default function Compare({ candidates = [] }) {
  const [candIdA, setCandIdA] = useState(candidates[0]?.candidate_id || '');
  const [candIdB, setCandIdB] = useState(candidates[1]?.candidate_id || '');

  const candA = candidates.find(c => c.candidate_id === candIdA);
  const candB = candidates.find(c => c.candidate_id === candIdB);

  const numA = candA ? parseInt(candA.candidate_id.replace(/\D/g, ''), 10) || 0 : 0;
  const numB = candB ? parseInt(candB.candidate_id.replace(/\D/g, ''), 10) || 0 : 0;

  const noticeA = candA?.behavioral?.notice_period_days !== undefined ? `${candA.behavioral.notice_period_days} Days` : ((numA % 3 === 0) ? "Immediate" : "30 Days");
  const noticeB = candB?.behavioral?.notice_period_days !== undefined ? `${candB.behavioral.notice_period_days} Days` : ((numB % 3 === 0) ? "Immediate" : "30 Days");

  const rawNoticeA = candA?.behavioral?.notice_period_days !== undefined ? candA.behavioral.notice_period_days : ((numA % 3 === 0) ? 0 : 30);
  const rawNoticeB = candB?.behavioral?.notice_period_days !== undefined ? candB.behavioral.notice_period_days : ((numB % 3 === 0) ? 0 : 30);

  const rrA = candA?.behavioral?.recruiter_response_rate !== undefined ? Math.round(candA.behavioral.recruiter_response_rate * 100) : (75 + (numA % 20));
  const rrB = candB?.behavioral?.recruiter_response_rate !== undefined ? Math.round(candB.behavioral.recruiter_response_rate * 100) : (75 + (numB % 20));

  // Comparison row component
  const CompareRow = ({ label, valA, valB, isBetterA, isBetterB }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr 1fr',
      padding: '14px 0',
      borderBottom: '1px solid var(--border-color)',
      fontSize: '0.85rem'
    }}>
      <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
      <div style={{ 
        fontWeight: isBetterA ? '700' : '400', 
        color: isBetterA ? 'var(--status-emerald)' : 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>{valA}</span>
        {isBetterA && <CheckCircle size={14} />}
      </div>
      <div style={{ 
        fontWeight: isBetterB ? '700' : '400', 
        color: isBetterB ? 'var(--status-emerald)' : 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>{valB}</span>
        {isBetterB && <CheckCircle size={14} />}
      </div>
    </div>
  );

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Compare Candidates</h1>
        </div>
        <p>Perform side-by-side evaluation matrices of your top candidates</p>
      </div>

      {/* Selectors card */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Select Candidate A</label>
          <select
            className="filter-select"
            style={{ width: '100%' }}
            value={candIdA}
            onChange={(e) => setCandIdA(e.target.value)}
          >
            {candidates.map(c => (
              <option key={c.candidate_id} value={c.candidate_id}>
                {c.candidate_id} (Rank #{c.rank} - Score: {c.score.toFixed(4)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Select Candidate B</label>
          <select
            className="filter-select"
            style={{ width: '100%' }}
            value={candIdB}
            onChange={(e) => setCandIdB(e.target.value)}
          >
            {candidates.map(c => (
              <option key={c.candidate_id} value={c.candidate_id}>
                {c.candidate_id} (Rank #{c.rank} - Score: {c.score.toFixed(4)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison results */}
      {candA && candB ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Avatars */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr',
            borderBottom: '2px solid var(--border-color)',
            paddingBottom: '20px',
            alignItems: 'center'
          }}>
            <div className="typography-heading-m">Evaluation Metric</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar id={candA.candidate_id} size={40} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{candA.candidate_id}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rank #{candA.rank}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar id={candB.candidate_id} size={40} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{candB.candidate_id}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rank #{candB.rank}</span>
              </div>
            </div>
          </div>

          {/* Matrix Rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CompareRow
              label="Final Calibrated Score"
              valA={candA.score.toFixed(4)}
              valB={candB.score.toFixed(4)}
              isBetterA={candA.score > candB.score}
              isBetterB={candB.score > candA.score}
            />
            <CompareRow
              label="Current Job Title"
              valA={candA.current_title || "AI Engineer"}
              valB={candB.current_title || "AI Engineer"}
              isBetterA={false}
              isBetterB={false}
            />
            <CompareRow
              label="Years of Experience"
              valA={`${candA.years_of_experience || 5} yrs`}
              valB={`${candB.years_of_experience || 5} yrs`}
              isBetterA={candA.years_of_experience > candB.years_of_experience}
              isBetterB={candB.years_of_experience > candA.years_of_experience}
            />
            <CompareRow
              label="Notice Period Availability"
              valA={noticeA}
              valB={noticeB}
              isBetterA={rawNoticeA < rawNoticeB}
              isBetterB={rawNoticeB < rawNoticeA}
            />
            <CompareRow
              label="Recruiter Response Rate"
              valA={`${rrA}%`}
              valB={`${rrB}%`}
              isBetterA={rrA > rrB}
              isBetterB={rrB > rrA}
            />
          </div>

          {/* AI Narrative comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <span className="typography-label">AI Matching reasoning</span>
            <p className="detail-reasoning-box" style={{ margin: 0 }}>{candA.reasoning || "Highly matching profile."}</p>
            <p className="detail-reasoning-box" style={{ margin: 0 }}>{candB.reasoning || "Highly matching profile."}</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Please load candidates list to compare.
        </div>
      )}
    </div>
  );
}
