export const BRAND_NAME = 'erosmactv';
export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'erosmactv_language';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'fr', label: 'Français' }
];

export const LOCALES = {
  en: 'en-GB',
  tr: 'tr-TR',
  de: 'de-DE',
  es: 'es-ES',
  zh: 'zh-CN',
  hi: 'hi-IN',
  fr: 'fr-FR'
};

const LANGUAGE_CODES = new Set(LANGUAGES.map((language) => language.code));

const MESSAGES = {
  en: {
    homeAria: 'erosmactv home',
    searchPlaceholder: 'Search team or league...',
    searchAria: 'Search team or league',
    languageAria: 'Select language',
    liveBroadcast: 'LIVE BROADCAST',
    liveStreams: 'LIVE STREAMS',
    heroTitleMain: 'All Matches.',
    heroTitleAccent: 'One Place.',
    heroDescription: 'There are currently {count} live {matchWord}. Select a match to start watching.',
    matchSingular: 'match',
    matchPlural: 'matches',
    lastUpdate: 'Last update:',
    listExpiresIn: 'List expires in:',
    autoRefresh: 'Auto-refresh: 2 min',
    refreshing: 'Refreshing...',
    refreshList: 'Refresh list',
    categoriesAria: 'Sports categories',
    noMatchesFound: 'No matches found',
    noMatchesMatch: 'No matches match your search or category filter.',
    apiNoMatches: 'The API did not return any matches right now.',
    clearFilters: 'Clear filters',
    couldNotLoad: 'Could not load the list',
    tryAgain: 'Try again',
    noStream: 'No stream',
    startWatching: 'Start watching',
    openMatchAria: 'Open {home} vs {away}',
    live: 'Live',
    streamUnavailable: 'Stream unavailable.',
    playerLabel: 'Live stream player',
    closePlayer: 'Close player',
    vs: 'vs',
    noLeagueInfo: 'No league information',
    matchOfTheDay: 'Match of the Day',
    streamBadge: 'Stream'
  },
  tr: {
    homeAria: 'erosmactv ana sayfa',
    searchPlaceholder: 'Takım veya lig ara...',
    searchAria: 'Takım veya lig ara',
    languageAria: 'Dil seç',
    liveBroadcast: 'CANLI YAYIN',
    liveStreams: 'CANLI YAYINLAR',
    heroTitleMain: 'Tüm Maçlar.',
    heroTitleAccent: 'Tek Yerde.',
    heroDescription: 'Şu anda {count} canlı {matchWord} var. İzlemek için bir maç seç.',
    matchSingular: 'maç',
    matchPlural: 'maç',
    lastUpdate: 'Son güncelleme:',
    listExpiresIn: 'Liste süresi:',
    autoRefresh: 'Otomatik yenileme: 2 dk',
    refreshing: 'Yenileniyor...',
    refreshList: 'Listeyi yenile',
    categoriesAria: 'Spor kategorileri',
    noMatchesFound: 'Maç bulunamadı',
    noMatchesMatch: 'Arama veya kategori filtresine uygun maç bulunamadı.',
    apiNoMatches: 'API şu anda maç döndürmedi.',
    clearFilters: 'Filtreleri temizle',
    couldNotLoad: 'Liste yüklenemedi',
    tryAgain: 'Tekrar dene',
    noStream: 'Yayın yok',
    startWatching: 'İzlemeye başla',
    openMatchAria: '{home} vs {away} maçını aç',
    live: 'Canlı',
    streamUnavailable: 'Yayın kullanılamıyor.',
    playerLabel: 'Canlı yayın oynatıcı',
    closePlayer: 'Oynatıcıyı kapat',
    vs: 'vs',
    noLeagueInfo: 'Lig bilgisi yok',
    matchOfTheDay: 'Günün Maçı',
    streamBadge: 'Yayın'
  },
  de: {
    homeAria: 'erosmactv Startseite',
    searchPlaceholder: 'Team oder Liga suchen...',
    searchAria: 'Team oder Liga suchen',
    languageAria: 'Sprache auswählen',
    liveBroadcast: 'LIVE-ÜBERTRAGUNG',
    liveStreams: 'LIVE-STREAMS',
    heroTitleMain: 'Alle Spiele.',
    heroTitleAccent: 'Ein Ort.',
    heroDescription: 'Aktuell laufen {count} Live-{matchWord}. Wähle ein Spiel aus, um zu starten.',
    matchSingular: 'Spiel',
    matchPlural: 'Spiele',
    lastUpdate: 'Letzte Aktualisierung:',
    listExpiresIn: 'Liste läuft ab in:',
    autoRefresh: 'Auto-Refresh: 2 Min.',
    refreshing: 'Aktualisiere...',
    refreshList: 'Liste aktualisieren',
    categoriesAria: 'Sportkategorien',
    noMatchesFound: 'Keine Spiele gefunden',
    noMatchesMatch: 'Keine Spiele passen zu deiner Suche oder Kategorie.',
    apiNoMatches: 'Die API liefert gerade keine Spiele.',
    clearFilters: 'Filter löschen',
    couldNotLoad: 'Liste konnte nicht geladen werden',
    tryAgain: 'Erneut versuchen',
    noStream: 'Kein Stream',
    startWatching: 'Ansehen',
    openMatchAria: '{home} gegen {away} öffnen',
    live: 'Live',
    streamUnavailable: 'Stream nicht verfügbar.',
    playerLabel: 'Live-Stream-Player',
    closePlayer: 'Player schließen',
    vs: 'gegen',
    noLeagueInfo: 'Keine Ligainformation',
    matchOfTheDay: 'Spiel des Tages',
    streamBadge: 'Stream'
  },
  es: {
    homeAria: 'inicio de erosmactv',
    searchPlaceholder: 'Buscar equipo o liga...',
    searchAria: 'Buscar equipo o liga',
    languageAria: 'Seleccionar idioma',
    liveBroadcast: 'TRANSMISIÓN EN VIVO',
    liveStreams: 'TRANSMISIONES EN VIVO',
    heroTitleMain: 'Todos los partidos.',
    heroTitleAccent: 'Un solo lugar.',
    heroDescription: 'Ahora hay {count} {matchWord} en vivo. Selecciona un partido para empezar.',
    matchSingular: 'partido',
    matchPlural: 'partidos',
    lastUpdate: 'Última actualización:',
    listExpiresIn: 'La lista caduca en:',
    autoRefresh: 'Autoactualización: 2 min',
    refreshing: 'Actualizando...',
    refreshList: 'Actualizar lista',
    categoriesAria: 'Categorías deportivas',
    noMatchesFound: 'No se encontraron partidos',
    noMatchesMatch: 'Ningún partido coincide con tu búsqueda o categoría.',
    apiNoMatches: 'La API no devolvió partidos en este momento.',
    clearFilters: 'Limpiar filtros',
    couldNotLoad: 'No se pudo cargar la lista',
    tryAgain: 'Intentar de nuevo',
    noStream: 'Sin transmisión',
    startWatching: 'Ver ahora',
    openMatchAria: 'Abrir {home} vs {away}',
    live: 'En vivo',
    streamUnavailable: 'Transmisión no disponible.',
    playerLabel: 'Reproductor de transmisión en vivo',
    closePlayer: 'Cerrar reproductor',
    vs: 'vs',
    noLeagueInfo: 'Sin información de liga',
    matchOfTheDay: 'Partido del día',
    streamBadge: 'Transmisión'
  },
  zh: {
    homeAria: 'erosmactv 首页',
    searchPlaceholder: '搜索球队或联赛...',
    searchAria: '搜索球队或联赛',
    languageAria: '选择语言',
    liveBroadcast: '现场直播',
    liveStreams: '直播列表',
    heroTitleMain: '所有赛事。',
    heroTitleAccent: '尽在一处。',
    heroDescription: '当前共有 {count} 场直播{matchWord}。选择一场比赛开始观看。',
    matchSingular: '比赛',
    matchPlural: '比赛',
    lastUpdate: '最后更新：',
    listExpiresIn: '列表有效期：',
    autoRefresh: '自动刷新：2 分钟',
    refreshing: '正在刷新...',
    refreshList: '刷新列表',
    categoriesAria: '体育分类',
    noMatchesFound: '未找到比赛',
    noMatchesMatch: '没有符合搜索或分类筛选的比赛。',
    apiNoMatches: 'API 当前没有返回比赛。',
    clearFilters: '清除筛选',
    couldNotLoad: '无法加载列表',
    tryAgain: '重试',
    noStream: '无直播源',
    startWatching: '开始观看',
    openMatchAria: '打开 {home} 对 {away}',
    live: '直播',
    streamUnavailable: '直播不可用。',
    playerLabel: '直播播放器',
    closePlayer: '关闭播放器',
    vs: 'vs',
    noLeagueInfo: '无联赛信息',
    matchOfTheDay: '今日焦点赛',
    streamBadge: '直播'
  },
  hi: {
    homeAria: 'erosmactv होम',
    searchPlaceholder: 'टीम या लीग खोजें...',
    searchAria: 'टीम या लीग खोजें',
    languageAria: 'भाषा चुनें',
    liveBroadcast: 'लाइव प्रसारण',
    liveStreams: 'लाइव स्ट्रीम',
    heroTitleMain: 'सभी मैच।',
    heroTitleAccent: 'एक ही जगह।',
    heroDescription: 'अभी {count} लाइव {matchWord} उपलब्ध हैं। देखने के लिए कोई मैच चुनें।',
    matchSingular: 'मैच',
    matchPlural: 'मैच',
    lastUpdate: 'अंतिम अपडेट:',
    listExpiresIn: 'सूची समाप्त होगी:',
    autoRefresh: 'ऑटो-रिफ्रेश: 2 मिनट',
    refreshing: 'रीफ्रेश हो रहा है...',
    refreshList: 'सूची रीफ्रेश करें',
    categoriesAria: 'खेल श्रेणियाँ',
    noMatchesFound: 'कोई मैच नहीं मिला',
    noMatchesMatch: 'आपकी खोज या श्रेणी से कोई मैच नहीं मिला।',
    apiNoMatches: 'API ने अभी कोई मैच वापस नहीं किया।',
    clearFilters: 'फ़िल्टर हटाएँ',
    couldNotLoad: 'सूची लोड नहीं हुई',
    tryAgain: 'फिर कोशिश करें',
    noStream: 'स्ट्रीम नहीं है',
    startWatching: 'देखना शुरू करें',
    openMatchAria: '{home} बनाम {away} खोलें',
    live: 'लाइव',
    streamUnavailable: 'स्ट्रीम उपलब्ध नहीं है।',
    playerLabel: 'लाइव स्ट्रीम प्लेयर',
    closePlayer: 'प्लेयर बंद करें',
    vs: 'बनाम',
    noLeagueInfo: 'लीग जानकारी नहीं है',
    matchOfTheDay: 'आज का मैच',
    streamBadge: 'स्ट्रीम'
  },
  fr: {
    homeAria: 'accueil erosmactv',
    searchPlaceholder: 'Rechercher une équipe ou une ligue...',
    searchAria: 'Rechercher une équipe ou une ligue',
    languageAria: 'Choisir la langue',
    liveBroadcast: 'DIFFUSION EN DIRECT',
    liveStreams: 'DIFFUSIONS EN DIRECT',
    heroTitleMain: 'Tous les matchs.',
    heroTitleAccent: 'Au même endroit.',
    heroDescription: 'Il y a actuellement {count} {matchWord} en direct. Sélectionnez un match pour commencer.',
    matchSingular: 'match',
    matchPlural: 'matchs',
    lastUpdate: 'Dernière mise à jour :',
    listExpiresIn: 'La liste expire dans :',
    autoRefresh: 'Actualisation auto : 2 min',
    refreshing: 'Actualisation...',
    refreshList: 'Actualiser la liste',
    categoriesAria: 'Catégories sportives',
    noMatchesFound: 'Aucun match trouvé',
    noMatchesMatch: 'Aucun match ne correspond à votre recherche ou catégorie.',
    apiNoMatches: 'L’API ne renvoie aucun match pour le moment.',
    clearFilters: 'Effacer les filtres',
    couldNotLoad: 'Impossible de charger la liste',
    tryAgain: 'Réessayer',
    noStream: 'Aucun stream',
    startWatching: 'Regarder',
    openMatchAria: 'Ouvrir {home} vs {away}',
    live: 'En direct',
    streamUnavailable: 'Stream indisponible.',
    playerLabel: 'Lecteur de diffusion en direct',
    closePlayer: 'Fermer le lecteur',
    vs: 'vs',
    noLeagueInfo: 'Aucune information de ligue',
    matchOfTheDay: 'Match du jour',
    streamBadge: 'Stream'
  }
};

