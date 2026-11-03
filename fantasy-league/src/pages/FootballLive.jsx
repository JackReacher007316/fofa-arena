import React, { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Play, Calendar, Trophy, Tv, X, ChevronRight, Radio, BarChart3, ClipboardList, FileText, LayoutGrid, ExternalLink, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { LEAGUES, MATCHES, getLeagueById, getFeaturedMatches } from '../data/footballSchedule';
import { getSportsurgeFootballUrl, getSportsurgeHomeUrl } from '../data/sportsurgeLinks';
import { useFootballFixtures, espnToMatch } from '../components/useEspnFixtures';
import { SportsurgeButton } from '../components/SportsurgeLinks';

const BASE_URL = 'https://harborfreight22.com';

// All football sections from harborfreight22.com — opened INSIDE our website, no new tab
// Sportsurge sections are also opened inside, with an external fallback (↗).
const FOOTBALL_SECTIONS = [
  { id: 'live', label: 'Live Streams', icon: Tv, url: BASE_URL, color: '#ff314a', desc: 'Watch live football matches' },
  { id: 'sportsurge', label: 'Football Live Hub', icon: MonitorPlay, url: getSportsurgeFootballUrl(), color: '#ff8a1c', desc: 'All football matches live in one hub' },
  { id: 'sportsurge-live', label: 'All Live Sports', icon: Radio, url: getSportsurgeHomeUrl(), color: '#ff8a1c', desc: 'Every live sport streaming right now' },
  { id: 'schedule', label: 'Schedule', icon: Calendar, url: `${BASE_URL}/lich-thi-dau`, color: '#20df7f', desc: 'Full match schedule' },
  { id: 'standings', label: 'Standings', icon: BarChart3, url: `${BASE_URL}/bang-xep-hang`, color: '#f2c94c', desc: 'League tables & rankings' },
  { id: 'results', label: 'Results', icon: ClipboardList, url: `${BASE_URL}/ket-qua-tran-dau`, color: '#4bb7ff', desc: 'Match results & scores' },
  { id: 'analysis', label: 'Analysis', icon: FileText, url: `${BASE_URL}/nhan-dinh-tran-dau`, color: '#9b7bff', desc: 'Pre-match analysis & predictions' },
];

function LeagueFilter({ active, onChange }) {
  return (
    <div className="football-league-tabs">
      {LEAGUES.map(l => (
        <button
          key={l.id}
          className={`league-tab ${active === l.id ? 'is-active' : ''}`}
          style={{ '--lc': l.color }}
          onClick={() => onChange(l.id)}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

function SectionNav({ activeSection, onSelect }) {
  return (
    <div className="ftb-section-nav">
      {FOOTBALL_SECTIONS.map(s => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            className={`ftb-section-btn ${activeSection === s.id ? 'is-active' : ''}`}
            style={{ '--sc': s.color }}
            onClick={() => onSelect(s.id)}
            title={s.desc}
          >
            <Icon size={16} />
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MatchRow({ match, onWatch }) {
  const d = new Date(match.date);
  const league = getLeagueById(match.league);
  const isPast = d < new Date();
  const isToday = d.toDateString() === new Date().toDateString();

  return (
    <div className={`ftb-match-row ${match.featured ? 'is-featured' : ''} ${isPast ? 'is-past' : ''}`} style={{ '--lc': league.color }}>
      <div className="ftb-match-date">
        <span className="ftb-day">{d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
        <span className="ftb-time">{d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        {isToday && <span className="ftb-today-badge">TODAY</span>}
      </div>
      <div className="ftb-match-info">
        <div className="ftb-teams">
          <strong>{match.home}</strong>
          <span className="ftb-vs">vs</span>
          <strong>{match.away}</strong>
        </div>
        {(match.statusState === 'in' || match.statusState === 'post') && (
          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: match.statusState === 'in' ? '#ff314a' : 'var(--text)' }}>
            {match.homeScore} – {match.awayScore}
            <span style={{ fontSize: '0.65rem', marginLeft: 8, color: 'var(--muted)', fontWeight: 700 }}>{match.statusText || ''}</span>
          </div>
        )}
        <div className="ftb-meta">
          <span className="ftb-league-badge" style={{ background: `${league.color}22`, color: league.color, borderColor: `${league.color}44` }}>{league.label}</span>
          <span>{match.round}</span>
          <span className="ftb-venue">{match.venue}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="ftb-watch-btn" onClick={() => onWatch(match)}>
          <Tv size={14} />
          Watch Live
        </button>
        <SportsurgeButton sport="football" match={match} />
      </div>
    </div>
  );
}

/* Inline iframe viewer — opens stream pages INSIDE the website, no new tab */
function InlineViewer({ url, title, onClose }) {
  const isSportsurge = url.includes('sportsurge');
  return (
    <div className="ftb-stream-overlay">
      <div className="ftb-stream-modal">
        <div className="ftb-stream-header">
          <div>
            <h3>{title}</h3>
            <span className="ftb-stream-meta">{'Streaming live inside FOFA Arena'}</span>
          </div>
          <div className="ftb-stream-actions">
            <a href={url} target="_blank" rel="noopener noreferrer" title="Open in new tab (use if embed is blocked)" className="ftb-close-btn" style={{ textDecoration: 'none' }}><ExternalLink size={16} /></a>
            <button className="ftb-close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>
        <div className="ftb-stream-player">
          <iframe
            src={url}
            title={title}
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}

export default function FootballLive() {
  const navigate = useNavigate();
  // Latest fixtures from ESPN (all leagues) — static MATCHES is only a fallback
  const { fixtures: espnFixtures, lastUpdated, fromEspn } = useFootballFixtures({ daysPast: 2, daysAhead: 21 });
  const allMatches = fromEspn ? espnFixtures.map(espnToMatch) : MATCHES;
  const [activeLeague, setActiveLeague] = useState('all');
  const [streamMatch, setStreamMatch] = useState(null);
  const [showStream, setShowStream] = useState(false);
  const [monthFilter, setMonthFilter] = useState('all');
  const [activeSection, setActiveSection] = useState(null); // for section iframes
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');

  const months = useMemo(() => {
    const seen = new Map();
    allMatches.forEach((m) => {
      const d = new Date(m.date);
      seen.set(String(d.getMonth() + 1), d.toLocaleDateString('en-IN', { month: 'long' }));
    });
    return [{ id: 'all', label: 'All' }, ...[...seen].map(([id, label]) => ({ id, label }))];
  }, [allMatches]);

  const filtered = useMemo(() => {
    let list = activeLeague === 'all' ? allMatches : allMatches.filter(m => m.league === activeLeague);
    if (monthFilter !== 'all') {
      list = list.filter(m => (new Date(m.date).getMonth() + 1).toString() === monthFilter);
    }
    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [activeLeague, monthFilter, allMatches]);

  const featured = useMemo(
    () => (fromEspn ? allMatches.filter(m => m.statusState === 'in').concat(allMatches.filter(m => m.statusState === 'pre')).slice(0, 3) : getFeaturedMatches()),
    [fromEspn, allMatches]);

  // Group matches by date for schedule-wise display
  const groupedByDate = useMemo(() => {
    const groups = {};
    filtered.forEach(m => {
      const dateKey = new Date(m.date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(m);
    });
    return groups;
  }, [filtered]);

  const handleWatch = useCallback((match) => {
    setStreamMatch(match);
    setShowStream(true);
    setActiveSection(null);
  }, []);

  const openFullStream = useCallback(() => {
    setStreamMatch(null);
    setShowStream(true);
    setActiveSection(null);
  }, []);

  const openSection = useCallback((sectionId) => {
    const section = FOOTBALL_SECTIONS.find(s => s.id === sectionId);
    if (section) {
      setViewerUrl(section.url);
      setViewerTitle(section.label);
      setActiveSection(sectionId);
      setShowStream(false);
    }
  }, []);

  const closeViewer = useCallback(() => {
    setActiveSection(null);
    setShowStream(false);
    setStreamMatch(null);
  }, []);

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="ftb-header">
        <button className="ghost-button" onClick={() => navigate('/')} style={{ marginBottom: 14 }}>
          <ArrowLeft size={16} /> Back to arena
        </button>
        <div className="ftb-hero">
          <div className="ftb-hero-text">
            <div className="eyebrow" style={{ color: '#20df7f', borderColor: '#20df7f55', background: '#20df7f16' }}>
              <Radio size={12} /> Live Football Hub
            </div>
            <h1 className="hero-title" style={{ fontSize: '2.8rem' }}>
              Football <span>Schedule & Streaming</span>
            </h1>
            <p className="hero-copy">
              {fromEspn ? `Latest fixtures LIVE from ESPN — Premier League, Champions League, La Liga, Serie A, Bundesliga & more${lastUpdated ? ` • updated ${lastUpdated.toLocaleTimeString()}` : ''} • auto-refreshes every minute` : 'Latest 2026/27 fixtures (ESPN offline — showing calendar snapshot)'} — with one-click live streaming right here inside FOFA Arena.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="ftb-stream-big-btn" onClick={openFullStream}>
                <Play size={18} /> Open Live Stream Player
              </button>
              <SportsurgeButton sport="football" label="Watch Live" style={{ padding: '12px 20px', fontSize: '0.88rem' }} />
              <Link to="/sportsurge?sport=football" style={{ color: '#ff8a1c', fontWeight: 750, fontSize: '0.85rem' }}>
                All live streams →
              </Link>
            </div>
          </div>
          <div className="ftb-featured-stack">
            {featured.slice(0, 3).map(m => (
              <div key={m.id} className="ftb-feat-card" onClick={() => handleWatch(m)}>
                <div className="ftb-feat-teams">{m.home} vs {m.away}</div>
                <div className="ftb-feat-detail">
                  <span style={{ color: getLeagueById(m.league).color }}>{getLeagueById(m.league).label}</span>
                  <span>{m.round}</span>
                </div>
                <ChevronRight size={16} className="ftb-feat-arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Football Section Navigation — all links open INSIDE the website */}
      <div className="ftb-sections-header">
        <LayoutGrid size={16} style={{ color: 'var(--muted)' }} />
        <span className="ftb-sections-title">Football Hub — All Links (opens inside)</span>
      </div>
      <SectionNav activeSection={activeSection} onSelect={openSection} />

      {/* Inline Section Viewer — shows stream pages INSIDE our site */}
      {activeSection && (
        <div className="ftb-inline-viewer">
          <div className="ftb-inline-header">
            <div className="ftb-inline-title-row">
              <h3>{viewerTitle}</h3>
              <span className="ftb-inline-badge">{'FOFA LIVE'}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={viewerUrl} target="_blank" rel="noopener noreferrer" title="Open in new tab" className="ftb-close-btn" style={{ textDecoration: 'none' }}><ExternalLink size={15} /></a>
              <button className="ftb-close-btn" onClick={closeViewer}><X size={16} /></button>
            </div>
          </div>
          <div className="ftb-inline-frame">
            <iframe
              src={viewerUrl}
              title={viewerTitle}
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* League Filter */}
      <LeagueFilter active={activeLeague} onChange={setActiveLeague} />

      {/* Month Filter */}
      <div className="ftb-month-bar">
        <Calendar size={14} style={{ color: 'var(--muted)' }} />
        {months.map(m => (
          <button key={m.id} className={`ftb-month-btn ${monthFilter === m.id ? 'is-active' : ''}`} onClick={() => setMonthFilter(m.id)}>
            {m.label}
          </button>
        ))}
        <span className="ftb-count">{filtered.length} matches</span>
      </div>

      {/* Schedule-wise Match List (Grouped by Date) */}
      <div className="ftb-schedule-list">
        {Object.keys(groupedByDate).length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>No matches found for this filter. Try a different league or month.</div>
        ) : (
          Object.entries(groupedByDate).map(([dateLabel, matches]) => (
            <div key={dateLabel} className="ftb-date-group">
              <div className="ftb-date-header">
                <Calendar size={14} />
                <span>{dateLabel}</span>
                <span className="ftb-date-count">{matches.length} match{matches.length > 1 ? 'es' : ''}</span>
              </div>
              <div className="ftb-match-list">
                {matches.map(m => <MatchRow key={m.id} match={m} onWatch={handleWatch} />)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stream Player Overlay — opens harborfreight22.com INSIDE our website */}
      {showStream && (
        <InlineViewer
          url={streamMatch ? BASE_URL : BASE_URL}
          title={streamMatch ? `${streamMatch.home} vs ${streamMatch.away}` : 'Football Live Stream'}
          onClose={closeViewer}
        />
      )}

      <style>{`
        .ftb-header { margin-bottom: 24px; }
        .ftb-hero { display: grid; grid-template-columns: 1fr 380px; gap: 32px; align-items: start; }
        .ftb-hero-text { display: flex; flex-direction: column; gap: 12px; }
        .ftb-stream-big-btn {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 8px;
          padding: 14px 28px; border-radius: 999px; border: none;
          background: linear-gradient(135deg, #20df7f, #0fb86e); color: #06130d;
          font-weight: 850; font-size: 0.95rem; cursor: pointer;
          box-shadow: 0 8px 32px rgba(32,223,127,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          width: fit-content;
        }
        .ftb-stream-big-btn:hover { transform: translateY(-2px) scale(1.03); box-shadow: 0 12px 40px rgba(32,223,127,0.35); }
        .ftb-featured-stack { display: flex; flex-direction: column; gap: 10px; }
        .ftb-feat-card {
          padding: 16px 18px; border-radius: 14px; cursor: pointer;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s; display: flex; align-items: center; gap: 12px;
        }
        .ftb-feat-card:hover { background: rgba(32,223,127,0.08); border-color: rgba(32,223,127,0.2); transform: translateX(4px); }
        .ftb-feat-teams { flex: 1; font-weight: 800; font-size: 0.9rem; }
        .ftb-feat-detail { display: flex; flex-direction: column; font-size: 0.72rem; color: var(--muted); gap: 2px; text-align: right; }
        .ftb-feat-arrow { color: var(--muted); flex-shrink: 0; }

        /* Section Navigation — Football Hub Links */
        .ftb-sections-header {
          display: flex; align-items: center; gap: 8px; margin-bottom: 10px; margin-top: 8px;
          font-size: 0.82rem; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em;
        }
        .ftb-sections-title { color: var(--text); }
        .ftb-section-nav {
          display: flex; gap: 10px; overflow-x: auto; padding: 4px 0 18px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .ftb-section-btn {
          display: flex; align-items: center; gap: 8px; padding: 12px 20px;
          border-radius: 14px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: var(--muted); font-size: 0.82rem;
          font-weight: 750; cursor: pointer; transition: all 0.25s; white-space: nowrap;
          flex-shrink: 0;
        }
        .ftb-section-btn:hover {
          color: var(--text); background: color-mix(in srgb, var(--sc) 12%, transparent);
          border-color: color-mix(in srgb, var(--sc) 35%, transparent);
          transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in srgb, var(--sc) 15%, transparent);
        }
        .ftb-section-btn.is-active {
          color: var(--sc); background: color-mix(in srgb, var(--sc) 18%, transparent);
          border-color: color-mix(in srgb, var(--sc) 45%, transparent);
          box-shadow: 0 4px 16px color-mix(in srgb, var(--sc) 20%, transparent);
        }
        .ftb-section-btn svg { flex-shrink: 0; }

        /* Inline Viewer — harborfreight22.com pages embedded INSIDE our website */
        .ftb-inline-viewer {
          border-radius: 18px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(10,17,24,0.85); overflow: hidden; margin-bottom: 24px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
          animation: slideInUp 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .ftb-inline-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.3);
        }
        .ftb-inline-title-row { display: flex; align-items: center; gap: 12px; }
        .ftb-inline-title-row h3 { margin: 0; font-size: 0.95rem; }
        .ftb-inline-badge {
          padding: 3px 10px; border-radius: 999px; background: rgba(32,223,127,0.12);
          color: #20df7f; font-size: 0.68rem; font-weight: 800;
          border: 1px solid rgba(32,223,127,0.25);
        }
        .ftb-inline-frame { height: 520px; position: relative; }
        .ftb-inline-frame iframe {
          position: absolute; inset: 0; width: 100%; height: 100%; border: none;
          border-radius: 0 0 18px 18px;
        }

        .football-league-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 16px; }
        .league-tab {
          flex-shrink: 0; padding: 8px 16px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: var(--muted); font-size: 0.8rem; font-weight: 700;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .league-tab:hover, .league-tab.is-active {
          color: var(--text); background: color-mix(in srgb, var(--lc) 16%, transparent);
          border-color: color-mix(in srgb, var(--lc) 40%, transparent);
        }

        .ftb-month-bar {
          display: flex; align-items: center; gap: 8px; margin-bottom: 18px;
          padding: 8px 14px; border-radius: 14px; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .ftb-month-btn {
          padding: 6px 14px; border-radius: 999px; border: none;
          background: transparent; color: var(--muted); font-size: 0.78rem;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .ftb-month-btn.is-active, .ftb-month-btn:hover { color: var(--text); background: rgba(255,255,255,0.08); }
        .ftb-count { margin-left: auto; color: var(--faint); font-size: 0.75rem; font-weight: 700; }

        /* Schedule-wise grouping */
        .ftb-schedule-list { display: flex; flex-direction: column; gap: 20px; }
        .ftb-date-group { display: flex; flex-direction: column; gap: 6px; }
        .ftb-date-header {
          display: flex; align-items: center; gap: 8px; padding: 10px 16px;
          border-radius: 12px; background: rgba(32,223,127,0.06);
          border: 1px solid rgba(32,223,127,0.12); font-size: 0.85rem;
          font-weight: 800; color: #20df7f; margin-bottom: 4px;
        }
        .ftb-date-header svg { flex-shrink: 0; opacity: 0.7; }
        .ftb-date-count {
          margin-left: auto; font-size: 0.7rem; font-weight: 700;
          color: var(--muted); background: rgba(255,255,255,0.06);
          padding: 2px 8px; border-radius: 999px;
        }

        .ftb-match-list { display: flex; flex-direction: column; gap: 6px; }
        .ftb-match-row {
          display: grid; grid-template-columns: 100px 1fr auto; gap: 18px; align-items: center;
          padding: 14px 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,17,24,0.6); transition: all 0.2s;
        }
        .ftb-match-row:hover { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.12); transform: translateX(3px); }
        .ftb-match-row.is-featured { border-left: 3px solid var(--lc); }
        .ftb-match-row.is-past { opacity: 0.5; }

        .ftb-match-date { display: flex; flex-direction: column; gap: 2px; }
        .ftb-day { font-weight: 800; font-size: 0.85rem; }
        .ftb-time { color: var(--muted); font-size: 0.72rem; }
        .ftb-today-badge {
          display: inline-block; padding: 2px 6px; border-radius: 4px; margin-top: 4px;
          background: rgba(32,223,127,0.15); color: #20df7f; font-size: 0.6rem; font-weight: 900; width: fit-content;
        }

        .ftb-match-info { min-width: 0; }
        .ftb-teams { display: flex; align-items: center; gap: 8px; font-size: 0.92rem; flex-wrap: wrap; }
        .ftb-vs { color: var(--faint); font-weight: 400; font-size: 0.75rem; }
        .ftb-meta { display: flex; align-items: center; gap: 10px; margin-top: 6px; font-size: 0.72rem; color: var(--muted); flex-wrap: wrap; }
        .ftb-league-badge {
          padding: 2px 8px; border-radius: 999px; font-weight: 800;
          border: 1px solid; font-size: 0.65rem;
        }
        .ftb-venue { color: var(--faint); }

        .ftb-watch-btn {
          display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
          border-radius: 999px; border: 1px solid rgba(32,223,127,0.3);
          background: rgba(32,223,127,0.08); color: #20df7f; font-size: 0.78rem;
          font-weight: 750; cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .ftb-watch-btn:hover { background: rgba(32,223,127,0.18); border-color: #20df7f; transform: scale(1.05); box-shadow: 0 0 20px rgba(32,223,127,0.15); }

        /* Stream Overlay */
        .ftb-stream-overlay {
          position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          animation: fadeIn 0.2s ease;
        }
        .ftb-stream-modal {
          width: min(95vw, 1200px); height: min(88vh, 740px); border-radius: 20px;
          background: #0b1117; border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 100px rgba(0,0,0,0.6); display: flex; flex-direction: column;
          overflow: hidden; animation: slideInUp 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
        }
        .ftb-stream-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 22px; border-bottom: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.3);
        }
        .ftb-stream-header h3 { margin: 0; font-size: 1rem; }
        .ftb-stream-meta { color: var(--muted); font-size: 0.75rem; }
        .ftb-stream-actions { display: flex; align-items: center; gap: 10px; }
        .ftb-close-btn {
          width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: var(--muted); cursor: pointer;
          display: grid; place-items: center; transition: all 0.2s;
        }
        .ftb-close-btn:hover { background: rgba(255,49,74,0.15); border-color: rgba(255,49,74,0.3); color: #ff314a; }
        .ftb-stream-player { flex: 1; position: relative; }
        .ftb-stream-player iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

        @media (max-width: 768px) {
          .ftb-hero { grid-template-columns: 1fr; }
          .ftb-match-row { grid-template-columns: 80px 1fr; gap: 12px; }
          .ftb-watch-btn { grid-column: 1 / -1; justify-self: start; }
          .ftb-stream-modal { width: 98vw; height: 94vh; border-radius: 14px; }
          .ftb-inline-frame { height: 380px; }
          .ftb-section-nav { gap: 6px; }
          .ftb-section-btn { padding: 10px 14px; font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
}
