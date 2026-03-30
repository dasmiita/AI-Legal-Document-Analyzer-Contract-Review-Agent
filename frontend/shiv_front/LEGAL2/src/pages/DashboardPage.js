import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RiskHeatmap from '../components/RiskHeatmap';
import ClauseDetails from '../components/ClauseDetails';
import SummaryPanel from '../components/SummaryPanel';
import { clauses as mockClauses, summary as mockSummary } from '../data/mockData';

export default function DashboardPage({ analysisData }) {
  const [selectedClause, setSelectedClause] = useState(null);
  const navigate = useNavigate();

  const isReal = analysisData?.status === 'success';

  const clauses = useMemo(() => {
    if (!isReal) return mockClauses;
    return (analysisData.sections || []).map((s, i) => ({
      id: i + 1,
      title: s.canonical_name || s.raw_heading,
      risk: s.risk ? s.risk.charAt(0).toUpperCase() + s.risk.slice(1) : 'Low',
      text: s.body,
      explanation: s.explanation || '',
      suggestion: s.redline?.suggested_replacement || s.redline?.suggested_redline || '',
      entities: s.entities || {},
    }));
  }, [analysisData, isReal]);

  const summary = useMemo(() => {
    if (!isReal) return mockSummary;
    const high = clauses.filter(c => c.risk === 'High').length;
    const medium = clauses.filter(c => c.risk === 'Medium').length;
    const low = clauses.filter(c => c.risk === 'Low').length;
    return { totalClauses: clauses.length, highRisk: high, mediumRisk: medium, lowRisk: low, aiSummary: analysisData.analysis };
  }, [clauses, analysisData, isReal]);

  const riskLevel = summary.highRisk > 0 ? 'high' : summary.mediumRisk > 0 ? 'medium' : 'low';

  return (
    <>
      <style>{`
        .dash-wrap {
          padding: 28px 32px; max-width: 1440px; margin: 0 auto;
          animation: fadeUp 0.4s ease both;
          background: var(--ink); min-height: calc(100vh - 58px);
        }
        .dash-topbar {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
          padding-bottom: 20px; border-bottom: 1px solid var(--border);
        }
        .dash-breadcrumb {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem; color: var(--text-dim); margin-bottom: 6px;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .dash-breadcrumb span { color: var(--gold); }
        .dash-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 700; color: var(--text); letter-spacing: -0.3px;
        }
        .dash-sub {
          font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;
          font-family: 'DM Mono', monospace; letter-spacing: 0.03em;
        }
        .dash-actions { display: flex; gap: 8px; align-items: center; }
        .btn-ghost {
          padding: 7px 16px; border-radius: 7px;
          border: 1px solid var(--border2); background: transparent;
          color: var(--text-muted); font-size: 0.78rem; cursor: pointer;
          font-weight: 400; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost:hover { border-color: var(--gold-border); color: var(--gold); background: var(--gold-dim); }
        .risk-pill {
          font-family: 'DM Mono', monospace;
          padding: 6px 14px; border-radius: 7px; font-size: 0.7rem; font-weight: 500;
          letter-spacing: 0.06em;
        }
        .risk-pill.high   { background: var(--red-dim);    border: 1px solid var(--red-border);    color: var(--red); }
        .risk-pill.medium { background: var(--yellow-dim); border: 1px solid var(--yellow-border); color: var(--yellow); }
        .risk-pill.low    { background: var(--green-dim);  border: 1px solid var(--green-border);  color: var(--green); }
        .dash-grid { display: grid; grid-template-columns: 300px 1fr; gap: 18px; }
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem; font-weight: 500; color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
        }
        @media (max-width: 800px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-topbar">
          <div>
            <p className="dash-breadcrumb">Upload / <span>Dashboard</span></p>
            <h1 className="dash-title">Document Analysis</h1>
            <p className="dash-sub">
              {isReal ? analysisData.filename : 'Sample_NDA_Agreement.pdf'} &nbsp;·&nbsp; {clauses.length} clauses &nbsp;·&nbsp; Analyzed just now
            </p>
          </div>
          <div className="dash-actions">
            <button className="btn-ghost" onClick={() => navigate('/chat')}>Chat with AI</button>
            <span className={`risk-pill ${riskLevel}`}>
              {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <SummaryPanel summary={summary} />
        </div>

        <div className="dash-grid">
          <div>
            <p className="section-label">Risk Heatmap — {clauses.length} Clauses</p>
            <RiskHeatmap clauses={clauses} selectedId={selectedClause?.id} onSelect={setSelectedClause} />
          </div>
          <div>
            <p className="section-label">{selectedClause ? `Clause — ${selectedClause.title}` : 'Clause Details'}</p>
            <ClauseDetails clause={selectedClause} />
          </div>
        </div>
      </div>
    </>
  );
}
