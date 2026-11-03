import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, RefreshCw, Tv, Trophy, Flag, PlayCircle } from 'lucide-react';
import SportTabs from '../components/SportTabs';
import { fetchAllScores, getScoreSummary, SPORT_CATALOG } from '../data/liveSports';

function getSportIcon(sportId, size = 16) {
  if (sportId === 'cricket') return <Trophy size={size} style={{ color: '#a855f7' }} />;
  if (sportId === 'f1') return <Flag size={size} style={{ color: '#ff314a' }} />;
  if (sportId === 'football') return <PlayCircle size={size} style={{ color: '#00c0f9' }} />;
  return <Tv size={size} />;
}

function ScoreCard({ score, onOpen }) {
  const sport = SPORT_CATALOG.find((item) => item.id === score.sportId) || SPORT_CATALOG[0];
  const isLive = score.statusState === 'in';

  return (
    <button type="button" className="score-card" onClick={onOpen}>
      <div className="score-topline">
        <span className="sport-pill">
          {getSportIcon(score.sportId, 16)}
          {sport.label}
        </span>
        <span className={`status-pill ${isLive ? 'is-live' : ''}`}>{score.statusText || 'Scheduled'}</span>
      </div>

      <div className="teams-row">
        <div className="team-name">{score.home}</div>
        <div className="score-number">{getScoreSummary(score)}</div>
        <div className="team-name">{score.away}</div>
      </div>

      <div className="score-meta">
        <strong>{score.competition}</strong>
        <br />
        {score.venue || sport.sourceLabel}
      </div>

      <span className="ghost-button" style={{ fontSize: '0.8rem', marginTop: '12px' }}>
        Open feed <ArrowRight size={14} />
      </span>
    </button>
  );
}

function HubCard({ group, onOpen }) {
  const live = group.scores.filter((score) => score.statusState === 'in').length;
  const upcoming = group.scores.filter((score) => score.statusState === 'pre').length;
  const final = group.scores.filter((score) => score.statusState === 'post').length;

  return (
    <button
      type="button"
      className="category-tile"
      onClick={onOpen}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '20px',
        width: '100%',
        aspectRatio: 'auto',
        minHeight: '140px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 'bold', color: '#ffffff' }}>
        {getSportIcon(group.sport.id, 20)}
        {group.sport.label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: '8px 0' }}>{group.scores.length} Events</div>
      <div className="score-meta" style={{ textAlign: 'left' }}>
        {live} live • {upcoming} scheduled • {final} final
      </div>
    </button>
  );
}

export default function LiveTracking({ activeSport, setActiveSport }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadScores = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    fetchAllScores()
      .then((results) => {
        setGroups(results);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchAllScores()
      .then((results) => {
        if (!mounted) return;
        setGroups(results);
        setLastUpdated(new Date());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return undefined;
    const id = setInterval(() => loadScores(false), 30000);
    return () => clearInterval(id);
  }, [autoRefresh, loadScores]);

  const visibleGroups = activeSport === 'all' ? groups : groups.filter((group) => group.sport.id === activeSport);
  const allScores = visibleGroups
    .flatMap((group) => group.scores)
    .sort((a, b) => {
      const order = { in: 0, pre: 1, post: 2 };
      return (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1);
    });

  const totals = useMemo(
    () => ({
      live: allScores.filter((score) => score.statusState === 'in').length,
      upcoming: allScores.filter((score) => score.statusState === 'pre').length,
      final: allScores.filter((score) => score.statusState === 'post').length,
    }),
    [allScores]
  );

  return (
    <div className="page-shell">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
        <div>
          <div className="eyebrow" style={{ color: '#ff4b44' }}>FOFA Sports Telemetry Desk</div>
          <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: 10, color: '#ffffff' }}>
            Arena Live Center
          </h1>
          <p className="hero-copy">
            Dynamic telemetry feeds refresh every 30 seconds. Track Football, Cricket, and Formula 1 matches side-by-side.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="ghost-button" type="button" onClick={loadScores}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
          <label className="toggle-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#8f98a9', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
            Auto refresh
          </label>
        </div>
      </div>

      {lastUpdated && <div className="section-note" style={{ marginBottom: 16 }}>Last updated {lastUpdated.toLocaleTimeString()}</div>}

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* Stream Alert Panel */}
      <div className="glass-panel" style={{
        margin: '20px 0',
        padding: '16px 24px',
        background: 'linear-gradient(90deg, rgba(31, 128, 224, 0.15) 0%, rgba(3, 11, 23, 0.2) 100%)',
        borderLeft: '4px solid #ff4b44',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Tv size={20} color="#ff4b44" style={{ minWidth: '20px' }} />
          <span style={{ fontSize: '0.9rem', color: '#ffffff' }}>
            <strong>Live Multicast:</strong> Watch F1, Cricket and Football embedded streams directly on this platform — no external sites, everything plays inside FOFA Arena.
          </span>
        </div>
        <Link
          to="/watch-live"
          className="submit-btn"
          style={{
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '8px 20px',
            width: 'auto',
            marginTop: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Watch Broadcasts <ArrowRight size={14} />
        </Link>
      </div>

      <div className="stat-grid">
        {[
          { label: 'Live now', value: totals.live, color: '#ff2e55' },
          { label: 'Upcoming', value: totals.upcoming, color: '#ff4b44' },
          { label: 'Completed', value: totals.final, color: '#f3c623' },
          { label: 'Sports', value: visibleGroups.length, color: '#ffffff' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {loading && !groups.length ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Collecting scoreboards...</div>
          </div>
        </div>
      ) : (
        <>
          <div className="section-head">
            <h2>Sports Categories</h2>
            <span className="section-note">Click a card for full dashboard</span>
          </div>
          <div className="category-tiles-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {visibleGroups.map((group) => (
              <HubCard key={group.sport.id} group={group} onOpen={() => navigate(`/live/${group.sport.id}`)} />
            ))}
          </div>

          <div className="section-head">
            <h2>Live Telemetry Wall</h2>
            <span className="section-note">{allScores.length} feeds loaded</span>
          </div>

          {allScores.length ? (
            <div className="score-grid" style={{ flexWrap: 'wrap', overflowX: 'visible' }}>
              {allScores.map((score) => (
                <ScoreCard key={score.id} score={score} onOpen={() => navigate(`/live/${score.sportId}`)} />
              ))}
            </div>
          ) : (
            <div className="empty-state">No score feeds available under this category.</div>
          )}
        </>
      )}
    </div>
  );
}
