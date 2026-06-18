import React from 'react';

/**
 * BrandMark - The Refinement Prism / Split Diamond
 * An elegant, modern geometric diamond split dynamically by a diagonal seam.
 * Colors: Indigo (#6366f1) and Light Indigo (#818cf8).
 */
export function BrandMark({ className = "brand-logo", size = 32 }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Left/Top Half - Refinement Prism */}
      <path 
        d="M48 6L11 43C9.2 44.8 9.2 47.2 11 49L48 86L45.5 46L48 6Z" 
        fill="#818cf8" 
        fillOpacity="0.85" 
      />
      {/* Right/Bottom Half - Refinement Prism */}
      <path 
        d="M52 14L49.5 54L52 94L89 57C90.8 55.2 90.8 52.8 89 51L52 14Z" 
        fill="#6366f1" 
      />
    </svg>
  );
}

/**
 * HorizontalLogo - Ideal for Navbar / Header
 */
export function HorizontalLogo({ size = 26 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <BrandMark size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Code Liberators
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.01em' }}>
          Redrob AI Candidate Ranker
        </span>
      </div>
    </div>
  );
}

/**
 * StackedLogo - Ideal for Landing, About, and Login pages
 */
export function StackedLogo({ size = 52 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' }}>
      <BrandMark size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          Code Liberators
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Redrob AI Candidate Ranker
        </p>
      </div>
    </div>
  );
}

/**
 * CompactLogo - Ideal for collapsed sidebar layouts
 */
export function CompactLogo({ size = 22 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <BrandMark size={size} />
      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
        CLR
      </span>
    </div>
  );
}
