import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryBar from './components/CategoryBar.jsx';
import MatchCard from './components/MatchCard.jsx';
import ChannelCard from './components/ChannelCard.jsx';
import StreamPlayer from './components/StreamPlayer.jsx';
import { fetchMatches, fetchChannels } from './lib/api.js';
import {
  ALL_CATEGORY,
  getCategoryId,
  getChannelFromUrl,
  getMatchFromUrl,
  groupByCategory,
  isMatchSearchHit,
  setChannelUrl,
  setMatchUrl,
  sortCategoryItems
} from './lib/helpers.js';
import {
  BRAND_NAME,
  LANGUAGES,
  getInitialLanguage,
  saveLanguage,
  t,
  translateCategory
} from './lib/i18n.js';
import { categoryIcon, uiText } from './lib/designText.js';

const AUTO_REFRESH_MS = 120_000;

function matchWord(language, count) {
  return count === 1 ? t(language, 'matchSingular') : t(language, 'matchPlural');
}

function Header({ query, onQueryChange, language, onLanguageChange }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label={t(language, 'homeAria')}>
        <img className="brand-logo" src="/LOGO.PNG" alt={BRAND_NAME} width="204" height="60" />
      </a>

      <div className="header-controls">
        <label className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t(language, 'searchPlaceholder')}
            aria-label={t(language, 'searchAria')}
          />
        </label>


        <label className="language-control">
          <span aria-hidden="true">🌐</span>
          <select
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            aria-label={t(language, 'languageAria')}
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
    </header>
  );
}

