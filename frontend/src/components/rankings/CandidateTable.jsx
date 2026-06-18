import React, { useState, useMemo, useEffect, useRef } from 'react';
import Avatar from '../common/Avatar';
import { Search, ArrowUpDown, ChevronRight } from 'lucide-react';

export default function CandidateTable({ candidates = [], selectedId, onSelectCandidate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const tableRef = useRef(null);

  // Filter roles dynamically from data for dropdown list
  const rolesList = useMemo(() => {
    const roles = new Set();
    candidates.forEach(c => {
      if (c.current_title) roles.add(c.current_title);
    });
    return ['all', ...Array.from(roles)];
  }, [candidates]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter and Sort Candidates
  const processedCandidates = useMemo(() => {
    let result = [...candidates];

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.candidate_id.toLowerCase().includes(q) ||
        (c.current_title && c.current_title.toLowerCase().includes(q)) ||
        (c.reasoning && c.reasoning.toLowerCase().includes(q))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(c => c.current_title === roleFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nulls/undefined
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return result;
  }, [candidates, searchTerm, roleFilter, sortField, sortAsc]);

  // Set focused index to matching selected candidate
  useEffect(() => {
    if (selectedId) {
      const idx = processedCandidates.findIndex(c => c.candidate_id === selectedId);
      if (idx !== -1) setFocusedIndex(idx);
    }
  }, [selectedId, processedCandidates]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (processedCandidates.length === 0) return;
      
      // Don't intercept typing in search box
      if (document.activeElement.tagName === 'INPUT') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1 >= processedCandidates.length ? 0 : prev + 1;
          onSelectCandidate(processedCandidates[next]);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1 < 0 ? processedCandidates.length - 1 : prev - 1;
          onSelectCandidate(processedCandidates[next]);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processedCandidates, onSelectCandidate]);

  // Score badge helper classes
  function getConfidenceClass(score) {
    if (score >= 0.80) return 'score-very-high';
    if (score >= 0.70) return 'score-high';
    if (score >= 0.55) return 'score-medium';
    return 'score-low';
  }

  function getConfidenceLabel(score) {
    if (score >= 0.80) return 'Very High';
    if (score >= 0.70) return 'High';
    if (score >= 0.55) return 'Medium';
    return 'Low';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Search and Filters Bar */}
      <div className="search-controls">
        <div className="search-field">
          <Search className="search-field-icon" />
          <input
            type="text"
            className="search-box-input"
            placeholder="Search by candidate ID, current title, or keywords (e.g. PyTorch)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Role dropdown filter */}
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          {rolesList.filter(r => r !== 'all').map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      {/* Table grid wrapper */}
      <div className="table-wrapper">
        <table className="candidate-list-table" ref={tableRef}>
          <thead>
            <tr>
              <th onClick={() => handleSort('rank')} style={{ cursor: 'pointer', width: '80px' }}>
                Rank <ArrowUpDown size={12} style={{ marginLeft: 4, display: 'inline-block' }} />
              </th>
              <th>Candidate</th>
              <th onClick={() => handleSort('current_title')} style={{ cursor: 'pointer' }}>
                Current Role <ArrowUpDown size={12} style={{ marginLeft: 4, display: 'inline-block' }} />
              </th>
              <th onClick={() => handleSort('years_of_experience')} style={{ cursor: 'pointer', width: '90px' }}>
                YOE <ArrowUpDown size={12} style={{ marginLeft: 4, display: 'inline-block' }} />
              </th>
              <th onClick={() => handleSort('score')} style={{ cursor: 'pointer', width: '120px' }}>
                Final Score <ArrowUpDown size={12} style={{ marginLeft: 4, display: 'inline-block' }} />
              </th>
              <th style={{ width: '140px' }}>Confidence</th>
              <th style={{ width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {processedCandidates.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                  No candidates match the search filters.
                </td>
              </tr>
            ) : (
              processedCandidates.map((c, index) => {
                const isSelected = c.candidate_id === selectedId;
                const isFocused = index === focusedIndex;
                
                return (
                  <tr
                    key={c.candidate_id}
                    className={`${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
                    onClick={() => {
                      setFocusedIndex(index);
                      onSelectCandidate(c);
                    }}
                    style={{
                      outline: isFocused ? '1px solid var(--color-accent)' : 'none',
                      backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                    }}
                  >
                    {/* Rank */}
                    <td style={{ fontWeight: 700 }}>
                      <div className={`rank-badge ${c.rank <= 3 ? `rank-${c.rank}` : 'rank-mid'}`}>
                        {c.rank}
                      </div>
                    </td>

                    {/* Candidate Identity */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar id={c.candidate_id} size={28} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.candidate_id}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {c.current_title || "AI Engineer"}
                    </td>

                    {/* YOE */}
                    <td style={{ fontWeight: 500 }}>
                      {c.years_of_experience || 5} yrs
                    </td>

                    {/* Score Bar & Numeric value */}
                    <td>
                      <div className="score-bar-wrapper">
                        <span style={{ fontWeight: 700, color: 'var(--color-accent-light)' }}>
                          {c.score.toFixed(4)}
                        </span>
                        <div className="score-bar">
                          <div className="score-bar-fill" style={{ width: `${c.score * 100}%` }} />
                        </div>
                      </div>
                    </td>

                    {/* Confidence Label */}
                    <td>
                      <span className={`score-badge ${getConfidenceClass(c.score)}`}>
                        {getConfidenceLabel(c.score)} Calibration
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      <ChevronRight size={16} style={{ color: isSelected ? 'var(--color-accent-light)' : 'var(--text-muted)' }} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Keyboard Shortcuts Hint */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', paddingLeft: '4px' }}>
        <span>Press <kbd style={{ border: '1px solid var(--color-border)', padding: '1px 4px', borderRadius: '3px' }}>↑</kbd> <kbd style={{ border: '1px solid var(--color-border)', padding: '1px 4px', borderRadius: '3px' }}>↓</kbd> to navigate candidates</span>
        <span>Click row to open Profile Drawer</span>
      </div>
    </div>
  );
}
