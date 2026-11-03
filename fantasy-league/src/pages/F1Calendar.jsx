import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Radio, ExternalLink, Flame, Search, Grid, Eye, Zap, MonitorPlay } from 'lucide-react';
import { SportsurgeButton } from '../components/SportsurgeLinks';
import { useF1Schedule } from '../components/useEspnFixtures';

// F1 calendar — updated 21 Oct 2026 (23 rounds in 2026 + 2027 preview below)
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
  { round: 15, gp: 'Spanish Grand Prix (Madrid)', dateRange: 'September 11–13', sprint: false, countryCode: 'ES' },
  { round: 16, gp: 'Azerbaijan Grand Prix', dateRange: 'September 24–26', sprint: false, countryCode: 'AZ' },
  { round: 17, gp: 'Singapore Grand Prix', dateRange: 'October 9–11', sprint: true, countryCode: 'SG' },
  { round: 18, gp: 'United States Grand Prix', dateRange: 'October 23–25', sprint: false, countryCode: 'US' },
  { round: 19, gp: 'Mexico City Grand Prix', dateRange: 'October 30 – November 1', sprint: false, countryCode: 'MX' },
  { round: 20, gp: 'São Paulo Grand Prix', dateRange: 'November 6–8', sprint: false, countryCode: 'BR' },
  { round: 21, gp: 'Las Vegas Grand Prix', dateRange: 'November 19–21', sprint: false, countryCode: 'US' },
  { round: 22, gp: 'Qatar Grand Prix', dateRange: 'November 27–29', sprint: true, countryCode: 'QA' },
  { round: 23, gp: 'Abu Dhabi Grand Prix', dateRange: 'December 4–6', sprint: false, countryCode: 'AE' }
];

export default function F1Calendar() {
  // Live F1 schedule (GP dates/circuits/sessions) straight from ESPN
  const { events: espnGps, lastUpdated: f1Updated, fromEspn: f1FromEspn } = useF1Schedule();
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
    const espnByKey = (gp) => espnGps.find((e) => {
      const a = gp.toLowerCase(); const b = (e.gp || '').toLowerCase();
      return a.includes(b.split(' grand')[0]) || b.includes(a.split(' grand')[0]) ||
        a.split(' ')[0] === b.split(' ')[0];
    });
    return f1ScheduleMetadata.map((meta) => {
      const espn = espnByKey(meta.gp);
      // Find matching database entry by title
      const dbMatch = dbMatches.find(
        (m) => m.title.toLowerCase().includes(meta.gp.toLowerCase())
      );

      return {
        ...meta,
        ...(espn ? {
          dateRange: new Date(espn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          espnCircuit: espn.circuit,
        } : {}),
        id: dbMatch?.id || null,
        venue: dbMatch?.venue || espn?.circuit || espn?.venue || 'Circuit Layout Pending',
        format: meta.sprint ? 'Sprint Weekend' : 'Race Weekend',
        status: dbMatch?.status || 'UPCOMING',
        matchTime: dbMatch?.matchTime || (espn?.date ? new Date(espn.date).toLocaleString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : `${meta.dateRange}, 2026`)
      };
    });
  }, [dbMatches, espnGps]);

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
            {f1FromEspn ? `Formula 1 schedule LIVE from ESPN${f1Updated ? ` • updated ${f1Updated.toLocaleTimeString()}` : ''} — latest Grand Prix dates & sessions, on top of the full 23-round 2026 + announced 2027 calendars below.` : 'Explore the complete 23-round Formula 1 2026 Championship calendar plus the announced 24-round 2027 calendar below.'} Check pitlane sessions and watch every live broadcast link.
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
            <Link
              to="/live-streams?sport=f1"
              className="ghost-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', textDecoration: 'none', color: '#ff8a1c', borderColor: 'rgba(255,138,28,0.4)', fontWeight: 'bold', fontSize: '0.85rem' }}
            >
              <MonitorPlay size={16} /> F1 Live Streams
            </Link>
            <Link to="/live-streams?sport=f1" style={{ alignSelf: 'center', color: '#ff8a1c', fontWeight: 700, fontSize: '0.82rem' }}>
              All live streams →
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
            <Link
              to="/live-streams?sport=f1"
              className="ghost-button"
              style={{ marginTop: '10px', fontSize: '0.8rem', width: '100%', justifyContent: 'center', color: '#ff8a1c', borderColor: 'rgba(255,138,28,0.4)', textDecoration: 'none' }}
            >
              <MonitorPlay size={14} /> Watch F1 Live
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
                      <span>{race.format || 'Race Weekend'} • 2026 Season</span>
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
                  <SportsurgeButton sport="f1" match={race} style={{ width: '100%' }} />

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

      {/* 2027 Calendar Preview — announced Sep 2026, 24 rounds */}
      <div className="section-head" style={{ marginTop: '36px' }}>
        <h2>🏁 F1 2027 Calendar — Announced</h2>
        <span className="section-note">24 rounds • Bahrain opener Mar 12–14 • 10 Sprints</span>
      </div>
      <div className="score-grid">
        {F1_2027_PREVIEW.map((r) => (
          <div key={r.round} className="glass-panel" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 800 }}>2027 • ROUND {r.round}{r.sprint ? ' • SPRINT' : ''}</div>
            <h3 style={{ margin: '6px 0', fontSize: '1rem' }}>{r.gp}</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(`${r.date}T12:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {r.circuit}</div>
            <div style={{ marginTop: '12px' }}><SportsurgeButton sport="f1" match={r} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

const F1_2027_PREVIEW = [
  { round: 1, gp: 'Bahrain Grand Prix', date: '2027-03-14', circuit: 'Sakhir', sprint: true },
  { round: 2, gp: 'Saudi Arabian Grand Prix', date: '2027-03-21', circuit: 'Jeddah', sprint: false },
  { round: 3, gp: 'Australian Grand Prix', date: '2027-04-04', circuit: 'Melbourne', sprint: true },
  { round: 4, gp: 'Japanese Grand Prix', date: '2027-04-11', circuit: 'Suzuka', sprint: true },
  { round: 6, gp: 'Miami Grand Prix', date: '2027-05-02', circuit: 'Miami', sprint: false },
  { round: 8, gp: 'Monaco Grand Prix', date: '2027-06-06', circuit: 'Monaco', sprint: true },
  { round: 9, gp: 'Portuguese Grand Prix', date: '2027-06-20', circuit: 'Portimão (returning)', sprint: false },
  { round: 10, gp: 'British Grand Prix', date: '2027-07-04', circuit: 'Silverstone', sprint: true },
  { round: 17, gp: 'Turkish Grand Prix', date: '2027-10-03', circuit: 'Istanbul (returning)', sprint: false },
  { round: 19, gp: 'United States Grand Prix', date: '2027-10-24', circuit: 'Austin', sprint: false },
  { round: 24, gp: 'Abu Dhabi Grand Prix', date: '2027-12-12', circuit: 'Yas Marina (finale)', sprint: true },
];