function TopCategoryTabs({ categories, activeCategory, onChange, language }) {
  return (
    <div className="top-category-wrap" aria-label={t(language, 'categoriesAria')}>
      <div className="top-category-tabs">
        {categories.map((category) => {
          const active = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              className={`top-category-tab ${active ? 'is-active' : ''}`}
              onClick={() => onChange(category.id)}
            >
              <span className="top-category-icon" aria-hidden="true">{categoryIcon(category.id)}</span>
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className="top-view-button" onClick={() => onChange(ALL_CATEGORY)}>
        {uiText(language, 'viewAll')} <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}

function ContentModeTabs({ viewMode, onChange, language, matchCount, channelCount }) {
  return (
    <div className="content-mode-tabs" aria-label={t(language, 'contentTabsAria')}>
      <button
        type="button"
        className={viewMode === 'matches' ? 'is-active' : ''}
        onClick={() => onChange('matches')}
      >
        <span aria-hidden="true">●</span>
        <strong>{t(language, 'liveMatches')}</strong>
        <small>{matchCount}</small>
      </button>
      <button
        type="button"
        className={viewMode === 'channels' ? 'is-active' : ''}
        onClick={() => onChange('channels')}
      >
        <span aria-hidden="true">📺</span>
        <strong>{t(language, 'channels')}</strong>
        <small>{channelCount}</small>
      </button>
    </div>
  );
}

function EmptyState({ hasQuery, onClear, language, titleKey = 'noMatchesFound', emptyKey = 'apiNoMatches', queryKey = 'noMatchesMatch', icon = '⚽' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h2>{t(language, titleKey)}</h2>
      <p>{hasQuery ? t(language, queryKey) : t(language, emptyKey)}</p>
      {hasQuery && <button type="button" onClick={onClear}>{t(language, 'clearFilters')}</button>}
    </div>
  );
}

function ErrorState({ message, onRetry, language }) {
  return (
    <div className="error-state">
      <h2>{t(language, 'couldNotLoad')}</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>{t(language, 'tryAgain')}</button>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="match-grid" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="match-card skeleton" key={index}>
          <span />
          <strong />
          <em />
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [matches, setMatches] = useState([]);
  const [channels, setChannels] = useState([]);
  const [status, setStatus] = useState('loading');
  const [channelsStatus, setChannelsStatus] = useState('idle');
  const [error, setError] = useState('');
  const [channelsError, setChannelsError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [viewMode, setViewMode] = useState(() => getChannelFromUrl() ? 'channels' : 'matches');
  const [activeMatchId, setActiveMatchId] = useState(getMatchFromUrl());
  const [activeChannelId, setActiveChannelId] = useState(getChannelFromUrl());
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    saveLanguage(language);
    document.documentElement.lang = language;
    document.title = `${BRAND_NAME} | ${t(language, 'liveStreams')}`;
  }, [language]);

  const loadMatches = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setStatus('loading');
      setError('');
    }

    try {
      const payload = await fetchMatches();
      setMatches(payload.data || []);
      setStatus('ready');
      setError('');
    } catch (loadError) {
      if (!silent) {
        setStatus('error');
        setError(loadError instanceof Error ? loadError.message : 'An unknown error occurred.');
      }
    }
  }, []);

  const loadChannels = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setChannelsStatus('loading');
      setChannelsError('');
    }

    try {
      const payload = await fetchChannels();
      setChannels(payload.data || []);
      setChannelsStatus('ready');
      setChannelsError('');
    } catch (loadError) {
      if (!silent) {
        setChannelsStatus('error');
        setChannelsError(loadError instanceof Error ? loadError.message : 'An unknown error occurred.');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function firstLoad() {
      if (!cancelled) await loadMatches();
    }

    firstLoad();
    const intervalId = window.setInterval(() => loadMatches({ silent: true }), AUTO_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [loadMatches]);

  useEffect(() => {
    let cancelled = false;

    async function firstLoad() {
      if (!cancelled) await loadChannels({ silent: viewMode !== 'channels' });
    }

    firstLoad();
    const intervalId = window.setInterval(() => loadChannels({ silent: true }), AUTO_REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [loadChannels, viewMode]);

  useEffect(() => {
    function onPopState() {
      const nextMatchId = getMatchFromUrl();
      const nextChannelId = getChannelFromUrl();
      setActiveMatchId(nextMatchId);
      setActiveChannelId(nextChannelId);
      if (nextChannelId) setViewMode('channels');
      else if (nextMatchId) setViewMode('matches');
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const categories = useMemo(() => {
    const counts = new Map([[ALL_CATEGORY, matches.length]]);

    for (const match of matches) {
      const id = getCategoryId(match);
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    return [...counts.entries()]
      .map(([id, count]) => ({ id, count, label: translateCategory(id, language) }))
      .sort((a, b) => sortCategoryItems(a, b, language));
  }, [matches, language]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const categoryHit = activeCategory === ALL_CATEGORY || getCategoryId(match) === activeCategory;
      return categoryHit && isMatchSearchHit(match, query);
    });
  }, [matches, activeCategory, query]);

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => isMatchSearchHit(channel, query));
  }, [channels, query]);

  const groupedMatches = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return groupByCategory(filteredMatches);
    return [[activeCategory, filteredMatches]];
  }, [activeCategory, filteredMatches]);

  const activeMatch = useMemo(() => {
    if (!activeMatchId) return null;
    return matches.find((match) => String(match.id) === String(activeMatchId)) || null;
  }, [matches, activeMatchId]);

  const activeChannel = useMemo(() => {
    if (!activeChannelId) return null;
    return channels.find((channel) => String(channel.id) === String(activeChannelId)) || null;
  }, [channels, activeChannelId]);

  const activePlayable = activeChannel || activeMatch;

  function openMatch(match) {
    setActiveChannelId(null);
    setActiveMatchId(String(match.id));
    setViewMode('matches');
    setMatchUrl(String(match.id));
  }

  function openChannel(channel) {
    setActiveMatchId(null);
    setActiveChannelId(String(channel.id));
    setViewMode('channels');
    setChannelUrl(String(channel.id));
  }

  function closeMatch() {
    setActiveMatchId(null);
    setActiveChannelId(null);
    setMatchUrl(null);
    setChannelUrl(null);
  }

  function switchViewMode(mode) {
    setViewMode(mode);
    setActiveCategory(ALL_CATEGORY);
    if (mode === 'matches') setChannelUrl(null);
    if (mode === 'channels') setMatchUrl(null);
  }

  function clearFilters() {
    setQuery('');
    setActiveCategory(ALL_CATEGORY);
  }

  return (
    <div className="app-shell">
      <Header
        query={query}
        onQueryChange={setQuery}
        language={language}
        onLanguageChange={setLanguage}
      />

      <main>
        <div className="main-layout">
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
            language={language}
            viewMode={viewMode}
            onViewModeChange={switchViewMode}
            channelsCount={channels.length}
          />

          <section className="content-wrap" aria-live="polite">
            <section className="content-top-tabs">
              <ContentModeTabs
                viewMode={viewMode}
                onChange={switchViewMode}
                language={language}
                matchCount={matches.length}
                channelCount={channels.length}
              />

              {viewMode === 'matches' && (
                <TopCategoryTabs
                  categories={categories}
                  activeCategory={activeCategory}
                  onChange={setActiveCategory}
                  language={language}
                />
              )}
            </section>

            {viewMode === 'matches' && status === 'loading' && <SkeletonGrid />}

            {viewMode === 'matches' && status === 'error' && (
              <ErrorState message={error} onRetry={() => loadMatches()} language={language} />
            )}

            {viewMode === 'matches' && status === 'ready' && filteredMatches.length === 0 && (
              <EmptyState
                hasQuery={Boolean(query || activeCategory !== ALL_CATEGORY)}
                onClear={clearFilters}
                language={language}
              />
            )}

            {viewMode === 'matches' && status === 'ready' && filteredMatches.length > 0 && groupedMatches.map(([category, items]) => (
              <section className="match-section" key={category}>
                <div className="section-heading">
                  <div className="section-title-group">
                    <span className="section-sport-icon" aria-hidden="true">{categoryIcon(category)}</span>
                    <h2>{translateCategory(category, language)}</h2>
                  </div>

                  <div className="section-actions">
                    <button type="button" onClick={() => setActiveCategory(category)}>{uiText(language, 'viewAll')}</button>
                    <i aria-hidden="true" />
                    <span>{items.length} {matchWord(language, items.length)}</span>
                  </div>
                </div>

                <div className="match-grid">
                  {items.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onOpen={openMatch}
                      language={language}
                    />
                  ))}
                </div>
              </section>
            ))}

            {viewMode === 'channels' && channelsStatus === 'loading' && <SkeletonGrid />}

            {viewMode === 'channels' && channelsStatus === 'error' && (
              <ErrorState message={channelsError} onRetry={() => loadChannels()} language={language} />
            )}

            {viewMode === 'channels' && channelsStatus === 'ready' && filteredChannels.length === 0 && (
              <EmptyState
                hasQuery={Boolean(query)}
                onClear={clearFilters}
                language={language}
                titleKey="noChannelsFound"
                emptyKey="apiNoChannels"
                icon="📺"
              />
            )}

            {viewMode === 'channels' && channelsStatus === 'ready' && filteredChannels.length > 0 && (
              <section className="match-section channel-section">
                <div className="section-heading">
                  <div className="section-title-group">
                    <span className="section-sport-icon" aria-hidden="true">📺</span>
                    <h2>{t(language, 'channels')}</h2>
                  </div>
                  <div className="section-actions">
                    <span>{filteredChannels.length} {filteredChannels.length === 1 ? t(language, 'channelSingular') : t(language, 'channelPlural')}</span>
                  </div>
                </div>

                <div className="channel-grid">
                  {filteredChannels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      onOpen={openChannel}
                      language={language}
                    />
                  ))}
                </div>
              </section>
            )}
          </section>
        </div>
      </main>

      {activePlayable && <StreamPlayer match={activePlayable} onClose={closeMatch} language={language} />}
    </div>
  );
}
