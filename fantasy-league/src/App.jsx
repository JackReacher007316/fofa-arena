import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Radio, 
  Shield, 
  Award, 
  Users, 
  Tv, 
  Settings, 
  Play, 
  Pause,
  LogOut,
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  ListMusic,
  Zap,
  Clapperboard,
  MonitorPlay
} from 'lucide-react';
import Background3D from './components/Background3D';
import Chatbot from './components/Chatbot';
import WelcomeAnimation from './components/WelcomeAnimation';
import MercedesStarLogo from './components/MercedesStarLogo';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const LiveTracking = React.lazy(() => import('./pages/LiveTracking'));
const LiveScorePage = React.lazy(() => import('./pages/LiveScorePage'));
const MatchDetail = React.lazy(() => import('./pages/MatchDetail'));
const WatchParty = React.lazy(() => import('./pages/WatchParty'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Presentation = React.lazy(() => import('./pages/Presentation'));
const FootballLive = React.lazy(() => import('./pages/FootballLive'));
const F1Calendar = React.lazy(() => import('./pages/F1Calendar'));
const CricketCalendar = React.lazy(() => import('./pages/CricketCalendar'));
const FootballCalendar = React.lazy(() => import('./pages/FootballCalendar'));
const WatchLive = React.lazy(() => import('./pages/WatchLive'));
const Movies = React.lazy(() => import('./pages/Movies'));
const SportsurgeLive = React.lazy(() => import('./pages/SportsurgeLive'));
const PlayerStats = React.lazy(() => import('./pages/PlayerStats'));

function PageLoader() {
  return (
    <div className="loading-state">
      <div>
        <div className="loading-spinner" />
        <div>Preparing live streams...</div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, token }) {
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function isActivePath(locationPath, itemPath) {
  if (itemPath === '/') return locationPath === '/';
  return locationPath === itemPath || locationPath.startsWith(`${itemPath}/`);
}


function Sidebar({ setToken }) {
  const location = useLocation();
  const userStr = localStorage.getItem('fantasy_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/f1-calendar', label: 'F1 Schedule', icon: Calendar },
    { path: '/cricket-calendar', label: 'Cricket Schedule', icon: Calendar },
    { path: '/football-calendar', label: 'Football Schedule', icon: Calendar },
    { path: '/live', label: 'Race Control', icon: Radio, live: true },
    { path: '/live/football', label: 'Football Live', icon: Play },
    { path: '/stats', label: 'Player Stats & Rosters', icon: Award },
    { path: '/leaderboard', label: 'Championship', icon: Award },
    { path: '/watch-party', label: 'Watch Party Lobby', icon: Users },
    { path: '/watch-live', label: 'Watch Live', icon: Tv },
    { path: '/movies', label: 'Movies', icon: Clapperboard },
    { path: '/live-streams', label: 'Live Streams', icon: MonitorPlay, live: true },
    { path: '/stats', label: 'Player Stats', icon: Award },
    { path: '/admin', label: 'Race Engineer', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('fantasy_token');
    localStorage.removeItem('fantasy_user');
    setToken(null);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MercedesStarLogo size={24} />
        <div className="brand-title">
          <span style={{ fontWeight: 800 }}>FOFA</span>{' '}
          <span className="brand-gradient-text">ARENA</span>
        </div>
      </div>

      <nav className="nav-list" aria-label="Primary">
        {navItems.map((item) => {
          const active = isActivePath(location.pathname, item.path);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${active ? 'is-active' : ''}`}
            >
              <IconComponent />
              <span>{item.label}</span>
              {item.live && <span className="live-dot" />}
            </Link>
          );
        })}
      </nav>

      <div className="user-strip">
        <div className="user-avatar">{(user?.username || 'P').slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="user-name">{user?.username || 'Viewer'}</div>
          <div className="user-role">Premium Member</div>
        </div>
        <button className="icon-button" type="button" title="Logout" onClick={handleLogout}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

function FloatingNav() {
  const location = useLocation();
  const links = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/live', label: 'Control', icon: Radio },
    { path: '/live/football', label: 'Football', icon: Play },
    { path: '/stats', label: 'Rosters', icon: Award },
    { path: '/leaderboard', label: 'Championship', icon: Award },
    { path: '/movies', label: 'Movies', icon: Clapperboard },
  ];

  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {links.map((link) => {
        const IconComponent = link.icon;
        const active = isActivePath(location.pathname, link.path);
        return (
          <Link 
            key={link.path} 
            to={link.path} 
            className={active ? 'is-active' : ''}
          >
            <IconComponent size={20} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SpotifyPlayer({ activeMatch, onPlayPause, isPlaying, volume, onVolumeChange }) {
  if (!activeMatch) return null;

  return (
    <div className="spotify-media-bar">
      {/* Left section: Track Info */}
      <div className="media-bar-left">
        <div className="media-bar-thumb" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {activeMatch.sport === 'f1' ? '🏎️' : activeMatch.sport === 'cricket' ? '🏏' : '⚽'}
        </div>
        <div className="media-bar-info">
          <p className="media-bar-title">{activeMatch.title}</p>
          <div className="media-bar-subtitle">
            <span className={`status-pill ${activeMatch.status === 'LIVE' ? 'is-live' : ''}`} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '3px' }}>
              {activeMatch.status}
            </span>
            <span>{activeMatch.venue || 'FOFA Arena'}</span>
          </div>
        </div>
      </div>

      {/* Center section: Player Controls */}
      <div className="media-bar-center">
        <div className="media-controls">
          <button className="media-btn" title="Shuffle"><Shuffle size={16} /></button>
          <button className="media-btn" title="Previous"><SkipBack size={18} /></button>
          <button className="media-btn media-btn-play" onClick={onPlayPause} title={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: '2px' }} />}
          </button>
          <button className="media-btn" title="Next"><SkipForward size={18} /></button>
          <button className="media-btn" title="Repeat"><Repeat size={16} /></button>
        </div>
        <div className="media-progress-container">
          <span className="media-time-lbl">0:00</span>
          <div className="media-progress-bar">
            <div className="media-progress-fill" style={{ width: isPlaying ? '35%' : '15%', transition: 'width 2s ease' }} />
          </div>
          <span className="media-time-lbl">{activeMatch.status === 'LIVE' ? 'LIVE' : '90:00'}</span>
        </div>
      </div>

      {/* Right section: Utilities */}
      <div className="media-bar-right">
        <button className="media-btn" title="Queue"><ListMusic size={18} /></button>
        <button className="media-btn" title="Stream View"><Tv size={18} /></button>
        <div className="volume-container">
          <button className="media-btn" onClick={() => onVolumeChange(volume === 0 ? 80 : 0)}>
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            style={{ 
              accentColor: 'var(--spotify-green)', 
              width: '100%', 
              height: '4px',
              borderRadius: '2px',
              cursor: 'pointer'
            }} 
          />
        </div>
        <button className="media-btn" title="Fullscreen"><Maximize2 size={16} /></button>
      </div>
    </div>
  );
}

function AppRoutes({ activeSport, setActiveSport, token, activeMatch, setActiveMatch }) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard activeSport={activeSport} setActiveSport={setActiveSport} setActiveMatch={setActiveMatch} />} />
      <Route path="/f1-calendar" element={<F1Calendar />} />
      <Route path="/cricket-calendar" element={<CricketCalendar />} />
      <Route path="/football-calendar" element={<FootballCalendar />} />
      <Route path="/football" element={<FootballLive />} />
      <Route path="/live/football" element={<FootballLive />} />
      <Route path="/match/:id" element={<MatchDetail setActiveMatch={setActiveMatch} />} />
      <Route path="/live" element={<LiveTracking activeSport={activeSport} setActiveSport={setActiveSport} setActiveMatch={setActiveMatch} />} />
      <Route path="/live/:sport" element={<LiveScorePage />} />
      <Route path="/watch-party" element={<WatchParty activeSport={activeSport} setActiveSport={setActiveSport} />} />
      <Route path="/watch-live" element={<WatchLive />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/live-streams" element={<SportsurgeLive />} />
      <Route path="/sportsurge" element={<Navigate to="/live-streams" replace />} />
      <Route path="/stats" element={<PlayerStats />} />
      <Route path="/leaderboard" element={<Leaderboard activeSport={activeSport} setActiveSport={setActiveSport} />} />
      <Route path="/create-team" element={<Navigate to="/stats" replace />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute token={token}>
            <AdminPanel activeSport={activeSport} setActiveSport={setActiveSport} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [activeSport, setActiveSport] = useState('all');
  const [token, setToken] = useState(localStorage.getItem('fantasy_token'));
  const [activeMatch, setActiveMatch] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [disable3D, setDisable3D] = useState(() => localStorage.getItem('arena_disable_3d') === 'true');

  useEffect(() => {
    const handleStorage = () => setToken(localStorage.getItem('fantasy_token'));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const liveMatch = data.find(m => m.status === 'LIVE') || data[0];
          setActiveMatch(liveMatch);
        }
      })
      .catch(e => console.error("Error loading initial match:", e));
  }, []);

  // On GitHub Pages the app lives under /1122/ (BASE_URL=/1122/); locally
  // and on the backend it lives at / (BASE_URL=./) — keep routing in sync.
  const basename = import.meta.env.BASE_URL.startsWith('/')
    ? import.meta.env.BASE_URL.replace(/\/$/, '')
    : undefined;

  return (
    <Router basename={basename}>
      <Background3D disabled={disable3D} activeSport={activeSport} />
      <WelcomeAnimation />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/auth" element={<Auth setToken={setToken} />} />
          <Route path="/presentation" element={<Presentation />} />
          <Route
            path="/*"
            element={
              <div className="app-container">
                <Sidebar setToken={setToken} />
                <main className="main-content">
                  {/* Top Netflix-style Brand Nav Header */}
                  <div className="brand-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '28px',
                    paddingBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MercedesStarLogo size={28} />
                        <span className="brand-lockup">FOFA <span className="brand-gradient-text">ARENA</span></span>
                      </div>
                      <nav style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: '#e5e5e5' }}>
                        <Link to="/" style={{ fontWeight: 600 }}>Home</Link>
                        <Link to="/watch-live" style={{ opacity: 0.8 }}>Live Streams</Link>
                        <Link to="/live-streams" style={{ opacity: 0.8 }}>Live Streams</Link>
                        <Link to="/stats" style={{ opacity: 0.8 }}>Player Stats</Link>
                        <Link to="/watch-party" style={{ opacity: 0.8 }}>Watch Parties</Link>
                        <Link to="/leaderboard" style={{ opacity: 0.8 }}>Leaderboard</Link>
                      </nav>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {/* Performance Mode / 3D Toggle */}
                      <button
                        onClick={() => {
                          const newValue = !disable3D;
                          setDisable3D(newValue);
                          localStorage.setItem('arena_disable_3d', String(newValue));
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          color: disable3D ? '#a1a1aa' : '#38bdf8',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease',
                          outline: 'none',
                          boxShadow: disable3D ? 'none' : '0 0 10px rgba(56,189,248,0.2)'
                        }}
                        title={disable3D ? "Enable 3D background (may lag on slower systems)" : "Disable 3D background (improves performance)"}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: disable3D ? '#71717a' : '#38bdf8',
                          boxShadow: disable3D ? 'none' : '0 0 6px #38bdf8',
                          display: 'inline-block'
                        }} />
                        {disable3D ? "3D OFF" : "3D ON"}
                      </button>
                      <input 
                        type="text" 
                        placeholder="Search sports, players..." 
                        style={{
                          background: 'rgba(0,0,0,0.6)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          color: '#fff',
                          fontSize: '0.8rem',
                          outline: 'none',
                          width: '200px',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--spotify-green)'; e.target.style.width = '240px'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.width = '200px'; }}
                      />
                    </div>
                  </div>
                  <AppRoutes 
                    activeSport={activeSport} 
                    setActiveSport={setActiveSport} 
                    token={token} 
                    activeMatch={activeMatch} 
                    setActiveMatch={setActiveMatch} 
                  />
                </main>
                <FloatingNav />
                <SpotifyPlayer 
                  activeMatch={activeMatch} 
                  isPlaying={isPlaying} 
                  onPlayPause={() => setIsPlaying(!isPlaying)} 
                  volume={volume} 
                  onVolumeChange={setVolume} 
                />
                <Chatbot />
              </div>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}
