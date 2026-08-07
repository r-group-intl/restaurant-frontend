import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";

const QuickViewModal = ({ item, isOpen, onClose, onAddToCart, formatPrice }) => {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setQuantity(1);
      requestAnimationFrame(() => setVisible(true));
    } else if (mounted) {
      setVisible(false);
      const timeoutId = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mounted, onClose]);

  useEffect(() => {
    if (mounted && panelRef.current) {
      panelRef.current.focus();
    }
  }, [mounted]);

  if (!mounted || !item) return null;

  const outOfStock = Boolean(item.isOutOfStock);

  return (
    <div
      className={`fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm transition-all duration-300 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div className="w-full h-full flex items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.name} quick view`}
          tabIndex={-1}
          onClick={(event) => event.stopPropagation()}
          className={`max-w-3xl w-[92%] rounded-2xl bg-card border border-border/70 shadow-[0_30px_80px_rgba(0,0,0,0.55)] overflow-hidden transition-all duration-300 ease-out ${
            visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="relative p-4 border-b border-border/70 flex items-center justify-between">
            <h3 className="text-foreground font-semibold">Quick View</h3>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-muted/40 border border-border/70 text-foreground/80 hover:bg-muted/60 transition-all duration-300 ease-out"
            >
              <X className="w-4 h-4 mx-auto" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-72 md:h-full min-h-[18rem] bg-black/30">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover ${outOfStock ? "opacity-60" : "opacity-100"}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </div>

            <div className="p-6 text-foreground">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-bold">{item.name}</h4>
                  {item.subname && <p className="text-emerald-300/90 text-sm mt-1">{item.subname}</p>}
                </div>
                <p className="text-emerald-300 font-semibold text-xl">Rs. {formatPrice(item.price)}</p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-muted/30 border border-border/70 text-muted-foreground">
                  {item.categoryDisplay || item.category || "Menu"}
                </span>
                {item.popular && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-300/20">Popular</span>
                )}
                {item.traditional && (
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-300/20">Chef’s Choice</span>
                )}
                {item.spicy && (
                  <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-200 border border-orange-300/20">Spicy</span>
                )}
                {outOfStock && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-300/20">Out of stock</span>
                )}
              </div>

              <p className="mt-4 text-muted-foreground leading-relaxed">{item.description || "Prepared with premium ingredients and authentic Hungarian flavors."}</p>

              <div className="mt-6 flex items-center gap-4">
                <div className="inline-flex items-center rounded-xl bg-muted/30 border border-border/70 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 text-foreground/80 hover:bg-muted/50 transition-all duration-300 ease-out"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 mx-auto" />
                  </button>
                  <span className="w-10 text-center text-foreground font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-10 h-10 text-foreground/80 hover:bg-muted/50 transition-all duration-300 ease-out"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={() => {
                    onAddToCart(item, quantity);
                    onClose();
                  }}
                  className="flex-1 h-10 rounded-xl bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30 font-semibold hover:bg-emerald-500/30 hover:ring-emerald-300/40 transition-all duration-300 ease-out disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
