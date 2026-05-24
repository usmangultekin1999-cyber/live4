import { useState } from 'react';
import { getInitials } from '../lib/helpers.js';

export default function TeamLogo({ src, name, align = 'left' }) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;

  return (
    <span className={`team-logo team-logo--${align}`} aria-hidden="true">
      {hasImage ? (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </span>
  );
}
