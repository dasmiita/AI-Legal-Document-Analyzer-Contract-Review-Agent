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
      explanation: s.redline?.plain_english_issue || '',
      suggestion: s.redline?.suggested_replacement || '',
      entities: s.entities || {},
    }));
  }, [analysisData, isReal]);

  const summary = useMemo(() => {
    if (!isReal) return mockSummary;
    const high = clauses.filter(c => c.risk === 'High').length;
    const medium = clauses.filter(c => c.risk === 'Medium').length;
    const low = clauses.filter(c => c.risk === 'Low').length;
    return {
      totalClauses: clauses.length,
      highRisk: high,
      mediumRisk: medium,
      lowRisk: low,
      aiSummary: analysisData.analysis,
    };
  }, [clauses, analysisData, isReal]);

  return (
    <>
      <style>{`
        .dash-wrap { padding: 24px 28px; max-width: 1440px; margin: 0 auto; animation: fadeUp 0.4s ease both; }
        .dash-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; flex-wrap: wrap; gap: 12px; }
        .dash-title { font-size: 1.15rem; font-weight: 800; color: #f2f2f2; letter-spacing: -0.5px; }
        .dash-sub { font-size: 0.72rem; color: #333; margin-top: 3px; }
        .dash-sub span { color: #444; }
        .dash-actions { display: flex; gap: 8px; align-items: center; }
        .btn-ghost { padding: 8px 18px; border-radius: 9px; border: 1px solid #222; background: transparent; color: #555; font-size: 0.78rem; cursor: pointer; font-weight: 500; transition: all 0.18s; font-family: Inter, sans-serif; }
        .btn-ghost:hover { border-color: #B8FF00; color: #B8FF00; }
        .risk-badge { padding: 8px 14px; border-radius: 9px; background: rgba(255,77,77,0.08); border: 1px solid rgba(255,77,77,0.2); color: #ff4d4d; font-size: 0.75rem; font-weight: 700; }
        .dash-grid { display: grid; grid-template-columns: 320px 1fr; gap: 18px; }
        .section-label { font-size: 0.62rem; font-weight: 700; color: #2e2e2e; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px; }
        @media (max-width: 800px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash-wrap">
        {/* Top bar */}
        <div className="dash-topbar">
          <div>
            <p style={{ fontSize: '0.65rem', color: '#2e2e2e', marginBottom: 4, letterSpacing: '0.5px' }}>
              UPLOAD &nbsp;/&nbsp; <span style={{ color: '#B8FF00' }}>DASHBOARD</span>
            </p>
            <h1 className="dash-title">Document Analysis</h1>
            <p className="dash-sub">
              <span>{isReal ? analysisData.filename : 'Sample_NDA_Agreement.pdf'}</span> &nbsp;·&nbsp; {clauses.length} clauses detected &nbsp;·&nbsp; Analyzed just now
            </p>
          </div>
          <div className="dash-actions">
            <button className="btn-ghost" onClick={() => navigate('/chat')}>💬 Ask AI Assistant</button>
            <div className="risk-badge">⚠ {summary.highRisk > 0 ? 'High' : summary.mediumRisk > 0 ? 'Medium' : 'Low'} Risk Document</div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ marginBottom: 18 }}>
          <SummaryPanel summary={summary} />
        </div>

        {/* Main grid */}
        <div className="dash-grid">
          <div>
            <p className="section-label">Risk Heatmap — {clauses.length} Clauses</p>
            <RiskHeatmap clauses={clauses} selectedId={selectedClause?.id} onSelect={setSelectedClause} />
          </div>
          <div>
            <p className="section-label">{selectedClause ? `Clause Details — ${selectedClause.title}` : 'Clause Details'}</p>
            <ClauseDetails clause={selectedClause} />
          </div>
        </div>
      </div>
    </>
  );
}
