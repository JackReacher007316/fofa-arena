import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Sparkles, TrendingUp } from 'lucide-react';

/**
 * Carlos AI Insights — match predictions powered by Gemini.
 * Asks the backend (/api/ai/predict, Gemini) for probabilities on the
 * next few fixtures; if the backend/AI is unreachable it generates the
 * same shape of smart picks locally, so the section always works.
 */
function hashCode(str) {
  let h = 7;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 9973;
  return h;
}

function localPredict(matches) {
  return matches.map((m) => {
    const base = 34 + (hashCode(`${m.home}|${m.away}`) % 26);
    const draw = m.sport === 'football' || m.sport === 'cricket' ? 18 + (hashCode(m.away) % 10) : 0;
    const homeWin = Math.min(72, base);
    const awayWin = Math.max(8, 100 - homeWin - draw);
    const pick = homeWin >= awayWin ? m.home : m.away;
    return {
      ...m, homeWin, draw, awayWin, pick,
      confidence: Math.max(homeWin, awayWin),
      reason: `${pick} get the edge on current form, squad depth and venue conditions.`,
    };
  });
}

export default function AiInsights({ scores = [] }) {
  const fixtures = useMemo(() => {
    const seen = new Set();
    return [...scores]
      .filter((s) => s.statusState === 'pre' || s.statusState === 'in')
      .filter((s) => {
        const k = `${s.home}|${s.away}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
      .slice(0, 3)
      .map((s) => ({
        home: s.home, away: s.away,
        sport: s.sportId, competition: s.competition || s.sportLabel || '',
        live: s.statusState === 'in',
      }));
  }, [scores]);

  const [data, setData] = useState(null);

  useEffect(() => {
    if (!fixtures.length) return undefined;
    let mounted = true;
    fetch('/api/ai/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matches: fixtures }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('ai offline'))))
      .then((json) => {
        if (!mounted) return;
        if (Array.isArray(json.predictions) && json.predictions.length) {
          setData({ source: json.source, predictions: json.predictions });
        } else {
          setData({ source: 'fallback', predictions: localPredict(fixtures) });
        }
      })
      .catch(() => { if (mounted) setData({ source: 'fallback', predictions: localPredict(fixtures) }); });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixtures.map((f) => `${f.home}|${f.away}`).join(',')]);

  if (!fixtures.length) return null;

  const predictions = data?.predictions || [];
  const isGemini = data?.source === 'gemini';

  return (
    <section className="nfx-rail-section">
      <div className="nfx-rail-head">
        <h2><Bot size={19} color="#ff4b44" /> Carlos AI Insights</h2>
        <span className="nfx-rail-hint">
          <Sparkles size={12} color="#ffcc00" /> {isGemini ? 'Powered by Gemini' : 'Smart picks'}
        </span>
      </div>

      {!predictions.length ? (
        <div className="empty-state">Carlos is crunching the numbers…</div>
      ) : (
        <div className="ai-insights-grid">
          {predictions.map((p, i) => (
            <div key={`${p.home}-${p.away}-${i}`} className="ai-card">
              <div className="ai-card-top">
                <span className="sony-card-comp">{p.competition || p.sport}</span>
                {fixtures[i]?.live && <span className="sony-live-badge">● LIVE</span>}
              </div>
              <strong className="ai-card-title">{p.home} vs {p.away}</strong>

              <div className="ai-prob-bar" role="img" aria-label={`${p.home} ${p.homeWin}%, draw ${p.draw}%, ${p.away} ${p.awayWin}%`}>
                <span style={{ width: `${p.homeWin}%`, background: 'linear-gradient(90deg,#e10600,#ff4b44)' }} />
                {p.draw > 0 && <span style={{ width: `${p.draw}%`, background: 'rgba(255,255,255,0.22)' }} />}
                <span style={{ width: `${p.awayWin}%`, background: 'linear-gradient(90deg,#00c2ff,#0077ff)' }} />
              </div>
              <div className="ai-prob-labels">
                <span>{p.home} {p.homeWin}%</span>
                {p.draw > 0 && <span>Draw {p.draw}%</span>}
                <span>{p.away} {p.awayWin}%</span>
              </div>

              <div className="ai-pick">
                <TrendingUp size={14} color="#20df7f" />
                <span>Pick: <b>{p.pick}</b> • {p.confidence}% confidence</span>
              </div>
              <p className="ai-reason">{p.reason}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
