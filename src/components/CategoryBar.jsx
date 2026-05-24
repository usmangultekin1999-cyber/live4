export default function CategoryBar({ categories, activeCategory, onChange }) {
  return (
    <nav className="category-shell" aria-label="Spor kategorileri">
      <div className="category-track">
        {categories.map((category) => {
          const active = category.name === activeCategory;

          return (
            <button
              key={category.name}
              type="button"
              className={`category-pill ${active ? 'is-active' : ''}`}
              onClick={() => onChange(category.name)}
            >
              <span>{category.name}</span>
              <small>{category.count}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
