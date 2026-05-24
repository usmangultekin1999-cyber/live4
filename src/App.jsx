import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryBar from './components/CategoryBar.jsx';
import MatchCard from './components/MatchCard.jsx';
import StreamPlayer from './components/StreamPlayer.jsx';
import { fetchMatches } from './lib/api.js';
import {
  ALL_CATEGORY,
  formatMetaTime,
  getMatchFromUrl,
  groupByCategory,
  isMatchSearchHit,
  setMatchUrl,
  sortCategories
} from './lib/helpers.js';

const AUTO_REFRESH_MS = 120_000;

function Header({ query, onQueryChange }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Home page">
        <span className="brand-signal" aria-hidden="true">
          <i />
        </span>
        <strong>ErosMatch</strong>
      </a>

      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search team or league..."
          aria-label="Search team or league"
        />
      </label>
    </header>
  );
}

function Hero({ total, generatedAt, expiresIn, onRefresh, loading }) {
  return (
    <section className="hero">
      <div className="hero-glow" />
      <div className="hero-content">
        <span className="hero-live"><i /> LIVE BROADCAST</span>
        <h1>All Matches. <span>One Place.</span></h1>
        <p><strong>{total}</strong> matches are live right now. Pick a match and start watching instantly.</p>

        <div className="hero-meta">
          {generatedAt && <span>Last updated: {formatMetaTime(generatedAt)}</span>}
          {expiresIn && <span>List expires in: {expiresIn}</span>}
          <span>Auto refresh: 2 minutes</span>
          <button type="button" onClick={onRefresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh list'}
          </button>
        </div>
      </div>
    </section>
  );
}

function EmptyState({ hasQuery, onClear }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">⚽</div>
      <h2>No matches found</h2>
      <p>{hasQuery ? 'No matches match your search or category filter.' : 'The API did not return any matches right now.'}</p>
      {hasQuery && <button type="button" onClick={onClear}>Clear filters</button>}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <h2>Could not load the list</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>Try again</button>
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
  const [meta, setMeta] = useState({ generated_at: null, expires_in: null });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [activeMatchId, setActiveMatchId] = useState(getMatchFromUrl());

  const loadMatches = useCallback(async ({ silent = false } = {}) => {
    const controller = new AbortController();

    if (!silent) {
      setStatus('loading');
      setError('');
    }

    try {
      const payload = await fetchMatches({ signal: controller.signal });
      setMatches(payload.data || []);
      setMeta({
        generated_at: payload.generated_at,
        expires_in: payload.expires_in
      });
      setStatus('ready');
      setError('');
    } catch (loadError) {
      if (!silent) {
        setStatus('error');
        setError(loadError instanceof Error ? loadError.message : 'An unknown error occurred.');
      }
    }

    return () => controller.abort();
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
      const name = match.category || 'Other';
      counts.set(name, (counts.get(name) || 0) + 1);
    }

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort(sortCategories);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const categoryHit = activeCategory === ALL_CATEGORY || match.category === activeCategory;
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
      <Header query={query} onQueryChange={setQuery} />

      <main>
        <Hero
          total={matches.length}
          generatedAt={meta.generated_at}
          expiresIn={meta.expires_in}
          onRefresh={() => loadMatches()}
          loading={status === 'loading'}
        />

        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        <section className="content-wrap" aria-live="polite">
          {status === 'loading' && <SkeletonGrid />}

          {status === 'error' && (
            <ErrorState message={error} onRetry={() => loadMatches()} />
          )}

          {status === 'ready' && filteredMatches.length === 0 && (
            <EmptyState hasQuery={Boolean(query || activeCategory !== ALL_CATEGORY)} onClear={clearFilters} />
          )}

          {status === 'ready' && filteredMatches.length > 0 && groupedMatches.map(([category, items]) => (
            <section className="match-section" key={category}>
              <div className="section-heading">
                <h2>{category}</h2>
                <span>{items.length} {items.length === 1 ? 'match' : 'matches'}</span>
              </div>

              <div className="match-grid">
                {items.map((match) => (
                  <MatchCard key={match.id} match={match} onOpen={openMatch} />
                ))}
              </div>
            </section>
          ))}
        </section>
      </main>

      {activeMatch && <StreamPlayer match={activeMatch} onClose={closeMatch} />}
    </div>
  );
}
