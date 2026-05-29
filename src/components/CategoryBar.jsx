import { ALL_CATEGORY } from '../lib/helpers.js';
import { t } from '../lib/i18n.js';
import { categoryIcon, uiText } from '../lib/designText.js';

const SOCIAL_LINKS = [
  {
    label: 'Telegram',
    shortUrl: 't.me/erosmactv3',
    href: 'https://t.me/erosmactv3',
    icon: '✈'
  },
  {
    label: 'X / Twitter',
    shortUrl: 'x.com/erosmactv',
    href: 'https://x.com/erosmactv',
    icon: '𝕏'
  }
];

const MENU_ITEMS = [
  { key: 'home', icon: '⌂' },
  { key: 'liveNow', icon: '⌁', active: true },
  { key: 'sports', icon: '⌘' },
  { key: 'schedule', icon: '□' },
  { key: 'favourites', icon: '☆' },
  { key: 'notifications', icon: '♧' }
];

export default function CategoryBar({ categories, activeCategory, onChange, language }) {
  const visibleCategories = categories;

  return (
    <aside className="category-shell" aria-label={t(language, 'categoriesAria')}>
      <nav className="side-menu" aria-label="Main menu">
        <p>{uiText(language, 'menu')}</p>
        <div className="side-menu-list">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`side-menu-button ${item.active ? 'is-active' : ''}`}
              onClick={() => item.key === 'liveNow' && onChange(ALL_CATEGORY)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <strong>{uiText(language, item.key)}</strong>
            </button>
          ))}
        </div>
      </nav>

      <div className="category-socials">
        <p>{t(language, 'socialTitle')}</p>
        <div className="social-link-list">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.href}
              className="social-link"
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span aria-hidden="true">{link.icon}</span>
              <strong>{link.label}</strong>
              <small>{link.shortUrl}</small>
            </a>
          ))}
        </div>
      </div>

      <nav className="category-nav" aria-label={t(language, 'categoriesAria')}>
        <p>{t(language, 'categoriesTitle')}</p>
        <div className="category-track">
          {visibleCategories.map((category) => {
            const active = category.id === activeCategory;

            return (
              <button
                key={category.id}
                type="button"
                className={`category-pill ${active ? 'is-active' : ''}`}
                onClick={() => onChange(category.id)}
              >
                <span className="category-pill-icon" aria-hidden="true">{categoryIcon(category.id)}</span>
                <span className="category-pill-label">{category.label}</span>
                <small>{category.count}</small>
              </button>
            );
          })}
        </div>
      </nav>

      <button type="button" className="side-more-button">
        <span>{uiText(language, 'more')}</span>
        <span aria-hidden="true">⌄</span>
      </button>
    </aside>
  );
}
