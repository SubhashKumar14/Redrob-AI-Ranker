import React, { useState } from 'react';
import { Database, Binary, Cpu, Network, BarChart2, ShieldAlert, Sparkles, FileSpreadsheet } from 'lucide-react';

export default function PipelineStory() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "1. Dataset Ingestion",
      short: "100K Profiles",
      icon: Database,
      desc: "Ingests raw candidate datasets (464 MB JSONL) in streaming mode to prevent memory exhaustion (< 2 GB). Pre-filters unqualified entries (YOE < 3) in seconds.",
      details: [
        "Ingests 100,000 JSONL records",
        "Stream-loader filters out 24,923 unqualified candidate records",
        "Retains 75,077 candidates for main scoring pipelines"
      ]
    },
    {
      title: "2. Structured Parsing",
      short: "Feature Mining",
      icon: Binary,
      desc: "Extracts key structured parameters: current job titles, career history gaps, total experience, educational institutions, and specific skill endorsements.",
      details: [
        "Title hierarchy parser classifies roles",
        "Career gap analyzer audits job hops",
        "Skills duration and endorsement weights parsed"
      ]
    },
    {
      title: "3. Semantic Embeddings",
      short: "BGE Vectors",
      icon: Network,
      desc: "Encodes candidate experience text descriptions into dense vector space using local BAAI/bge-small-en-v1.5 embedding models.",
      details: [
        "Runs parameter-free with smart fallback if models are not precomputed",
        "Captures conceptual semantics rather than mere keyword presence",
        "Standardized dimensions mapped for retrieval"
      ]
    },
    {
      title: "4. FAISS Index Retrieval",
      short: "Vector Search",
      icon: Cpu,
      desc: "Performs high-performance vector search in pre-built flat IP FAISS indices to retrieve the top candidate nodes matching the job description.",
      details: [
        "Indexed database size: 153.6 MB (excluded from git due to 100MB limit)",
        "Performs top candidate similarity matching on FAISS index",
        "Achieves sub-millisecond retrieval latencies"
      ]
    },
    {
      title: "5. Weighted Ensemble",
      short: "Ensemble Score",
      icon: BarChart2,
      desc: "Computes a unified score using a weighted combination of structured features and semantic similarity scores.",
      details: [
        "Title Alignment: 30% | Career Trajectory: 20%",
        "Skill Quality: 20% | YOE Fit (Gaussian): 15%",
        "Education Tier: 5% | Semantic Similarity: 10%"
      ]
    },
    {
      title: "6. Behavioral Calibration",
      short: "Multiplier",
      icon: Sparkles,
      desc: "Applies a dynamic behavioral multiplier B(c) ∈ [0.7, 1.1] based on active signals: notice periods, open-to-work flags, and recruiter response rates.",
      details: [
        "Boosts candidates who are immediately available",
        "De-prioritizes candidates with low engagement history",
        "Ensures high-intent candidates rise to the top"
      ]
    },
    {
      title: "7. Honeypot Filtering",
      short: "Adversarial Shield",
      icon: ShieldAlert,
      desc: "Audits candidates for keyword-stuffing and adversarial profiles (e.g. HR managers listing expert LLM/RAG skills) using 8 deterministic tests.",
      details: [
        "Identifies keyword stuffing with 0 endorsements",
        "Applies H(c) penalty factor (down to 0.0) to suppress fraud",
        "Guarantees 0% honeypots in final top-100 rankings"
      ]
    },
    {
      title: "8. Final Shortlist",
      short: "CSV Export",
      icon: FileSpreadsheet,
      desc: "Sorts calibrated candidates, formats output according to candidate_schema, and saves the final 100 entries to team_code_liberators.csv.",
      details: [
        "Capped at exactly 100 rows",
        "Verified clean formatting (CAND_XXXXXXX, rank, score, reasoning)",
        "Passes the official validate_submission.py validator script"
      ]
    }
  ];

  const ActiveIcon = steps[activeStep].icon;

  return (
    <div className="card">
      <div className="card-header" style={{ marginBottom: '16px' }}>
        <div className="card-title">
          <Sparkles className="card-title-icon" size={18} strokeWidth={1.75} />
          <h2>Interactive AI Pipeline</h2>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Click any stage below to inspect detailed data transformations</span>
      </div>

      {/* Visual Timeline / Flowchart */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '12px 0',
        marginBottom: '20px',
        overflowX: 'auto',
        gap: '8px'
      }}>
        {/* Horizontal background connection bar */}
        <div style={{
          position: 'absolute',
          left: '5%',
          right: '5%',
          top: '36px',
          height: '2px',
          backgroundColor: 'var(--border-color)',
          zIndex: 0
        }} />

        {steps.map((s, idx) => {
          const StepIcon = s.icon;
          const isActive = idx === activeStep;
          return (
            <div 
              key={idx} 
              onClick={() => setActiveStep(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 1,
                minWidth: '70px',
                textAlign: 'center'
              }}
            >
              {/* Icon node */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--color-accent)' : 'var(--bg-card)',
                border: `2px solid ${isActive ? 'var(--color-accent-light)' : 'var(--border-color)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'white' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
                marginBottom: '8px'
              }}>
                <StepIcon size={16} strokeWidth={isActive ? 2 : 1.75} />
              </div>
              <span style={{ 
                fontSize: '0.68rem', 
                fontWeight: isActive ? '700' : '500', 
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' 
              }}>
                {s.short}
              </span>
            </div>
          );
        })}
      </div>

      {/* Interactive Detail Box */}
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-start',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-accent-glow)',
          color: 'var(--color-accent-light)'
        }}>
          <ActiveIcon size={24} strokeWidth={1.75} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {steps[activeStep].title}
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            {steps[activeStep].desc}
          </p>
          
          <div style={{ marginTop: '4px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>Pipeline Actions</span>
            <ul style={{ paddingLeft: '16px', marginTop: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {steps[activeStep].details.map((d, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
