import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <>
      <style>{`
        .nav-link { padding: 7px 16px; border-radius: 8px; text-decoration: none; font-size: 0.82rem; font-weight: 500; transition: all 0.2s; color: #666; border: 1px solid transparent; }
        .nav-link:hover { color: #aaa; border-color: #2a2a2a; }
        .nav-link.active { background: #B8FF00; color: #000 !important; border-color: transparent; font-weight: 700; }
        .logo-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
      `}</style>
      <nav style={{
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1c',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '62px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <NavLink to="/upload" className="logo-link">
          <div style={{
            width: 34, height: 34,
            background: 'linear-gradient(135deg, #B8FF00 0%, #7acc00 100%)',
            borderRadius: 9, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 17, color: '#000', fontWeight: 800,
            boxShadow: '0 0 14px rgba(184,255,0,0.35)',
          }}>⚖</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f0f0', letterSpacing: '-0.4px' }}>
              AI Legal <span style={{ color: '#B8FF00' }}>Analyzer</span>
            </span>
            <div style={{ fontSize: '0.6rem', color: '#444', letterSpacing: '0.5px', marginTop: 1 }}>POWERED BY AI</div>
          </div>
        </NavLink>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[
            { to: '/upload', label: '↑ Upload' },
            { to: '/dashboard', label: '⊞ Dashboard' },
            { to: '/chat', label: '💬 Chat' },
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
