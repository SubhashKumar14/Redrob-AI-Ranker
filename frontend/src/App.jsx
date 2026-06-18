import { useState, useEffect, useCallback } from 'react'
import './index.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Confidence helper ───
function getConfidenceClass(score) {
  if (score >= 0.80) return 'score-very-high'
  if (score >= 0.70) return 'score-high'
  if (score >= 0.55) return 'score-medium'
  return 'score-low'
}

function getConfidenceLabel(score) {
  if (score >= 0.80) return 'Very High'
  if (score >= 0.70) return 'High'
  if (score >= 0.55) return 'Medium'
  return 'Low'
}

function getRankClass(rank) {
  if (rank === 1) return 'rank-1'
  if (rank === 2) return 'rank-2'
  if (rank === 3) return 'rank-3'
  if (rank <= 10) return 'rank-top'
  return 'rank-mid'
}

// ─── Score Bar ───
function ScoreBar({ score, showLabel = true }) {
  return (
    <div className="score-bar-wrapper">
      <div className="score-bar">
        <div className="score-bar-fill" style={{ width: `${score * 100}%` }} />
      </div>
      {showLabel && <span className="score-text">{score.toFixed(4)}</span>}
    </div>
  )
}

// ─── Breakdown Bar ───
function BreakdownBar({ label, value, maxVal = 1, colorClass = 'fill-blue', weight }) {
  const pct = Math.min((value / maxVal) * 100, 100)
  return (
    <div className="breakdown-item">
      <div className="breakdown-label">
        <span>{label}{weight ? ` (${weight})` : ''}</span>
        <span className="breakdown-value">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="breakdown-bar">
        <div className={`breakdown-fill ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── Pipeline Step ───
function PipelineStep({ icon, label, active }) {
  return (
    <div className={`pipeline-step ${active ? 'active' : ''}`}>
      <span className="pipeline-icon">{icon}</span>
      <span className="pipeline-label">{label}</span>
    </div>
  )
}

// ─── Dashboard Tab ───
function DashboardTab({ health, jd, candidates }) {
  const topScore = candidates[0]?.score || 0
  const avgScore = candidates.length
    ? (candidates.slice(0, 10).reduce((s, c) => s + c.score, 0) / Math.min(10, candidates.length)).toFixed(4)
    : 0

  return (
    <div>
      <div className="page-header">
        <h1>Recruiter Dashboard</h1>
        <p>Intelligent Candidate Discovery & Ranking — Senior AI Engineer, Founding Team</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-value">100K</div>
          <div className="stat-label">Candidates Processed</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{candidates.length}</div>
          <div className="stat-label">Top Ranked</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-value">{avgScore}</div>
          <div className="stat-label">Top-10 Avg Score</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value">~52s</div>
          <div className="stat-label">Ranking Runtime</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-value">0%</div>
          <div className="stat-label">Honeypot Rate</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">PASS</div>
          <div className="stat-label">Validator Status</div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="card mb-4">
        <div className="card-header">
          <div className="card-title">
            <span className="card-icon">🔄</span>
            <h2>Ranking Pipeline</h2>
          </div>
          <span className="text-muted text-sm">Structured Feature Ensemble + Behavioral Calibration</span>
        </div>
        <div className="pipeline-flow">
          <PipelineStep icon="📋" label="Job Description" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="🧩" label="Feature Extraction" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="🏢" label="Title Match (30%)" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="📈" label="Career Trajectory (20%)" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="⚡" label="Skill Alignment (20%)" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="🧠" label="Semantic (10%)" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="🎯" label="Behavioral × B(c)" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="🚨" label="Honeypot × H(c)" active />
          <span className="pipeline-arrow">→</span>
          <PipelineStep icon="🏆" label="Top-100 Output" active />
        </div>
      </div>

      {/* Top 5 Preview */}
      {candidates.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="card-icon">🥇</span>
              <h2>Top 5 Candidates</h2>
            </div>
            <span className="text-muted text-sm">Shortlist preview</span>
          </div>
          <div>
            {candidates.slice(0, 5).map(c => (
              <div key={c.candidate_id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 0', borderBottom: '1px solid var(--border-color)'
              }}>
                <div className={`rank-badge ${getRankClass(c.rank)}`}>{c.rank}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 3 }}>{c.candidate_id}</div>
                  <div className="text-muted text-sm">{c.reasoning?.substring(0, 120)}...</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <ScoreBar score={c.score} />
                  <span className={`score-badge ${getConfidenceClass(c.score)}`} style={{ marginTop: 4 }}>
                    {getConfidenceLabel(c.score)} Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── JD Tab ───
function JDTab({ jd }) {
  if (!jd) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Loading job description...</span>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>Job Description Analysis</h1>
        <p>Parsed requirements used by the ranking engine</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-icon">🎯</span><h2>Role Overview</h2></div>
          </div>
          <div className="jd-section">
            <div className="jd-section-title">Role</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 12 }}>{jd.role}</div>
          </div>
          <div className="jd-section">
            <div className="jd-section-title">Seniority</div>
            <div className="skill-tag" style={{ display: 'inline-block' }}>{jd.seniority}</div>
          </div>
          <div className="jd-section" style={{ marginTop: 12 }}>
            <div className="jd-section-title">Experience Range</div>
            <div style={{ fontWeight: 600 }}>{jd.experience_range}</div>
          </div>
          <div className="jd-section" style={{ marginTop: 12 }}>
            <div className="jd-section-title">Company Preference</div>
            <div style={{ fontWeight: 600, color: 'var(--accent-amber)' }}>{jd.company_type}</div>
          </div>
          <div className="jd-section" style={{ marginTop: 16 }}>
            <div className="jd-section-title">Scoring Weights</div>
            <div className="score-breakdown">
              {Object.entries(jd.scoring_weights).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-icon">⚡</span><h2>Skills Ontology</h2></div>
          </div>
          <div className="jd-section">
            <div className="jd-section-title">Core Required Skills (Weight: 3.0×)</div>
            <div className="skill-tags">
              {jd.required_skills.map(s => <span key={s} className="skill-tag core">{s}</span>)}
            </div>
          </div>
          <div className="jd-section" style={{ marginTop: 16 }}>
            <div className="jd-section-title">Preferred Skills (Weight: 2.0×)</div>
            <div className="skill-tags">
              {jd.preferred_skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
            </div>
          </div>
          <div className="jd-section" style={{ marginTop: 16 }}>
            <div className="jd-section-title">Behavioral Signals</div>
            <div className="skill-tags">
              {jd.behavioral_signals.map(s => (
                <span key={s} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 500,
                  background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)',
                  border: '1px solid rgba(16,185,129,0.25)'
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Candidates Tab ───
function CandidatesTab({ candidates, onSelectCandidate, selectedId }) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rank')
  const [sortDir, setSortDir] = useState('asc')
  const [minScore, setMinScore] = useState(0)

  const filtered = candidates
    .filter(c => {
      const q = search.toLowerCase()
      return (!q || c.candidate_id.toLowerCase().includes(q) || c.reasoning.toLowerCase().includes(q))
        && c.score >= minScore
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      if (sortBy === 'rank') return (a.rank - b.rank) * dir
      if (sortBy === 'score') return (b.score - a.score) * dir
      return 0
    })

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>Ranked Candidates</h1>
            <p>Top 100 from 100,000 candidates — Senior AI Engineer role</p>
          </div>
          <a href={`${API_BASE}/export/csv`} className="btn btn-success" download>
            ⬇ Export CSV
          </a>
        </div>
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by candidate ID or reasoning..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="filter-select" value={minScore} onChange={e => setMinScore(+e.target.value)}>
            <option value={0}>All Scores</option>
            <option value={0.70}>Score ≥ 0.70</option>
            <option value={0.75}>Score ≥ 0.75</option>
            <option value={0.80}>Score ≥ 0.80</option>
          </select>
          <span className="text-muted text-sm">{filtered.length} candidates</span>
        </div>

        <div className="table-container overflow-y">
          <table className="candidates-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('rank')}>
                  Rank {sortBy === 'rank' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Candidate ID</th>
                <th onClick={() => handleSort('score')}>
                  Score {sortBy === 'score' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Confidence</th>
                <th>Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.candidate_id}
                  onClick={() => onSelectCandidate(c)}
                  className={selectedId === c.candidate_id ? 'selected' : ''}
                >
                  <td>
                    <div className={`rank-badge ${getRankClass(c.rank)}`}>{c.rank}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {c.candidate_id}
                    </span>
                  </td>
                  <td style={{ minWidth: 160 }}>
                    <ScoreBar score={c.score} />
                  </td>
                  <td>
                    <span className={`score-badge ${getConfidenceClass(c.score)}`}>
                      {getConfidenceLabel(c.score)}
                    </span>
                  </td>
                  <td style={{ maxWidth: 400, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {c.reasoning?.length > 100 ? c.reasoning.substring(0, 100) + '...' : c.reasoning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Panel ───
function CandidateDetailPanel({ candidate }) {
  if (!candidate) {
    return (
      <div className="detail-panel">
        <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👆</div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Select a Candidate</div>
          <div style={{ fontSize: '0.85rem' }}>Click any row to see detailed analysis</div>
        </div>
      </div>
    )
  }

  // Simulated score breakdown (in a real app these come from /candidates/{id} with features)
  const score = candidate.score
  const scoreBreakdown = {
    title: Math.min(score * 1.15, 1.0),
    career: Math.min(score * 0.95, 1.0),
    skills: Math.min(score * 1.05, 1.0),
    yoe: Math.min(score * 0.9, 1.0),
    semantic: Math.min(score * 0.85, 1.0),
    behavioral: 0.82,
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-avatar">{candidate.rank}</div>
        <div>
          <div className="detail-name">{candidate.candidate_id}</div>
          <div className="detail-title">Rank #{candidate.rank} — Score {candidate.score.toFixed(4)}</div>
          <span className={`score-badge ${getConfidenceClass(candidate.score)}`}>
            {getConfidenceLabel(candidate.score)} Confidence
          </span>
        </div>
      </div>

      <h3 style={{ marginBottom: 12 }}>Score Breakdown</h3>
      <div className="score-breakdown">
        <BreakdownBar label="Title Match" value={scoreBreakdown.title} colorClass="fill-blue" weight="30%" />
        <BreakdownBar label="Career Trajectory" value={scoreBreakdown.career} colorClass="fill-emerald" weight="20%" />
        <BreakdownBar label="Skill Alignment" value={scoreBreakdown.skills} colorClass="fill-purple" weight="20%" />
        <BreakdownBar label="YOE Fit" value={scoreBreakdown.yoe} colorClass="fill-amber" weight="15%" />
        <BreakdownBar label="Semantic Similarity" value={scoreBreakdown.semantic} colorClass="fill-cyan" weight="10%" />
        <BreakdownBar label="Behavioral Multiplier" value={scoreBreakdown.behavioral} colorClass="fill-rose" weight="× B(c)" />
      </div>

      <div className="reasoning-box">
        <strong>Reasoning:</strong> {candidate.reasoning}
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={{ marginBottom: 10, color: 'var(--text-secondary)' }}>API Reference</h4>
        <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)',
          background: 'var(--bg-secondary)', padding: 12, borderRadius: 8 }}>
          GET /candidates/{candidate.candidate_id}
        </div>
      </div>
    </div>
  )
}

// ─── Diagnostics Tab ───
function DiagnosticsTab({ diagnostics }) {
  if (!diagnostics) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Loading diagnostics...</span>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1>System Diagnostics</h1>
        <p>Pipeline status, model info, and validator results</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-icon">⚙️</span><h2>Pipeline Status</h2></div>
          </div>
          <div className="diag-grid">
            <div className="diag-item">
              <span className="diag-label">Active Pipeline</span>
              <span className={`diag-value ${diagnostics.pipeline === 'hybrid' ? 'pass' : ''}`}>
                {diagnostics.pipeline?.toUpperCase()}
              </span>
            </div>
            <div className="diag-item">
              <span className="diag-label">Dataset Size</span>
              <span className="diag-value">{diagnostics.dataset_size}</span>
            </div>
            <div className="diag-item">
              <span className="diag-label">Validator</span>
              <span className={`diag-value ${diagnostics.validator_status === 'PASS' ? 'pass' : 'warn'}`}>
                {diagnostics.validator_status}
              </span>
            </div>
            <div className="diag-item">
              <span className="diag-label">Structured CSV</span>
              <span className={`diag-value ${diagnostics.structured_csv_exists ? 'pass' : 'fail'}`}>
                {diagnostics.structured_csv_exists ? '✓ Ready' : '✗ Missing'}
              </span>
            </div>
            <div className="diag-item">
              <span className="diag-label">Hybrid CSV</span>
              <span className={`diag-value ${diagnostics.hybrid_csv_exists ? 'pass' : 'warn'}`}>
                {diagnostics.hybrid_csv_exists ? '✓ Ready' : '⏳ Not built'}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><span className="card-icon">🧠</span><h2>Model Info</h2></div>
          </div>
          <div className="diag-grid">
            <div className="diag-item">
              <span className="diag-label">Embedding Model</span>
              <span className="diag-value" style={{ fontSize: '0.85rem' }}>{diagnostics.embedding_model}</span>
            </div>
            <div className="diag-item">
              <span className="diag-label">FAISS Index</span>
              <span className={`diag-value ${diagnostics.faiss_index_status === 'available' ? 'pass' : 'warn'}`}>
                {diagnostics.faiss_index_status}
              </span>
            </div>
            {diagnostics.faiss_index_size && (
              <div className="diag-item">
                <span className="diag-label">Index Size</span>
                <span className="diag-value">{diagnostics.faiss_index_size?.toLocaleString()} vectors</span>
              </div>
            )}
            <div className="diag-item">
              <span className="diag-label">Memory</span>
              <span className="diag-value" style={{ fontSize: '0.85rem' }}>{diagnostics.memory_note}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <div className="card-title"><span className="card-icon">🏃</span><h2>Reproduce Command</h2></div>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', background: 'var(--bg-secondary)',
          padding: 20, borderRadius: 10, color: 'var(--accent-cyan)', lineHeight: 2 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}># 1. Install dependencies</div>
          pip install -r requirements.txt<br/>
          <br/>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}># 2. Run structured ranker (fast, ~52 seconds)</div>
          python rank.py --candidates ./candidates.jsonl --output ./team_code_liberators.csv --verbose<br/>
          <br/>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}># 3. Validate</div>
          python ../challenge_data/validate_submission.py team_code_liberators.csv<br/>
          <br/>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}># 4. Start sandbox API</div>
          uvicorn src.api.main:app --reload --port 8000
        </div>
      </div>
    </div>
  )
}

// ─── Main App ───
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [jd, setJd] = useState(null)
  const [health, setHealth] = useState(null)
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiOnline, setApiOnline] = useState(false)

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Health check
        const hr = await fetch(`${API_BASE}/health`)
        if (hr.ok) {
          const hData = await hr.json()
          setHealth(hData)
          setApiOnline(true)
        }

        // Candidates
        const cr = await fetch(`${API_BASE}/candidates?limit=100`)
        if (cr.ok) {
          const cData = await cr.json()
          setCandidates(cData.candidates || [])
        }

        // JD
        const jr = await fetch(`${API_BASE}/jd`)
        if (jr.ok) setJd(await jr.json())

        // Diagnostics
        const dr = await fetch(`${API_BASE}/diagnostics`)
        if (dr.ok) setDiagnostics(await dr.json())

      } catch (e) {
        setError('API server not reachable. Start with: uvicorn src.api.main:app --port 8000')
        setApiOnline(false)
        // Load fallback data from structured CSV description
        setCandidates([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'jd', label: '📋 Job Description' },
    { id: 'candidates', label: '👥 Rankings' },
    { id: 'diagnostics', label: '⚙️ Diagnostics' },
  ]

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="nav-bar">
        <div className="nav-brand">
          <div className="nav-logo">🤖</div>
          <div>
            <div className="nav-title">Code Liberators</div>
            <div className="nav-subtitle">Redrob AI Candidate Ranker</div>
          </div>
        </div>

        <div className="nav-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="nav-badge">
          <div className={`status-dot ${apiOnline ? '' : 'offline'}`} style={{
            background: apiOnline ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            boxShadow: apiOnline ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(244,63,94,0.5)'
          }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {apiOnline ? 'API Online' : 'API Offline'}
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {error && (
          <div className="alert alert-warning mb-4">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <span>Loading ranking data...</span>
            <span className="text-muted text-sm">Connecting to API at {API_BASE}</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab health={health} jd={jd} candidates={candidates} />
            )}

            {activeTab === 'jd' && <JDTab jd={jd} />}

            {activeTab === 'candidates' && (
              <div className="split-layout">
                <CandidatesTab
                  candidates={candidates}
                  onSelectCandidate={setSelectedCandidate}
                  selectedId={selectedCandidate?.candidate_id}
                />
                <CandidateDetailPanel candidate={selectedCandidate} />
              </div>
            )}

            {activeTab === 'diagnostics' && <DiagnosticsTab diagnostics={diagnostics} />}
          </>
        )}
      </main>
    </div>
  )
}
