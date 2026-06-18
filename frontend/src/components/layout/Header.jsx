import React from 'react';
import { Search, Database, Bell, Sun, Moon } from 'lucide-react';

export default function Header({ onSearchClick, theme, toggleTheme, isSampleDataset = false }) {
  return (
    <header className="workspace-header">
      {/* Search box trigger */}
      <div className="header-search" onClick={onSearchClick}>
        <Search size={16} className="nav-icon" style={{ strokeWidth: 1.75 }} />
        <span>Search or run a command...</span>
        <span className="search-shortcut">⌘K</span>
      </div>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Dataset badge */}
        <div className="header-badge">
          <Database className="header-badge-icon" size={14} />
          <span>Dataset: {isSampleDataset ? "Sample (1,000)" : "Full (100,000 candidates)"}</span>
        </div>

        {/* Theme toggle button */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} style={{ strokeWidth: 1.75 }} /> : <Moon size={18} style={{ strokeWidth: 1.75 }} />}
        </button>

        {/* Notifications mock icon */}
        <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px' }}>
          <Bell size={18} style={{ strokeWidth: 1.75 }} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-indigo-light)'
          }} />
        </div>
      </div>
    </header>
  );
}
