import { useEffect, useMemo, useRef, useState } from 'react';
import { cleanDisplayText, parseLeague } from '../lib/helpers.js';
import { t } from '../lib/i18n.js';

function streamKind(url = '') {
  const clean = String(url).toLowerCase();
  if (/\.mpd($|\?)/.test(clean)) return 'dash';
  if (/\.(mp4|webm|ogv|ogg)($|\?)/.test(clean)) return 'direct';
  return 'hls';
}

export default function StreamPlayer({ match, onClose, language }) {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const [mode, setMode] = useState('loading');
  const [message, setMessage] = useState('');
  const streamUrl = useMemo(() => String(match?.videoid || '').trim(), [match]);
  const { time, league } = parseLeague(match?.league || '', language);
  const home = cleanDisplayText(match?.home, 'Home');
  const away = cleanDisplayText(match?.away, 'Away');

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    let destroyed = false;
    let hlsInstance = null;
    let dashInstance = null;

    async function startPlayer() {
      setMode('loading');
      setMessage('');

      if (!video || !streamUrl) {
        setMode('empty');
        setMessage(t(language, 'streamUnavailable'));
        return;
      }

      video.removeAttribute('src');
      video.load();

      const playSoftly = () => {
        video.play().catch(() => {
          // Autoplay can be blocked by the browser. The user can press play manually.
        });
      };

      const startDirect = () => {
        if (destroyed) return;
        video.src = streamUrl;
        video.load();
        setMode('video');
        setMessage('');
        playSoftly();
      };

      const startFallback = () => {
        if (destroyed) return;
        setMode('fallback');
        setMessage('');
      };

      const kind = streamKind(streamUrl);

      if (kind === 'direct') {
        startDirect();
        return;
      }

      if (kind === 'dash') {
        try {
          const mod = await import('dashjs');
          const dashjs = mod.default || mod;
          if (destroyed) return;
          dashInstance = dashjs.MediaPlayer().create();
          dashInstance.initialize(video, streamUrl, true);
          setMode('video');
          setMessage('');
        } catch (error) {
          startFallback();
        }
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        startDirect();
        return;
      }

      try {
        const mod = await import('hls.js');
        const Hls = mod.default || mod;

        if (destroyed) return;

        if (Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 60
          });

          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
            hlsInstance.loadSource(streamUrl);
          });
          hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!destroyed) {
              setMode('video');
              setMessage('');
              playSoftly();
            }
          });
          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (data?.fatal) {
              hlsInstance?.destroy();
              hlsInstance = null;
              startFallback();
            }
          });
        } else {
          startDirect();
        }
      } catch (error) {
        startFallback();
      }
    }

    startPlayer();

    return () => {
      destroyed = true;
      if (hlsInstance) hlsInstance.destroy();
      if (dashInstance) dashInstance.reset();
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [streamUrl, language]);

  return (
    <div className="player-overlay" role="dialog" aria-modal="true" aria-label={t(language, 'playerLabel')}>
      <div className="player-backdrop" onClick={onClose} />

      <section className="player-panel">
        <header className="player-header">
          <div>
            <span className="live-chip"><i /> {t(language, 'liveBroadcast')}</span>
            <h2>{home} <span>{t(language, 'vs')}</span> {away}</h2>
            <p>{time ? `${time} | ` : ''}{league}</p>
          </div>

          <button type="button" className="close-button" onClick={onClose} aria-label={t(language, 'closePlayer')}>
            ×
          </button>
        </header>

        <div className="video-shell">
          {mode === 'loading' && (
            <div className="video-message" aria-label="Loading stream">
              <span className="loader" />
            </div>
          )}

          {mode === 'empty' && (
            <div className="video-message">
              <p>{message}</p>
            </div>
          )}

          <video
            ref={videoRef}
            className={mode === 'video' || mode === 'loading' ? 'is-visible' : ''}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />

          {mode === 'fallback' && (
            <iframe
              ref={iframeRef}
              title={`${home} ${t(language, 'vs')} ${away} stream`}
              src={streamUrl}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      </section>
    </div>
  );
}
