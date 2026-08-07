import { useState } from "react";
import { Eye, Plus, Flame, Star, Award, AlertCircle } from "lucide-react";

const HEIGHT_CLASSES = ["h-60", "h-64", "h-72"];

const Badge = ({ children, className }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${className}`}>
    {children}
  </span>
);

const MenuCard = ({ item, index, onQuickView, onAddToCart, formatPrice }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageHeight = HEIGHT_CLASSES[index % HEIGHT_CLASSES.length];
  const isOutOfStock = Boolean(item.isOutOfStock);

  const badges = [
    item.popular && (
      <Badge key="popular" className="bg-amber-500/20 text-amber-200 border border-amber-300/20">
        <Star className="w-3 h-3" /> Popular
      </Badge>
    ),
    item.traditional && (
      <Badge key="traditional" className="bg-indigo-500/20 text-indigo-200 border border-indigo-300/20">
        <Award className="w-3 h-3" /> Chef’s Choice
      </Badge>
    ),
    item.spicy && (
      <Badge key="spicy" className="bg-orange-500/20 text-orange-200 border border-orange-300/20">
        <Flame className="w-3 h-3" /> Spicy
      </Badge>
    ),
    isOutOfStock && (
      <Badge key="stock" className="bg-rose-500/20 text-rose-200 border border-rose-300/20">
        <AlertCircle className="w-3 h-3" /> Out of stock
      </Badge>
    ),
  ].filter(Boolean);

  return (
    <article className="group rounded-2xl bg-card/50 backdrop-blur-xl border border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:ring-1 hover:ring-emerald-400/20 overflow-hidden">
      <div className={`relative ${imageHeight} overflow-hidden`}>
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-white/10" />}

        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={(event) => {
            event.currentTarget.src = "/hero/BG_2.png";
            setImageLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] group-hover:-translate-y-0.5 ${
            isOutOfStock ? "opacity-60" : "opacity-100"
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/45 border border-white/10 text-[11px] text-white/90 backdrop-blur-md">
          {item.categoryDisplay || item.category || "Menu"}
        </span>

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">{badges}</div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
              {item.subname && <p className="text-xs text-emerald-200/90 mt-1 truncate">{item.subname}</p>}
            </div>
            <p className="text-emerald-300 font-semibold whitespace-nowrap">Rs. {formatPrice(item.price)}</p>
          </div>

          <div className="mt-3 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
            <p className="text-sm text-white/80 line-clamp-2">{item.description || "Classic Hungarian flavors, crafted fresh."}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => onQuickView(item)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/25 border border-white/15 text-white/90 text-sm font-medium hover:bg-black/35 transition-all duration-300 ease-out"
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4" /> Quick View
                </span>
              </button>
              <button
                type="button"
                onClick={() => onAddToCart(item, 1)}
                disabled={isOutOfStock}
                className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30 text-sm font-semibold hover:bg-emerald-500/30 hover:ring-emerald-300/40 transition-all duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MenuCard;
