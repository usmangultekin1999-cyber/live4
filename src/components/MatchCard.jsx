import TeamLogo from './TeamLogo.jsx';
import { cleanDisplayText, parseLeague } from '../lib/helpers.js';
import { t, translateCategory } from '../lib/i18n.js';

function splitLiveLabel(label) {
  const parts = String(label || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { primary: label || 'LIVE', secondary: '' };
  return { primary: parts[0], secondary: parts.slice(1).join(' ') };
}

function getSportInitials(category) {
  const words = String(category || 'TV')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return String(words[0] || 'TV').slice(0, 2).toUpperCase();
}

export default function MatchCard({ match, onOpen, language }) {
  const { time, league } = parseLeague(match.league, language);
  const home = cleanDisplayText(match.home, 'Home');
  const away = cleanDisplayText(match.away, 'Away');
  const category = match.category ? translateCategory(cleanDisplayText(match.category), language) : t(language, 'streamBadge');
  const disabled = !match.videoid;
  const liveLabel = t(language, 'liveBroadcast');
  const liveParts = splitLiveLabel(liveLabel);
  const sportInitials = getSportInitials(category);

  return (
    <button
      type="button"
      className={`match-card broadcast-card ${disabled ? 'is-disabled' : 'is-live'}`}
      onClick={() => !disabled && onOpen(match)}
      disabled={disabled}
      aria-label={t(language, 'openMatchAria', { home, away })}
    >
      <span className="broadcast-card-top">
        {!disabled ? (
          <span className="broadcast-live-pill" aria-label={liveLabel}>
            <span className="broadcast-dot" aria-hidden="true" />
            <span className="broadcast-live-main">{liveParts.primary}</span>
            {liveParts.secondary && <span className="broadcast-live-tail">{liveParts.secondary}</span>}
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
        <span className="sport-mini-mark" aria-hidden="true">{sportInitials}</span>
        <span className="broadcast-sport" title={category}>{category}</span>
        <span className="broadcast-divider" aria-hidden="true" />
        <span className="broadcast-league" title={league}>{league}</span>
      </span>

      <span className="broadcast-matchup">
        <span className="broadcast-team broadcast-team--home">
          <TeamLogo src={match.home_icon} name={home} />
          <strong title={home}>{home}</strong>
        </span>

        <span className="broadcast-vs-wrap" aria-hidden="true">
          <i className="broadcast-vs-line broadcast-vs-line--left" />
          <span className="broadcast-vs">{t(language, 'vs')}</span>
          <i className="broadcast-vs-line broadcast-vs-line--right" />
        </span>

        <span className="broadcast-team broadcast-team--away">
          <strong title={away}>{away}</strong>
          <TeamLogo src={match.away_icon} name={away} align="right" />
        </span>
      </span>
    </button>
  );
}
