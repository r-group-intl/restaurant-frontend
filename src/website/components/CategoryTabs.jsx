const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`relative px-4 py-2 rounded-full border whitespace-nowrap transition-all duration-300 ease-out ${
              isActive
                ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.18)] border-emerald-400/20"
                : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
            }`}
          >
            <span className="relative z-10">{category}</span>
            <span
              className={`absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] rounded-full bg-emerald-300 transition-all duration-300 ease-out ${
                isActive ? "w-8 opacity-100" : "w-0 opacity-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
