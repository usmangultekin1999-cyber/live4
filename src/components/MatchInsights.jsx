import TeamLogo from './TeamLogo.jsx';
import { cleanDisplayText } from '../lib/helpers.js';
import { localeForLanguage, t, translateCategory } from '../lib/i18n.js';

function formatDateTime(value, language) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return cleanDisplayText(value);

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function titleCaseStatus(value = '') {
  return cleanDisplayText(value)
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function numberFromValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : null;
}

function normalizeKey(value = '') {
  return cleanDisplayText(value, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLocaleLowerCase('en-US')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isEnumCode(value = '') {
  const text = cleanDisplayText(value, '').trim();
  return /^[A-Z]{2,}_[A-Z0-9_]+$/.test(text.toUpperCase().replace(/[\s-]+/g, '_'));
}

function isStatLabelAllowed(label = '') {
  const key = normalizeKey(label);
  if (!key) return false;
  if (/\b(?:team id|teamid|team name|teamname|participant id|participant name|wins?|draws?|losses?|played|form|rank|ranking|position|standing|standings|season|league id|group id|country|code|slug|logo|image|name|id)\b/.test(key)) return false;

  return [
    'possess', 'shot', 'corner', 'card', 'foul', 'offside', 'save', 'attack', 'penalt', 'expected goal', 'xg',
    'ace', 'double fault', 'serve', 'break point', 'field goal', 'three point', '3 point', 'free throw',
    'rebound', 'assist', 'turnover', 'steal', 'block'
  ].some((part) => key.includes(part));
}

function isStatValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return true;
  if (value === null || value === undefined || typeof value === 'object') return false;
  const text = cleanDisplayText(value, '');
  return /^-?\d+(?:[.,]\d+)?%?$/.test(text);
}

function normalizeStatsForDisplay(stats = []) {
  const seen = new Set();
  return stats
    .filter((row) => {
      const label = cleanDisplayText(row?.label, '');
      if (!isStatLabelAllowed(label)) return false;
      if (!isStatValue(row?.home) || !isStatValue(row?.away)) return false;
      const key = normalizeKey(label);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function formatOddsDisplay(value) {
  const raw = cleanDisplayText(value, '').trim();
  if (!raw) return '';

  const numeric = raw.replace(/\s+/g, '').replace(',', '.').match(/^-?\d+(?:\.\d+)?$/);
  if (!numeric) return raw;

  let number = Number.parseFloat(numeric[0]);
  if (!Number.isFinite(number)) return '';

  const integerLike = /^-?\d+$/.test(raw);
  if (integerLike && Math.abs(number) >= 1000) number /= 1000;
  else if (integerLike && Math.abs(number) > 100) number /= 100;

  if (number <= 1 || number > 500) return '';
  return number.toFixed(2);
}

function normalizeOutcomeName(value = '') {
  const text = cleanDisplayText(value, '').trim();
  if (!text) return '';

  const code = text.toUpperCase().replace(/[\s-]+/g, '_');
  const map = new Map([
    ['OT_ONE', '1'],
    ['OT_1', '1'],
    ['ONE', '1'],
    ['HOME', '1'],
    ['OT_CROSS', 'X'],
    ['OT_X', 'X'],
    ['CROSS', 'X'],
    ['DRAW', 'X'],
    ['OT_DRAW', 'X'],
    ['OT_TWO', '2'],
    ['OT_2', '2'],
    ['TWO', '2'],
    ['AWAY', '2'],
    ['YES', 'Yes'],
    ['NO', 'No'],
    ['OVER', 'Over'],
    ['UNDER', 'Under']
  ]);

  if (map.has(code)) return map.get(code);
  if (isEnumCode(text)) return '';
  return text;
}

function normalizeOddsForDisplay(odds = []) {
  return odds
    .map((market) => {
      const name = cleanDisplayText(market?.name, 'Market');
      const outcomes = Array.isArray(market?.outcomes)
        ? market.outcomes
            .map((outcome) => ({
              name: normalizeOutcomeName(outcome?.name),
              odds: formatOddsDisplay(outcome?.odds)
            }))
            .filter((outcome) => outcome.name && outcome.odds)
        : [];

      return outcomes.length ? { name, outcomes } : null;
    })
    .filter(Boolean)
    .slice(0, 6);
}

function validTimelineType(type = '') {
  const clean = cleanDisplayText(type, '');
  if (!clean || isEnumCode(clean)) return '';
  return clean;
}

function normalizeTimelineForDisplay(timeline = []) {
  const seen = new Set();
  return timeline
    .map((item) => {
      const minute = cleanDisplayText(item?.minute, '');
      const type = validTimelineType(item?.type);
      const team = cleanDisplayText(item?.team, '');
      const text = cleanDisplayText(item?.text, '');
      if (!minute || (!type && !text)) return null;
      const key = `${minute}-${type}-${team}-${text}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return { minute, type: type || 'Event', team, text };
    })
    .filter(Boolean)
    .slice(0, 8);
}

function hasLineupData(lineups) {
  const homePlayers = lineups?.homePlayers || [];
  const awayPlayers = lineups?.awayPlayers || [];
  return Boolean(lineups?.homeFormation || lineups?.awayFormation || homePlayers.length || awayPlayers.length);
}

function Panel({ title, children, className = '', badge }) {
  return (
    <section className={`insight-panel ${className}`.trim()}>
      <div className="insight-heading">
        <h3>{title}</h3>
        {badge && <span>{badge}</span>}
      </div>
      {children}
    </section>
  );
}

function EmptyLine({ children }) {
  return <p className="insight-empty">{children}</p>;
}

function EventInfo({ details, match, language }) {
  const event = details?.event || {};
  const home = cleanDisplayText(event.home || match.home, 'Home');
  const away = cleanDisplayText(event.away || match.away, 'Away');
  const rows = [
    [t(language, 'competition'), cleanDisplayText(event.group)],
    [t(language, 'sport'), event.sport ? translateCategory(event.sport, language) : ''],
    [t(language, 'country'), cleanDisplayText(event.country)],
    [t(language, 'status'), titleCaseStatus(event.state)],
    [t(language, 'kickOff'), formatDateTime(event.start, language)]
  ].filter(([, value]) => value);

  return (
    <Panel title={t(language, 'eventInfo')} badge={details?.matched ? t(language, 'apiMatched') : t(language, 'streamApiSource')}>
      <div className="event-card-mini">
        <div className="mini-team">
          <TeamLogo src={event.home_logo || match.home_icon} name={home} />
          <strong>{home}</strong>
        </div>
        <span>{t(language, 'vs')}</span>
        <div className="mini-team mini-team--away">
          <strong>{away}</strong>
          <TeamLogo src={event.away_logo || match.away_icon} name={away} />
        </div>
      </div>

      {rows.length > 0 && (
        <dl className="event-info-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Panel>
  );
}

function StatisticsPanel({ stats, language }) {
  return (
    <Panel title={t(language, 'statistics')}>
      <div className="stats-list">
        {stats.map((row) => {
          const homeNumber = numberFromValue(row.home);
          const awayNumber = numberFromValue(row.away);
          const total = (homeNumber || 0) + (awayNumber || 0);
          const homeWidth = total > 0 ? Math.max(5, Math.min(95, ((homeNumber || 0) / total) * 100)) : 50;
          const awayWidth = 100 - homeWidth;

          return (
            <div className="stat-row" key={`${row.label}-${row.home}-${row.away}`} style={{ '--home-width': `${homeWidth}%`, '--away-width': `${awayWidth}%` }}>
              <div className="stat-values">
                <strong>{cleanDisplayText(row.home, '—')}</strong>
                <span>{cleanDisplayText(row.label, 'Stat')}</span>
                <strong>{cleanDisplayText(row.away, '—')}</strong>
              </div>
              <div className="stat-track" aria-hidden="true">
                <i />
                <b />
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function OddsPanel({ odds, language }) {
  return (
    <Panel title={t(language, 'odds')}>
      <div className="odds-list">
        {odds.map((market) => (
          <div className="odds-market" key={`${market.name}-${market.outcomes?.length || 0}`}>
            <h4>{cleanDisplayText(market.name, 'Market')}</h4>
            <div className="odds-outcomes">
              {(market.outcomes || []).map((outcome) => (
                <div className="odds-chip" key={`${market.name}-${outcome.name}-${outcome.odds}`}>
                  <span>{cleanDisplayText(outcome.name, 'Selection')}</span>
                  <strong>{cleanDisplayText(outcome.odds, '—')}</strong>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function TimelinePanel({ timeline, language }) {
  return (
    <Panel title={t(language, 'timeline')}>
      <div className="timeline-list">
        {timeline.map((item, index) => (
          <article className="timeline-item" key={`${item.minute}-${item.type}-${item.team}-${index}`}>
            <strong>{cleanDisplayText(item.minute, '•')}</strong>
            <div>
              <h4>{cleanDisplayText(item.type, 'Event')}</h4>
              {(item.team || item.text) && (
                <p>
                  {item.team && <span>{cleanDisplayText(item.team)}</span>}
                  {item.team && item.text ? ' · ' : ''}
                  {item.text && cleanDisplayText(item.text)}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function LineupsPanel({ lineups, language, match }) {
  const homePlayers = lineups?.homePlayers || [];
  const awayPlayers = lineups?.awayPlayers || [];

  return (
    <Panel title={t(language, 'lineups')}>
      <div className="lineup-box">
        <div className="lineup-pitch">
          <span>{lineups.homeFormation || '—'}</span>
          <span>{lineups.awayFormation || '—'}</span>
        </div>

        <div className="lineup-columns">
          <div>
            <h4>{t(language, 'homeTeam')} · {cleanDisplayText(match.home, 'Home')}</h4>
            {lineups.homeFormation && <p>{t(language, 'formation')}: {lineups.homeFormation}</p>}
            {homePlayers.length > 0 && <ol>{homePlayers.map((player) => <li key={player}>{player}</li>)}</ol>}
          </div>
          <div>
            <h4>{t(language, 'awayTeam')} · {cleanDisplayText(match.away, 'Away')}</h4>
            {lineups.awayFormation && <p>{t(language, 'formation')}: {lineups.awayFormation}</p>}
            {awayPlayers.length > 0 && <ol>{awayPlayers.map((player) => <li key={player}>{player}</li>)}</ol>}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function RelatedPanel({ related, language }) {
  return (
    <Panel title={t(language, 'relatedMatches')}>
      <div className="related-list">
        {related.map((event) => (
          <div className="related-row" key={event.id || `${event.home}-${event.away}-${event.start}`}>
            <strong>{cleanDisplayText(event.home, 'Home')}</strong>
            <span>{cleanDisplayText(event.away, 'Away')}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function MatchInsights({ details, status, error, match, language }) {
  if (status === 'loading') {
    return (
      <div className="match-insights">
        <Panel title={t(language, 'matchData')}>
          <div className="insight-loading"><span className="mini-loader" /> {t(language, 'loadingMatchData')}</div>
        </Panel>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="match-insights">
        <Panel title={t(language, 'matchData')}>
          <EmptyLine>{error || t(language, 'sportsDataError')}</EmptyLine>
        </Panel>
      </div>
    );
  }

  if (!details || details.matched === false) return null;

  const stats = normalizeStatsForDisplay(details.stats || []);
  const odds = normalizeOddsForDisplay(details.odds || []);
  const timeline = normalizeTimelineForDisplay(details.timeline || []);
  const lineups = hasLineupData(details.lineups) ? details.lineups : null;
  const related = Array.isArray(details.related) ? details.related : [];
  const hasMainPanels = stats.length > 0 || timeline.length > 0 || Boolean(lineups);

  return (
    <div className="match-insights">
      {hasMainPanels && (
        <div className="insight-main">
          {stats.length > 0 && <StatisticsPanel stats={stats} language={language} />}
          {timeline.length > 0 && <TimelinePanel timeline={timeline} language={language} />}
          {lineups && <LineupsPanel lineups={lineups} language={language} match={match} />}
        </div>
      )}

      <aside className="insight-side">
        <EventInfo details={details} match={match} language={language} />
        {odds.length > 0 && <OddsPanel odds={odds} language={language} />}
        {related.length > 0 && <RelatedPanel related={related} language={language} />}
      </aside>
    </div>
  );
}
