import React, { useEffect, useState } from 'react';
import MercedesStarLogo from './MercedesStarLogo';

/**
 * FOFA Arena intro — kept deliberately simple & fast:
 * logo + wordmark rise in, one F1-red bar sweeps, done in ~1.4s.
 * Shows once per session; click anywhere to skip. No audio, no
 * extra fonts, no heavy effects (performance first).
 */
export default function WelcomeAnimation() {
  const [show, setShow] = useState(() => !sessionStorage.getItem('arena_intro_seen'));
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) return undefined;
    const t1 = setTimeout(() => setLeaving(true), 1150);
    const t2 = setTimeout(() => {
      sessionStorage.setItem('arena_intro_seen', 'true');
      setShow(false);
    }, 1450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;

  const skip = () => {
    sessionStorage.setItem('arena_intro_seen', 'true');
    setShow(false);
  };

  return (
    <div
      className="simple-intro"
      onClick={skip}
      role="button"
      aria-label="Skip intro"
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        background: 'radial-gradient(700px 400px at 50% 38%, rgba(225,6,0,0.16), transparent 65%), #07070c',
        cursor: 'pointer',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div className="simple-intro-rise" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <MercedesStarLogo size={72} />
        <div style={{
          fontFamily: 'var(--font-racing)', fontWeight: 900, fontStyle: 'italic',
          fontSize: '2rem', letterSpacing: '3px', color: '#fff', textTransform: 'uppercase', lineHeight: 1,
        }}>
          FOFA <span className="brand-gradient-text">ARENA</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-racing)', fontWeight: 700, fontStyle: 'italic',
          fontSize: '0.7rem', letterSpacing: '4px', color: 'var(--muted)', textTransform: 'uppercase',
        }}>
          Lights Out • Kick-Off • Live
        </div>
      </div>
      <div className="simple-intro-bar" />
      <span style={{ position: 'absolute', bottom: 22, fontSize: '0.62rem', letterSpacing: '2px', color: 'var(--faint)', textTransform: 'uppercase' }}>
        Tap to skip
      </span>
    </div>
  );
}
