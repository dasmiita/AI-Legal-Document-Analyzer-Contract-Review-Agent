import React from 'react';

export default function ClauseCard({ clause, isSelected, onClick, index }) {
  const risk = clause.risk || 'Low';

  return (
    <>
      <style>{`
        .clause-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .clause-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          border-radius: 10px 0 0 10px;
          transition: opacity 0.2s;
        }
        .clause-card.risk-high::before  { background: var(--red); }
        .clause-card.risk-medium::before { background: var(--yellow); }
        .clause-card.risk-low::before   { background: var(--green); }
        .clause-card:hover { background: var(--surface2); border-color: var(--border2); }
        .clause-card.selected {
          background: var(--surface2);
          border-color: var(--gold-border);
          box-shadow: 0 0 20px var(--gold-glow);
        }
        .clause-card.selected::before { background: var(--gold) !important; }
        .clause-index {
          width: 20px; height: 20px; border-radius: 4px;
          background: var(--surface3); border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 0.58rem;
          color: var(--text-dim); font-weight: 500; flex-shrink: 0; margin-top: 1px;
        }
        .clause-title {
          font-size: 0.82rem; font-weight: 500; color: var(--text); line-height: 1.4;
          font-family: 'DM Sans', sans-serif;
        }
        .clause-card.selected .clause-title { color: var(--gold); }
        .risk-tag {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem; font-weight: 500; padding: 2px 8px;
          border-radius: 4px; white-space: nowrap; flex-shrink: 0;
          letter-spacing: 0.04em;
        }
        .risk-tag.high   { background: var(--red-dim);    color: var(--red);    border: 1px solid var(--red-border); }
        .risk-tag.medium { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--yellow-border); }
        .risk-tag.low    { background: var(--green-dim);  color: var(--green);  border: 1px solid var(--green-border); }
        .clause-preview {
          font-size: 0.71rem; color: var(--text-dim); margin-top: 7px;
          line-height: 1.5; padding-left: 30px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>
      <div onClick={onClick} className={`clause-card risk-${risk.toLowerCase()} ${isSelected ? 'selected' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
            <div className="clause-index">{String(index + 1).padStart(2, '0')}</div>
            <span className="clause-title">{clause.title}</span>
          </div>
          <span className={`risk-tag ${risk.toLowerCase()}`}>{risk}</span>
        </div>
        <p className="clause-preview">{clause.text?.slice(0, 80)}...</p>
      </div>
    </>
  );
}
