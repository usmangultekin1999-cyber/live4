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

function CoverageNotice({ details, match, language }) {
  if (details?.matched !== false) return null;

  return (
    <Panel title={t(language, 'sportsApiCoverage')} className="insight-panel--notice">
      <EmptyLine>
        {t(language, 'sportsApiNoMatch', {
          home: cleanDisplayText(match?.home, 'Home'),
          away: cleanDisplayText(match?.away, 'Away')
        })}
      </EmptyLine>
    </Panel>
  );
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

      {rows.length ? (
        <dl className="event-info-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <EmptyLine>{details?.matched === false ? t(language, 'sportsApiNoMatchShort') : t(language, 'noSportsData')}</EmptyLine>
      )}
    </Panel>
  );
}

function StatisticsPanel({ stats, language }) {
  return (
    <Panel title={t(language, 'statistics')}>
      {stats.length ? (
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
      ) : (
        <EmptyLine>{t(language, 'noStatistics')}</EmptyLine>
      )}
    </Panel>
  );
}

function OddsPanel({ odds, language }) {
  return (
    <Panel title={t(language, 'odds')}>
      {odds.length ? (
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
      ) : (
        <EmptyLine>{t(language, 'noOdds')}</EmptyLine>
      )}
    </Panel>
  );
}

function TimelinePanel({ timeline, language }) {
  return (
    <Panel title={t(language, 'timeline')}>
      {timeline.length ? (
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
      ) : (
        <EmptyLine>{t(language, 'noTimeline')}</EmptyLine>
      )}
    </Panel>
  );
}

function LineupsPanel({ lineups, language, match }) {
  const homePlayers = lineups?.homePlayers || [];
  const awayPlayers = lineups?.awayPlayers || [];
  const hasData = Boolean(lineups?.homeFormation || lineups?.awayFormation || homePlayers.length || awayPlayers.length);

  return (
    <Panel title={t(language, 'lineups')}>
      {hasData ? (
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
      ) : (
        <EmptyLine>{t(language, 'noLineups')}</EmptyLine>
      )}
    </Panel>
  );
}

function RelatedPanel({ related, language }) {
  return (
    <Panel title={t(language, 'relatedMatches')}>
      {related.length ? (
        <div className="related-list">
          {related.map((event) => (
            <div className="related-row" key={event.id || `${event.home}-${event.away}-${event.start}`}>
              <strong>{cleanDisplayText(event.home, 'Home')}</strong>
              <span>{cleanDisplayText(event.away, 'Away')}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyLine>{t(language, 'noRelatedMatches')}</EmptyLine>
      )}
    </Panel>
  );
}


function SportsApiCoveragePanel({ details, match, language }) {
  const count = details?.coverage?.checked_events ?? details?.sportsApi?.eventsCount ?? 0;
  const sources = Array.isArray(details?.coverage?.checked_sources) ? details.coverage.checked_sources : [];
  const candidates = Array.isArray(details?.sportsApi?.topCandidates) ? details.sportsApi.topCandidates : [];

  return (
    <Panel title={t(language, 'sportsApiCoverage')} badge={t(language, 'notMatched')} className="insight-panel--notice">
      <p className="insight-empty">
        {t(language, 'sportsApiNoMatch', {
          home: cleanDisplayText(match?.home, 'Home'),
          away: cleanDisplayText(match?.away, 'Away')
        })}
      </p>
      <p className="insight-note">{t(language, 'sportsApiEventsChecked', { count })}</p>
      {sources.length > 0 && <p className="insight-note">{sources.join(' · ')}</p>}

      {candidates.length > 0 && (
        <div className="candidate-list">
          <h4>{t(language, 'nearestSportsEvents')}</h4>
          {candidates.map((candidate) => (
            <div className="candidate-row" key={candidate.id}>
              <span>{cleanDisplayText(candidate.event?.home, 'Home')} {t(language, 'vs')} {cleanDisplayText(candidate.event?.away, 'Away')}</span>
              <strong>{t(language, 'matchScore')}: {candidate.score}</strong>
            </div>
          ))}
        </div>
      )}
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

  if (!details) return null;

  if (details.matched === false) {
    return (
      <div className="match-insights">
        <div className="insight-main">
          <SportsApiCoveragePanel details={details} match={match} language={language} />
        </div>

        <aside className="insight-side">
          <EventInfo details={details} match={match} language={language} />
        </aside>
      </div>
    );
  }

  return (
    <div className="match-insights">
      <div className="insight-main">
        <CoverageNotice details={details} match={match} language={language} />
        <StatisticsPanel stats={details.stats || []} language={language} />
        <TimelinePanel timeline={details.timeline || []} language={language} />
        <LineupsPanel lineups={details.lineups} language={language} match={match} />
      </div>

      <aside className="insight-side">
        <EventInfo details={details} match={match} language={language} />
        <OddsPanel odds={details.odds || []} language={language} />
        <RelatedPanel related={details.related || []} language={language} />
      </aside>
    </div>
  );
}
