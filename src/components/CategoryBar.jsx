import { t } from '../lib/i18n.js';

export default function CategoryBar({ categories, activeCategory, onChange, language }) {
  return (
    <nav className="category-shell" aria-label={t(language, 'categoriesAria')}>
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
              <span>{category.label}</span>
              <small>{category.count}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
