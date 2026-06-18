import React, { useState, useEffect, useRef } from 'react';
import { Search, Compass, Terminal, FileDown, Eye, Check } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, candidates = [], setActiveTab, onThemeToggle, onExportCsv }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Command items definitions
  const navigationCommands = [
    { id: 'go_dashboard', label: 'Go to Dashboard', category: 'Navigation', action: () => { setActiveTab('dashboard'); onClose(); } },
    { id: 'go_rankings', label: 'Go to Rankings Table', category: 'Navigation', action: () => { setActiveTab('rankings'); onClose(); } },
    { id: 'go_explorer', label: 'Go to Candidate Explorer', category: 'Navigation', action: () => { setActiveTab('explorer'); onClose(); } },
    { id: 'go_compare', label: 'Go to Compare Candidates', category: 'Navigation', action: () => { setActiveTab('compare'); onClose(); } },
    { id: 'go_jd', label: 'Go to JD Analysis', category: 'Navigation', action: () => { setActiveTab('jd'); onClose(); } },
    { id: 'go_pipeline', label: 'Go to Pipeline Visualizer', category: 'Navigation', action: () => { setActiveTab('pipeline'); onClose(); } },
    { id: 'go_diagnostics', label: 'Go to Diagnostics & Logs', category: 'Navigation', action: () => { setActiveTab('diagnostics'); onClose(); } },
    { id: 'go_benchmark', label: 'Go to Benchmark Metrics', category: 'Navigation', action: () => { setActiveTab('benchmark'); onClose(); } },
    { id: 'go_settings', label: 'Go to Settings', category: 'Navigation', action: () => { setActiveTab('settings'); onClose(); } }
  ];

  const actionCommands = [
    { id: 'act_theme', label: 'Toggle Dark / Light Theme', category: 'Action', action: () => { onThemeToggle(); onClose(); } },
    { id: 'act_export', label: 'Download Submission CSV', category: 'Action', action: () => { onExportCsv(); onClose(); } }
  ];

  // Candidates list items
  const candidateCommands = candidates.slice(0, 10).map(c => ({
    id: `cand_${c.candidate_id}`,
    label: `View Candidate ${c.candidate_id} (Rank #${c.rank} - Score: ${c.score.toFixed(4)})`,
    category: 'Candidates (Top 10)',
    action: () => {
      setActiveTab('rankings');
      // Dispatch custom event to select this candidate in rankings page
      const event = new CustomEvent('selectCandidate', { detail: c });
      window.dispatchEvent(event);
      onClose();
    }
  }));

  const allCommands = [...navigationCommands, ...actionCommands, ...candidateCommands];

  // Filter commands by search query
  const filteredCommands = allCommands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase()) || 
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  // Auto scroll into view for selected item
  useEffect(() => {
    const activeEl = listRef.current?.querySelector('.command-item-active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '15vh',
      zIndex: 1000,
      animation: 'fadeIn 0.15s ease-out'
    }} onClick={onClose}>
      
      {/* Palette Box */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animation: 'slideDown 0.2s ease-out'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search candidate IDs..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Command Items List */}
        <div 
          ref={listRef}
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            padding: '8px 0'
          }}
        >
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              No results found for "{query}"
            </div>
          ) : (
            // Group by category
            Object.entries(
              filteredCommands.reduce((groups, cmd) => {
                groups[cmd.category] = groups[cmd.category] || [];
                groups[cmd.category].push(cmd);
                return groups;
              }, {})
            ).map(([category, items]) => (
              <div key={category}>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  padding: '8px 16px 4px 16px'
                }}>{category}</div>
                {items.map((item) => {
                  const cmdGlobalIndex = filteredCommands.indexOf(item);
                  const isActive = cmdGlobalIndex === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      className={isActive ? 'command-item-active' : ''}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(cmdGlobalIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'var(--color-bg-hover)' : 'transparent',
                        transition: 'background-color var(--motion-hover) ease'
                      }}
                    >
                      {item.category === 'Navigation' && <Compass size={14} style={{ color: 'var(--text-muted)' }} />}
                      {item.category === 'Action' && <Terminal size={14} style={{ color: 'var(--text-muted)' }} />}
                      {item.category.startsWith('Candidates') && <Eye size={14} style={{ color: 'var(--text-muted)' }} />}
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {isActive && <Check size={14} style={{ color: 'var(--color-accent-light)' }} />}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'rgba(11, 15, 23, 0.4)',
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Use <span style={{ border: '1px solid var(--color-border)', padding: '1px 4px', borderRadius: '3px' }}>↑↓</span> to navigate, <span style={{ border: '1px solid var(--color-border)', padding: '1px 4px', borderRadius: '3px' }}>Enter</span> to select
          </div>
          <div>
            <span style={{ border: '1px solid var(--color-border)', padding: '1px 4px', borderRadius: '3px' }}>ESC</span> to close
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
