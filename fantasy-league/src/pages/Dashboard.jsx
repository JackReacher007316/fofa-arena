import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Radio, 
  Tv, 
  Users, 
  TrendingUp, 
  Trophy, 
  Flag, 
  PlayCircle, 
  Calendar,
  Clapperboard
} from 'lucide-react';
import SportTabs from '../components/SportTabs';
import { fetchAllScores, getScoreSummary, getSportById, SPORT_CATALOG } from '../data/liveSports';
import SportsurgeLinks from '../components/SportsurgeLinks';
import UpcomingFixtures from '../components/UpcomingFixtures';

const demoMatches = [
  {
    id: 'demo-f1',
    sport: 'f1',
    status: 'LIVE',
    teamA: 'Verstappen',
    teamB: 'Norris',
    _count: { teams: 284 },
    deadline: new Date(Date.now() + 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'demo-football',
    sport: 'football',
    status: 'LIVE',
    teamA: 'FOFA Wolves',
    teamB: 'Nagpur City',
    _count: { teams: 192 },
    deadline: new Date(Date.now() + 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'demo-cricket',
    sport: 'cricket',
    status: 'UPCOMING',
    teamA: 'CSK',
    teamB: 'RCB',
    _count: { teams: 340 },
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'demo-basketball',
    sport: 'basketball',
    status: 'LIVE',
    teamA: 'Raptors',
    teamB: 'Heat',
    _count: { teams: 148 },
    deadline: new Date(Date.now() + 1000 * 60 * 24).toISOString(),
  },
];

const carouselSlides = [
  {
    id: 'slide-cricket',
    title: 'India vs Pakistan Live Match',
    subtitle: 'T20 CHAMPIONS TROPHY • LIVE STREAM',
    desc: 'Watch the ultimate cricket clash live in high-fidelity 4D telemetry. Join active watch party rooms and compete on the global leaderboard.',
    cta: 'Watch Live Now',
    path: '/watch-live',
    image: 'https://images.unsplash.com/photo-1531415080290-bc98529c113a?auto=format&fit=crop&q=70&w=900',
    tag: 'CRICKET'
  },
  {
    id: 'slide-f1',
    title: 'Silverstone Grand Prix race control',
    subtitle: 'FORMULA 1 TELEMETRY • REPLAY STREAM',
    desc: 'Take command of the pit wall. Monitor live telemetry, track gap intervals, and draft your ultimate fantasy driver lineup.',
    cta: 'Enter Race Control',
    path: '/live',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=70&w=900',
    tag: 'F1 RACING'
  },
  {
    id: 'slide-football',
    title: 'London Derby: Arsenal vs Chelsea',
    subtitle: 'FOOTBALL CHAMPIONSHIP • LIVE STREAM',
    desc: 'Catch every pass and tactic in real-time. Embed streams in your watch party room and co-watch with up to 12 friends.',
    cta: 'Watch Now',
    path: '/live/football',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=70&w=900',
    tag: 'FOOTBALL'
  },
  {
    id: 'slide-fantasy',
    title: 'Star players & full rosters',
    subtitle: 'PLAYER STATS • UPDATED ROSTERS',
    desc: 'Faces, ratings and 2026/27 season stats for football, cricket and F1 stars — plus the full updated team rosters for every big match.',
    cta: 'View Player Stats',
    path: '/stats',
    image: 'https://images.unsplash.com/photo-1540747737956-37872404a82a?auto=format&fit=crop&q=70&w=900',
    tag: 'ROSTERS 2026/27'
  }
];

function Countdown({ deadline }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) {
        setTimeLeft('Racing Now');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return <span>{timeLeft}</span>;
}

function ScorePreview({ score, setActiveMatch, navigate }) {
  const sport = getSportById(score.sportId);
  const isLive = score.statusState === 'in';
  const destination = `/live/${score.sportId}`;
  const [hovered, setHovered] = useState(false);

  const getSportColor = (s) => {
    if (s === 'f1') return 'var(--netflix-red)';
    if (s === 'cricket') return 'var(--hotstar-gold)';
    if (s === 'football') return 'var(--spotify-green)';
    return '#ff4b44';
  };
  const getSportGlow = (s) => {
    if (s === 'f1') return 'rgba(229, 9, 20, 0.4)';
    if (s === 'cricket') return 'rgba(243, 198, 35, 0.4)';
    if (s === 'football') return 'rgba(29, 185, 84, 0.4)';
    return 'rgba(31, 128, 224, 0.4)';
  };

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (setActiveMatch) {
          setActiveMatch({
            title: `${score.home} vs ${score.away}`,
            teamALogo: '',
            status: isLive ? 'LIVE' : 'UPCOMING',
            venue: score.venue,
          });
        }
        navigate(destination);
      }}
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: hovered ? 'scale(1.06) translateY(-4px)' : 'scale(1)',
        zIndex: hovered ? 5 : 1
      }}
    >
      <div 
        className="score-card" 
        style={{ 
          width: '310px',
          borderColor: hovered ? getSportColor(score.sportId) : 'rgba(255,255,255,0.05)',
          boxShadow: hovered ? `0 12px 24px rgba(0, 0, 0, 0.5), 0 0 15px ${getSportGlow(score.sportId)}` : '0 6px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="score-topline">
          <span className="sport-pill">
            {score.sportId === 'cricket' && <Trophy size={14} style={{ color: 'var(--hotstar-gold)' }} />}
            {score.sportId === 'f1' && <Flag size={14} style={{ color: 'var(--netflix-red)' }} />}
            {score.sportId === 'football' && <PlayCircle size={14} style={{ color: 'var(--spotify-green)' }} />}
            {score.sportId !== 'cricket' && score.sportId !== 'f1' && score.sportId !== 'football' && <Tv size={14} />}
            {sport.label}
          </span>
          <span className={`status-pill ${isLive ? 'is-live' : ''}`}>
            {isLive ? 'Live' : 'Scheduled'}
          </span>
        </div>

        <div className="teams-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', margin: '16px 0 8px' }}>
          <div className="team-name" style={{ fontSize: '0.85rem', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{score.home}</div>
          <div className="score-number" style={{ fontSize: '1.15rem' }}>{getScoreSummary(score)}</div>
          <div className="team-name" style={{ fontSize: '0.85rem', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{score.away}</div>
        </div>

        <div className="score-meta" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <strong>{score.competition}</strong>
          <div style={{ marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {score.venue || 'Pitlane live telemetry'}
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, navigate, setActiveMatch }) {
  const isLive = match.status === 'LIVE';
  const completed = match.status === 'COMPLETED';
  const isDemo = String(match.id).startsWith('demo-');
  const destination = isDemo ? `/live/${match.sport}` : `/match/${match.id}`;
  const [hovered, setHovered] = useState(false);

  const getSportColor = (s) => {
    if (s === 'f1') return 'var(--netflix-red)';
    if (s === 'cricket') return 'var(--hotstar-gold)';
    if (s === 'football') return 'var(--spotify-green)';
    return '#ff4b44';
  };
  const getSportGlow = (s) => {
    if (s === 'f1') return 'rgba(229, 9, 20, 0.4)';
    if (s === 'cricket') return 'rgba(243, 198, 35, 0.4)';
    if (s === 'football') return 'rgba(29, 185, 84, 0.4)';
    return 'rgba(31, 128, 224, 0.4)';
  };

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (setActiveMatch) setActiveMatch(match);
        navigate(destination);
      }} 
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: hovered ? 'scale(1.06) translateY(-4px)' : 'scale(1)',
        zIndex: hovered ? 5 : 1
      }}
    >
      <div 
        className="match-card" 
        style={{ 
          width: '310px',
          borderColor: hovered ? getSportColor(match.sport) : 'rgba(255,255,255,0.05)',
          boxShadow: hovered ? `0 12px 24px rgba(0, 0, 0, 0.5), 0 0 15px ${getSportGlow(match.sport)}` : '0 6px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="score-topline">
          <span className="sport-pill">
            {match.sport === 'cricket' && <Trophy size={14} style={{ color: 'var(--hotstar-gold)' }} />}
            {match.sport === 'f1' && <Flag size={14} style={{ color: 'var(--netflix-red)' }} />}
            {match.sport === 'football' && <PlayCircle size={14} style={{ color: 'var(--spotify-green)' }} />}
            {match.sport !== 'cricket' && match.sport !== 'f1' && match.sport !== 'football' && <Tv size={14} />}
            {match.sport.toUpperCase()}
          </span>
          {isLive && <span className="status-pill is-live">Live</span>}
        </div>

        <div className="match-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: match.sport === 'f1' ? 'var(--netflix-red)' : match.sport === 'cricket' ? 'var(--hotstar-gold)' : 'var(--spotify-green)',
            display: 'inline-block',
            boxShadow: `0 0 6px ${match.sport === 'f1' ? 'var(--netflix-red)' : match.sport === 'cricket' ? 'var(--hotstar-gold)' : 'var(--spotify-green)'}`
          }} />
          <span style={{ fontSize: '0.95rem' }}>{match.teamA} vs {match.teamB}</span>
        </div>

        <div className="match-subtitle">
          {completed ? 'Final standings' : isLive ? 'Telemetry updates live' : <>Starts in <Countdown deadline={match.deadline} /></>}
        </div>

        <div className="prize-block">
          <small>Fan Teams</small>
          <strong>{match._count?.teams ?? 0} teams</strong>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ activeSport, setActiveSport, setActiveMatch }) {
  const [matches, setMatches] = useState([]);
  const [scores, setScores] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingScores, setLoadingScores] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Auto cycle carousel slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/matches')
      .then((response) => response.json())
      .then((data) => {
        if (!mounted) return;
        setMatches(Array.isArray(data) && data.length ? data : demoMatches);
      })
      .catch(() => {
        if (mounted) setMatches(demoMatches);
      })
      .finally(() => {
        if (mounted) setLoadingMatches(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadScores = () => {
      fetchAllScores()
        .then((groups) => {
          if (!mounted) return;
          const sortedScores = groups.flatMap((group) => group.scores).sort((a, b) => {
            if (a.sportId === 'f1') return -1;
            if (b.sportId === 'f1') return 1;
            return 0;
          });
          setScores(sortedScores);
        })
        .finally(() => {
          if (mounted) setLoadingScores(false);
        });
    };

    loadScores();
    const id = setInterval(loadScores, 30000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const filteredMatches = activeSport === 'all' ? matches : matches.filter((match) => match.sport === activeSport);
  const liveMatches = filteredMatches.filter((match) => match.status === 'LIVE');
  const upcomingMatches = filteredMatches.filter((match) => match.status === 'UPCOMING');
  const completedMatches = filteredMatches.filter((match) => match.status === 'COMPLETED');
  const liveScores = scores.filter((score) => activeSport === 'all' || score.sportId === activeSport);

  const slide = carouselSlides[currentSlide];

  return (
    <div className="page-shell">
      {/* Amazon Prime & JioCinema Style Premium Hero Banner */}
      <section 
        className="netflix-hero" 
        style={{ 
          background: `linear-gradient(to right, rgba(2, 6, 16, 0.95) 0%, rgba(2, 6, 16, 0.8) 30%, rgba(2, 6, 16, 0.4) 60%, transparent 100%), url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="netflix-hero-content">
          <div className="netflix-hero-badge" style={{ background: 'linear-gradient(135deg, #ff4b44, #e10600)', borderRadius: '20px', padding: '6px 14px' }}>
            <Radio size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', animation: 'pulse 1s infinite' }} />
            {slide.tag} • {slide.subtitle}
          </div>
          <h1 className="netflix-hero-title">{slide.title}</h1>
          <p className="netflix-hero-desc">{slide.desc}</p>
          <div className="netflix-hero-actions">
            <button 
              className="btn-netflix-play" 
              onClick={() => {
                const associatedMatch = matches.find(m => m.sport === slide.id.replace('slide-', ''));
                if (associatedMatch && setActiveMatch) setActiveMatch(associatedMatch);
                navigate(slide.path);
              }}
              style={{
                border: 'none',
                boxShadow: '0 0 18px rgba(225, 6, 0, 0.45)'
              }}
            >
              <PlayCircle size={18} /> {slide.cta}
            </button>
            <button 
              className="btn-netflix-info" 
              onClick={() => navigate('/watch-party')}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Users size={18} /> Co-Watch Room
            </button>
          </div>
          
          {/* Carousel dots indicators */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            {carouselSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                style={{
                  width: '24px',
                  height: '4px',
                  borderRadius: '2px',
                  border: 'none',
                  background: idx === currentSlide ? '#ffcc00' : 'rgba(255, 255, 255, 0.4)',
                  transition: 'background 0.3s',
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* F1 × LALIGA theme strip */}
      <div className="f1-laliga-strip" aria-hidden="true">
        <div className="f1-laliga-strip-track">
          {[0, 1].map((n) => (
            <span key={n}>FORMULA 1 <b>×</b> LALIGA&nbsp;&nbsp;•&nbsp;&nbsp;RACE CONTROL&nbsp;&nbsp;•&nbsp;&nbsp;CARBON &amp; CORAL&nbsp;&nbsp;•&nbsp;&nbsp;LIVE TIMING TOWER&nbsp;&nbsp;•&nbsp;&nbsp;EL CLÁSICO ENERGY&nbsp;&nbsp;•&nbsp;&nbsp;LIGHTS OUT &amp; KICK-OFF&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          ))}
        </div>
      </div>

      {/* Prime Video style Channel Brand Tiles */}
      <section className="prime-brand-tiles">
        <div className="prime-brand-tile" onClick={() => navigate('/watch-live')} style={{ '--sport-glow-color': 'var(--hotstar-gold)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
            <span style={{ fontSize: '1.25rem' }}>🏏</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }}>IPL FANTASY</div>
          </div>
        </div>
        <div className="prime-brand-tile" onClick={() => navigate('/live')} style={{ '--sport-glow-color': 'var(--netflix-red)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
            <span style={{ fontSize: '1.25rem' }}>🏎️</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }}>F1 CONTROL</div>
          </div>
        </div>
        <div className="prime-brand-tile" onClick={() => navigate('/live/football')} style={{ '--sport-glow-color': 'var(--spotify-green)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
            <span style={{ fontSize: '1.25rem' }}>⚽</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }}>PREMIER LIVE</div>
          </div>
        </div>
        <div className="prime-brand-tile" onClick={() => navigate('/watch-party')} style={{ '--sport-glow-color': 'var(--prime-blue)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--prime-blue)', zIndex: 2 }}>
            <Users size={28} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }}>Watch Party</div>
          </div>
        </div>
        <div className="prime-brand-tile" onClick={() => navigate('/stats')} style={{ '--sport-glow-color': 'var(--hotstar-gold)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--hotstar-gold)', zIndex: 2 }}>
            <Trophy size={28} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }}>Rosters</div>
          </div>
        </div>
        <div className="prime-brand-tile" onClick={() => navigate('/movies')} style={{ '--sport-glow-color': 'var(--laliga-coral, #ff4b44)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#ff4b44', zIndex: 2 }}>
            <Clapperboard size={28} />
            <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }}>Movies</div>
          </div>
        </div>
      </section>

      {/* Stats Quick strip */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Live Telemetry Feeds</div>
          <div className="stat-value" style={{ color: 'var(--prime-blue)' }}>{scores.filter((score) => score.statusState === 'in').length} Feeds</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fan Teams Created</div>
          <div className="stat-value" style={{ color: '#ffffff' }}>{matches.reduce((sum, match) => sum + (match._count?.teams || 0), 0)} Teams</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sports Leagues</div>
          <div className="stat-value" style={{ color: 'var(--hotstar-gold)' }}>{SPORT_CATALOG.length} Leagues</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/stats')} style={{ cursor: 'pointer' }} title="Open Player Stats & Faces">
          <div className="stat-label">Star Players Tracked</div>
          <div className="stat-value" style={{ color: 'var(--spotify-green)' }}>10 Profiles</div>
        </div>
      </div>

      {/* Sportsurge — football & F1 live links */}
      <div className="section-head" style={{ marginBottom: '10px' }}>
        <h2 style={{ fontSize: '1.15rem' }}>⚡ Sportsurge Live Links</h2>
        <button className="ghost-button" type="button" onClick={() => navigate('/sportsurge')}>
          Football &amp; F1 on Sportsurge <ArrowRight size={16} />
        </button>
      </div>
      <SportsurgeLinks style={{ marginBottom: '28px' }} />

      <UpcomingFixtures limit={9} />

      <SportTabs activeSport={activeSport} setActiveSport={setActiveSport} />

      {/* Live Telemetry Card Row */}
      <div className="section-head">
        <h2>Live telemetry board</h2>
        <button className="ghost-button" type="button" onClick={() => navigate('/live')}>
          Enter Telemetry Wall <ArrowRight size={16} />
        </button>
      </div>

      {loadingScores ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Receiving telemetry data...</div>
          </div>
        </div>
      ) : liveScores.length ? (
        <div className="score-grid">
          {liveScores.map((score) => (
            <ScorePreview key={score.id} score={score} setActiveMatch={setActiveMatch} navigate={navigate} />
          ))}
        </div>
      ) : (
        <div className="empty-state">No live telemetry available for this track right now.</div>
      )}

      {/* Match Contests Card Row */}
      <div className="section-head">
        <h2>Championship Matches</h2>
        <span className="section-note">{filteredMatches.length} matches • free to play, no prizes</span>
      </div>

      {loadingMatches ? (
        <div className="loading-state">
          <div>
            <div className="loading-spinner" />
            <div>Loading match roster...</div>
          </div>
        </div>
      ) : (
        <>
          {liveMatches.length > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <div className="section-head" style={{ margin: '12px 0' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff2e55', animation: 'pulse 1.5s infinite' }} />
                  Live streams & events
                </h3>
              </div>
              <div className="match-list">
                {liveMatches.map((match) => (
                  <MatchCard key={match.id} match={match} navigate={navigate} setActiveMatch={setActiveMatch} />
                ))}
              </div>
            </section>
          )}

          {upcomingMatches.length > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <div className="section-head" style={{ margin: '12px 0' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} style={{ color: '#ff4b44' }} />
                  Upcoming Matches
                </h3>
              </div>
              <div className="match-list">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} navigate={navigate} setActiveMatch={setActiveMatch} />
                ))}
              </div>
            </section>
          )}

          {completedMatches.length > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <div className="section-head" style={{ margin: '12px 0' }}>
                <h3 style={{ fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={16} style={{ color: '#f3c623' }} />
                  Podium Match Results
                </h3>
              </div>
              <div className="match-list">
                {completedMatches.map((match) => (
                  <MatchCard key={match.id} match={match} navigate={navigate} setActiveMatch={setActiveMatch} />
                ))}
              </div>
            </section>
          )}

          {!filteredMatches.length && <div className="empty-state">No matches scheduled for this category.</div>}
        </>
      )}
    </div>
  );
}
