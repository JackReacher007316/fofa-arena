import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Radio, Search, Eye, Award, Shield } from 'lucide-react';

// Cricket calendar — latest 2026–27 India/international series (updated 21 Oct 2026)
const cricketScheduleMetadata = [
  { round: 1, gp: 'NZ vs India — T20I Series (5 matches)', dateRange: 'Oct 22 – Nov 1, 2026', format: 'T20I', type: 'international', countryCode: 'NZ' },
  { round: 2, gp: 'NZ vs India — ODI Series (5 matches)', dateRange: 'Nov 4–15, 2026', format: 'ODI', type: 'international', countryCode: 'NZ' },
  { round: 3, gp: 'NZ vs India — 1st Test (Wellington)', dateRange: 'Nov 19–23, 2026', format: 'Test', type: 'international', countryCode: 'NZ' },
  { round: 4, gp: 'NZ vs India — 2nd Test (Christchurch)', dateRange: 'Nov 27 – Dec 1, 2026', format: 'Test', type: 'international', countryCode: 'NZ' },
  { round: 5, gp: 'Australia vs England — Ashes Series', dateRange: 'Nov 2026 – Jan 2027', format: 'Test', type: 'international', countryCode: 'AU' },
  { round: 6, gp: 'India vs Sri Lanka — 1st ODI (Delhi)', dateRange: 'Dec 13, 2026', format: 'ODI', type: 'international', countryCode: 'IN' },
  { round: 7, gp: 'India vs Sri Lanka — 2nd ODI (Bengaluru)', dateRange: 'Dec 16, 2026', format: 'ODI', type: 'international', countryCode: 'IN' },
  { round: 8, gp: 'India vs Sri Lanka — 3rd ODI (Ahmedabad)', dateRange: 'Dec 19, 2026', format: 'ODI', type: 'international', countryCode: 'IN' },
  { round: 9, gp: 'India vs Sri Lanka — T20I Series (Rajkot · Cuttack · Pune)', dateRange: 'Dec 22–27, 2026', format: 'T20I', type: 'international', countryCode: 'IN' },
  { round: 10, gp: 'India vs Zimbabwe — ODI Series (3 matches)', dateRange: 'Jan 3–9, 2027', format: 'ODI', type: 'international', countryCode: 'IN' },
  { round: 11, gp: 'India vs Australia — Test Series (Nagpur opener)', dateRange: 'Jan 21 – Feb 2027', format: 'Test', type: 'international', countryCode: 'IN' },
  { round: 12, gp: 'IPL 2027 — Indian Premier League', dateRange: 'Mar – May 2027 (tentative)', format: 'T20', type: 'ipl', countryCode: 'IN' },
];

export default function CricketCalendar() {
  const [dbMatches, setDbMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'ipl', 'international', 'upcoming', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/matches?sport=cricket')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbMatches(data);
        }
      })
      .catch((err) => console.error('Error fetching Cricket matches:', err))
      .finally(() => setLoading(false));
  }, []);

  // Merge database match data with static metadata
  const calendarData = useMemo(() => {
    return cricketScheduleMetadata.map((meta) => {
      // Find matching database entry by title
      const dbMatch = dbMatches.find(
        (m) => m.title.toLowerCase().includes(meta.gp.toLowerCase()) || 
               meta.gp.toLowerCase().includes(m.title.toLowerCase())
      );

      return {
        ...meta,
        id: dbMatch?.id || null,
        venue: dbMatch?.venue || 'Venue TBD',
        formatInfo: meta.format,
        status: dbMatch?.status || 'UPCOMING',
        matchTime: dbMatch?.matchTime || `${meta.dateRange}, 2026 • 7:30 PM`
      };
    });
  }, [dbMatches]);

  // Apply filters and search query
  const filteredCalendar = useMemo(() => {
    return calendarData.filter((match) => {
      const matchesSearch =
        match.gp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.venue.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'upcoming') return match.status === 'UPCOMING';
      if (filter === 'completed') return match.status === 'COMPLETED';
      if (filter === 'ipl') return match.type === 'ipl';
      if (filter === 'international') return match.type === 'international';
      return true;
    });
  }, [calendarData, filter, searchQuery]);

  return (
    <div className="page-shell" style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '100px' }}>
      {/* Top Banner Hero */}
      <section className="hero-layout" style={{ marginBottom: '40px' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--neon-pink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} className="pulse" />
            LATEST CRICKET 2026–27 SEASON PORTAL
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', margin: '10px 0' }}>
            Cricket <span>2026–27 Calendar</span>
          </h1>
          <p className="hero-copy">
            Explore the latest 2026–27 cricket calendar — India's New Zealand tour, Sri Lanka home series, the Ashes and IPL 2027 (updated Oct 2026). Track live ball-by-ball scores and stream match action live.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/watch-live?sport=cricket"
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
              <Radio size={16} /> Watch Matches Live
            </Link>
          </div>
        </div>

        <div className="hero-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid var(--gold-glow)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontFamily: 'var(--font-heading)', letterSpacing: '2px', marginBottom: '8px' }}>
              CHAMPIONSHIP PARTNER
            </div>
            <h3 style={{ fontSize: '1.25rem', margin: '0 0 12px 0' }}>FOFA Live Streaming</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Stream every boundary, wicket, and post-match ceremony live in ultra low latency.
            </p>
            <Link
              to="/watch-live?sport=cricket"
              className="ghost-button"
              style={{ marginTop: '16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
            >
              Launch Live Player
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
            { id: 'all', label: 'All Rounds' },
            { id: 'ipl', label: 'IPL Sched' },
            { id: 'international', label: 'International' },
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
                background: filter === tab.id ? 'var(--neon-purple)' : 'rgba(255,255,255,0.02)',
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
            <div>Loading Cricket Schedule...</div>
          </div>
        </div>
      ) : filteredCalendar.length > 0 ? (
        <div className="score-grid">
          {filteredCalendar.map((match, index) => {
            const isCompleted = match.status === 'COMPLETED';
            const isLive = match.status === 'LIVE';

            const borderTopColor = 
              match.format === 'Test' ? 'var(--neon-pink)' : 
              match.format === 'ODI' ? 'var(--gold)' : 'var(--neon-purple)';

            return (
              <div
                key={match.round}
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
                      ROUND {match.round} • {match.format}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          background: match.type === 'ipl' ? 'rgba(93,42,143,0.1)' : 'rgba(255,49,74,0.1)',
                          border: `1px solid ${match.type === 'ipl' ? 'var(--neon-purple)' : 'var(--neon-pink)'}`,
                          color: match.type === 'ipl' ? 'var(--neon-purple)' : 'var(--neon-pink)',
                          fontSize: '0.6rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                        }}
                      >
                        {match.type.toUpperCase()}
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
                  <h3 style={{ fontSize: '1.15rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px', height: '42px', overflow: 'hidden' }}>
                    {match.gp}
                  </h3>

                  {/* Date & Venue */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} color="var(--neon-pink)" />
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
                      <span>{match.formatInfo || match.format} • {match.dateRange}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: match.id ? '1fr 1fr' : '1fr', gap: '10px', marginTop: '12px' }}>
                  <Link
                    to="/watch-live?sport=cricket"
                    className="ghost-button"
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      padding: '10px',
                      textDecoration: 'none',
                      color: 'var(--neon-pink)',
                      borderColor: 'rgba(255, 49, 74, 0.3)'
                    }}
                  >
                    <Eye size={14} /> Watch Live
                  </Link>

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
        <div className="empty-state">No matching Cricket matches found. Try selecting another filter!</div>
      )}
    </div>
  );
}
