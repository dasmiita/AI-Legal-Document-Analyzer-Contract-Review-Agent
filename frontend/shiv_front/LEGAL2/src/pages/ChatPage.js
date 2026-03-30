import React from 'react';
import ChatBox from '../components/ChatBox';

export default function ChatPage() {
  return (
    <>
      <style>{`
        .chat-page {
          max-width: 800px; margin: 0 auto;
          height: calc(100vh - 58px); display: flex; flex-direction: column;
          animation: fadeUp 0.4s ease both;
        }
        .chat-page-header {
          padding: 18px 28px; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between; align-items: center;
          background: var(--surface);
        }
        .chat-page-title {
          font-family: 'Playfair Display', serif;
          font-size: 1rem; font-weight: 700; color: var(--text);
        }
        .chat-status { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); display: inline-block; }
        .status-text {
          font-size: 0.7rem; color: var(--text-dim);
          font-family: 'DM Mono', monospace; letter-spacing: 0.03em;
        }
        .chat-tags { display: flex; gap: 6px; }
        .chat-tag {
          padding: 3px 10px; border-radius: 4px; font-size: 0.62rem; font-weight: 500;
          background: var(--surface2); color: var(--text-dim);
          border: 1px solid var(--border2);
          font-family: 'DM Mono', monospace; letter-spacing: 0.04em;
        }
      `}</style>
      <div className="chat-page">
        <div className="chat-page-header">
          <div>
            <h1 className="chat-page-title">AI Legal Assistant</h1>
            <div className="chat-status">
              <span className="status-dot" />
              <span className="status-text">Online · Document loaded · Ask anything about your contract</span>
            </div>
          </div>
          <div className="chat-tags">
            {['NDA', 'Contract Review'].map((tag, i) => (
              <span key={i} className="chat-tag">{tag}</span>
            ))}
          </div>
        </div>
        <ChatBox />
      </div>
    </>
  );
}
