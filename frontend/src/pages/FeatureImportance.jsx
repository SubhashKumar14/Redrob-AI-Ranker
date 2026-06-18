import React from 'react';
import { Sliders, ShieldCheck, HelpCircle, Activity, Award } from 'lucide-react';

export default function FeatureImportancePage() {
  const coreWeights = [
    { name: "Title Alignment Match", percentage: 30, color: "var(--color-accent)", desc: "Analyzes candidate current title against semantic target categories (e.g. Senior AI Engineer, ML Specialist). Peak weight is awarded for direct matches." },
    { name: "Skills Alignment Quality", percentage: 20, color: "var(--color-accent-light)", desc: "Evaluates matching required core skills (Python, PyTorch, FAISS) and secondary preferred technologies, weighted by endorsements and experience duration." },
    { name: "Career Trajectory Auditing", percentage: 20, color: "var(--color-accent-light)", desc: "Audits historic employment records, assigning higher values for product-company backgrounds, progressive seniority shifts, and low duration gaps." },
    { name: "Years of Experience Alignment", percentage: 15, color: "var(--color-accent-light)", desc: "Evaluates candidates using a mathematical Gaussian curve centered at a target of 7 years, optimizing for the preferred 5-9 years experience band." },
    { name: "Semantic Similarity Embeddings", percentage: 10, color: "var(--color-accent-light)", desc: "Dense vector search using local BAAI/bge-small-en-v1.5 embeddings, capturing conceptual experience context beyond exact keyword syntax matches." },
    { name: "Education & Relevance Tier", percentage: 5, color: "var(--color-accent-light)", desc: "Grades academic institutions into tiers and applies a multiplier for CS-relevant fields of study (Computer Science, Machine Learning, AI)." }
  ];

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Feature Importance Analysis</h1>
        </div>
        <p>Recruiter-facing transparency breakdown of candidate ranking weights, ensembling, and multipliers</p>
      </div>

      <div className="grid-12">
        {/* Core Weights List - Left (8 columns) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <h2>Shortlist Scoring Weights</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {coreWeights.map((w, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{w.name}</span>
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-accent-light)' }}>{w.percentage}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${w.percentage}%`, height: '100%', backgroundColor: 'var(--color-accent)', borderRadius: '3px' }} />
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                    {w.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calibration Multipliers - Right (4 columns) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Behavioral Boost */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <Activity size={16} style={{ color: 'var(--status-emerald)', marginRight: '8px' }} />
                <h2>Behavioral Multiplier B(c)</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <p>
                Calibrates final candidate ranking positions based on real recruiter engagement signals:
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Notice Period Boost</span>
                  <br />Immediate or short availability (≤30 days) receives peak weight multipliers.
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Open to Work Status</span>
                  <br />Active search flags apply a direct positive calibration coefficient.
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Response Rate Signals</span>
                  <br />High recruiter interaction responsiveness boosts outreach efficiency scores.
                </div>
              </div>
            </div>
          </div>

          {/* Honeypot Shield */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <ShieldCheck size={16} style={{ color: 'var(--status-emerald)', marginRight: '8px' }} />
                <h2>Adversarial Honeypot Shield</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <p>
                Protects the recruiter workspace from spam or keyword-stuffing hacks:
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Fraud Suppression</span>
                  <br />Detects adversarial keyword clusters (e.g. non-tech profiles claims of advanced RAG experience).
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Zero-Endorsement Penalties</span>
                  <br />Skills listed without verified endorsements or months of experience trigger deterministic penalties.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
