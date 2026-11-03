import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Radio, Search, Eye, Award, Shield } from 'lucide-react';

// Football 2026 schedule static metadata to merge with DB matches
const footballScheduleMetadata = Array.from({ length: 38 }, (_, i) => {
  const round = i + 1;
  const isManCityHome = round % 2 !== 0;
  return {
    round,
    gp: isManCityHome ? `Premier League Round ${round}: Man City vs Liverpool` : `Premier League Round ${round}: Liverpool vs Man City`,
    type: isManCityHome ? 'etihad' : 'anfield',
    countryCode: 'GB'
  };
});

export default function FootballCalendar() {
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

  // Merge database match data with static metadata
  const calendarData = useMemo(() => {
    return footballScheduleMetadata.map((meta) => {
      // Find matching database entry by title
      const dbMatch = dbMatches.find(
        (m) => m.title.toLowerCase().includes(meta.gp.toLowerCase()) || 
               meta.gp.toLowerCase().includes(m.title.toLowerCase())
      );

      return {
        ...meta,
        id: dbMatch?.id || null,
        venue: dbMatch?.venue || 'Venue TBD',
        prize: dbMatch?.prize || 'INR 15K',
        status: dbMatch?.status || 'UPCOMING',
        matchTime: dbMatch?.matchTime || `TBD, 2026`
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
      if (filter === 'etihad') return match.type === 'etihad';
      if (filter === 'anfield') return match.type === 'anfield';
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
            Explore the complete 38-round Premier League head-to-head campaign for 2026. Draft your ultimate fantasy roster, track live goal-scoring metrics, and stream match action live.
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
            { id: 'etihad', label: 'Etihad Stadium' },
            { id: 'anfield', label: 'Anfield' },
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
              match.type === 'etihad' ? 'var(--neon-blue)' : 'var(--neon-red)';

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
                      ROUND {match.round} • PREMIER LEAGUE
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span
                        style={{
                          background: match.type === 'etihad' ? 'rgba(0,192,249,0.1)' : 'rgba(225,6,0,0.1)',
                          border: `1px solid ${match.type === 'etihad' ? 'var(--neon-blue)' : 'var(--neon-red)'}`,
                          color: match.type === 'etihad' ? 'var(--neon-blue)' : 'var(--neon-red)',
                          fontSize: '0.6rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                        }}
                      >
                        {match.type === 'etihad' ? 'HOME' : 'AWAY'}
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
                      <span>Fantasy Prize Pool: {match.prize}</span>
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
