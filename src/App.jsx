import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryBar from './components/CategoryBar.jsx';
import MatchCard from './components/MatchCard.jsx';
import StreamPlayer from './components/StreamPlayer.jsx';
import { fetchMatches } from './lib/api.js';
import {
  ALL_CATEGORY,
  getCategoryId,
  getMatchFromUrl,
  groupByCategory,
  isMatchSearchHit,
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
          <span aria-hidden="true">⌕</span>
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

function EmptyState({ hasQuery, onClear, language }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⚽</div>
      <h2>{t(language, 'noMatchesFound')}</h2>
      <p>{hasQuery ? t(language, 'noMatchesMatch') : t(language, 'apiNoMatches')}</p>
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
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeMatchId, setActiveMatchId] = useState(getMatchFromUrl());
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
    function onPopState() {
      setActiveMatchId(getMatchFromUrl());
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

  const groupedMatches = useMemo(() => {
    if (activeCategory === ALL_CATEGORY) return groupByCategory(filteredMatches);
    return [[activeCategory, filteredMatches]];
  }, [activeCategory, filteredMatches]);

  const activeMatch = useMemo(() => {
    if (!activeMatchId) return null;
    return matches.find((match) => String(match.id) === String(activeMatchId)) || null;
  }, [matches, activeMatchId]);

  function openMatch(match) {
    setActiveMatchId(String(match.id));
    setMatchUrl(String(match.id));
  }

  function closeMatch() {
    setActiveMatchId(null);
    setMatchUrl(null);
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
          />

          <section className="content-wrap" aria-live="polite">
            <div className="list-live-strip">
              <span><i aria-hidden="true" />{t(language, 'liveBroadcast')}</span>
              {status === 'ready' && (
                <small>{filteredMatches.length} {matchWord(language, filteredMatches.length)}</small>
              )}
            </div>

            {status === 'loading' && <SkeletonGrid />}

            {status === 'error' && (
              <ErrorState message={error} onRetry={() => loadMatches()} language={language} />
            )}

            {status === 'ready' && filteredMatches.length === 0 && (
              <EmptyState
                hasQuery={Boolean(query || activeCategory !== ALL_CATEGORY)}
                onClear={clearFilters}
                language={language}
              />
            )}

            {status === 'ready' && filteredMatches.length > 0 && groupedMatches.map(([category, items]) => (
              <section className="match-section" key={category}>
                <div className="section-heading">
                  <h2>{translateCategory(category, language)}</h2>
                  <span>{items.length} {matchWord(language, items.length)}</span>
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
          </section>
        </div>
      </main>

      {activeMatch && <StreamPlayer match={activeMatch} onClose={closeMatch} language={language} />}
    </div>
  );
}
