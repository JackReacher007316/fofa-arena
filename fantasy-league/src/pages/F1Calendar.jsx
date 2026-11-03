import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Radio, ExternalLink, Flame, Search, Grid, Eye } from 'lucide-react';

// F1 2026 schedule static metadata to merge with DB matches
const f1ScheduleMetadata = [
  { round: 1, gp: 'Australian Grand Prix', dateRange: 'March 6–8', sprint: false, countryCode: 'AU' },
  { round: 2, gp: 'Chinese Grand Prix', dateRange: 'March 13–15', sprint: true, countryCode: 'CN' },
  { round: 3, gp: 'Japanese Grand Prix', dateRange: 'March 27–29', sprint: false, countryCode: 'JP' },
  { round: 4, gp: 'Bahrain Grand Prix', dateRange: 'April 10–12', sprint: false, countryCode: 'BH' },
  { round: 5, gp: 'Saudi Arabian Grand Prix', dateRange: 'April 17–19', sprint: false, countryCode: 'SA' },
  { round: 6, gp: 'Miami Grand Prix', dateRange: 'May 1–3', sprint: true, countryCode: 'US' },
  { round: 7, gp: 'Canadian Grand Prix', dateRange: 'May 22–24', sprint: true, countryCode: 'CA' },
  { round: 8, gp: 'Spanish Grand Prix', dateRange: 'June 12–14', sprint: false, countryCode: 'ES' },
  { round: 9, gp: 'Austrian Grand Prix', dateRange: 'June 26–28', sprint: false, countryCode: 'AT' },
  { round: 10, gp: 'British Grand Prix', dateRange: 'July 3–5', sprint: true, countryCode: 'GB' },
  { round: 11, gp: 'Belgian Grand Prix', dateRange: 'July 17–19', sprint: false, countryCode: 'BE' },
  { round: 12, gp: 'Hungarian Grand Prix', dateRange: 'July 24–26', sprint: false, countryCode: 'HU' },
  { round: 13, gp: 'Dutch Grand Prix', dateRange: 'August 21–23', sprint: true, countryCode: 'NL' },
  { round: 14, gp: 'Italian Grand Prix', dateRange: 'September 4–6', sprint: false, countryCode: 'IT' },
  { round: 15, gp: 'Azerbaijan Grand Prix', dateRange: 'September 25–27', sprint: false, countryCode: 'AZ' },
  { round: 16, gp: 'Singapore Grand Prix', dateRange: 'October 9–11', sprint: true, countryCode: 'SG' },
  { round: 17, gp: 'United States Grand Prix', dateRange: 'October 23–25', sprint: false, countryCode: 'US' },
  { round: 18, gp: 'Mexico City Grand Prix', dateRange: 'October 30 – November 1', sprint: false, countryCode: 'MX' },
  { round: 19, gp: 'São Paulo Grand Prix', dateRange: 'November 6–8', sprint: false, countryCode: 'BR' },
  { round: 20, gp: 'Las Vegas Grand Prix', dateRange: 'November 19–21', sprint: false, countryCode: 'US' },
  { round: 21, gp: 'Qatar Grand Prix', dateRange: 'November 27–29', sprint: false, countryCode: 'QA' },
  { round: 22, gp: 'Abu Dhabi Grand Prix', dateRange: 'December 4–6', sprint: false, countryCode: 'AE' }
];

export default function F1Calendar() {
  const [dbMatches, setDbMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'sprint', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/matches?sport=f1')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbMatches(data);
        }
      })
      .catch((err) => console.error('Error fetching F1 matches:', err))
      .finally(() => setLoading(false));
  }, []);

  // Merge database match data with static metadata
  const calendarData = useMemo(() => {
    return f1ScheduleMetadata.map((meta) => {
      // Find matching database entry by title
      const dbMatch = dbMatches.find(
        (m) => m.title.toLowerCase().includes(meta.gp.toLowerCase())
      );

      return {
        ...meta,
        id: dbMatch?.id || null,
        venue: dbMatch?.venue || 'Circuit Layout Pending',
        prize: dbMatch?.prize || 'INR 30K',
        status: dbMatch?.status || 'UPCOMING',
        matchTime: dbMatch?.matchTime || `${meta.dateRange}, 2026`
      };
    });
  }, [dbMatches]);

  // Apply filters and search query
  const filteredCalendar = useMemo(() => {
    return calendarData.filter((race) => {
      const matchesSearch =
        race.gp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        race.venue.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'upcoming') return race.status === 'UPCOMING';
      if (filter === 'completed') return race.status === 'COMPLETED';
      if (filter === 'sprint') return race.sprint === true;
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
            OFFICIAL F1 2026 SEASON PORTAL
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', margin: '10px 0' }}>
            Grand Prix <span>2026 Calendar</span>
          </h1>
          <p className="hero-copy">
            Explore the complete 22-round Formula 1 2026 Championship calendar. Build your elite garage, check pitlane sessions, and watch every live broadcast link below.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/watch-live"
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
              <Radio size={16} /> Watch Races Live
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
              Stream every practice, qualifying, and grand prix session live with zero delays.
            </p>
            <Link
              to="/watch-live"
              className="ghost-button"
              style={{ marginTop: '16px', fontSize: '0.8rem', width: '100%', justifyContent: 'center' }}
            >
              Launch Live Player <ExternalLink size={14} />
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
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'sprint', label: 'Sprints Only' },
            { id: 'completed', label: 'Podiums' }
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
            placeholder="Search grand prix or circuit..."
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
            <div>Loading 2026 Schedule...</div>
          </div>
        </div>
      ) : filteredCalendar.length > 0 ? (
        <div className="score-grid">
          {filteredCalendar.map((race, index) => {
            const isCompleted = race.status === 'COMPLETED';
            const isLive = race.status === 'LIVE';

            return (
              <div
                key={race.round}
                className="glass-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px',
                  position: 'relative',
                  borderTop: race.sprint ? '2px solid var(--gold)' : '2px solid var(--neon-blue)',
                  animation: `fadeInUp 0.4s ease forwards`,
                  animationDelay: `${index * 40}ms`
                }}
              >
                <div>
                  {/* Top line metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                      ROUND {race.round}
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {race.sprint && (
                        <span
                          style={{
                            background: 'rgba(243,198,35,0.1)',
                            border: '1px solid var(--gold)',
                            color: 'var(--gold)',
                            fontSize: '0.6rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Flame size={10} /> SPRINT
                        </span>
                      )}
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

                  {/* Grand Prix Name & Country Flag Emoji */}
                  <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {race.gp}
                  </h3>

                  {/* Date & Track */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} color="var(--neon-pink)" />
                      {race.matchTime}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <MapPin size={14} color="var(--neon-blue)" />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {race.venue}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Trophy size={14} color="var(--gold)" />
                      <span>Fantasy Prize Pool: {race.prize}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: race.id ? '1fr 1fr' : '1fr', gap: '10px', marginTop: '12px' }}>
                  <Link
                    to="/watch-live"
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

                  {race.id && (
                    <button
                      onClick={() => navigate(`/match/${race.id}`)}
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
        <div className="empty-state">No matching F1 Grand Prix matches found. Try selecting another filter!</div>
      )}
    </div>
  );
}
