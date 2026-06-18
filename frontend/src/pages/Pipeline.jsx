import React from 'react';
import PipelineStory from '../components/dashboard/PipelineStory';
import { GitFork } from 'lucide-react';

export default function PipelinePage() {
  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Pipeline Visualizer</h1>
        </div>
        <p>Detailed architecture map detailing ingestion, scoring, calibration, and filtering stages</p>
      </div>

      {/* Render flowchart story */}
      <PipelineStory />
    </div>
  );
}
