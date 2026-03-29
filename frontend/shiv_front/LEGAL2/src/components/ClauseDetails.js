import React, { useState } from 'react';

const riskColor = { High: '#ff4d4d', Medium: '#f5c518', Low: '#00e676' };
const riskScore = { High: 85, Medium: 50, Low: 18 };

function Tag({ children, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 20,
      background: `${color}12`, color, border: `1px solid ${color}30`,
      fontSize: '0.72rem', fontWeight: 500, margin: '3px 4px 3px 0',
    }}>
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#B8FF00', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 10 }}>
      {children}
    </p>
  );
}

export default function ClauseDetails({ clause }) {
  const [tab, setTab] = useState('overview');

  if (!clause) {
    return (
      <div style={{
        background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16,
        height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, background: '#141414', border: '1px solid #222',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>📄</div>
        <p style={{ color: '#333', fontSize: '0.85rem', fontWeight: 500 }}>Select a clause to view details</p>
        <p style={{ color: '#252525', fontSize: '0.75rem' }}>Click any card on the left</p>
      </div>
    );
  }

  const { title, risk, text, explanation, suggestion, entities } = clause;
  const color = riskColor[risk];
  const score = riskScore[risk];

  const tabs = ['overview', 'entities', 'suggestion'];

  return (
    <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 22px 0', borderBottom: '1px solid #161616' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f2f2f2', marginBottom: 4 }}>{title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                padding: '3px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                background: `${color}12`, color, border: `1px solid ${color}30`,
              }}>
                {risk} Risk
              </span>
              <span style={{ fontSize: '0.7rem', color: '#444' }}>Risk Score: <span style={{ color }}>{score}/100</span></span>
            </div>
          </div>
          {/* Risk score bar */}
          <div style={{ width: 80, flexShrink: 0 }}>
            <div style={{ height: 6, background: '#1a1a1a', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ fontSize: '0.6rem', color: '#333', marginTop: 4, textAlign: 'right' }}>{score}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.15s',
              color: tab === t ? '#B8FF00' : '#444',
              borderBottom: `2px solid ${tab === t ? '#B8FF00' : 'transparent'}`,
              marginBottom: -1,
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 22px', overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>

        {tab === 'overview' && (
          <>
            <SectionLabel>Clause Text</SectionLabel>
            <div style={{ background: '#080808', border: '1px solid #1a1a1a', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
              <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.8 }}>{text}</p>
            </div>

            <SectionLabel>Plain English Explanation</SectionLabel>
            <div style={{ background: 'rgba(184,255,0,0.04)', border: '1px solid rgba(184,255,0,0.12)', borderRadius: 10, padding: '14px 16px' }}>
              <p style={{ fontSize: '0.82rem', color: '#bbb', lineHeight: 1.75 }}>{explanation}</p>
            </div>
          </>
        )}

        {tab === 'entities' && (
          <>
            <SectionLabel>Extracted Entities</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Parties',      items: entities.parties,                                  color: '#7c9eff', icon: '👥' },
                { label: 'Dates',        items: entities.dates.length ? entities.dates : ['—'],    color: '#f5c518', icon: '📅' },
                { label: 'Money',        items: entities.money.length ? entities.money : ['—'],    color: '#00e676', icon: '💰' },
                { label: 'Jurisdiction', items: entities.jurisdiction,                             color: '#ff9f43', icon: '🌍' },
              ].map(({ label, items, color: c, icon }) => (
                <div key={label} style={{ background: '#080808', borderRadius: 10, padding: '14px', border: '1px solid #1a1a1a' }}>
                  <p style={{ fontSize: '0.65rem', color: '#444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>
                    {icon} {label}
                  </p>
                  <div>{items.map((item, i) => <Tag key={i} color={c}>{item}</Tag>)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'suggestion' && (
          <>
            <SectionLabel>Suggested Modification</SectionLabel>
            <div style={{ background: 'rgba(124,158,255,0.04)', border: '1px solid rgba(124,158,255,0.15)', borderRadius: 10, padding: '16px', marginBottom: 16 }}>
              <p style={{ fontSize: '0.82rem', color: '#bbb', lineHeight: 1.75 }}>{suggestion}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: '#080808', border: '1px solid #1a1a1a', borderRadius: 10 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <p style={{ fontSize: '0.75rem', color: '#444', lineHeight: 1.5 }}>
                Consider consulting a legal professional before making modifications to binding agreements.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
