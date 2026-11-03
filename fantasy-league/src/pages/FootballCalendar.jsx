import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Radio, Search, Eye, Award, Shield, ExternalLink, Zap, MonitorPlay } from 'lucide-react';
import { MATCHES as LATEST_MATCHES, getLeagueById } from '../data/footballSchedule';
import { SportsurgeButton } from '../components/SportsurgeLinks';
import { useFootballFixtures, espnToMatch } from '../components/useEspnFixtures';

// Football calendar — latest 2026/27 fixtures (updated Oct 2026, from footballSchedule.js)
const footballScheduleMetadata = LATEST_MATCHES.map((m, i) => ({
  round: m.round,
  gp: `${m.home} vs ${m.away}`,
  type: m.league,
  leagueLabel: getLeagueById(m.league).label,
  venue: m.venue,
  matchTime: new Date(m.date).toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  status: new Date(m.date) < new Date() ? 'COMPLETED' : 'UPCOMING',
  countryCode: 'GB',
  _i: i,
}));

export default function FootballCalendar() {
  // Latest fixtures from ESPN (all leagues); static snapshot is the fallback
  const { fixtures: espnFixtures, lastUpdated, fromEspn } = useFootballFixtures({ daysPast: 3, daysAhead: 28 });
  const [dbMatches, setDbMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'etihad', 'anfield', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/matches?sport=football')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbMatches(data);
        }
      })
      .catch((err) => console.error('Error fetching Football matches:', err))
      .finally(() => setLoading(false));
  }, []);

  // ESPN first; merge database/static metadata only as offline fallback
  const calendarData = useMemo(() => {
    if (fromEspn) {
      return espnFixtures.map(espnToMatch).map((m, i) => ({
        round: m.round, gp: `${m.home} vs ${m.away}`, type: m.league,
        leagueLabel: getLeagueById(m.league).label, venue: m.venue || 'Venue TBD',
        matchTime: new Date(m.date).toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        status: m.status === 'completed' ? 'COMPLETED' : m.status === 'live' ? 'LIVE' : 'UPCOMING',
        homeScore: m.homeScore, awayScore: m.awayScore, _i: i, id: null,
      }));
    }
    return footballScheduleMetadata.map((meta) => {
      // Find matching database entry by title
      const dbMatch = dbMatches.find(
        (m) => m.title.toLowerCase().includes(meta.gp.toLowerCase()) || 
               meta.gp.toLowerCase().includes(m.title.toLowerCase())
      );

      return {
        ...meta,
        id: dbMatch?.id || null,
        venue: meta.venue || dbMatch?.venue || 'Venue TBD',
        status: meta.status,
        matchTime: meta.matchTime,
      };
    });
  }, [dbMatches, espnFixtures, fromEspn]);

  // Apply filters and search query
  const filteredCalendar = useMemo(() => {
    return calendarData.filter((match) => {
      const matchesSearch =
        match.gp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'upcoming') return match.status === 'UPCOMING';
      if (filter === 'completed') return match.status === 'COMPLETED';
      if (['pl', 'ucl', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'uel'].includes(filter)) return match.type === filter;
      return true;
    });
  }, [calendarData, filter, searchQuery]);

  return (
    <div className="page-shell" style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '100px' }}>
      {/* Top Banner Hero */}
      <section className="hero-layout" style={{ marginBottom: '40px' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--neon-blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} className="pulse" />
            OFFICIAL FOOTBALL 2026 SEASON PORTAL
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', margin: '10px 0' }}>
            Football <span>2026 Calendar</span>
          </h1>
          <p className="hero-copy">
            {fromEspn ? `Latest fixtures LIVE from ESPN — every major league, updated ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'now'} and auto-refreshing every minute.` : 'Explore the latest 2026/27 football calendar (ESPN offline — showing snapshot).'} Track live scores and stream match action live.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/watch-live?sport=football"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.85rem',
                letterSpacing: '1px'
              }}
            >
              <Radio size={16} /> Watch Live Stream
            </Link>
            <Link
              to="/live-streams?sport=football"
              className="ghost-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', textDecoration: 'none', color: '#ff8a1c', borderColor: 'rgba(255,138,28,0.4)', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              <MonitorPlay size={16} /> Football Live Streams
            </Link>
            <Link to="/live-streams?sport=football" style={{ alignSelf: 'center', color: '#ff8a1c', fontWeight: 700, fontSize: '0.82rem' }}>
              All live streams →
            </Link>
          </div>
        </div>

        <div className="hero-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--gold-glow)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-heading)', letterSpacing: '2px', marginBottom: '8px' }}>
              CHAMPIONSHIP PARTNER
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 12px 0' }}>FOFA Live Broadcast</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Enjoy high-definition streams of every tackle, goal, and tactical masterclass live on our built-in player.
            </p>
            <Link
              to="/watch-live?sport=football"
              className="ghost-button"
              style={{ marginTop: '16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
            >
              Launch Live Player
            </Link>
            <Link
              to="/live-streams?sport=football"
              className="ghost-button"
              style={{ marginTop: '10px', fontSize: '0.8rem', width: '100%', justifyContent: 'center', color: '#ff8a1c', borderColor: 'rgba(255,138,28,0.4)', textDecoration: 'none' }}
            >
              <MonitorPlay size={14} /> Watch Live
            </Link>
          </div>
        </div>
      </section>

      {/* Filters Toolbar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          padding: '16px 24px',
          marginBottom: '32px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Matches' },
            { id: 'pl', label: 'Premier League' },
            { id: 'ucl', label: 'Champions League' },
            { id: 'laliga', label: 'La Liga' },
            { id: 'seriea', label: 'Serie A' },
            { id: 'bundesliga', label: 'Bundesliga' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Finished' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '8px 16px',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '8px',
                background: filter === tab.id ? 'var(--neon-blue)' : 'rgba(255,255,255,0.02)',
                color: filter === tab.id ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-heading)',
                transition: 'all 0.3s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search match or stadium..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 38px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Grid of Calendar Cards */}
      {loading ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Loading Football Schedule...</div>
          </div>
        </div>
      ) : filteredCalendar.length > 0 ? (
        <div className="score-grid">
          {filteredCalendar.map((match, index) => {
            const isCompleted = match.status === 'COMPLETED';
            const isLive = match.status === 'LIVE';

            const borderTopColor = 
              match.type === 'ucl' ? 'var(--gold)' : 'var(--neon-blue)';

            return (
              <div
                key={`${match.round}-${match._i}`}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  position: 'relative',
                  borderTop: `2px solid ${borderTopColor}`,
                  animation: `fadeInUp 0.4s ease forwards`,
                  animationDelay: `${index * 40}ms`
                }}
              >
                <div>
                  {/* Top line metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                      {match.round} • {(match.leagueLabel || 'FOOTBALL').toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          background: match.type === 'etihad' ? 'rgba(0,192,249,0.1)' : 'rgba(225,6,0,0.1)',
                          border: `1px solid ${match.type === 'ucl' ? 'var(--gold)' : 'var(--neon-blue)'}`,
                          color: match.type === 'ucl' ? 'var(--gold)' : 'var(--neon-blue)',
                          fontSize: '0.6rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                        }}
                      >
                        {(match.leagueLabel || 'MATCH').toUpperCase()}
                      </span>
                      {isLive ? (
                        <span className="live-badge">LIVE</span>
                      ) : isCompleted ? (
                        <span style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          Final
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(0,192,249,0.08)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', color: 'var(--neon-blue)' }}>
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Match Title */}
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '42px', overflow: 'hidden' }}>
                    {match.gp}
                    {(match.status === 'COMPLETED' || match.status === 'LIVE') && match.homeScore !== undefined && (
                      <span style={{ color: match.status === 'LIVE' ? '#ff314a' : 'var(--gold)', fontWeight: 900 }}>{match.homeScore}–{match.awayScore}</span>
                    )}
                  </h3>

                  {/* Date & Venue */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} color="var(--neon-blue)" />
                      {match.matchTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={14} color="var(--neon-blue)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {match.venue}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Trophy size={14} color="var(--gold)" />
                      <span>2026/27 Season • Premier League</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: match.id ? '1fr 1fr' : '1fr', gap: '10px', marginTop: '12px' }}>
                  <Link
                    to="/watch-live?sport=football"
                    className="ghost-button"
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      padding: '10px',
                      textDecoration: 'none',
                      color: 'var(--neon-blue)',
                      borderColor: 'rgba(0, 192, 249, 0.3)'
                    }}
                  >
                    <Eye size={14} /> Watch Live
                  </Link>
                  <SportsurgeButton sport="football" match={match.gp} style={{ width: '100%' }} />

                  {match.id && (
                    <button
                      onClick={() => navigate(`/match/${match.id}`)}
                      className="btn-primary"
                      style={{
                        padding: '10px',
                        fontSize: '0.75rem',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trophy size={13} /> Play Fantasy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">No matching Football matches found. Try selecting another filter!</div>
      )}
    </div>
  );
}
