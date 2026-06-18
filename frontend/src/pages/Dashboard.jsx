import React from 'react';
import MetricsCards from '../components/dashboard/MetricsCards';
import PipelineStory from '../components/dashboard/PipelineStory';
import TopCandidatesList from '../components/dashboard/TopCandidatesList';
import { HeroIllustration } from '../assets/illustrations/illustrations';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Dashboard({ candidates = [], health = {}, setActiveTab, onSelectCandidate }) {
  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Recruiter Dashboard</h1>
        </div>
        <p>Intelligent Candidate Discovery & Ranking — Senior AI Engineer, Founding Team</p>
      </div>

      {/* Metrics grid cards */}
      <MetricsCards candidates={candidates} health={health} />

      {/* 12-Column Layout */}
      <div className="grid-12">
        {/* Pipeline Story - Left (8 columns) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PipelineStory />
          
          {/* Visual Hero Feature Panel */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Understanding Candidate Competency
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Our ranking engine prioritizes deep semantic mapping and verified experience patterns over literal keywords. This de-prioritizes keyword-stuffed profiles and ensures highly capable AI engineers rise to the top.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => setActiveTab('jd')} 
                style={{ width: 'fit-content', marginTop: '8px' }}
              >
                Inspect JD Requirements <ArrowRight size={14} />
              </button>
            </div>
            
            <div style={{ width: '160px', height: '120px', flexShrink: 0, opacity: 0.85 }}>
              <HeroIllustration className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Shortlist preview - Right (4 columns) */}
        <div className="col-4">
          <TopCandidatesList 
            candidates={candidates} 
            onSelectCandidate={onSelectCandidate}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
