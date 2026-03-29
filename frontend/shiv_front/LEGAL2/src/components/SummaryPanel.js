import React from 'react';

const stats = [
  { key: 'totalClauses', label: 'Total Clauses', color: '#f2f2f2', icon: '📄', bar: 100 },
  { key: 'highRisk',     label: 'High Risk',     color: '#ff4d4d', icon: '🔴', bar: 50 },
  { key: 'mediumRisk',   label: 'Medium Risk',   color: '#f5c518', icon: '🟡', bar: 33 },
  { key: 'lowRisk',      label: 'Low Risk',      color: '#00e676', icon: '🟢', bar: 17 },
];

export default function SummaryPanel({ summary }) {
  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#B8FF00', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
          Document Summary
        </p>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
          background: 'rgba(255,77,77,0.1)', color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.25)',
        }}>
          ⚠ HIGH RISK
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {stats.map(({ key, label, color, icon }) => (
          <div key={key} style={{
            background: '#080808', border: '1px solid #1a1a1a', borderRadius: 12,
            padding: '16px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
            }} />
            <p style={{ fontSize: '0.7rem', marginBottom: 6 }}>{icon}</p>
            <p style={{ fontSize: '1.9rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-1px' }}>
              {summary[key]}
            </p>
            <p style={{ fontSize: '0.65rem', color: '#3a3a3a', marginTop: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2e2e2e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
        Key Insights
      </p>
      {summary.aiSummary ? (
        <div style={{ background: '#080808', border: '1px solid #1a1a1a', borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: '0.75rem', color: '#888', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{summary.aiSummary}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {summary.insights.map((insight, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 9,
              background: '#080808', border: '1px solid #161616', borderRadius: 10, padding: '10px 12px',
            }}>
              <span style={{ color: '#B8FF00', fontSize: '0.7rem', marginTop: 2, flexShrink: 0, fontWeight: 700 }}>→</span>
              <p style={{ fontSize: '0.75rem', color: '#555', lineHeight: 1.5 }}>{insight}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
