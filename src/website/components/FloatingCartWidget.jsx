import { useMemo, useState } from "react";
import { ShoppingBag, ChevronUp, ChevronDown } from "lucide-react";

const FloatingCartWidget = ({ cartItems = [], onOpenCart }) => {
  const [expanded, setExpanded] = useState(false);

  const { itemCount, subtotal } = useMemo(() => {
    const itemCountValue = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const subtotalValue = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
    return { itemCount: itemCountValue, subtotal: subtotalValue };
  }, [cartItems]);

  if (!itemCount) return null;

  return (
    <aside className="fixed right-6 bottom-20 sm:bottom-6 z-50 w-[min(360px,calc(100vw-2rem))]">
      <div className="rounded-2xl bg-card/50 backdrop-blur-xl border border-border/70 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-emerald-400/20 transition-all duration-300 ease-out overflow-hidden">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-all duration-300 ease-out"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 ring-1 ring-emerald-400/30 flex items-center justify-center text-emerald-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-foreground font-semibold">{itemCount} items</p>
              <p className="text-emerald-300 text-sm">Rs. {subtotal.toFixed(2)}</p>
            </div>
          </div>
          <span className="text-foreground/70">{expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}</span>
        </button>

        <div
          className={`grid transition-all duration-300 ease-out ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-border/70">
              <ul className="space-y-2 mt-3">
                {cartItems.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-foreground/85 truncate">
                      {item.name} <span className="text-muted-foreground">x{item.quantity || 1}</span>
                    </span>
                    <span className="text-emerald-300 whitespace-nowrap">Rs. {((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </li>
                ))}
              </ul>

              {cartItems.length > 4 && (
                <p className="text-xs text-muted-foreground mt-2">+{cartItems.length - 4} more items</p>
              )}

              <button
                type="button"
                onClick={onOpenCart}
                className="mt-4 w-full h-10 rounded-xl bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30 font-semibold hover:bg-emerald-500/30 hover:ring-emerald-300/40 transition-all duration-300 ease-out"
              >
                Go to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FloatingCartWidget;
