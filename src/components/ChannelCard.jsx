import TeamLogo from './TeamLogo.jsx';
import { cleanDisplayText } from '../lib/helpers.js';
import { t } from '../lib/i18n.js';

export default function ChannelCard({ channel, onOpen, language }) {
  const name = cleanDisplayText(channel?.home, 'Channel');
  const disabled = !channel?.videoid;

  return (
    <button
      type="button"
      className={`channel-card ${disabled ? 'is-disabled' : 'is-live'}`}
      onClick={() => !disabled && onOpen(channel)}
      disabled={disabled}
      aria-label={t(language, 'openChannelAria', { channel: name })}
    >
      <span className="channel-card-live">
        <i aria-hidden="true" />
        {t(language, 'live')}
      </span>

      <span className="channel-card-logo">
        <TeamLogo src={channel?.home_icon} name={name} />
      </span>

      <strong title={name}>{name}</strong>
      <small>{t(language, 'liveTv')}</small>
    </button>
  );
}