const CATEGORY_LABELS = {
  all: { en: 'All', tr: 'Tümü', de: 'Alle', es: 'Todos', zh: '全部', hi: 'सभी', fr: 'Tous' },
  other: { en: 'Other', tr: 'Diğer', de: 'Andere', es: 'Otros', zh: '其他', hi: 'अन्य', fr: 'Autres' },
  stream: { en: 'Stream', tr: 'Yayın', de: 'Stream', es: 'Transmisión', zh: '直播', hi: 'स्ट्रीम', fr: 'Stream' },
  football: { en: 'Football', tr: 'Futbol', de: 'Fußball', es: 'Fútbol', zh: '足球', hi: 'फ़ुटबॉल', fr: 'Football' },
  basketball: { en: 'Basketball', tr: 'Basketbol', de: 'Basketball', es: 'Baloncesto', zh: '篮球', hi: 'बास्केटबॉल', fr: 'Basketball' },
  table_basketball: { en: 'Table Basketball', tr: 'Masa Basketbolu', de: 'Tischbasketball', es: 'Baloncesto de mesa', zh: '桌上篮球', hi: 'टेबल बास्केटबॉल', fr: 'Basket de table' },
  tennis: { en: 'Tennis', tr: 'Tenis', de: 'Tennis', es: 'Tenis', zh: '网球', hi: 'टेनिस', fr: 'Tennis' },
  badminton: { en: 'Badminton', tr: 'Badminton', de: 'Badminton', es: 'Bádminton', zh: '羽毛球', hi: 'बैडमिंटन', fr: 'Badminton' },
  volleyball: { en: 'Volleyball', tr: 'Voleybol', de: 'Volleyball', es: 'Voleibol', zh: '排球', hi: 'वॉलीबॉल', fr: 'Volley-ball' },
  beach_volleyball: { en: 'Beach Volleyball', tr: 'Plaj Voleybolu', de: 'Beachvolleyball', es: 'Vóley playa', zh: '沙滩排球', hi: 'बीच वॉलीबॉल', fr: 'Beach-volley' },
  bowling: { en: 'Bowling', tr: 'Bowling', de: 'Bowling', es: 'Bolos', zh: '保龄球', hi: 'बॉलिंग', fr: 'Bowling' },
  cricket: { en: 'Cricket', tr: 'Kriket', de: 'Cricket', es: 'Críquet', zh: '板球', hi: 'क्रिकेट', fr: 'Cricket' },
  fifa: { en: 'FIFA', tr: 'FIFA', de: 'FIFA', es: 'FIFA', zh: 'FIFA', hi: 'FIFA', fr: 'FIFA' },
  futsal: { en: 'Futsal', tr: 'Futsal', de: 'Futsal', es: 'Fútbol sala', zh: '五人制足球', hi: 'फुटसल', fr: 'Futsal' },
  handball: { en: 'Handball', tr: 'Hentbol', de: 'Handball', es: 'Balonmano', zh: '手球', hi: 'हैंडबॉल', fr: 'Handball' },
  ice_hockey: { en: 'Ice Hockey', tr: 'Buz Hokeyi', de: 'Eishockey', es: 'Hockey sobre hielo', zh: '冰球', hi: 'आइस हॉकी', fr: 'Hockey sur glace' },
  baseball: { en: 'Baseball', tr: 'Beyzbol', de: 'Baseball', es: 'Béisbol', zh: '棒球', hi: 'बेसबॉल', fr: 'Baseball' },
  table_tennis: { en: 'Table Tennis', tr: 'Masa Tenisi', de: 'Tischtennis', es: 'Tenis de mesa', zh: '乒乓球', hi: 'टेबल टेनिस', fr: 'Tennis de table' },
  esports: { en: 'Esports', tr: 'E-spor', de: 'E-Sport', es: 'Esports', zh: '电子竞技', hi: 'ईस्पोर्ट्स', fr: 'Esport' },
  formula_1: { en: 'Formula 1', tr: 'Formula 1', de: 'Formel 1', es: 'Fórmula 1', zh: '一级方程式', hi: 'फॉर्मूला 1', fr: 'Formule 1' },
  motorsport: { en: 'Motorsport', tr: 'Motor Sporları', de: 'Motorsport', es: 'Automovilismo', zh: '赛车运动', hi: 'मोटरस्पोर्ट', fr: 'Sport automobile' },
  boxing: { en: 'Boxing', tr: 'Boks', de: 'Boxen', es: 'Boxeo', zh: '拳击', hi: 'मुक्केबाज़ी', fr: 'Boxe' },
  mma: { en: 'MMA', tr: 'MMA', de: 'MMA', es: 'MMA', zh: '综合格斗', hi: 'MMA', fr: 'MMA' },
  rugby: { en: 'Rugby', tr: 'Ragbi', de: 'Rugby', es: 'Rugby', zh: '橄榄球', hi: 'रग्बी', fr: 'Rugby' },
  snooker: { en: 'Snooker', tr: 'Snooker', de: 'Snooker', es: 'Snooker', zh: '斯诺克', hi: 'स्नूकर', fr: 'Snooker' },
  darts: { en: 'Darts', tr: 'Dart', de: 'Darts', es: 'Dardos', zh: '飞镖', hi: 'डार्ट्स', fr: 'Fléchettes' },
  golf: { en: 'Golf', tr: 'Golf', de: 'Golf', es: 'Golf', zh: '高尔夫', hi: 'गोल्फ', fr: 'Golf' },
  imagic: { en: 'Imagic', tr: 'Imagic', de: 'Imagic', es: 'Imagic', zh: 'Imagic', hi: 'Imagic', fr: 'Imagic' },
  mortal_kombat: { en: 'Mortal Kombat', tr: 'Mortal Kombat', de: 'Mortal Kombat', es: 'Mortal Kombat', zh: '真人快打', hi: 'Mortal Kombat', fr: 'Mortal Kombat' }
};

