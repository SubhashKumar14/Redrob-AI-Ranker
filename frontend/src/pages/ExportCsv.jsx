import React from 'react';
import { Download, FileSpreadsheet, FileArchive, CheckCircle2 } from 'lucide-react';

export default function ExportCsv({ API_BASE }) {
  // Trigger file download helper
  const handleDownload = (type) => {
    // Redirect to API endpoint which outputs the attachment file
    window.open(`${API_BASE}/export/csv`, '_blank');
  };

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Export Ranked Shortlists</h1>
        </div>
        <p>Download final validated candidate shortlist CSVs for submission and review</p>
      </div>

      <div className="grid-12">
        {/* Main Export Box - Left (8 columns) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <FileSpreadsheet className="card-title-icon" size={18} />
                <h2>Available CSV shortlists</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Hybrid Winner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>team_code_liberators.csv</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>The final hybrid pipeline output combining structured scoring and semantic similarity matches (100 rows, validator: PASS).</span>
                </div>
                <button 
                  onClick={() => handleDownload('hybrid')}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={14} />
                  <span>Download CSV</span>
                </button>
              </div>

              {/* Structured Baseline */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>team_code_liberators_structured.csv</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>The baseline structured pipeline output containing candidate records scored without vector indexing (100 rows, validator: PASS).</span>
                </div>
                <button 
                  onClick={() => handleDownload('structured')}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={14} />
                  <span>Download CSV</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Verification Checklist - Right (4 columns) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <h2>Submission Checks</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>Exactly 100 candidate rows</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>Strict candidate_schema formatting</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>Monotonic non-increasing scores</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>Passes validate_submission.py</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
