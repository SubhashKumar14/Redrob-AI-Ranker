import React from 'react';
import { BrandMark } from '../../assets/logos/logo';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Search, 
  Users, 
  FileText, 
  Sliders, 
  Cpu, 
  BarChart3, 
  Download, 
  Settings, 
  GitFork, 
  Activity, 
  HelpCircle,
  FolderArchive
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, apiOnline, candidatesCount = 100, latency = "33.4s" }) {
  // Navigation sections list
  const navSections = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "Recruiter Workspace",
      items: [
        { id: "rankings", label: "Rankings Table", icon: ListOrdered },
        { id: "explorer", label: "Candidate Explorer", icon: Search },
        { id: "compare", label: "Compare Candidates", icon: Users }
      ]
    },
    {
      title: "Intelligence",
      items: [
        { id: "jd", label: "JD Analysis", icon: FileText },
        { id: "feature_importance", label: "Feature Importance", icon: Sliders }
      ]
    },
    {
      title: "Evaluation",
      items: [
        { id: "pipeline", label: "Pipeline Visualizer", icon: GitFork },
        { id: "diagnostics", label: "Diagnostics & Logs", icon: Activity },
        { id: "benchmark", label: "Benchmark Metrics", icon: BarChart3 }
      ]
    },
    {
      title: "Exports",
      items: [
        { id: "export_csv", label: "Export CSVs", icon: Download },
        { id: "submission_package", label: "Submission Package", icon: FolderArchive }
      ]
    },
    {
      title: "System",
      items: [
        { id: "settings", label: "Settings & About", icon: Settings }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <BrandMark size={32} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span className="brand-text-name">Code Liberators</span>
          <span className="brand-text-sub">AI Candidate Ranker</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navSections.map((sect, idx) => (
          <div className="nav-section" key={idx}>
            <span className="nav-section-title">{sect.title}</span>
            {sect.items.map(item => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <IconComp className="nav-icon" strokeWidth={1.75} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status indicators in sidebar footer */}
      <div className="sidebar-footer">
        <div className="nav-section-title" style={{ paddingLeft: 0, marginBottom: 0 }}>System Status</div>
        
        <div className="footer-status-item">
          <span className="status-label">Pipeline Status</span>
          <span className="status-badge">
            <span className={`status-indicator-dot ${apiOnline ? 'active' : 'inactive'}`} />
            {apiOnline ? 'Healthy' : 'Disconnected'}
          </span>
        </div>

        <div className="footer-status-item">
          <span className="status-label">Index Loaded</span>
          <span className="status-badge" style={{ color: 'var(--color-text-primary)' }}>
            {candidatesCount > 0 ? '100K Candidates' : '0 Ingested'}
          </span>
        </div>

        <div className="footer-status-item">
          <span className="status-label">Latency (Avg)</span>
          <span className="status-badge" style={{ fontFamily: 'monospace' }}>
            {latency}
          </span>
        </div>

        <div className="footer-status-item">
          <span className="status-label">Model Core</span>
          <span className="status-badge">
            BGE + FAISS
          </span>
        </div>

        {/* User Profile */}
        <div className="footer-user">
          <div className="user-avatar">SK</div>
          <div className="user-details">
            <span className="user-name">Subhash Kumar</span>
            <span className="user-role">Code Liberators</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
