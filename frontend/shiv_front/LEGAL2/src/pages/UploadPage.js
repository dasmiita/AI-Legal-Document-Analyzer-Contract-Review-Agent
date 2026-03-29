import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeDocument } from '../api';

const features = [
  { icon: '🔍', label: 'Risk Detection', desc: 'Identify high-risk clauses instantly' },
  { icon: '📋', label: 'Clause Breakdown', desc: 'Full entity & context extraction' },
  { icon: '💬', label: 'AI Chat', desc: 'Ask questions about your document' },
];

export default function UploadPage({ onFileUpload, uploadedFile, onAnalysis }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (file) => {
    if (file && file.type === 'application/pdf') onFileUpload(file);
    else alert('Please upload a PDF file.');
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !uploadedFile.type) return; // sample doc guard
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeDocument(uploadedFile);
      onAnalysis(data);
      navigate('/dashboard');
    } catch (e) {
      setError('Analysis failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .upload-page { min-height: calc(100vh - 62px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; position: relative; overflow: hidden; }
        .grid-bg { position: absolute; inset: 0; background-image: linear-gradient(rgba(184,255,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(184,255,0,0.03) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .glow-orb { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(184,255,0,0.06) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -60%); pointer-events: none; }
        .upload-hero { text-align: center; margin-bottom: 44px; animation: fadeUp 0.6s ease both; position: relative; z-index: 1; }
        .badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(184,255,0,0.07); border: 1px solid rgba(184,255,0,0.18); border-radius: 20px; padding: 5px 14px; margin-bottom: 22px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #B8FF00; animation: pulse-dot 2s infinite; }
        .upload-title { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; color: #f2f2f2; line-height: 1.15; letter-spacing: -1.5px; margin-bottom: 14px; }
        .upload-sub { color: #555; font-size: 0.95rem; max-width: 400px; margin: 0 auto; line-height: 1.6; }
        .drop-zone { width: 100%; max-width: 540px; border-radius: 20px; padding: 56px 36px; text-align: center; cursor: pointer; transition: all 0.25s ease; position: relative; z-index: 1; animation: fadeUp 0.6s 0.1s ease both; }
        .drop-zone-idle { background: #0f0f0f; border: 2px dashed #252525; }
        .drop-zone-idle:hover { border-color: #3a3a3a; background: #111; }
        .drop-zone-drag { background: rgba(184,255,0,0.04); border: 2px dashed #B8FF00; box-shadow: 0 0 40px rgba(184,255,0,0.08); }
        .drop-zone-done { background: rgba(0,230,118,0.04); border: 2px dashed #00e676; }
        .drop-icon { font-size: 52px; margin-bottom: 18px; display: block; }
        .drop-title { color: #e0e0e0; font-weight: 600; font-size: 1rem; margin-bottom: 8px; }
        .drop-sub { color: #444; font-size: 0.8rem; margin-bottom: 22px; }
        .file-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 16px; border-radius: 8px; background: #161616; border: 1px solid #2a2a2a; color: #666; font-size: 0.75rem; }
        .analyze-btn { margin-top: 22px; padding: 15px 52px; border-radius: 12px; border: none; font-size: 0.95rem; font-weight: 700; letter-spacing: -0.2px; transition: all 0.2s; position: relative; z-index: 1; animation: fadeUp 0.6s 0.2s ease both; }
        .analyze-btn-on { background: linear-gradient(135deg, #B8FF00, #8fcc00); color: #000; cursor: pointer; box-shadow: 0 4px 24px rgba(184,255,0,0.25); }
        .analyze-btn-on:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(184,255,0,0.35); }
        .analyze-btn-off { background: #141414; color: #333; cursor: not-allowed; border: 1px solid #222; }
        .sample-btn { margin-top: 10px; background: transparent; border: none; color: #3a3a3a; font-size: 0.78rem; cursor: pointer; text-decoration: underline; transition: color 0.2s; position: relative; z-index: 1; }
        .sample-btn:hover { color: #666; }
        .features-row { display: flex; gap: 16px; margin-top: 56px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; animation: fadeUp 0.6s 0.3s ease both; }
        .feature-card { background: #0f0f0f; border: 1px solid #1e1e1e; border-radius: 14px; padding: 18px 20px; display: flex; align-items: flex-start; gap: 12px; width: 180px; transition: border-color 0.2s; }
        .feature-card:hover { border-color: #2e2e2e; }
        .feature-icon { font-size: 22px; flex-shrink: 0; }
        .feature-label { font-size: 0.8rem; font-weight: 600; color: #ccc; margin-bottom: 3px; }
        .feature-desc { font-size: 0.7rem; color: #444; line-height: 1.4; }
        .file-name { color: #00e676; font-weight: 600; font-size: 0.95rem; margin-bottom: 6px; }
        .file-meta { color: #555; font-size: 0.78rem; }
      `}</style>

      <div className="upload-page">
        <div className="grid-bg" />
        <div className="glow-orb" />

        <div className="upload-hero">
          <div className="badge">
            <span className="badge-dot" />
            <span style={{ fontSize: '0.72rem', color: '#B8FF00', fontWeight: 600, letterSpacing: '0.3px' }}>AI-Powered Legal Analysis</span>
          </div>
          <h1 className="upload-title">
            Analyze Legal Documents<br />
            <span style={{ color: '#B8FF00' }}>In Seconds</span>
          </h1>
          <p className="upload-sub">
            Upload any NDA or contract and get instant risk scoring, clause breakdown, and plain-English explanations.
          </p>
        </div>

        <div
          className={`drop-zone ${dragging ? 'drop-zone-drag' : uploadedFile ? 'drop-zone-done' : 'drop-zone-idle'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
        >
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {uploadedFile ? (
            <>
              <span className="drop-icon">✅</span>
              <p className="file-name">{uploadedFile.name}</p>
              <p className="file-meta">{(uploadedFile.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; PDF &nbsp;·&nbsp; Ready to analyze</p>
            </>
          ) : (
            <>
              <span className="drop-icon">{dragging ? '📂' : '📄'}</span>
              <p className="drop-title">{dragging ? 'Release to upload' : 'Drop your PDF here'}</p>
              <p className="drop-sub">or click to browse files from your computer</p>
              <span className="file-badge">
                <span style={{ color: '#B8FF00' }}>PDF</span>
                <span style={{ color: '#333' }}>·</span>
                <span>Max 50 MB</span>
              </span>
            </>
          )}
        </div>

        {error && <p style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: 8 }}>{error}</p>}
        <button
          className={`analyze-btn ${uploadedFile && !loading ? 'analyze-btn-on' : 'analyze-btn-off'}`}
          onClick={handleAnalyze}
          disabled={!uploadedFile || loading}
        >
          {loading ? 'Analyzing…' : 'Analyze Document →'}
        </button>

        {!uploadedFile && (
          <button className="sample-btn" onClick={() => onFileUpload({ name: 'Sample_NDA_Agreement.pdf', size: 245760, type: 'application/pdf' })}>
            Use sample document instead
          </button>
        )}

        <div className="features-row">
          {features.map(({ icon, label, desc }) => (
            <div key={label} className="feature-card">
              <span className="feature-icon">{icon}</span>
              <div>
                <p className="feature-label">{label}</p>
                <p className="feature-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
