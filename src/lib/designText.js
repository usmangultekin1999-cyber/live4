import { normalizeLanguage } from './i18n.js';

const TEXT = {
  en: {
    menu: 'Menu',
    home: 'Home',
    liveNow: 'Live Now',
    sports: 'Sports',
    schedule: 'Schedule',
    favourites: 'Favourites',
    notifications: 'Notifications',
    viewAll: 'View All',
    more: 'More'
  },
  tr: {
    menu: 'Menü',
    home: 'Ana sayfa',
    liveNow: 'Canlı Yayınlar',
    sports: 'Sporlar',
    schedule: 'Program',
    favourites: 'Favoriler',
    notifications: 'Bildirimler',
    viewAll: 'Tümünü gör',
    more: 'Daha fazla'
  },
  de: {
    menu: 'Menü',
    home: 'Startseite',
    liveNow: 'Jetzt live',
    sports: 'Sportarten',
    schedule: 'Zeitplan',
    favourites: 'Favoriten',
    notifications: 'Benachrichtigungen',
    viewAll: 'Alle anzeigen',
    more: 'Mehr'
  },
  es: {
    menu: 'Menú',
    home: 'Inicio',
    liveNow: 'En vivo ahora',
    sports: 'Deportes',
    schedule: 'Calendario',
    favourites: 'Favoritos',
    notifications: 'Notificaciones',
    viewAll: 'Ver todo',
    more: 'Más'
  },
  zh: {
    menu: '菜单',
    home: '首页',
    liveNow: '正在直播',
    sports: '体育',
    schedule: '赛程',
    favourites: '收藏',
    notifications: '通知',
    viewAll: '查看全部',
    more: '更多'
  },
  hi: {
    menu: 'मेन्यू',
    home: 'होम',
    liveNow: 'लाइव अभी',
    sports: 'खेल',
    schedule: 'शेड्यूल',
    favourites: 'पसंदीदा',
    notifications: 'सूचनाएँ',
    viewAll: 'सभी देखें',
    more: 'और'
  },
  fr: {
    menu: 'Menu',
    home: 'Accueil',
    liveNow: 'En direct',
    sports: 'Sports',
    schedule: 'Calendrier',
    favourites: 'Favoris',
    notifications: 'Notifications',
    viewAll: 'Voir tout',
    more: 'Plus'
  }
};

export function uiText(language, key) {
  const code = normalizeLanguage(language);
  return TEXT[code]?.[key] || TEXT.en[key] || key;
}

export function categoryIcon(category = '') {
  const key = String(category || '').toLowerCase();
  if (category === '__all__') return '✺';
  if (key.includes('badminton')) return '🏸';
  if (key.includes('baseball')) return '⚾';
  if (key.includes('basket')) return '🏀';
  if (key.includes('beach') || key.includes('volley')) return '🏐';
  if (key.includes('football') || key.includes('futbol') || key.includes('fifa') || key.includes('soccer')) return '⚽';
  if (key.includes('tennis')) return '🎾';
  if (key.includes('cricket')) return '🏏';
  if (key.includes('hockey')) return '🏒';
  if (key.includes('dota') || key.includes('espor') || key.includes('esport')) return '⌘';
  if (key.includes('handball')) return '🤾';
  if (key.includes('table')) return '🏓';
  return '✦';
}
