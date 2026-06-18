import React from 'react';

/**
 * Avatar component that generates an initials-based avatar
 * with a deterministic background color and SVG pattern based on the candidate's ID.
 */
export default function Avatar({ id, size = 32, className = "" }) {
  // Extract number from CAND_XXXXXXX
  const numId = parseInt(id.replace(/\D/g, ''), 10) || 0;
  
  // Deterministic color schemes (Linear/Vercel palette compatibility)
  const colors = [
    { bg: '#312e81', text: '#c7d2fe', pattern: 'grid' }, // Indigo
    { bg: '#064e3b', text: '#a7f3d0', pattern: 'dots' }, // Emerald
    { bg: '#1e3a8a', text: '#bfdbfe', pattern: 'diagonal' }, // Blue
    { bg: '#581c87', text: '#e9d5ff', pattern: 'cross' }, // Purple
    { bg: '#701a75', text: '#fbcfe8', pattern: 'circles' }, // Pink
    { bg: '#7c2d12', text: '#ffedd5', pattern: 'squares' }, // Amber
  ];
  
  const scheme = colors[numId % colors.length];
  
  // Initials (e.g., C36 for CAND_0036184 or just the last digits/ID)
  const initials = id ? id.replace('CAND_', 'C') : '??';

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: scheme.bg,
        color: scheme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: size * 0.38 + 'px',
        borderRadius: 'var(--radius-sm)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        flexShrink: 0,
      }}
      title={id}
    >
      {/* Background SVG decorative pattern */}
      <svg 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.12,
          pointerEvents: 'none',
        }}
        viewBox="0 0 40 40"
      >
        {scheme.pattern === 'grid' && (
          <path d="M 0 10 L 40 10 M 0 20 L 40 20 M 0 30 L 40 30 M 10 0 L 10 40 M 20 0 L 20 40 M 30 0 L 30 40" stroke="currentColor" strokeWidth="1" />
        )}
        {scheme.pattern === 'dots' && (
          <>
            <circle cx="10" cy="10" r="2" fill="currentColor" />
            <circle cx="30" cy="10" r="2" fill="currentColor" />
            <circle cx="10" cy="30" r="2" fill="currentColor" />
            <circle cx="30" cy="30" r="2" fill="currentColor" />
          </>
        )}
        {scheme.pattern === 'diagonal' && (
          <path d="M -10 10 L 10 -10 M 0 20 L 20 0 M 10 30 L 30 10 M 20 40 L 40 20 M 30 50 L 50 30" stroke="currentColor" strokeWidth="1.5" />
        )}
        {scheme.pattern === 'cross' && (
          <path d="M 10 10 L 30 30 M 30 10 L 10 30" stroke="currentColor" strokeWidth="1.5" />
        )}
        {scheme.pattern === 'circles' && (
          <>
            <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="1" fill="none" />
          </>
        )}
        {scheme.pattern === 'squares' && (
          <rect x="10" y="10" width="20" height="20" stroke="currentColor" strokeWidth="1" fill="none" />
        )}
      </svg>
      
      {/* Front Text */}
      <span style={{ zIndex: 1, letterSpacing: '-0.02em' }}>{initials}</span>
    </div>
  );
}
