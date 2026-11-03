// Sportsurge links — central place for every Sportsurge URL used in the app.
//
// Sportsurge is a third-party *link aggregator* (it does not host streams
// itself): it lists live football/soccer and Formula 1 / motorsport events
// and links out to broadcasts for each match / session. Its domain changes
// often, so we keep a primary domain + fallback mirrors in ONE place —
// change a mirror here and Football Live, F1 Calendar, Watch Live and the
// /sportsurge page all pick it up.
//
// Primary hub pages (v2.sportsurge.net):
//   Home / all live sports : https://v2.sportsurge.net/home5/
//   Football (Soccer)      : https://v2.sportsurge.net/watch-soccer-streams/
//   Formula 1              : https://v2.sportsurge.net/watch-f1-streams/
// Both hub pages let you search by team / Grand Prix name, so per-match
// links below deep-link to the hub with `?q=<match>` pre-filled.

export const SPORTSURGE_BASE = 'https://v2.sportsurge.net';

export const SPORTSURGE_MIRRORS = [
  { id: 'v2', label: 'Player 1 — Primary', base: 'https://v2.sportsurge.net' },
  { id: 'club', label: 'Player 2', base: 'https://sportsurge.club' },
  { id: 'uno', label: 'Player 3', base: 'https://www.sportsurge.uno' },
];

const cleanBase = (base = SPORTSURGE_BASE) => String(base).replace(/\/+$/, '');

export const sportsurgeUrl = (path = '', base = SPORTSURGE_BASE) =>
  `${cleanBase(base)}${path.startsWith('/') ? path : `/${path}`}`;

/** All live sports happening right now on Sportsurge. */
export const getSportsurgeHomeUrl = (base = SPORTSURGE_BASE) =>
  sportsurgeUrl('/home5/', base);

/** Football / soccer hub — every live & upcoming football match. */
export const getSportsurgeFootballUrl = (match, base = SPORTSURGE_BASE) => {
  const hub = sportsurgeUrl('/watch-soccer-streams/', base);
  if (!match) return hub;
  const label =
    typeof match === 'string'
      ? match
      : [match.home, match.away].filter(Boolean).join(' vs ') || match.gp || match.title || '';
  return label ? `${hub}?q=${encodeURIComponent(label)}` : hub;
};

/** Formula 1 hub — practice, qualifying, sprint & Grand Prix sessions. */
export const getSportsurgeF1Url = (race, base = SPORTSURGE_BASE) => {
  const hub = sportsurgeUrl('/watch-f1-streams/', base);
  if (!race) return hub;
  const label =
    typeof race === 'string' ? race : race.gp || race.title || race.name || '';
  return label ? `${hub}?q=${encodeURIComponent(label)}` : hub;
};

/** Generic helper used by Watch Live / calendars: sport = 'football' | 'f1'. */
export function getSportsurgeUrlForSport(sport, matchOrRace, base = SPORTSURGE_BASE) {
  if (sport === 'f1') return getSportsurgeF1Url(matchOrRace, base);
  if (sport === 'football') return getSportsurgeFootballUrl(matchOrRace, base);
  return getSportsurgeHomeUrl(base);
}

/** Quick-link cards shown on Dashboard, Watch Live and /sportsurge. */
export const SPORTSURGE_QUICK_LINKS = [
  {
    id: 'live',
    sport: 'all',
    label: 'All Live Sports',
    desc: 'Every live match & race listed right now',
    color: '#ff8a1c',
    getUrl: (base) => getSportsurgeHomeUrl(base),
  },
  {
    id: 'football',
    sport: 'football',
    label: 'Football Live',
    desc: 'Premier League, La Liga, Serie A, Bundesliga, Champions League & World Cup',
    color: '#20df7f',
    getUrl: (base) => getSportsurgeFootballUrl(null, base),
  },
  {
    id: 'f1',
    sport: 'f1',
    label: 'Formula 1 Live',
    desc: 'Every FP1/FP2/FP3, qualifying, sprint and Grand Prix session',
    color: '#ff314a',
    getUrl: (base) => getSportsurgeF1Url(null, base),
  },
];

/** F1 2026 races (mirrors F1Calendar) — each gets its own Sportsurge link. */
export const F1_2026_RACES = [
  { round: 1, gp: 'Australian Grand Prix', dateRange: 'March 6–8' },
  { round: 2, gp: 'Chinese Grand Prix', dateRange: 'March 13–15', sprint: true },
  { round: 3, gp: 'Japanese Grand Prix', dateRange: 'March 27–29' },
  { round: 4, gp: 'Bahrain Grand Prix', dateRange: 'April 10–12' },
  { round: 5, gp: 'Saudi Arabian Grand Prix', dateRange: 'April 17–19' },
  { round: 6, gp: 'Miami Grand Prix', dateRange: 'May 1–3', sprint: true },
  { round: 7, gp: 'Canadian Grand Prix', dateRange: 'May 22–24', sprint: true },
  { round: 8, gp: 'Spanish Grand Prix', dateRange: 'June 12–14' },
  { round: 9, gp: 'Austrian Grand Prix', dateRange: 'June 26–28' },
  { round: 10, gp: 'British Grand Prix', dateRange: 'July 3–5', sprint: true },
  { round: 11, gp: 'Belgian Grand Prix', dateRange: 'July 17–19' },
  { round: 12, gp: 'Hungarian Grand Prix', dateRange: 'July 24–26' },
  { round: 13, gp: 'Dutch Grand Prix', dateRange: 'August 21–23', sprint: true },
  { round: 14, gp: 'Italian Grand Prix', dateRange: 'September 4–6' },
  { round: 15, gp: 'Spanish Grand Prix (Madrid)', dateRange: 'September 11–13' },
  { round: 16, gp: 'Azerbaijan Grand Prix', dateRange: 'September 24–26' },
  { round: 17, gp: 'Singapore Grand Prix', dateRange: 'October 9–11', sprint: true },
  { round: 18, gp: 'United States Grand Prix', dateRange: 'October 23–25' },
  { round: 19, gp: 'Mexico City Grand Prix', dateRange: 'October 30 – November 1' },
  { round: 20, gp: 'São Paulo Grand Prix', dateRange: 'November 6–8' },
  { round: 21, gp: 'Las Vegas Grand Prix', dateRange: 'November 19–21' },
  { round: 22, gp: 'Qatar Grand Prix', dateRange: 'November 27–29', sprint: true },
  { round: 23, gp: 'Abu Dhabi Grand Prix', dateRange: 'December 4–6' },
];
