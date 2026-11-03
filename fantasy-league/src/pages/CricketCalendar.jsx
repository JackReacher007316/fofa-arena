import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Radio, Search, Eye, Award, Shield } from 'lucide-react';

// Cricket 2026 schedule static metadata to merge with DB matches
const cricketScheduleMetadata = [
  { round: 1, gp: 'IPL Round 1: CSK vs RCB', dateRange: 'Jan 15', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 2, gp: 'BGT Round 2: AUS vs IND (1st Test)', dateRange: 'Jan 29', format: 'Test', type: 'international', countryCode: 'AU' },
  { round: 3, gp: 'IPL Round 3: RCB vs CSK', dateRange: 'Feb 12', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 4, gp: 'T20 Cup Round 4: IND vs AUS', dateRange: 'Feb 26', format: 'T20', type: 'international', countryCode: 'IN' },
  { round: 5, gp: 'IPL Round 5: CSK vs RCB', dateRange: 'Mar 12', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 6, gp: 'BGT Round 6: AUS vs IND (2nd Test)', dateRange: 'Mar 26', format: 'Test', type: 'international', countryCode: 'AU' },
  { round: 7, gp: 'IPL Round 7: RCB vs CSK', dateRange: 'Apr 9', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 8, gp: 'ODI Series Round 8: IND vs AUS (1st ODI)', dateRange: 'Apr 23', format: 'ODI', type: 'international', countryCode: 'IN' },
  { round: 9, gp: 'IPL Round 9: CSK vs RCB', dateRange: 'May 7', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 10, gp: 'BGT Round 10: AUS vs IND (3rd Test)', dateRange: 'May 21', format: 'Test', type: 'international', countryCode: 'AU' },
  { round: 11, gp: 'IPL Round 11: RCB vs CSK', dateRange: 'Jun 4', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 12, gp: 'T20 Series Round 12: IND vs AUS (1st T20I)', dateRange: 'Jun 18', format: 'T20', type: 'international', countryCode: 'IN' },
  { round: 13, gp: 'IPL Round 13: CSK vs RCB', dateRange: 'Jul 2', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 14, gp: 'BGT Round 14: AUS vs IND (4th Test)', dateRange: 'Jul 16', format: 'Test', type: 'international', countryCode: 'AU' },
  { round: 15, gp: 'IPL Round 15: RCB vs CSK', dateRange: 'Jul 30', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 16, gp: 'T20 Series Round 16: IND vs AUS (2nd T20I)', dateRange: 'Aug 13', format: 'T20', type: 'international', countryCode: 'IN' },
  { round: 17, gp: 'IPL Round 17: CSK vs RCB (IPL Final)', dateRange: 'Aug 27', format: 'T20', type: 'ipl', countryCode: 'IN' },
  { round: 18, gp: 'BGT Round 18: AUS vs IND (5th Test)', dateRange: 'Sep 10', format: 'Test', type: 'international', countryCode: 'AU' },
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
        prize: dbMatch?.prize || 'INR 25K',
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
            OFFICIAL CRICKET 2026 SEASON PORTAL
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', margin: '10px 0' }}>
            Cricket <span>2026 Calendar</span>
          </h1>
          <p className="hero-copy">
            Explore the complete 18-round Cricket championship calendar for 2026. Build your winning fantasy squad, track live ball-by-ball contests, and stream match actions live.
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
                      <span>Fantasy Prize Pool: {match.prize}</span>
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