const CATEGORY_SYNONYMS = new Map([
  ['all', 'all'], ['tumu', 'all'], ['tum', 'all'],
  ['other', 'other'], ['diger', 'other'],
  ['stream', 'stream'], ['yayin', 'stream'],
  ['football', 'football'], ['futbol', 'football'], ['soccer', 'football'],
  ['basketball', 'basketball'], ['basketbol', 'basketball'],
  ['table basketball', 'table_basketball'], ['table basketball league', 'table_basketball'], ['masa basketbolu', 'table_basketball'],
  ['tennis', 'tennis'], ['tenis', 'tennis'],
  ['badminton', 'badminton'],
  ['volleyball', 'volleyball'], ['voleybol', 'volleyball'],
  ['beach volleyball', 'beach_volleyball'], ['plaj voleybolu', 'beach_volleyball'],
  ['bowling', 'bowling'],
  ['cricket', 'cricket'], ['kriket', 'cricket'],
  ['fifa', 'fifa'],
  ['futsal', 'futsal'],
  ['handball', 'handball'], ['hentbol', 'handball'],
  ['ice hockey', 'ice_hockey'], ['buz hokeyi', 'ice_hockey'],
  ['baseball', 'baseball'], ['beyzbol', 'baseball'],
  ['table tennis', 'table_tennis'], ['masa tenisi', 'table_tennis'],
  ['esports', 'esports'], ['e-sports', 'esports'], ['e-spor', 'esports'], ['e spor', 'esports'],
  ['formula 1', 'formula_1'], ['f1', 'formula_1'],
  ['motor sports', 'motorsport'], ['motorsport', 'motorsport'], ['motor sporlari', 'motorsport'],
  ['boxing', 'boxing'], ['boks', 'boxing'],
  ['mma', 'mma'],
  ['rugby', 'rugby'], ['ragbi', 'rugby'],
  ['snooker', 'snooker'],
  ['darts', 'darts'], ['dart', 'darts'],
  ['golf', 'golf'],
  ['imagic', 'imagic'],
  ['mortal kombat', 'mortal_kombat']
]);

