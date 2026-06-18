import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/layout/CommandPalette';
import LoadingSkeleton from './components/common/LoadingSkeleton';

// Pages
import Dashboard from './pages/Dashboard';
import Rankings from './pages/Rankings';
import Explorer from './pages/Explorer';
import Compare from './pages/Compare';
import JDAnalysis from './pages/JDAnalysis';
import PipelinePage from './pages/Pipeline';
import Diagnostics from './pages/Diagnostics';
import BenchmarkPage from './pages/Benchmark';
import ExportCsv from './pages/ExportCsv';
import SubmissionPackage from './pages/SubmissionPackage';
import SettingsPage from './pages/Settings';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [candidates, setCandidates] = useState([]);
  const [health, setHealth] = useState({});
  const [jd, setJd] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiOnline, setApiOnline] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync theme
  useEffect(() => {
    document.body.className = theme;
    if (theme === 'light') {
      document.documentElement.style.setProperty('--color-bg-primary', '#f8fafc');
      document.documentElement.style.setProperty('--color-bg-surface', '#ffffff');
      document.documentElement.style.setProperty('--color-bg-card', '#f1f5f9');
      document.documentElement.style.setProperty('--color-bg-hover', '#e2e8f0');
      document.documentElement.style.setProperty('--color-border', '#cbd5e1');
      document.documentElement.style.setProperty('--color-border-hover', '#94a3b8');
      document.documentElement.style.setProperty('--color-text-primary', '#0f172a');
      document.documentElement.style.setProperty('--color-text-secondary', '#475569');
      document.documentElement.style.setProperty('--color-text-muted', '#64748b');
    } else {
      document.documentElement.style.removeProperty('--color-bg-primary');
      document.documentElement.style.removeProperty('--color-bg-surface');
      document.documentElement.style.removeProperty('--color-bg-card');
      document.documentElement.style.removeProperty('--color-bg-hover');
      document.documentElement.style.removeProperty('--color-border');
      document.documentElement.style.removeProperty('--color-border-hover');
      document.documentElement.style.removeProperty('--color-text-primary');
      document.documentElement.style.removeProperty('--color-text-secondary');
      document.documentElement.style.removeProperty('--color-text-muted');
    }
  }, [theme]);

  // Key listener for Command Palette (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial system data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const hr = await fetch(`${API_BASE}/health`);
        if (hr.ok) {
          setHealth(await hr.json());
          setApiOnline(true);
        }

        const cr = await fetch(`${API_BASE}/candidates?limit=100`);
        if (cr.ok) {
          const cData = await cr.json();
          setCandidates(cData.candidates || []);
        }

        const jr = await fetch(`${API_BASE}/jd`);
        if (jr.ok) setJd(await jr.json());

        const dr = await fetch(`${API_BASE}/diagnostics`);
        if (dr.ok) setDiagnostics(await dr.json());

      } catch (e) {
        setError('API server not reachable. Start local dev server with: uvicorn src.api.main:app --port 8000');
        setApiOnline(false);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE}/export/csv`, '_blank');
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        apiOnline={apiOnline}
        candidatesCount={candidates.length}
        latency={diagnostics?.latency || "33.4s"}
      />

      {/* Main Workspace Area */}
      <div className="main-workspace">
        <Header
          onSearchClick={() => setIsCommandPaletteOpen(true)}
          theme={theme}
          toggleTheme={toggleTheme}
          isSampleDataset={candidates.length < 100}
        />

        {/* Workspace scrollable viewport */}
        <main className="workspace-content">
          {error && (
            <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="content-container">
              <div className="page-heading">
                <h1>Loading Workspace...</h1>
                <p>Retrieving model indices and precomputed candidate shortlists</p>
              </div>
              <LoadingSkeleton type="metrics" />
              <div style={{ marginTop: '24px' }}>
                <LoadingSkeleton type="table" count={6} />
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  candidates={candidates}
                  health={health}
                  setActiveTab={setActiveTab}
                  onSelectCandidate={setSelectedCandidate}
                />
              )}

              {activeTab === 'rankings' && (
                <Rankings
                  candidates={candidates}
                  selectedCandidate={selectedCandidate}
                  setSelectedCandidate={setSelectedCandidate}
                />
              )}

              {activeTab === 'explorer' && (
                <Explorer
                  candidates={candidates}
                />
              )}

              {activeTab === 'compare' && (
                <Compare
                  candidates={candidates}
                />
              )}

              {activeTab === 'jd' && (
                <JDAnalysis
                  jd={jd}
                />
              )}

              {activeTab === 'pipeline' && (
                <PipelinePage />
              )}

              {activeTab === 'diagnostics' && (
                <Diagnostics
                  diagnostics={diagnostics}
                />
              )}

              {activeTab === 'benchmark' && (
                <BenchmarkPage
                  candidates={candidates}
                />
              )}

              {activeTab === 'export_csv' && (
                <ExportCsv
                  API_BASE={API_BASE}
                />
              )}

              {activeTab === 'submission_package' && (
                <SubmissionPackage />
              )}

              {activeTab === 'settings' && (
                <SettingsPage
                  theme={theme}
                  toggleTheme={toggleTheme}
                  API_BASE={API_BASE}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Command Palette dialog (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        candidates={candidates}
        setActiveTab={setActiveTab}
        onThemeToggle={toggleTheme}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
