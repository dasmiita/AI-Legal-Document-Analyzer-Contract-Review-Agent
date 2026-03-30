import React, { useState } from 'react';

export default function ClauseDetails({ clause }) {
  const [tab, setTab] = useState('overview');

  return (
    <>
      <style>{`
        .cd-empty {
          background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
          height: 420px; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 10px;
        }
        .cd-empty-icon {
          width: 48px; height: 48px; border-radius: 10px;
          background: var(--surface2); border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center; color: var(--text-dim);
        }
        .cd-empty p { color: var(--text-muted); font-size: 0.85rem; font-weight: 400; }
        .cd-empty span { color: var(--text-dim); font-size: 0.75rem; font-family: 'DM Mono', monospace; }
        .cd-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
        .cd-header { padding: 18px 20px 0; border-bottom: 1px solid var(--border); }
        .cd-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 8px;
        }
        .cd-risk-tag {
          font-family: 'DM Mono', monospace;
          padding: 2px 10px; border-radius: 4px; font-size: 0.65rem;
          font-weight: 500; display: inline-block; margin-bottom: 14px;
          letter-spacing: 0.06em;
        }
        .cd-risk-tag.high   { background: var(--red-dim);    color: var(--red);    border: 1px solid var(--red-border); }
        .cd-risk-tag.medium { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--yellow-border); }
        .cd-risk-tag.low    { background: var(--green-dim);  color: var(--green);  border: 1px solid var(--green-border); }
        .cd-tabs { display: flex; }
        .cd-tab {
          padding: 8px 16px; background: transparent; border: none; cursor: pointer;
          font-size: 0.78rem; font-weight: 400; text-transform: capitalize;
          transition: all 0.15s; color: var(--text-dim);
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
        }
        .cd-tab:hover { color: var(--text-muted); }
        .cd-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
        .cd-body { padding: 18px 20px; overflow-y: auto; max-height: calc(100vh - 340px); }
        .cd-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.62rem; font-weight: 500; color: var(--text-dim);
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
        }
        .cd-textbox {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 8px; padding: 12px 14px; margin-bottom: 18px;
        }
        .cd-textbox p { font-size: 0.8rem; color: var(--text-muted); line-height: 1.8; font-weight: 300; }
        .cd-explain {
          background: var(--gold-dim); border: 1px solid var(--gold-border);
          border-radius: 8px; padding: 12px 14px;
        }
        .cd-explain p { font-size: 0.82rem; color: var(--text); line-height: 1.75; font-weight: 300; }
        .cd-entities-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cd-entity-card {
          background: var(--surface2); border-radius: 8px;
          padding: 12px; border: 1px solid var(--border);
          transition: border-color 0.2s;
        }
        .cd-entity-card:hover { border-color: var(--border2); }
        .cd-entity-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem; color: var(--text-dim); font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;
        }
        .cd-tag {
          display: inline-flex; align-items: center; padding: 3px 8px; border-radius: 4px;
          background: var(--surface3); color: var(--text-muted);
          border: 1px solid var(--border2); font-size: 0.7rem;
          font-family: 'DM Mono', monospace; margin: 3px 4px 3px 0;
        }
        .cd-suggest {
          background: var(--surface2); border: 1px solid var(--border);
          border-radius: 8px; padding: 14px; margin-bottom: 14px;
        }
        .cd-suggest p { font-size: 0.82rem; color: var(--text-muted); line-height: 1.75; font-weight: 300; }
        .cd-notice {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 12px 14px; background: var(--surface2);
          border: 1px solid var(--border); border-radius: 8px;
        }
        .cd-notice p { font-size: 0.75rem; color: var(--text-dim); line-height: 1.5; font-family: 'DM Mono', monospace; }
      `}</style>

      {!clause ? (
        <div className="cd-empty">
          <div className="cd-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p>Select a clause to view details</p>
          <span>— click any item on the left —</span>
        </div>
      ) : (
        <div className="cd-wrap">
          <div className="cd-header">
            <h2 className="cd-title">{clause.title}</h2>
            <span className={`cd-risk-tag ${(clause.risk || 'low').toLowerCase()}`}>{clause.risk} Risk</span>
            <div className="cd-tabs">
              {['overview', 'entities', 'suggestion'].map(t => (
                <button key={t} className={`cd-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="cd-body">
            {tab === 'overview' && (
              <>
                <p className="cd-label">Clause Text</p>
                <div className="cd-textbox"><p>{clause.text}</p></div>
                <p className="cd-label">Plain English Explanation</p>
                <div className="cd-explain">
                  <p>{clause.explanation || 'No explanation available for this clause.'}</p>
                </div>
              </>
            )}

            {tab === 'entities' && (
              <>
                <p className="cd-label">Extracted Entities</p>
                <div className="cd-entities-grid">
                  {[
                    { label: 'Parties',      items: clause.entities?.parties      || ['—'] },
                    { label: 'Dates',        items: clause.entities?.dates?.length   ? clause.entities.dates   : ['—'] },
                    { label: 'Money',        items: clause.entities?.money?.length   ? clause.entities.money   : ['—'] },
                    { label: 'Jurisdiction', items: clause.entities?.jurisdiction || ['—'] },
                  ].map(({ label, items }) => (
                    <div key={label} className="cd-entity-card">
                      <p className="cd-entity-label">{label}</p>
                      <div>{items.map((item, i) => <span key={i} className="cd-tag">{item}</span>)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'suggestion' && (
              <>
                <p className="cd-label">Suggested Modification</p>
                <div className="cd-suggest">
                  <p>{clause.suggestion || 'No suggestion available for this clause.'}</p>
                </div>
                <div className="cd-notice">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#50576a" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p>Consult a legal professional before making modifications to binding agreements.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
