import React from 'react';

const stats = [
  { key: 'totalClauses', label: 'Total Clauses', cls: 'gold' },
  { key: 'highRisk',     label: 'High Risk',     cls: 'red' },
  { key: 'mediumRisk',   label: 'Medium Risk',   cls: 'yellow' },
  { key: 'lowRisk',      label: 'Low Risk',      cls: 'green' },
];

export default function SummaryPanel({ summary }) {
  const riskLevel = summary.highRisk > 0 ? 'high' : summary.mediumRisk > 0 ? 'medium' : 'low';

  return (
    <>
      <style>{`
        .summary-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px 22px;
          box-shadow: var(--shadow-sm);
        }
        .summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .summary-title {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem; font-weight: 500; color: var(--gold);
          text-transform: uppercase; letter-spacing: 0.12em;
        }
        .risk-pill {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem; font-weight: 500; padding: 3px 10px;
          border-radius: 4px; letter-spacing: 0.06em;
        }
        .risk-pill.high   { background: var(--red-dim);    color: var(--red);    border: 1px solid var(--red-border); }
        .risk-pill.medium { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--yellow-border); }
        .risk-pill.low    { background: var(--green-dim);  color: var(--green);  border: 1px solid var(--green-border); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .stat-card {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 10px; padding: 14px 12px; text-align: center;
          transition: all 0.2s ease;
        }
        .stat-card:hover { border-color: var(--border2); background: var(--surface3); }
        .stat-card.gold   { border-top: 2px solid var(--gold); }
        .stat-card.red    { border-top: 2px solid var(--red); }
        .stat-card.yellow { border-top: 2px solid var(--yellow); }
        .stat-card.green  { border-top: 2px solid var(--green); }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem; font-weight: 700; line-height: 1; letter-spacing: -1px;
        }
        .stat-card.gold   .stat-value { color: var(--gold); }
        .stat-card.red    .stat-value { color: var(--red); }
        .stat-card.yellow .stat-value { color: var(--yellow); }
        .stat-card.green  .stat-value { color: var(--green); }
        .stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem; color: var(--text-dim); margin-top: 6px;
          font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .insights-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem; font-weight: 500; color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
        }
        .ai-summary {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 8px; padding: 14px 16px;
        }
        .ai-summary p {
          font-size: 0.82rem; color: var(--text-muted); line-height: 1.75;
          white-space: pre-wrap; font-weight: 300;
        }
        .insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .insight-item {
          display: flex; align-items: flex-start; gap: 10px;
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 12px;
          transition: border-color 0.2s;
        }
        .insight-item:hover { border-color: var(--gold-border); }
        .insight-dash {
          font-family: 'DM Mono', monospace;
          color: var(--gold); font-size: 0.7rem; margin-top: 2px; flex-shrink: 0;
        }
        .insight-text { font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; font-weight: 300; }
      `}</style>
      <div className="summary-panel">
        <div className="summary-header">
          <p className="summary-title">Document Summary</p>
          <span className={`risk-pill ${riskLevel}`}>
            {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
          </span>
        </div>

        <div className="stats-grid">
          {stats.map(({ key, label, cls }) => (
            <div key={key} className={`stat-card ${cls}`}>
              <p className="stat-value">{summary[key] ?? 0}</p>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </div>

        <p className="insights-label">Key Insights</p>
        {summary.aiSummary ? (
          <div className="ai-summary"><p>{summary.aiSummary}</p></div>
        ) : (
          <div className="insights-grid">
            {summary.insights?.map((insight, i) => (
              <div key={i} className="insight-item">
                <span className="insight-dash">—</span>
                <p className="insight-text">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
