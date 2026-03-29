import React from 'react';
import ChatBox from '../components/ChatBox';

export default function ChatPage() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', height: 'calc(100vh - 62px)', display: 'flex', flexDirection: 'column', animation: 'fadeUp 0.4s ease both' }}>
      {/* Header */}
      <div style={{ padding: '18px 28px 16px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #B8FF00, #7acc00)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: '#000', fontWeight: 800,
            boxShadow: '0 0 16px rgba(184,255,0,0.25)',
          }}>⚖</div>
          <div>
            <h1 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f2f2f2', letterSpacing: '-0.3px' }}>Legal AI Assistant</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '0.68rem', color: '#333' }}>Online &nbsp;·&nbsp; NDA document loaded &nbsp;·&nbsp; 6 clauses indexed</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['NDA', 'High Risk', '6 Clauses'].map((tag, i) => (
            <span key={i} style={{
              padding: '4px 10px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
              background: i === 1 ? 'rgba(255,77,77,0.08)' : '#0f0f0f',
              color: i === 1 ? '#ff4d4d' : '#333',
              border: `1px solid ${i === 1 ? 'rgba(255,77,77,0.2)' : '#1a1a1a'}`,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <ChatBox />
    </div>
  );
}
