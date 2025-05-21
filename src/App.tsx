import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import Browse from "./pages/Browse";
import NowPlaying from "./pages/NowPlaying";

function TabNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return (
    <nav
      style={{
        width: '100%',
        background: '#18181b',
        borderBottom: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: 24, padding: '0.5rem 0' }}>
        <Link
          to="/browse"
          style={{
            padding: '8px 32px',
            borderRadius: 12,
            fontWeight: isActive('/browse') ? 700 : 400,
            color: isActive('/browse') ? '#fff' : '#888',
            background: isActive('/browse') ? '#232326' : 'transparent',
            boxShadow: isActive('/browse') ? '0 2px 12px #0002' : 'none',
            border: isActive('/browse') ? '1.5px solid #333' : 'none',
            transition: 'all 0.15s',
            fontSize: '1.3rem',
            letterSpacing: '0.5px',
            textDecoration: 'none',
            outline: 'none',
          }}
        >
          Browse
        </Link>
        <Link
          to="/now-playing"
          style={{
            padding: '8px 32px',
            borderRadius: 12,
            fontWeight: isActive('/now-playing') ? 700 : 400,
            color: isActive('/now-playing') ? '#fff' : '#888',
            background: isActive('/now-playing') ? '#232326' : 'transparent',
            boxShadow: isActive('/now-playing') ? '0 2px 12px #0002' : 'none',
            border: isActive('/now-playing') ? '1.5px solid #333' : 'none',
            transition: 'all 0.15s',
            fontSize: '1.3rem',
            letterSpacing: '0.5px',
            textDecoration: 'none',
            outline: 'none',
          }}
        >
          Now Playing
        </Link>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <TabNav />
      <Routes>
        <Route path="/browse" element={<Browse />} />
        <Route path="/now-playing" element={<NowPlaying />} />
        <Route path="/" element={<Navigate to="/now-playing" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#18181b',
        paddingTop: 'calc(env(safe-area-inset-top, 20px))',
        boxSizing: 'border-box',
      }}
    >
      <div className="safe-area-top-overlay" />
      <style>{`
        .safe-area-top-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: env(safe-area-inset-top, 20px);
          background: #18181b;
          z-index: 100;
          pointer-events: none;
        }
      `}</style>
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}
