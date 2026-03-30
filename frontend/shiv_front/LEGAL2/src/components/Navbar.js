import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../logo.jpg';

export default function Navbar() {
  return (
    <>
      <style>{`
        .navbar {
          background: rgba(12,15,26,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 58px;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .logo-link { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .logo-icon {
          width: 36px; height: 36px; border-radius: 8px;
          overflow: hidden; flex-shrink: 0;
          border: 1px solid rgba(201,168,76,0.3);
        }
        .logo-icon img {
          width: 100%; height: 100%; object-fit: cover; object-position: center; display: block;
        }
        .logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; font-weight: 700;
          color: var(--text); letter-spacing: -0.2px;
        }
        .logo-sub {
          font-family: 'DM Mono', monospace;
          font-size: 0.58rem; color: var(--text-dim);
          letter-spacing: 0.12em; text-transform: uppercase; margin-top: 1px;
        }
        .nav-links { display: flex; gap: 2px; align-items: center; }
        .nav-link {
          padding: 6px 14px; border-radius: 6px; text-decoration: none;
          font-size: 0.8rem; font-weight: 400; transition: all 0.15s;
          color: var(--text-muted); border: 1px solid transparent;
          font-family: 'DM Sans', sans-serif; letter-spacing: 0.01em;
        }
        .nav-link:hover { color: var(--text); background: var(--surface2); border-color: var(--border); }
        .nav-link.active {
          color: var(--gold); background: var(--gold-dim);
          border-color: var(--gold-border); font-weight: 500;
        }
      `}</style>
      <nav className="navbar">
        <NavLink to="/upload" className="logo-link">
          <div className="logo-icon"><img src={logo} alt="logo" /></div>
          <div>
            <div className="logo-name">Legal Document Analyzer</div>
            <div className="logo-sub">AI-Powered</div>
          </div>
        </NavLink>
        <div className="nav-links">
          {[
            { to: '/upload', label: 'Upload' },
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/chat', label: 'Chat' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
