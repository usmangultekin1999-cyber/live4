import { useEffect, useMemo, useRef, useState } from 'react';
import MatchInsights from './MatchInsights.jsx';
import { cleanDisplayText, parseLeague } from '../lib/helpers.js';
import { fetchMatchDetails } from '../lib/api.js';
import { t } from '../lib/i18n.js';

function streamKind(url = '') {
  const clean = String(url).toLowerCase();
  if (/\.mpd($|\?)/.test(clean)) return 'dash';
  if (/\.(mp4|webm|ogv|ogg)($|\?)/.test(clean)) return 'direct';
  return 'hls';
}

function directStreamUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw, window.location.href);

    // Do not let relative stream manifests/segments hit our Cloudflare Worker.
    // The provider must be used with its original absolute URL.
    if (!/^https?:\/\//i.test(raw) && parsed.origin === window.location.origin) return '';
    if (!/^https?:$/i.test(parsed.protocol)) return '';

    return parsed.href;
  } catch (error) {
    return /^https?:\/\//i.test(raw) ? raw : '';
  }
}

export default function StreamPlayer({ match, onClose, language }) {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const [mode, setMode] = useState('loading');
  const [message, setMessage] = useState('');
  const [detailsStatus, setDetailsStatus] = useState('ready');
  const [details, setDetails] = useState(null);
  const [detailsError, setDetailsError] = useState('');
  const streamUrl = useMemo(() => directStreamUrl(match?.videoid), [match]);
  const { time, league } = parseLeague(match?.league || '', language);
  const home = cleanDisplayText(match?.home, 'Home');
  const away = cleanDisplayText(match?.away, 'Away');


  useEffect(() => {
    if (!match?.id) {
      setDetailsStatus('ready');
      setDetails(null);
      setDetailsError('');
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setDetailsStatus('loading');
      setDetails(null);
      setDetailsError('');

      fetchMatchDetails(match, { signal: controller.signal })
        .then((payload) => {
          setDetails(payload);
          setDetailsStatus('ready');
        })
        .catch((error) => {
          if (error?.name === 'AbortError') return;
          // Sports data is optional enrichment. Never show an error block over
          // the broadcast and never let a SportsAPI/Cloudflare failure affect playback.
          setDetails(null);
          setDetailsError('');
          setDetailsStatus('ready');
        });
    }, 1500);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [match?.id, match?.home, match?.away, match?.category, match?.league, language]);

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

        <MatchInsights
          details={details}
          status={detailsStatus}
          error={detailsError}
          match={match}
          language={language}
        />
      </section>
    </div>
  );
}
