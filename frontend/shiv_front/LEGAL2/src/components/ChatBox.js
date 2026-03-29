import React, { useState, useRef, useEffect } from 'react';
import { initialMessages } from '../data/mockData';
import { askQuestion } from '../api';

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: 'Sorry, I could not reach the backend. Is it running?', time: timeNow() }]);
    } finally {
      setTyping(false);
    }
  };

  const prompts = ['What are the high risk clauses?', 'Explain the IP clause', 'What are the damages?', 'Can I terminate early?'];

  return (
    <>
      <style>{`
        .chat-wrap { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }
        .msg-row-ai { display: flex; align-items: flex-start; gap: 10; }
        .msg-row-user { display: flex; align-items: flex-start; gap: 10; justify-content: flex-end; }
        .ai-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#B8FF00,#7acc00); display: flex; align-items: center; justify-content: center; font-size: 16px; color: #000; font-weight: 800; flex-shrink: 0; box-shadow: 0 0 12px rgba(184,255,0,0.2); }
        .user-avatar { width: 34px; height: 34px; border-radius: 10px; background: #1e1e1e; border: 1px solid #2a2a2a; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .bubble-ai { max-width: 72%; padding: 13px 16px; border-radius: 4px 16px 16px 16px; background: #111; border: 1px solid #1e1e1e; color: #ccc; font-size: 0.85rem; line-height: 1.7; }
        .bubble-user { max-width: 72%; padding: 13px 16px; border-radius: 16px 4px 16px 16px; background: linear-gradient(135deg,#B8FF00,#9ddd00); color: #000; font-size: 0.85rem; line-height: 1.7; font-weight: 500; }
        .msg-time { font-size: 0.62rem; color: #2a2a2a; margin-top: 5px; }
        .msg-time-user { text-align: right; }
        .prompts-row { padding: 0 28px 12px; display: flex; gap: 7px; flex-wrap: wrap; }
        .prompt-chip { background: transparent; border: 1px solid #1e1e1e; border-radius: 20px; padding: 6px 13px; color: #3a3a3a; font-size: 0.72rem; cursor: pointer; transition: all 0.18s; font-family: Inter, sans-serif; }
        .prompt-chip:hover { border-color: #B8FF00; color: #B8FF00; background: rgba(184,255,0,0.04); }
        .chat-input-wrap { padding: 10px 28px 24px; border-top: 1px solid #111; }
        .chat-input-box { display: flex; gap: 10px; background: #0d0d0d; border-radius: 14px; padding: 8px 8px 8px 18px; align-items: flex-end; transition: border-color 0.2s; }
        .chat-input-box-focused { border: 1px solid #2e2e2e; }
        .chat-input-box-blur { border: 1px solid #161616; }
        .chat-textarea { flex: 1; background: transparent; border: none; outline: none; color: #e0e0e0; font-size: 0.875rem; resize: none; line-height: 1.6; font-family: Inter, sans-serif; padding-top: 5px; }
        .chat-textarea::placeholder { color: #2e2e2e; }
        .send-btn { width: 38px; height: 38px; border-radius: 10px; border: none; font-size: 1rem; font-weight: 700; transition: all 0.18s; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .send-btn-on { background: linear-gradient(135deg,#B8FF00,#8fcc00); color: #000; cursor: pointer; box-shadow: 0 2px 12px rgba(184,255,0,0.2); }
        .send-btn-off { background: #141414; color: #2a2a2a; cursor: not-allowed; }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #333; display: inline-block; }
      `}</style>

      <div className="chat-wrap">
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={msg.role === 'user' ? 'msg-row-user' : 'msg-row-ai'}>
                {msg.role === 'assistant' && <div className="ai-avatar">⚖</div>}
                <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-ai'}>{msg.text}</div>
                {msg.role === 'user' && <div className="user-avatar">👤</div>}
              </div>
              <p className={`msg-time ${msg.role === 'user' ? 'msg-time-user' : ''}`} style={{ paddingLeft: msg.role === 'assistant' ? 44 : 0, paddingRight: msg.role === 'user' ? 44 : 0 }}>
                {msg.time}
              </p>
            </div>
          ))}

          {typing && (
            <div className="msg-row-ai">
              <div className="ai-avatar">⚖</div>
              <div className="bubble-ai" style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '14px 18px' }}>
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
          <div className={`chat-input-box ${focused ? 'chat-input-box-focused' : 'chat-input-box-blur'}`}>
            <textarea
              className="chat-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ask anything about your legal document…"
              rows={1}
            />
            <button className={`send-btn ${input.trim() ? 'send-btn-on' : 'send-btn-off'}`} onClick={sendMessage} disabled={!input.trim()}>
              ↑
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
