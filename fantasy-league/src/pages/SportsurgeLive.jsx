import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Calendar, ExternalLink, Flag, MonitorPlay, Play,
  Radio, RotateCcw, Trophy, X, Zap,
} from 'lucide-react';
import { MATCHES, getLeagueById } from '../data/footballSchedule';
import { useFootballFixtures, espnToMatch } from '../components/useEspnFixtures';
import {
  F1_2026_RACES, SPORTSURGE_MIRRORS,
  getSportsurgeF1Url, getSportsurgeFootballUrl, getSportsurgeHomeUrl,
} from '../data/sportsurgeLinks';

const TABS = [
  { id: 'football', label: '⚽ Football Matches', color: '#20df7f' },
  { id: 'f1', label: '🏎️ Formula 1 Races', color: '#ff314a' },
  { id: 'live', label: '🔴 All Live Sports', color: '#ff8a1c' },
];

export default function SportsurgeLive() {
  const [searchParams] = useSearchParams();
  const initial = ['football', 'f1', 'live'].includes(searchParams.get('sport'))
    ? searchParams.get('sport')
    : 'football';

  const [tab, setTab] = useState(initial); // 'football' | 'f1' | 'live'
  const [mirror, setMirror] = useState(SPORTSURGE_MIRRORS[0].base);
  const [viewer, setViewer] = useState(null); // { url, title } opened INSIDE the site
  const [frameKey, setFrameKey] = useState(0);

  const hubUrl = (t = tab, base = mirror) =>
    t === 'f1' ? getSportsurgeF1Url(null, base)
    : t === 'football' ? getSportsurgeFootballUrl(null, base)
    : getSportsurgeHomeUrl(base);

  const openInside = (url, title) => setViewer({ url, title });

  // Latest fixtures from ESPN; static MATCHES only if ESPN is unreachable
  const { fixtures: espnFixtures, fromEspn: footballFromEspn } = useFootballFixtures({ daysPast: 1, daysAhead: 14 });
  const footballMatches = useMemo(
    () => (footballFromEspn
      ? espnFixtures.map(espnToMatch).slice(0, 14)
      : [...MATCHES].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 14)),
    [footballFromEspn, espnFixtures],
  );

  const activeColor = TABS.find((t) => t.id === tab)?.color || '#ff8a1c';

  return (
    <div className="page-shell" style={{ paddingBottom: '100px' }}>
      <Link to="/" className="ghost-button" style={{ marginBottom: 14, display: 'inline-flex' }}>
        <ArrowLeft size={16} /> Back to arena
      </Link>

      {/* Hero */}
      <div className="eyebrow" style={{ color: '#ff8a1c', borderColor: '#ff8a1c55', background: '#ff8a1c14' }}>
        <MonitorPlay size={12} /> FOFA Arena — Live Streaming Hub
      </div>
      <h1 className="hero-title" style={{ fontSize: '2.6rem', margin: '10px 0' }}>
        Live <span>Football &amp; F1 Streams</span>
      </h1>
      <p className="hero-copy" style={{ maxWidth: 760 }}>
        Every football match and Formula 1 session, streaming inside FOFA Arena.
        Pick a match below and watch right here — if one player is down,
        switch to another player.
      </p>

      {/* Mirror selector */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', margin: '18px 0' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)' }}>PLAYER:</span>
        {SPORTSURGE_MIRRORS.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMirror(m.base); setFrameKey((k) => k + 1); }}
            style={{
              padding: '7px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
              border: `1px solid ${mirror === m.base ? '#ff8a1c' : 'rgba(255,255,255,0.1)'}`,
              background: mirror === m.base ? 'rgba(255,138,28,0.15)' : 'rgba(255,255,255,0.03)',
              color: mirror === m.base ? '#ff8a1c' : 'var(--muted)',
            }}
          >
            {m.label}
          </button>
        ))}
        <a href={hubUrl()} target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: 'auto', display: 'inline-flex', gap: 6, alignItems: 'center', color: activeColor, fontSize: '0.8rem', fontWeight: 750, textDecoration: 'none' }}>
          Open Player <ExternalLink size={13} />
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '11px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '0.85rem',
              border: `1px solid ${tab === t.id ? t.color : 'rgba(255,255,255,0.08)'}`,
              background: tab === t.id ? `${t.color}1f` : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? t.color : 'var(--muted)',
            }}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => openInside(hubUrl(), TABS.find((t) => t.id === tab)?.label || 'Live Stream')}
          style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 20px', borderRadius: '999px', border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${activeColor}, ${activeColor}bb)`, color: '#0b1117',
            fontWeight: 850, fontSize: '0.85rem',
          }}
        >
          <Play size={16} /> Watch Inside Website
        </button>
      </div>

      {/* Inline viewer — Sportsurge opened INSIDE our website */}
      {viewer && (
        <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,17,24,0.85)', overflow: 'hidden', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
            <strong style={{ fontSize: '0.9rem', display: 'flex', gap: 8, alignItems: 'center' }}>
              <MonitorPlay size={16} color={activeColor} /> {viewer.title}
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, background: `${activeColor}1c`, color: activeColor, border: `1px solid ${activeColor}44` }}>FOFA LIVE</span>
            </strong>
            <span style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFrameKey((k) => k + 1)} title="Reload" style={iconBtn}><RotateCcw size={15} /></button>
              <a href={viewer.url} target="_blank" rel="noopener noreferrer" title="Open in new tab (use if the embed is blocked)" style={{ ...iconBtn, textDecoration: 'none' }}><ExternalLink size={15} /></a>
              <button onClick={() => setViewer(null)} title="Close" style={iconBtn}><X size={16} /></button>
            </span>
          </div>
          <div style={{ height: 540, position: 'relative' }}>
            <iframe key={frameKey} src={viewer.url} title={viewer.title} allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              referrerPolicy="no-referrer"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
          </div>
          <p style={{ margin: 0, padding: '10px 18px', fontSize: '0.72rem', color: 'var(--muted)' }}>
            If the player stays blank, this player is blocking embedding right now — switch to another player above.
          </p>
        </div>
      )}

      {/* Football matches */}
      {tab === 'football' && (
        <section>
          <h2 style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '1.1rem' }}>
            <Radio size={17} color="#20df7f" /> {footballFromEspn ? 'Latest Football Fixtures (ESPN) — Watch Live' : 'Upcoming Football Matches — Watch Live'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {footballMatches.map((m) => {
              const league = getLeagueById(m.league);
              const url = getSportsurgeFootballUrl(m, mirror);
              const title = `${m.home} vs ${m.away}`;
              return (
                <div key={m.id} style={rowStyle}>
                  <div style={{ minWidth: 92 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.7rem' }}>{new Date(m.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <strong>{title}</strong>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4, fontSize: '0.7rem', color: 'var(--muted)' }}>
                      <span style={{ padding: '1px 8px', borderRadius: 999, border: `1px solid ${league.color}55`, color: league.color, background: `${league.color}18`, fontWeight: 800 }}>{league.label}</span>
                      <span>{m.round}</span><span>{m.venue}</span>
                    </div>
                  </div>
                  <button onClick={() => openInside(url, title)} style={insideBtn('#20df7f')}><MonitorPlay size={13} /> Inside</button>
                  <button onClick={() => openInside(url, title)} style={surgeBtn('#20df7f')}><Play size={13} /> Watch</button>
                </div>
              );
            })}
          </div>
          <Link to="/live/football" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginTop: 16, color: '#20df7f', fontWeight: 750, fontSize: '0.85rem', textDecoration: 'none' }}>
            <Trophy size={15} /> Full football schedule &amp; live player →
          </Link>
        </section>
      )}

      {/* F1 races */}
      {tab === 'f1' && (
        <section>
          <h2 style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '1.1rem' }}>
            <Flag size={17} color="#ff314a" /> F1 2026 Races — Watch Live
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 10 }}>
            {F1_2026_RACES.map((r) => {
              const url = getSportsurgeF1Url(r, mirror);
              return (
                <div key={r.round} style={{ ...rowStyle, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 800, letterSpacing: 1 }}>ROUND {r.round}{r.sprint ? ' • SPRINT' : ''}</div>
                    <strong style={{ display: 'block', margin: '4px 0' }}>{r.gp}</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'inline-flex', gap: 5, alignItems: 'center' }}><Calendar size={12} /> {r.dateRange}, 2026</span>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <button onClick={() => openInside(url, r.gp)} style={insideBtn('#ff314a')}><MonitorPlay size={13} /> Inside</button>
                      <button onClick={() => openInside(url, r.gp)} style={surgeBtn('#ff314a')}><Play size={13} /> Watch</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Link to="/watch-live?sport=f1" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginTop: 16, color: '#ff314a', fontWeight: 750, fontSize: '0.85rem', textDecoration: 'none' }}>
            <Radio size={15} /> Watch F1 on the Live website player →
          </Link>
        </section>
      )}

      {/* All live */}
      {tab === 'live' && (
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          {[
            { label: 'All Live Sports', desc: 'Every live event listed right now', url: getSportsurgeHomeUrl(mirror), color: '#ff8a1c' },
            { label: 'Football Live', desc: 'All live football / soccer matches', url: getSportsurgeFootballUrl(null, mirror), color: '#20df7f' },
            { label: 'Formula 1 Live', desc: 'Practice, qualifying, sprint & races', url: getSportsurgeF1Url(null, mirror), color: '#ff314a' },
          ].map((c) => (
            <div key={c.label} style={{ padding: 20, borderRadius: 16, border: `1px solid ${c.color}33`, background: `${c.color}0d` }}>
              <strong>{c.label}</strong>
              <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{c.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => openInside(c.url, c.label)} style={insideBtn(c.color)}><MonitorPlay size={13} /> Watch Inside</button>
                <button onClick={() => openInside(c.url, c.label)} style={surgeBtn(c.color)}><Play size={13} /> Watch</button>
              </div>
            </div>
          ))}
        </section>
      )}

      <p style={{ marginTop: 28, fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.6 }}>
        Streams come from third-party embedded players and link aggregators that do not host content
        themselves; players can change or go offline. If a player is dead, try another player above — and prefer official broadcasters
        (e.g. F1 TV, your league&apos;s broadcaster) where available.
      </p>
    </div>
  );
}

const iconBtn = {
  width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 9, cursor: 'pointer',
  border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: 'var(--muted)',
};
const rowStyle = {
  display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
  padding: '13px 16px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,17,24,0.6)',
};
const insideBtn = (color = '#ff8a1c') => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
  border: `1px solid ${color}44`, background: 'rgba(255,255,255,0.05)', color: 'var(--text)',
  fontSize: '0.75rem', fontWeight: 750,
});
const surgeBtn = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999,
  border: `1px solid ${color}55`, background: `${color}14`, color, fontSize: '0.75rem', fontWeight: 750, textDecoration: 'none',
});
