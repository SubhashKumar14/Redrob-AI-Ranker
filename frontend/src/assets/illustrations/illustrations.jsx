import React from 'react';

/**
 * Common Grid Pattern to be reused across illustrations for consistent SaaS look
 */
function GridBackground() {
  return (
    <g opacity="0.15">
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#94a3b8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </g>
  );
}

/**
 * HeroIllustration - Recruiter working with semantic profile matches
 */
export function HeroIllustration({ className = "empty-state-illust" }) {
  return (
    <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <GridBackground />
      
      {/* Background Panel Outline */}
      <rect x="20" y="20" width="360" height="200" rx="12" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-secondary)" />
      
      {/* Job Description Card (Left) */}
      <rect x="50" y="50" width="110" height="130" rx="8" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-card)" />
      <line x1="70" y1="75" x2="140" y2="75" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="70" y1="95" x2="120" y2="95" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="115" x2="135" y2="115" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="70" y1="135" x2="110" y2="135" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Candidate Profile Card (Right) */}
      <rect x="240" y="50" width="110" height="130" rx="8" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-card)" />
      <circle cx="295" cy="85" r="18" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-primary)" />
      {/* Profile Avatar Initials */}
      <text x="295" y="89" fill="var(--text-secondary)" fontSize="10" fontWeight="bold" textAnchor="middle">CAND</text>
      
      <line x1="260" y1="120" x2="330" y2="120" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="260" y1="138" x2="310" y2="138" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="260" y1="156" x2="325" y2="156" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Semantic Connection Vector (Middle) */}
      <path d="M165 95 C 195 95, 205 130, 235 130" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
      <path d="M165 135 C 195 135, 205 95, 235 95" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      
      {/* Precision Node in center */}
      <circle cx="200" cy="113" r="6" fill="#6366f1" />
      <circle cx="200" cy="113" r="12" stroke="#818cf8" strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * EmptyStateRankings - Shown when candidate list is empty
 */
export function EmptyStateRankings({ className = "empty-state-illust" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <GridBackground />
      
      {/* Stacked Empty Rows representing a table */}
      <rect x="20" y="30" width="160" height="24" rx="4" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-secondary)" />
      <line x1="40" y1="42" x2="90" y2="42" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="150" cy="42" r="4" fill="var(--border-color)" />

      <rect x="20" y="62" width="160" height="24" rx="4" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-secondary)" />
      <line x1="40" y1="74" x2="110" y2="74" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="150" cy="74" r="4" fill="var(--border-color)" />

      <rect x="20" y="94" width="160" height="24" rx="4" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-secondary)" opacity="0.6" />
      <line x1="40" y1="106" x2="80" y2="106" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      
      {/* Refinement Funnel overlay */}
      <path d="M 90 60 L 110 60 L 105 80 L 95 80 Z" stroke="#6366f1" strokeWidth="1.5" fill="var(--bg-primary)" />
      <line x1="100" y1="80" x2="100" y2="95" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * EmptyStateCompare - Shown when no candidates are selected for comparison
 */
export function EmptyStateCompare({ className = "empty-state-illust" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <GridBackground />
      
      {/* Left Card Placeholder */}
      <rect x="15" y="25" width="70" height="100" rx="6" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="3 3" fill="var(--bg-secondary)" />
      <circle cx="50" cy="50" r="10" stroke="var(--border-color)" strokeWidth="1.5" />
      <line x1="30" y1="75" x2="70" y2="75" stroke="var(--border-color)" strokeWidth="1.5" />
      <line x1="35" y1="90" x2="65" y2="90" stroke="var(--border-color)" strokeWidth="1.5" />
      
      {/* Right Card Placeholder */}
      <rect x="115" y="25" width="70" height="100" rx="6" stroke="var(--border-color)" strokeWidth="1.5" strokeDasharray="3 3" fill="var(--bg-secondary)" />
      <circle cx="150" cy="50" r="10" stroke="var(--border-color)" strokeWidth="1.5" />
      <line x1="130" y1="75" x2="170" y2="75" stroke="var(--border-color)" strokeWidth="1.5" />
      <line x1="135" y1="90" x2="165" y2="90" stroke="var(--border-color)" strokeWidth="1.5" />

      {/* Compare Seam VS */}
      <circle cx="100" cy="75" r="14" fill="var(--bg-card)" stroke="#6366f1" strokeWidth="1.5" />
      <text x="100" y="79" fill="#818cf8" fontSize="10" fontWeight="bold" textAnchor="middle">VS</text>
    </svg>
  );
}

/**
 * ApiOfflineState - Shown when server error or API not reachable
 */
export function ApiOfflineState({ className = "empty-state-illust" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <GridBackground />
      
      {/* Cloud Icon */}
      <path d="M 60 90 A 20 20 0 0 1 100 60 A 25 25 0 0 1 140 75 A 15 15 0 0 1 135 105 L 65 105 A 15 15 0 0 1 60 90 Z" 
            stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-secondary)" />
      
      {/* Connection Bolt / Broken link */}
      <path d="M 95 72 L 115 72 L 100 92 L 120 92 L 105 112" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      <circle cx="65" cy="105" r="3" fill="#f43f5e" />
      <circle cx="135" cy="105" r="3" fill="#f43f5e" />
    </svg>
  );
}

/**
 * UploadState - Shown in dropzones/upload indicators
 */
export function UploadState({ className = "empty-state-illust" }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <GridBackground />
      
      {/* File Outline */}
      <rect x="70" y="35" width="60" height="80" rx="6" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-secondary)" />
      
      {/* Folder Tab Detail */}
      <path d="M 110 35 L 130 55 L 110 55 Z" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-card)" />
      
      {/* Upload Arrow */}
      <circle cx="100" cy="85" r="16" fill="var(--bg-card)" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M 100 93 L 100 77 M 94 83 L 100 77 L 106 83" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
