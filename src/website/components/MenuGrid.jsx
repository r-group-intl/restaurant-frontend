import MenuCard from "./MenuCard";

const MenuGrid = ({ items, isFiltering, onQuickView, onAddToCart, formatPrice }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-300 ease-out ${
        isFiltering ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
      }`}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className="transition-all duration-300 ease-out"
          style={{ transitionDelay: `${Math.min(index * 28, 220)}ms` }}
        >
          <MenuCard
            item={item}
            index={index}
            onQuickView={onQuickView}
            onAddToCart={onAddToCart}
            formatPrice={formatPrice}
          />
        </div>
      ))}
    </div>
  );
};

export default MenuGrid;
