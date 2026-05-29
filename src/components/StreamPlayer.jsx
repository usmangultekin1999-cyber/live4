import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MatchInsights from './MatchInsights.jsx';
import { cleanDisplayText, parseLeague } from '../lib/helpers.js';
import { fetchMatchDetails } from '../lib/api.js';
import { t } from '../lib/i18n.js';

function streamKind(url = '', explicitType = '') {
  const type = String(explicitType || '').toLowerCase();
  const clean = String(url || '').toLowerCase();

  if (type.includes('rtmp') || /^rtmp:/i.test(url)) return 'rtmp';
  if (type.includes('flv') || /\.flv($|\?)/.test(clean)) return 'flv';
  if (type.includes('mpd') || /\.mpd($|\?)/.test(clean)) return 'dash';
  if (type.includes('mpegts') || type === 'ts' || /\.ts($|\?)/.test(clean)) return 'direct';
  if (type.includes('mp4') || /\.(mp4|webm|ogv|ogg)($|\?)/.test(clean)) return 'direct';
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
  const [selectedStreamIndex, setSelectedStreamIndex] = useState(0);
  const streamOptions = useMemo(() => {
    const options = Array.isArray(match?.streams)
      ? match.streams.filter((stream) => stream?.url)
      : [];

    if (options.length) return options;
    return match?.videoid ? [{ id: 'main', name: 'Main Stream', url: match.videoid, type: '' }] : [];
  }, [match]);
  const activeStream = streamOptions[Math.min(selectedStreamIndex, Math.max(streamOptions.length - 1, 0))] || null;
  const streamUrl = useMemo(() => directStreamUrl(activeStream?.url || match?.videoid), [activeStream?.url, match?.videoid]);
  const isChannel = Boolean(match?.is_channel);
  const { time, league } = parseLeague(match?.league || '', language);
  const home = cleanDisplayText(match?.home, 'Home');
  const away = isChannel ? '' : cleanDisplayText(match?.away, 'Away');
  const displayTitle = isChannel || !away ? home : `${home} ${t(language, 'vs')} ${away}`;


  useEffect(() => {
    setSelectedStreamIndex(0);
  }, [match?.id]);

  useEffect(() => {
    if (!match?.id || match?.is_channel) {
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
    document.body.classList.add('has-player-open');
    return () => document.body.classList.remove('has-player-open');
  }, []);

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

      const kind = streamKind(streamUrl, activeStream?.type);

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

      if (kind === 'flv' || kind === 'rtmp') {
        // Browser-native FLV/RTMP playback is not reliable without a media engine.
        // Use iframe fallback and keep the stream URL on the provider domain instead
        // of proxying it through our Worker.
        startFallback();
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
  }, [streamUrl, activeStream?.type, language]);

  const overlay = (
    <div className="player-overlay" role="dialog" aria-modal="true" aria-label={t(language, 'playerLabel')}>
      <div className="player-backdrop" onClick={onClose} />

      <section className="player-panel">
        <header className="player-header">
          <div>
            <span className="live-chip"><i /> {t(language, 'liveBroadcast')}</span>
            <h2>{isChannel || !away ? displayTitle : <>{home} <span>{t(language, 'vs')}</span> {away}</>}</h2>
            <p>{time ? `${time} | ` : ''}{league}</p>
          </div>

          <button type="button" className="close-button" onClick={onClose} aria-label={t(language, 'closePlayer')}>
            ×
          </button>
        </header>

        {streamOptions.length > 1 && (
          <div className="stream-line-tabs" aria-label="Stream lines">
            {streamOptions.map((stream, index) => (
              <button
                key={`${stream.id || stream.url}-${index}`}
                type="button"
                className={index === selectedStreamIndex ? 'is-active' : ''}
                onClick={() => setSelectedStreamIndex(index)}
              >
                <span>{cleanDisplayText(stream.name, `Line ${index + 1}`)}</span>
                {stream.height ? <em>{stream.height}p</em> : null}
              </button>
            ))}
          </div>
        )}

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
              title={`${displayTitle} stream`}
              src={streamUrl}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {!isChannel && (
          <MatchInsights
            details={details}
            status={detailsStatus}
            error={detailsError}
            match={match}
            language={language}
          />
        )}
      </section>
    </div>
  );

  return createPortal(overlay, document.body);
}
