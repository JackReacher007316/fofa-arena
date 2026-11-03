import React from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay } from 'lucide-react';
import { SPORTSURGE_QUICK_LINKS } from '../data/sportsurgeLinks';

const SPORT_COLOR = { football: '#20df7f', f1: '#ff314a', all: '#ff8a1c' };

/**
 * Single Sportsurge button for one match / race.
 * Opens Sportsurge in a new tab (Sportsurge often blocks iframing, so the
 * external link is the reliable path; in-app viewing lives on /sportsurge).
 */
export function SportsurgeButton({ sport = 'football', label, style }) {
  const color = SPORT_COLOR[sport] || SPORT_COLOR.all;
  const text =
    label ||
    (sport === 'f1' ? 'Watch F1 Live' : 'Watch Live');
  return (
    <Link
      to={`/live-streams?sport=${sport === 'f1' ? 'f1' : sport === 'football' ? 'football' : 'live'}`}
      title={`${text} — watch inside FOFA Arena`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '999px', whiteSpace: 'nowrap',
        border: `1px solid ${color}55`, background: `${color}14`, color,
        fontSize: '0.78rem', fontWeight: 750, textDecoration: 'none', cursor: 'pointer',
        ...style,
      }}
    >
      <MonitorPlay size={14} /> {text}
    </Link>
  );
}

/**
 * Quick-links bar: Sportsurge Live (all) + Football + F1 hubs,
 * plus a link to the in-site /sportsurge live page.
 */
export default function SportsurgeLinks({ style }) {
  return (
    <div
      style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
        padding: '14px 16px', borderRadius: '14px',
        border: '1px solid rgba(255,138,28,0.25)', background: 'rgba(255,138,28,0.05)',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.82rem' }}>
        <MonitorPlay size={15} color="#ff8a1c" /> Live Streams
      </span>
      {SPORTSURGE_QUICK_LINKS.map((l) => (
        <Link
          key={l.id}
          to={`/live-streams?sport=${l.id === 'f1' ? 'f1' : l.id === 'football' ? 'football' : 'live'}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px', borderRadius: '999px', textDecoration: 'none',
            border: `1px solid ${l.color}44`, background: `${l.color}12`, color: l.color,
            fontSize: '0.75rem', fontWeight: 700,
          }}
        >
          {l.label}
        </Link>
      ))}
      <Link
        to="/live-streams"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', marginLeft: 'auto',
          padding: '7px 12px', borderRadius: '999px', textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
          color: 'var(--text)', fontSize: '0.75rem', fontWeight: 700,
        }}
      >
        <MonitorPlay size={13} /> Open inside FOFA Arena
      </Link>
    </div>
  );
}
