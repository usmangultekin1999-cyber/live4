import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MatchInsights from './MatchInsights.jsx';
import TeamLogo from './TeamLogo.jsx';
import { cleanDisplayText, parseLeague } from '../lib/helpers.js';
import { fetchMatchDetails } from '../lib/api.js';
import { t } from '../lib/i18n.js';

function streamKind(url = '', explicitType = '') {
  const type = String(explicitType || '').toLowerCase();
  const clean = String(url || '').toLowerCase();

  if (type.includes('rtmp') || /^rtmp:/i.test(url)) return 'rtmp';
  if (type.includes('flv') || /\.flv($|\?)/.test(clean)) return 'flv';
  if (type.includes('mpd') || /\.mpd($|\?)/.test(clean)) return 'dash';
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


function formatStandingNumber(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : cleanDisplayText(value, fallback);
}

function buildFallbackScoreTable(match = {}) {
  const home = cleanDisplayText(match?.home, 'Home');
  const away = cleanDisplayText(match?.away, 'Away');
  const homeScore = match?.home_score ?? '—';
  const awayScore = match?.away_score ?? '—';
  const progress = cleanDisplayText(match?.progress, 'Live');

  return {
    source: 'local-match',
    rows: [
      { position: 1, team: home, logo: match?.home_icon || '', played: progress, gd: homeScore, points: progress, side: 'home' },
      { position: 2, team: away, logo: match?.away_icon || '', played: progress, gd: awayScore, points: progress, side: 'away' }
    ]
  };
}

function PlayerStandings({ standings = [], match, language }) {
  const rows = Array.isArray(standings?.rows) ? standings.rows : Array.isArray(standings) ? standings : [];
  if (!rows.length) return null;

  const first = rows[0] || {};
  const second = rows[1] || {};
  const homeScore = formatStandingNumber(first.gd, '—');
  const awayScore = formatStandingNumber(second.gd, '—');
  const progress = cleanDisplayText(first.points || second.points || match?.progress, 'Live');

  return (
    <aside className="player-standings-card player-score-card" aria-label={t(language, 'standings')}>
      <div className="player-standings-head">
        <div>
          <span>{t(language, 'leagueTable')}</span>
          <h3>{t(language, 'standings')}</h3>
        </div>
        <small>{progress}</small>
      </div>

      <div className="scoreboard-hero" aria-label="Score board">
        <div className="scoreboard-team is-home">
          <TeamLogo src={first.logo || match?.home_icon} name={first.team} />
          <strong>{cleanDisplayText(first.team, 'Home')}</strong>
        </div>
        <div className="scoreboard-score">
          <strong>{homeScore}</strong>
          <span>{t(language, 'vs')}</span>
          <strong>{awayScore}</strong>
        </div>
        <div className="scoreboard-team is-away">
          <TeamLogo src={second.logo || match?.away_icon} name={second.team} />
          <strong>{cleanDisplayText(second.team, 'Away')}</strong>
        </div>
      </div>

      <div className="standings-table standings-table--compact" role="table" aria-label={t(language, 'standings')}>
        <div className="standings-row standings-row--head" role="row">
          <span>#</span>
          <span>{t(language, 'team')}</span>
          <span>Score</span>
          <span>Status</span>
        </div>

        {rows.slice(0, 8).map((row, index) => (
          <div className={`standings-row ${row.side ? 'is-highlighted' : ''}`} role="row" key={`${row.position || index}-${row.team}`}>
            <span>{formatStandingNumber(row.position || index + 1)}</span>
            <span className="standings-team">
              <TeamLogo src={row.logo || (row.side === 'home' ? match?.home_icon : match?.away_icon)} name={row.team} />
              <strong>{cleanDisplayText(row.team, 'Team')}</strong>
            </span>
            <span><b>{formatStandingNumber(row.gd)}</b></span>
            <span>{cleanDisplayText(row.points || row.played || progress, 'Live')}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

function officialOddsMarkets(details = {}) {
  const data = details?.official_odds || details?.officialOdds || null;
  const markets = Array.isArray(data?.markets) ? data.markets : [];
  return markets
    .map((market) => ({
      name: cleanDisplayText(market.name, 'Market'),
      bookmaker: cleanDisplayText(market.bookmaker, ''),
      redirectUrl: cleanDisplayText(market.redirect_url || data.redirect_url || 'https://cryptobet545.com'),
      outcomes: Array.isArray(market.outcomes)
        ? market.outcomes
            .map((outcome) => ({
              name: cleanDisplayText(outcome.name, 'Selection'),
              odds: cleanDisplayText(outcome.odds, ''),
              side: cleanDisplayText(outcome.side, '')
            }))
            .filter((outcome) => outcome.name && outcome.odds)
        : []
    }))
    .filter((market) => market.outcomes.length)
    .slice(0, 4);
}

function safeBetUrl(value = '') {
  const fallback = 'https://cryptobet545.com';
  try {
    const parsed = new URL(value || fallback);
    return /^https?:$/i.test(parsed.protocol) ? parsed.href : fallback;
  } catch (error) {
    return fallback;
  }
}

function matchCanDraw(match = {}) {
  const haystack = `${match?.category || ''} ${match?.league || ''} ${match?.home || ''} ${match?.away || ''}`.toLowerCase();
  if (/basket|tennis|badminton|baseball|volley|table tennis|snooker|cricket|mma|boxing/.test(haystack)) return false;
  return /football|soccer|futbol|futsal|beach football|hockey|ice hockey|fifa|pes|efootball/.test(haystack);
}

function fallbackOddsMarkets(match = {}, details = {}, language = 'en') {
  const redirectUrl = cleanDisplayText(details?.official_odds?.redirect_url || details?.officialOdds?.redirect_url || 'https://cryptobet545.com');
  const home = cleanDisplayText(match?.home, t(language, 'homeTeam'));
  const away = cleanDisplayText(match?.away, t(language, 'awayTeam'));
  if (!home || !away) return [];

  const winnerOutcomes = [
    { name: home, odds: t(language, 'openOdds'), side: 'home', isFallback: true },
    ...(matchCanDraw(match) ? [{ name: t(language, 'draw'), odds: t(language, 'openOdds'), side: 'draw', isFallback: true }] : []),
    { name: away, odds: t(language, 'openOdds'), side: 'away', isFallback: true }
  ];

  return [
    {
      name: t(language, 'matchWinner'),
      bookmaker: 'Cryptobet',
      redirectUrl,
      fallback: true,
      outcomes: winnerOutcomes
    },
    {
      name: t(language, 'totalsMarket'),
      bookmaker: 'Cryptobet',
      redirectUrl,
      fallback: true,
      outcomes: [
        { name: t(language, 'overLine'), odds: t(language, 'openOdds'), isFallback: true },
        { name: t(language, 'underLine'), odds: t(language, 'openOdds'), isFallback: true }
      ]
    },
    {
      name: t(language, 'handicap'),
      bookmaker: 'Cryptobet',
      redirectUrl,
      fallback: true,
      outcomes: [
        { name: home, odds: t(language, 'openOdds'), side: 'home', isFallback: true },
        { name: away, odds: t(language, 'openOdds'), side: 'away', isFallback: true }
      ]
    }
  ];
}

function OfficialOddsBoard({ details, match, language }) {
  const markets = officialOddsMarkets(details);
  const hasOfficialMarkets = markets.length > 0;
  const displayMarkets = hasOfficialMarkets ? markets : fallbackOddsMarkets(match, details, language);

  return (
    <section
      className={`official-odds-board ${hasOfficialMarkets ? 'has-official-odds' : 'is-fallback'}`.trim()}
      aria-label={t(language, 'officialOdds')}
    >
      <div className="official-odds-head">
        <div>
          <span>{hasOfficialMarkets ? t(language, 'officialOdds') : t(language, 'odds')}</span>
          <h3>{t(language, 'matchOdds')}</h3>
        </div>
        <small>{hasOfficialMarkets ? t(language, 'tapOddsToBet') : 'Cryptobet'}</small>
      </div>

      <div className="official-odds-grid">
        {displayMarkets.map((market) => (
          <article className={`official-odds-market ${market.fallback ? 'is-fallback-market' : ''}`.trim()} key={`${market.name}-${market.bookmaker}`}>
            <div className="official-market-title">
              <strong>{market.name}</strong>
              {market.bookmaker && <em>{market.bookmaker}</em>}
            </div>
            <div className="official-outcomes">
              {market.outcomes.slice(0, 4).map((outcome) => (
                <a
                  className={`official-odd-chip ${outcome.side ? `is-${outcome.side}` : ''} ${market.fallback ? 'is-link-only' : ''}`.trim()}
                  key={`${market.name}-${outcome.name}-${outcome.odds}`}
                  href={safeBetUrl(market.redirectUrl)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                >
                  <span>{outcome.name}</span>
                  <strong>{outcome.odds}</strong>
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
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
          // Optional data must never block the broadcast playback.
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

        <div className="player-watch-grid">
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
        </div>

        {!isChannel && (
          <div className="player-bottom-stack odds-only">
            <OfficialOddsBoard details={details} match={match} language={language} />
          </div>
        )}

        {!isChannel && (
          <div className="player-extra-data">
            <MatchInsights
              details={details}
              status={detailsStatus}
              error={detailsError}
              match={match}
              language={language}
            />
          </div>
        )}
      </section>
    </div>
  );

  return createPortal(overlay, document.body);
}
