import { useMemo } from 'react';
import { getImageUrlWithFallback } from '../../utils/imageUtils';

const FALLBACK_CATEGORY_IMAGE = '/hero/BG_2.png';

const CategoryCarouselSection = ({
  categories: categoriesProp = [],
  menuItems = [],
  activeCategory = 'All',
  onSelectCategory,
}) => {
  const categories = useMemo(() => {
    const items = Array.isArray(menuItems) ? menuItems : [];

    const normalize = (value) => (value ?? '').toString().trim();

    const countByCategory = new Map();
    for (const item of items) {
      const category = normalize(item.categoryDisplay || item.category || 'Other') || 'Other';
      countByCategory.set(category, (countByCategory.get(category) || 0) + 1);
    }

    const adminCategories = Array.isArray(categoriesProp) ? categoriesProp : [];
    const orderedAdmin = [...adminCategories]
      .filter((cat) => normalize(cat?.name))
      .sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0));

    return [
      { key: 'All', label: 'All', image: FALLBACK_CATEGORY_IMAGE, count: items.length },
      ...orderedAdmin.map((cat) => {
        const name = normalize(cat.name);
        return {
          key: name,
          label: name,
          image: getImageUrlWithFallback(cat.image) || FALLBACK_CATEGORY_IMAGE,
          count: countByCategory.get(name) || 0,
        };
      }),
    ];
  }, [menuItems, categoriesProp]);

  return (
    <section className="relative py-16 md:py-20 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.08),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_45%)]" />
      <div className="absolute -inset-20 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.24),transparent_68%)]" />

      <div className="absolute top-20 left-[12%] w-2 h-2 rounded-full bg-emerald-300/30 animate-pulse" />
      <div className="absolute top-44 right-[20%] w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:300ms]" />
      <div className="absolute bottom-24 left-[24%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse [animation-delay:600ms]" />
      <div className="absolute bottom-40 right-[26%] w-1.5 h-1.5 rounded-full bg-white/15 animate-pulse [animation-delay:900ms]" />

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Browse <span className="text-primary">Categories</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Swipe and pick what you feel like today.</p>
        </header>

        <div className="-mx-4 px-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
            {(categories.length ? categories : new Array(6).fill(null)).map((category, index) => {
              if (!category) {
                return (
                  <div
                    key={`skeleton-${index}`}
                    className="flex-none w-56 sm:w-72 aspect-[16/10] rounded-3xl border border-border/70 bg-card/50 backdrop-blur-xl animate-pulse snap-start"
                  />
                );
              }

              const isActive = category.key === activeCategory;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => onSelectCategory?.(category.key)}
                  className={
                    `group relative flex-none w-56 sm:w-72 aspect-[16/10] rounded-3xl overflow-hidden border transition-smooth shadow-elegant snap-start ` +
                    (isActive
                      ? 'border-primary/60 ring-1 ring-primary/30'
                      : 'border-border/70 hover:border-primary/35')
                  }
                  aria-pressed={isActive}
                >
                  <img
                    src={category.image || FALLBACK_CATEGORY_IMAGE}
                    alt={category.label}
                    className="absolute inset-0 w-full h-full object-cover scale-[1.02] group-hover:scale-[1.06] transition-transform duration-500"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/5" />

                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="inline-flex items-center gap-2">
                      <span className="text-white font-semibold text-lg sm:text-xl drop-shadow">{category.label}</span>
                      <span className="text-white/80 text-sm">({category.count})</span>
                    </div>
                    <div className={
                      `mt-3 h-1.5 w-12 rounded-full transition-all duration-300 ` +
                      (isActive ? 'bg-primary' : 'bg-white/35 group-hover:bg-white/55')
                    } />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarouselSection;
