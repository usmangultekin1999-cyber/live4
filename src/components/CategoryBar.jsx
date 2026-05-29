import { t } from '../lib/i18n.js';
import { categoryIcon } from '../lib/designText.js';

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

export default function CategoryBar({ categories, activeCategory, onChange, language }) {
  return (
    <aside className="category-shell category-shell--compact" aria-label={t(language, 'categoriesAria')}>
      <a className="sidebar-brand" href="/" aria-label="ErosMacTV home">
        <img src="/LOGO.PNG" alt="ErosMacTV" />
      </a>
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
          {categories.map((category) => {
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
    </aside>
  );
}
