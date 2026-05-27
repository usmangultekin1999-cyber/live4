import TeamLogo from './TeamLogo.jsx';
import { cleanDisplayText, parseLeague } from '../lib/helpers.js';
import { t, translateCategory } from '../lib/i18n.js';

export default function MatchCard({ match, onOpen, language }) {
  const { time, league } = parseLeague(match.league, language);
  const home = cleanDisplayText(match.home, 'Home');
  const away = cleanDisplayText(match.away, 'Away');
  const category = match.category ? translateCategory(cleanDisplayText(match.category), language) : t(language, 'streamBadge');
  const disabled = !match.videoid;

  return (
    <button
      type="button"
      className={`match-card ${disabled ? 'is-disabled' : 'has-stream'}`}
      onClick={() => !disabled && onOpen(match)}
      disabled={disabled}
      aria-label={t(language, 'openMatchAria', { home, away })}
    >
      <span className="card-topline">
        {disabled ? (
          <span className="card-status-badge card-status-badge--off">{t(language, 'noStream')}</span>
        ) : (
          <span className="card-status-badge card-status-badge--live">
            <i aria-hidden="true" />
            {t(language, 'liveBroadcast')}
          </span>
        )}
        <span className="match-time">{time || t(language, 'live')}</span>
      </span>

      <span className="league-name" title={`${category} · ${league}`}>
        <span>{category}</span>
        <b aria-hidden="true">•</b>
        <em>{league}</em>
      </span>

      <span className="teams-row">
        <span className="team team--home">
          <TeamLogo src={match.home_icon} name={home} />
          <strong title={home}>{home}</strong>
        </span>

        <span className="versus">{t(language, 'vs')}</span>

        <span className="team team--away">
          <strong title={away}>{away}</strong>
          <TeamLogo src={match.away_icon} name={away} align="right" />
        </span>
      </span>
    </button>
  );
}
