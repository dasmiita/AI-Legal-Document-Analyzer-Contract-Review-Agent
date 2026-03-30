import React, { useState, useRef, useEffect } from 'react';
import { initialMessages } from '../data/mockData';
import { askQuestion } from '../api';

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const prompts = ['What are the high risk clauses?', 'Explain the IP clause', 'What are the damages?', 'Can I terminate early?'];

export default function ChatBox() {
  const [messages, setMessages] = useState(initialMessages.map(m => ({ ...m, time: timeNow() })));
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [focused, setFocused] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: timeNow() }]);
    setInput('');
    setTyping(true);
    try {
      const data = await askQuestion(text);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: data.answer, time: timeNow() }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: 'Could not reach the backend. Please ensure the server is running.', time: timeNow() }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <style>{`
        .chat-wrap { display: flex; flex-direction: column; flex: 1; overflow: hidden; background: var(--ink); }
        .chat-messages { flex: 1; overflow-y: auto; padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }
        .msg-row-ai   { display: flex; align-items: flex-start; gap: 12px; }
        .msg-row-user { display: flex; align-items: flex-start; gap: 12px; justify-content: flex-end; }
        .ai-avatar {
          width: 30px; height: 30px; border-radius: 7px;
          background: linear-gradient(135deg, #b8933e, #d4a84b);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 10px; color: #0c0f1a;
          font-weight: 500; flex-shrink: 0; letter-spacing: 0.05em;
        }
        .user-avatar {
          width: 30px; height: 30px; border-radius: 7px;
          background: var(--surface2); border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace; font-size: 10px; color: var(--text-dim);
          flex-shrink: 0;
        }
        .bubble-ai {
          max-width: 72%; padding: 12px 16px;
          border-radius: 4px 10px 10px 10px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text); font-size: 0.85rem; line-height: 1.75;
          font-weight: 300; font-family: 'DM Sans', sans-serif;
        }
        .bubble-user {
          max-width: 72%; padding: 12px 16px;
          border-radius: 10px 4px 10px 10px;
          background: linear-gradient(135deg, #b8933e, #d4a84b);
          color: #0c0f1a; font-size: 0.85rem; line-height: 1.75; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
        }
        .msg-time {
          font-size: 0.6rem; color: var(--text-dim); margin-top: 4px;
          font-family: 'DM Mono', monospace; letter-spacing: 0.03em;
        }
        .prompts-row { padding: 0 28px 12px; display: flex; gap: 6px; flex-wrap: wrap; }
        .prompt-chip {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 6px; padding: 5px 12px; color: var(--text-dim);
          font-size: 0.7rem; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif; font-weight: 400;
        }
        .prompt-chip:hover { border-color: var(--gold-border); color: var(--gold); background: var(--gold-dim); }
        .chat-input-wrap {
          padding: 10px 28px 22px; border-top: 1px solid var(--border);
          background: var(--surface);
        }
        .chat-input-box {
          display: flex; gap: 10px; background: var(--surface2);
          border-radius: 10px; padding: 8px 8px 8px 16px;
          align-items: flex-end; border: 1px solid var(--border2);
          transition: border-color 0.2s;
        }
        .chat-input-box.focused { border-color: var(--gold-border); box-shadow: 0 0 0 3px var(--gold-dim); }
        .chat-textarea {
          flex: 1; background: transparent; border: none; outline: none;
          color: var(--text); font-size: 0.875rem; resize: none; line-height: 1.6;
          font-family: 'DM Sans', sans-serif; padding-top: 4px; font-weight: 300;
        }
        .chat-textarea::placeholder { color: var(--text-dim); }
        .send-btn {
          width: 34px; height: 34px; border-radius: 8px; border: none;
          transition: all 0.15s; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .send-btn.on {
          background: linear-gradient(135deg, #b8933e, #d4a84b);
          color: #0c0f1a; cursor: pointer;
        }
        .send-btn.on:hover { box-shadow: 0 4px 14px var(--gold-glow); transform: translateY(-1px); }
        .send-btn.off { background: var(--surface3); color: var(--text-dim); cursor: not-allowed; border: 1px solid var(--border); }
        .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-dim); display: inline-block; }
      `}</style>

      <div className="chat-wrap">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={msg.role === 'user' ? 'msg-row-user' : 'msg-row-ai'}>
                {msg.role === 'assistant' && <div className="ai-avatar">AI</div>}
                <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}>{msg.text}</div>
                {msg.role === 'user' && <div className="user-avatar">You</div>}
              </div>
              <p className="msg-time" style={{ paddingLeft: msg.role === 'assistant' ? '42px' : 0, paddingRight: msg.role === 'user' ? '42px' : 0, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.time}
              </p>
            </div>
          ))}

          {typing && (
            <div className="msg-row-ai">
              <div className="ai-avatar">AI</div>
              <div className="bubble-ai" style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '14px 16px' }}>
                {[0, 1, 2].map(i => (
                  <span key={i} className="typing-dot" style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="prompts-row">
          {prompts.map(p => (
            <button key={p} className="prompt-chip" onClick={() => setInput(p)}>{p}</button>
          ))}
        </div>

        <div className="chat-input-wrap">
          <div className={`chat-input-box ${focused ? 'focused' : ''}`}>
            <textarea
              className="chat-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask anything about your legal document..."
              rows={1}
            />
            <button className={`send-btn ${input.trim() ? 'on' : 'off'}`} onClick={sendMessage} disabled={!input.trim()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
