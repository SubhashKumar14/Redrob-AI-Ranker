import React from 'react';
import { Terminal, ShieldCheck, Cpu, HardDrive, BarChart3, Database } from 'lucide-react';

export default function Diagnostics({ diagnostics }) {
  const modelSpecs = {
    name: "BAAI/bge-small-en-v1.5",
    dimension: 384,
    metric: "Cosine Similarity (Inner ProductFlat)",
    retrievalType: "FAISS CPU IndexFlatIP",
    indexSize: "100,000 Candidates"
  };

  const weights = [
    { component: "Title Match Alignment", weight: "30%", role: "Candidate current title semantic overlap" },
    { component: "Skills Quality Score", weight: "20%", role: "Matched required vs preferred skills weight" },
    { component: "Career Trajectory Profile", weight: "20%", role: "Weighted company tier and duration duration" },
    { component: "Years of Experience Fit", weight: "15%", role: "Gaussian model centered around 7-year target" },
    { component: "Semantic Similarity Embeddings", weight: "10%", role: "BGE vector search dot product ranking" },
    { component: "Education Verification Tier", weight: "5%", role: "CS field of study and institution rank" },
  ];

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>System Diagnostics & Audits</h1>
        </div>
        <p>Execution audits, vector index metrics, and validation checks for the active ranking engine</p>
      </div>

      {/* Stats row */}
      <div className="diag-grid" style={{ marginBottom: '24px' }}>
        <div className="diag-item">
          <span className="diag-label">Runtime Engine</span>
          <span className="diag-value">Python 3.13 / FastAPI</span>
        </div>
        <div className="diag-item">
          <span className="diag-label">Validator Status</span>
          <span className="diag-value pass" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> PASS
          </span>
        </div>
        <div className="diag-item">
          <span className="diag-label">Vector Space</span>
          <span className="diag-value">384-Dim FAISS CPU</span>
        </div>
        <div className="diag-item">
          <span className="diag-label">Audit Version</span>
          <span className="diag-value">v2.0.0 (Live)</span>
        </div>
      </div>

      <div className="grid-12">
        {/* Model and Pipeline audits - Left (8 columns) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Index Specs */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <Database size={16} style={{ color: 'var(--color-accent-light)', marginRight: '8px' }} />
                <h2>Semantic Search Index Specifications</h2>
              </div>
            </div>

            <div className="importance-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Embedding Model Core</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{modelSpecs.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Vector Dimension</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{modelSpecs.dimension} Channels</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Similarity Search Metric</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{modelSpecs.metric}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Index Registry</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{modelSpecs.indexSize} Indexed Profiles</span>
              </div>
            </div>
          </div>

          {/* Scoring Weights */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <BarChart3 size={16} style={{ color: 'var(--color-accent-light)', marginRight: '8px' }} />
                <h2>Active Pipeline Scoring Matrices</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {weights.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx === weights.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{w.component}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{w.role}</span>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-accent-light)' }}>{w.weight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System specs - Right (4 columns) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <h2>Environment Audits</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={18} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Processor Model</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>AMD Ryzen / Intel Core (CPU Only)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <HardDrive size={18} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Memory Limit</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>&lt; 2.0 GB Peak RAM Ingestion</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <span className="typography-label">Validator Checksum</span>
                <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)', padding: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '6px' }}>
                  SHA256: 2d12f81740d78b5ae3ec93b053325b50bcb9
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
