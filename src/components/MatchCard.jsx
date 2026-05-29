import TeamLogo from './TeamLogo.jsx';
import { cleanDisplayText, getCategoryBackground, getCategoryVisualKey, parseLeague } from '../lib/helpers.js';
import { t, translateCategory } from '../lib/i18n.js';

export default function MatchCard({ match, onOpen, language }) {
  const { time, league } = parseLeague(match.league, language);
  const home = cleanDisplayText(match.home, 'Home');
  const away = cleanDisplayText(match.away, 'Away');
  const category = match.category ? translateCategory(cleanDisplayText(match.category), language) : t(language, 'streamBadge');
  const disabled = !match.videoid;
  const liveLabel = t(language, 'live');
  const visualKey = getCategoryVisualKey(match);
  const backgroundUrl = getCategoryBackground(match);

  return (
    <button
      type="button"
      className={`match-card broadcast-card broadcast-card--${visualKey} ${disabled ? 'is-disabled' : 'is-live'}`}
      style={{ '--match-bg': `url(${backgroundUrl})` }}
      onClick={() => !disabled && onOpen(match)}
      disabled={disabled}
      aria-label={t(language, 'openMatchAria', { home, away })}
    >
      <span className="broadcast-card-top">
        {!disabled ? (
          <span className="broadcast-live-pill" aria-label={liveLabel}>
            <span className="broadcast-dot" aria-hidden="true" />
            <span className="broadcast-live-main">{liveLabel}</span>
          </span>
        ) : (
          <span className="broadcast-live-pill is-offline">{t(language, 'noStream')}</span>
        )}

        <span className="broadcast-time-pill">
          <span className="broadcast-time-icon" aria-hidden="true">◷</span>
          {time || t(language, 'live')}
        </span>
      </span>

      <span className="broadcast-meta">
        <span className="broadcast-sport" title={category}>{category}</span>
        <span className="broadcast-divider" aria-hidden="true" />
        <span className="broadcast-league" title={league}>{league}</span>
      </span>

      <span className="broadcast-matchup">
        <span className="broadcast-team broadcast-team--home">
          <span className="broadcast-team-stack">
            <TeamLogo src={match.home_icon} name={home} />
            <strong title={home}>{home}</strong>
          </span>
        </span>

        <span className="broadcast-vs-wrap" aria-hidden="true">
          <i className="broadcast-vs-line broadcast-vs-line--left" />
          <span className="broadcast-vs">{t(language, 'vs')}</span>
          <i className="broadcast-vs-line broadcast-vs-line--right" />
        </span>

        <span className="broadcast-team broadcast-team--away">
          <span className="broadcast-team-stack">
            <TeamLogo src={match.away_icon} name={away} align="right" />
            <strong title={away}>{away}</strong>
          </span>
        </span>
      </span>
    </button>
  );
}
