import React from 'react';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { Target, Award, ShieldAlert, Sparkles, Network } from 'lucide-react';

export default function JDAnalysis({ jd }) {
  if (!jd) {
    return (
      <div className="content-container">
        <div className="page-heading">
          <h1>Job Description Analysis</h1>
          <p>Connecting requirements ontology to evaluation weights</p>
        </div>
        <div className="card">
          <LoadingSkeleton type="detail" />
        </div>
      </div>
    );
  }

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Job Description Analysis</h1>
        </div>
        <p>Parsed requirements and semantic ontology used by the ranking engine</p>
      </div>

      <div className="grid-12">
        {/* Role overview - Left (6 columns) */}
        <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <Award className="card-title-icon" size={18} />
                <h2>Role Overview</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="typography-label">Position Title</span>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '4px' }}>{jd.role}</div>
              </div>

              <div>
                <span className="typography-label">Target Seniority</span>
                <div style={{ display: 'inline-block', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-light)', marginTop: '4px' }}>
                  {jd.seniority}
                </div>
              </div>

              <div>
                <span className="typography-label">Ideal Experience</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', marginTop: '4px' }}>{jd.experience_range}</div>
              </div>

              <div>
                <span className="typography-label">Target Organization Type</span>
                <div style={{ fontWeight: 600, color: 'var(--status-amber)', fontSize: '0.85rem', marginTop: '4px' }}>{jd.company_type}</div>
              </div>

              <div>
                <span className="typography-label">Ensemble Weight Distributions</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  {Object.entries(jd.scoring_weights).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k.replace('_', ' ')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{(v * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & signals - Right (6 columns) */}
        <div className="col-6" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <Network className="card-title-icon" size={18} />
                <h2>Skills Ontology</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span className="typography-label">Core Required Skills (Weight: 3.0×)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {jd.required_skills.map(s => (
                    <span key={s} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', color: 'var(--color-accent-light)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="typography-label">Preferred Skills (Weight: 2.0×)</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {jd.preferred_skills.map(s => (
                    <span key={s} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="typography-label">Behavioral Calibration Multipliers</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {jd.behavioral_signals.map(s => (
                    <span key={s} style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--status-emerald)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 500 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
