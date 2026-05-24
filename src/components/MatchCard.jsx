import TeamLogo from './TeamLogo.jsx';
import { parseLeague } from '../lib/helpers.js';

export default function MatchCard({ match, onOpen }) {
  const { time, league } = parseLeague(match.league);
  const disabled = !match.videoid;

  return (
    <button
      type="button"
      className={`match-card ${disabled ? 'is-disabled' : ''}`}
      onClick={() => !disabled && onOpen(match)}
      disabled={disabled}
      aria-label={`Open ${match.home} vs ${match.away}`}
    >
      <span className="card-topline">
        <span className="sport-badge">{match.category || 'Stream'}</span>
        <span className="match-time">{time || 'Live'}</span>
      </span>

      <span className="league-name" title={league}>{league}</span>

      <span className="teams-row">
        <span className="team team--home">
          <TeamLogo src={match.home_icon} name={match.home} />
          <strong title={match.home}>{match.home}</strong>
        </span>

        <span className="versus">VS</span>

        <span className="team team--away">
          <strong title={match.away}>{match.away}</strong>
          <TeamLogo src={match.away_icon} name={match.away} align="right" />
        </span>
      </span>

      <span className="card-action">
        {disabled ? 'No stream' : 'Start watching'}
      </span>
    </button>
  );
}
