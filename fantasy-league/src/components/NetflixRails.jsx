import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { getScoreSummary } from '../data/liveSports';

/**
 * Netflix-style horizontal poster rail.
 * items: [{ key, title, subtitle, image, badge, badgeColor, path }]
 */
export function PosterRail({ title, items, icon }) {
  if (!items?.length) return null;
  return (
    <section className="nfx-rail-section">
      <div className="nfx-rail-head">
        <h2>{icon}{title}</h2>
        <span className="nfx-rail-hint">Scroll <ChevronRight size={13} /></span>
      </div>
      <div className="nfx-rail-track">
        {items.map((item) => (
          <Link key={item.key} to={item.path} className="nfx-card">
            <div className="nfx-card-media">
              {item.image && <img src={item.image} alt="" loading="lazy" />}
              <div className="nfx-card-shade" />
              {item.badge && (
                <span className="nfx-card-badge" style={{ background: item.badgeColor || '#e10600' }}>{item.badge}</span>
              )}
              <span className="nfx-card-play"><Play size={20} fill="#fff" /></span>
            </div>
            <div className="nfx-card-body">
              <strong>{item.title}</strong>
              {item.subtitle && <span>{item.subtitle}</span>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Sony LIV-style "Live Now" match-centre rail.
 * Big score cards in a horizontal rail; live first, upcoming after.
 */
export function LiveNowRail({ scores = [] }) {
  const live = scores.filter((s) => s.statusState === 'in');
  const upcoming = scores.filter((s) => s.statusState === 'pre');
  const items = [...live, ...upcoming].slice(0, 10);
  if (!items.length) return null;

  return (
    <section className="nfx-rail-section">
      <div className="nfx-rail-head">
        <h2>
          <span className="sony-live-dot" />
          {live.length ? 'Live Now' : 'Up Next'}
        </h2>
        <Link to="/live" className="nfx-rail-hint" style={{ textDecoration: 'none' }}>
          All scores <ChevronRight size={13} />
        </Link>
      </div>
      <div className="nfx-rail-track">
        {items.map((s) => {
          const isLive = s.statusState === 'in';
          return (
            <div key={s.id} className="sony-card">
              <div className="sony-card-top">
                <span className="sony-card-comp">{s.competition || s.sportLabel}</span>
                {isLive
                  ? <span className="sony-live-badge">● LIVE {s.clock || ''}</span>
                  : <span className="sony-up-badge">{s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'UPCOMING'}</span>}
              </div>
              <div className="sony-card-teams">
                <span className="sony-team">{s.home}</span>
                <span className="sony-score">{isLive || s.statusState === 'post' ? getScoreSummary(s) : 'vs'}</span>
                <span className="sony-team" style={{ textAlign: 'right' }}>{s.away}</span>
              </div>
              <div className="sony-card-meta">{s.venue || s.sportLabel} • {s.statusText || ''}</div>
              <div className="sony-card-actions">
                <Link to={`/watch-live?sport=${s.sportId}`} className="sony-watch-btn">
                  <Play size={14} fill="#000" /> Watch
                </Link>
                <Link to={`/live/${s.sportId}`} className="sony-score-btn">Scorecard</Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
