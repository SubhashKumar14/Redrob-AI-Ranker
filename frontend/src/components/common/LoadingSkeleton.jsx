import React from 'react';

/**
 * LoadingSkeleton - Reusable skeleton UI loader
 * Types: 'table', 'detail', 'metrics', 'dashboard'
 */
export default function LoadingSkeleton({ type = 'table', count = 5 }) {
  // Styles for shimmer effect
  const shimmerStyle = {
    animation: 'shimmer 1.4s ease-in-out infinite',
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
  };

  // Add keyframe style dynamically to document if not present
  React.useEffect(() => {
    const styleId = 'skeleton-keyframes';
    if (!document.getElementById(styleId)) {
      const styleSheet = document.createElement('style');
      styleSheet.id = styleId;
      styleSheet.innerText = `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `;
      document.head.appendChild(styleSheet);
    }
  }, []);

  const LinePlaceholder = ({ width = '100%', height = '12px', className = "" }) => (
    <div 
      className={className}
      style={{
        width,
        height,
        borderRadius: 'var(--radius-sm)',
        marginBottom: '8px',
        ...shimmerStyle
      }}
    />
  );

  if (type === 'table') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        {/* Table header skeleton */}
        <div style={{ display: 'flex', gap: '16px', padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <LinePlaceholder width="40px" height="14px" />
          <LinePlaceholder width="120px" height="14px" />
          <LinePlaceholder width="180px" height="14px" />
          <LinePlaceholder width="80px" height="14px" />
          <LinePlaceholder width="80px" height="14px" />
        </div>
        {/* Rows skeleton */}
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '16px', padding: '14px 18px', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
            <LinePlaceholder width="28px" height="28px" className="flex-shrink-0" />
            <LinePlaceholder width="100px" height="12px" />
            <LinePlaceholder width="200px" height="12px" />
            <LinePlaceholder width="80px" height="12px" />
            <LinePlaceholder width="60px" height="12px" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', ...shimmerStyle }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <LinePlaceholder width="140px" height="16px" />
            <LinePlaceholder width="90px" height="12px" />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LinePlaceholder width="60px" height="10px" className="typography-label" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <LinePlaceholder width="50px" height="10px" />
              <LinePlaceholder width="80px" height="12px" />
            </div>
            <div>
              <LinePlaceholder width="50px" height="10px" />
              <LinePlaceholder width="80px" height="12px" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <LinePlaceholder width="100px" height="10px" className="typography-label" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <LinePlaceholder width="100%" height="28px" />
            <LinePlaceholder width="100%" height="28px" />
            <LinePlaceholder width="100%" height="28px" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'metrics') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <LinePlaceholder width="60%" height="10px" />
            <LinePlaceholder width="40%" height="24px" />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
