import React from 'react';
import { FolderArchive, User, Mail, Github, FileCode, CheckCircle2 } from 'lucide-react';

export default function SubmissionPackage() {
  const metadata = {
    teamName: "Code Liberators",
    githubRepo: "https://github.com/SubhashKumar14/Redrob-AI-Ranker",
    branchName: "main",
    primaryContact: "Subhash Kumar",
    primaryEmail: "subhash1403kumar@gmail.com",
    techStack: "Python 3.13 / FastAPI / React (Vite)",
    validatorStatus: "PASS"
  };

  return (
    <div className="content-container">
      {/* Page Header */}
      <div className="page-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderArchive size={20} style={{ color: 'var(--color-accent-light)' }} />
          <h1>Submission Package</h1>
        </div>
        <p>Review final team metadata details and repository registry specifications</p>
      </div>

      <div className="grid-12">
        {/* Registry metadata card - Left (8 columns) */}
        <div className="col-8" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <h2>Submission Details</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Team Lead */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Team Leader / Primary Contact</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metadata.primaryContact}</span>
                </div>
              </div>

              {/* Contact Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Contact Email</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metadata.primaryEmail}</span>
                </div>
              </div>

              {/* GitHub Link */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <Github size={16} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>GitHub Repository</span>
                  <a 
                    href={metadata.githubRepo} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent-light)', textDecoration: 'none' }}
                  >
                    {metadata.githubRepo}
                  </a>
                </div>
              </div>

              {/* Branch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                <FileCode size={16} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Branch Name</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metadata.branchName}</span>
                </div>
              </div>

              {/* Stack */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileCode size={16} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Development Stack</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metadata.techStack}</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Verification Check Card - Right (4 columns) */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div className="card-title">
                <h2>Submission Verification</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>Clean Git log (Subhash Kumar only)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>No dataset files committed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>Marp PDF presentation ready</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--status-emerald)' }} />
                <span>requirements.txt complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
