import React, { useRef, useState } from 'react';
import { Clapperboard, Maximize2, RefreshCw, MonitorPlay, ShieldAlert } from 'lucide-react';

/**
 * FOFA Cinema — movies & shows watch hub.
 * Third-party players are embedded directly inside our page; no source
 * names, links or URLs are ever shown in the UI. Users pick "Player 1"
 * or "Player 2" from our own chrome and watch without leaving the site.
 */
const PLAYERS = [
  { id: 'player-1', label: 'Player 1', src: 'https://bingr.one/home' },
  { id: 'player-2', label: 'Player 2', src: 'https://tbcpl.lol/' },
];

export default function Movies() {
  const [activePlayer, setActivePlayer] = useState(PLAYERS[0]);
  const [frameKey, setFrameKey] = useState(0);
  const frameWrapRef = useRef(null);

  const switchPlayer = (player) => {
    setActivePlayer(player);
    setFrameKey((k) => k + 1);
  };

  const goFullscreen = () => {
    const el = frameWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="section-head" style={{ marginBottom: 12 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clapperboard size={22} color="#ff4b44" /> FOFA Cinema — Movies &amp; Shows
        </h2>
        <span className="section-note">Watch free inside FOFA Arena • no sign-up • switch players if one is slow</span>
      </div>

      {/* Player switcher (our own chrome — no external links shown) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <div className="sport-tabs" style={{ display: 'flex', gap: 8 }}>
          {PLAYERS.map((player) => (
            <button
              key={player.id}
              type="button"
              className={`sport-tab ${activePlayer.id === player.id ? 'is-active' : ''}`}
              onClick={() => switchPlayer(player)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
            >
              <MonitorPlay size={15} /> {player.label}
            </button>
          ))}
        </div>
        <span style={{ flex: 1 }} />
        <button type="button" className="ghost-button" onClick={() => setFrameKey((k) => k + 1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <RefreshCw size={14} /> Reload
        </button>
        <button type="button" className="ghost-button" onClick={goFullscreen}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <Maximize2 size={14} /> Fullscreen
        </button>
      </div>

      {/* Embedded player */}
      <div
        ref={frameWrapRef}
        style={{
          position: 'relative',
          width: '100%',
          height: 'min(78vh, 900px)',
          minHeight: 420,
          background: '#000',
          border: '1px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid var(--f1-red, #e10600)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <iframe
          key={`${activePlayer.id}-${frameKey}`}
          src={activePlayer.src}
          title="FOFA Cinema player"
          style={{ width: '100%', height: '100%', border: 0, display: 'block', background: '#000' }}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Help + disclaimer (no source names or URLs, ever) */}
      <div className="glass-panel" style={{ marginTop: 14, padding: '14px 16px' }}>
        <strong style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem' }}>
          <ShieldAlert size={16} color="#ffcc00" /> Player not loading?
        </strong>
        <p style={{ margin: '8px 0 0', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          Tap <b style={{ color: 'var(--text)' }}>Reload</b>, or switch between <b style={{ color: 'var(--text)' }}>Player 1</b> and{' '}
          <b style={{ color: 'var(--text)' }}>Player 2</b> above — both are built right into this page, so you never leave FOFA Arena.
          Streams are provided by third-party embedded players; availability and ads inside the player window are controlled by them.
        </p>
      </div>
    </div>
  );
}
