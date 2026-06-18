import React from 'react';
import { Settings, Info, Sun, Moon } from 'lucide-react';

export default function SettingsPage({ theme, toggleTheme, API_BASE }) {
  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Settings & System Info</h1>
        </div>
        <p>Manage application preferences and review team configuration metadata</p>
      </div>

      <div className="grid-12">
        {/* Settings Box - Left (7 columns) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <h2>Preferences</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Theme Settings */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Interface Theme</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Toggle between light and dark visual aesthetics</span>
                </div>
                <button 
                  onClick={toggleTheme}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                  <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
                </button>
              </div>

              {/* API Server Endpoint */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>API Server Base URL</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>The endpoint used by the React frontend to fetch candidates, health metrics, and parsed job descriptions.</span>
                <input
                  type="text"
                  className="search-box-input"
                  style={{ padding: '8px 12px', width: '100%', maxWidth: '320px', marginTop: '4px' }}
                  value={API_BASE}
                  disabled
                />
              </div>

            </div>
          </div>
        </div>

        {/* Project Info - Right (5 columns) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <Info className="card-title-icon" size={18} />
                <h2>About Code Liberators</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              <p>
                <strong>Code Liberators</strong> is a team formed for the INDIA.RUNS Data & AI Challenge. 
              </p>
              <p>
                Our mission is to build clean, reproducible, and highly performant AI platforms that deliver transparent, explainable results without relying on heavy external runtime APIs.
              </p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="typography-label">Team Lead</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Subhash Kumar</span>
                <span style={{ fontSize: '0.75rem' }}>subhash1403kumar@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
