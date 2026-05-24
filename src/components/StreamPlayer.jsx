import { useEffect, useMemo, useRef, useState } from 'react';
import { parseLeague } from '../lib/helpers.js';

function streamKind(url = '') {
  const clean = String(url).toLowerCase();
  if (/\.mpd($|\?)/.test(clean)) return 'dash';
  if (/\.(mp4|webm|ogv|ogg)($|\?)/.test(clean)) return 'direct';
  return 'hls';
}

export default function StreamPlayer({ match, onClose }) {
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const [mode, setMode] = useState('loading');
  const [notice, setNotice] = useState('Yayın hazırlanıyor...');
  const streamUrl = useMemo(() => String(match?.videoid || '').trim(), [match]);
  const { time, league } = parseLeague(match?.league || '');

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
      setNotice('Yayın hazırlanıyor...');

      if (!video || !streamUrl) {
        setMode('empty');
        setNotice('Bu maç için yayın adresi bulunamadı.');
        return;
      }

      video.removeAttribute('src');
      video.load();

      const playSoftly = () => {
        video.play().catch(() => {
          setNotice('Oynatmak için player üzerindeki başlat tuşuna bas.');
        });
      };

      const startDirect = () => {
        if (destroyed) return;
        video.src = streamUrl;
        video.load();
        setMode('video');
        playSoftly();
      };

      const startFallback = (message) => {
        if (destroyed) return;
        setMode('fallback');
        setNotice(message || 'Bu kaynak video player ile açılamadı. Embed modu deneniyor.');
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
        } catch (error) {
          startFallback('DASH player başlatılamadı. Embed modu deneniyor.');
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
              playSoftly();
            }
          });
          hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
            if (data?.fatal) {
              hlsInstance?.destroy();
              hlsInstance = null;
              startFallback('Yayın kaynağı HLS player tarafından okunamadı. Embed modu deneniyor.');
            }
          });
        } else {
          startDirect();
        }
      } catch (error) {
        startFallback('HLS player yüklenemedi. Embed modu deneniyor.');
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
  }, [streamUrl]);

  return (
    <div className="player-overlay" role="dialog" aria-modal="true" aria-label="Yayın player">
      <div className="player-backdrop" onClick={onClose} />

      <section className="player-panel">
        <header className="player-header">
          <div>
            <span className="live-chip"><i /> CANLI YAYIN</span>
            <h2>{match.home} <span>vs</span> {match.away}</h2>
            <p>{time ? `${time} | ` : ''}{league}</p>
          </div>

          <button type="button" className="close-button" onClick={onClose} aria-label="Playerı kapat">
            ×
          </button>
        </header>

        <div className="video-shell">
          {(mode === 'loading' || mode === 'empty') && (
            <div className="video-message">
              <span className="loader" />
              <p>{notice}</p>
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
              title={`${match.home} - ${match.away} yayını`}
              src={streamUrl}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <footer className="player-footer">
          <p>{notice}</p>
          <a href={streamUrl} target="_blank" rel="noreferrer">Yayını yeni sekmede aç</a>
        </footer>
      </section>
    </div>
  );
}
