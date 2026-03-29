import React, { useState } from 'react';

const riskConfig = {
  High:   { color: '#ff4d4d', bg: 'rgba(255,77,77,0.08)',   border: 'rgba(255,77,77,0.25)',   left: '#ff4d4d' },
  Medium: { color: '#f5c518', bg: 'rgba(245,197,24,0.08)',  border: 'rgba(245,197,24,0.25)',  left: '#f5c518' },
  Low:    { color: '#00e676', bg: 'rgba(0,230,118,0.08)',   border: 'rgba(0,230,118,0.25)',   left: '#00e676' },
};

export default function ClauseCard({ clause, isSelected, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const { color, bg, border, left } = riskConfig[clause.risk];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected ? '#161616' : hovered ? '#131313' : '#0f0f0f',
        border: `1px solid ${isSelected ? '#B8FF00' : hovered ? border : '#1e1e1e'}`,
        borderLeft: `3px solid ${isSelected ? '#B8FF00' : hovered ? left : '#1e1e1e'}`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        transform: hovered && !isSelected ? 'translateX(2px)' : 'none',
        boxShadow: isSelected ? `0 0 0 1px #B8FF00, 0 4px 20px rgba(184,255,0,0.08)` : hovered ? `0 4px 16px ${border}` : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{
            width: 22, height: 22, borderRadius: 6, background: '#1a1a1a', border: '1px solid #2a2a2a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', color: '#555', fontWeight: 700, flexShrink: 0, marginTop: 1,
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '0.83rem', fontWeight: 600, color: isSelected ? '#f2f2f2' : '#ccc', lineHeight: 1.4 }}>
            {clause.title}
          </span>
        </div>
        <span style={{
          fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20,
          background: bg, color, border: `1px solid ${border}`, whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {clause.risk}
        </span>
      </div>
      <p style={{ fontSize: '0.72rem', color: '#3a3a3a', marginTop: 8, lineHeight: 1.5, paddingLeft: 32 }}>
        {clause.text.slice(0, 72)}…
      </p>
    </div>
  );
}
