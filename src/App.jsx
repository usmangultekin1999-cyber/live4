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

function Header({ query, onQueryChange }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Ana sayfa">
        <span className="brand-signal" aria-hidden="true">
          <i />
        </span>
        <strong>ErosMaç</strong>
      </a>

      <label className="search-box">
        <span aria-hidden="true">⌕</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Takım, lig ara..."
          aria-label="Takım veya lig ara"
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
        <span className="hero-live"><i /> CANLI YAYIN</span>
        <h1>Tüm Maçlar. <span>Tek Yerde.</span></h1>
        <p>Şu anda <strong>{total}</strong> maç yayında. Bir maça tıkla, hemen izlemeye başla.</p>

        <div className="hero-meta">
          {generatedAt && <span>Son güncelleme: {formatMetaTime(generatedAt)}</span>}
          {expiresIn && <span>Liste süresi: {expiresIn}</span>}
          <button type="button" onClick={onRefresh} disabled={loading}>
            {loading ? 'Yenileniyor...' : 'Listeyi yenile'}
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
      <h2>Maç bulunamadı</h2>
      <p>{hasQuery ? 'Arama veya kategori filtresiyle eşleşen maç yok.' : 'API şu anda maç listesi döndürmedi.'}</p>
      {hasQuery && <button type="button" onClick={onClear}>Filtreleri temizle</button>}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <h2>Liste alınamadı</h2>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>Tekrar dene</button>
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
        setError(loadError instanceof Error ? loadError.message : 'Bilinmeyen hata oluştu.');
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
    const intervalId = window.setInterval(() => loadMatches({ silent: true }), 90_000);

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
      const name = match.category || 'Diğer';
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
                <span>{items.length} maç</span>
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
