import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllScores, getScoreSummary } from '../data/liveSports';

/**
 * Sony LIV-style live scores tucked into the sidebar.
 * ESPN-backed, auto-refreshes every 30s. Lives first, then upcoming.
 * The sidebar is an icon dock, so this panel reveals itself when the
 * sidebar expands on hover (CSS: .sidebar:hover .sidebar-live).
 */
export default function SidebarLive() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = () => fetchAllScores()
      .then((groups) => {
        if (!mounted) return;
        const all = groups.flatMap((g) => g.scores);
        const order = { in: 0, pre: 1, post: 2 };
        all.sort((a, b) => (order[a.statusState] ?? 1) - (order[b.statusState] ?? 1));
        setScores(all);
      })
      .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const live = scores.filter((s) => s.statusState === 'in');
  const shown = (live.length ? live : scores.filter((s) => s.statusState === 'pre')).slice(0, 5);

  return (
    <div className="sidebar-live">
      <div className="sidebar-live-head">
        <span className="sidebar-live-dot" />
        {live.length ? `LIVE NOW • ${live.length}` : 'UP NEXT'}
      </div>
      {shown.length === 0 && <div className="sidebar-live-empty">Scores loading…</div>}
      {shown.map((s) => (
        <Link key={s.id} to={`/live/${s.sportId}`} className="sidebar-live-row">
          <span className="sidebar-live-sport">{(s.sportLabel || s.sportId || '').toUpperCase()}</span>
          <span className="sidebar-live-title">{s.home} vs {s.away}</span>
          <span className="sidebar-live-score">
            {s.statusState === 'in'
              ? getScoreSummary(s)
              : (s.statusText || 'Upcoming')}
          </span>
        </Link>
      ))}
      <Link to="/live" className="sidebar-live-all">All live scores →</Link>
    </div>
  );
}