export function normalizeLanguage(language) {
  const raw = String(language || '').trim().toLowerCase();
  if (!raw) return DEFAULT_LANGUAGE;
  const short = raw.split(/[-_]/)[0];
  if (LANGUAGE_CODES.has(short)) return short;
  return DEFAULT_LANGUAGE;
}

export function getInitialLanguage() {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const stored = window.localStorage?.getItem(STORAGE_KEY);
  if (stored) return normalizeLanguage(stored);

  const browserLanguage = window.navigator?.language || window.navigator?.languages?.[0];
  return normalizeLanguage(browserLanguage);
}

export function saveLanguage(language) {
  if (typeof window === 'undefined') return;
  window.localStorage?.setItem(STORAGE_KEY, normalizeLanguage(language));
}

export function localeForLanguage(language) {
  const code = normalizeLanguage(language);
  return LOCALES[code] || LOCALES[DEFAULT_LANGUAGE];
}

export function t(language, key, params = {}) {
  const code = normalizeLanguage(language);
  const template = MESSAGES[code]?.[key] || MESSAGES[DEFAULT_LANGUAGE][key] || key;

  return Object.entries(params).reduce((text, [paramKey, value]) => {
    return text.replaceAll(`{${paramKey}}`, String(value));
  }, template);
}

function normalizeCategoryKey(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function translateCategory(value, language) {
  const clean = String(value || '').trim();
  if (clean === '__all__') return CATEGORY_LABELS.all[normalizeLanguage(language)];
  if (clean === '__other__' || !clean) return CATEGORY_LABELS.other[normalizeLanguage(language)];

  const normalized = normalizeCategoryKey(clean);
  const canonical = CATEGORY_SYNONYMS.get(normalized);
  if (!canonical) return clean;

  const code = normalizeLanguage(language);
  return CATEGORY_LABELS[canonical]?.[code] || CATEGORY_LABELS[canonical]?.[DEFAULT_LANGUAGE] || clean;
}
