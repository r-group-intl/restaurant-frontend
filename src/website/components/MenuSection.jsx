import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "../../inventory/services/api";
import { getImageUrlWithFallback } from "../../utils/imageUtils";
import CategoryTabs from "./CategoryTabs";
import MenuGrid from "./MenuGrid";
import QuickViewModal from "./QuickViewModal";
import FloatingCartWidget from "./FloatingCartWidget";

const normalizeCategory = (value) => {
  const normalized = (value ?? '').toString().trim();
  return normalized || 'Other';
};
const MENU_API_TIMEOUT_MS = 8000;

const MenuSection = ({
  onAddToCart,
  cartItems = [],
  onOpenCart,
  activeCategory: activeCategoryProp,
  onCategoryChange,
  showCategoryTabs = true,
  onMenuItemsLoaded,
}) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [internalActiveCategory, setInternalActiveCategory] = useState("All");
  const [isFiltering, setIsFiltering] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const gridAnchorRef = useRef(null);
  const { toast } = useToast();

  const activeCategory = activeCategoryProp ?? internalActiveCategory;

  const formatPrice = (price) => {
    const numericPrice = Number(price) || 0;
    return numericPrice.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadMenuItems = async () => {
      try {
        if (isMounted) {
          setLoading(true);
        }

        const timeoutPromise = new Promise((_, reject) => {
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error("Menu request timeout"));
          }, MENU_API_TIMEOUT_MS);
        });

        const response = await Promise.race([api.get("/public/menu"), timeoutPromise]);
        const items = response.data
          .map((item) => ({
            id: item._id,
            name: item.name,
            subname: item.subname || "",
            description: item.description || "",
            price: item.sellPrice || 0,
            image: getImageUrlWithFallback(item.image),
            category: normalizeCategory(item.category),
            categoryDisplay: normalizeCategory(item.category),
            popular: item.popular || false,
            traditional: item.traditional || false,
            spicy: item.spicy || false,
            premium: item.premium || false,
            isOutOfStock: item.isOutOfStock || false,
            stockMessage: item.stockMessage || "Out of stock",
          }))
          .filter((item) => item.price > 0);

        if (isMounted) {
          setMenuItems(items);
          onMenuItemsLoaded?.(items);
        }
      } catch (error) {
        console.error("Error loading menu items:", error);
        if (isMounted) {
          toast({
            title: "Menu unavailable",
            description: "Unable to load the menu right now. Please try again.",
            duration: 2800,
          });
          setMenuItems([]);
          onMenuItemsLoaded?.([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMenuItems();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const available = new Set(menuItems.map((item) => normalizeCategory(item.categoryDisplay || item.category)));
    const ordered = [...available].sort((a, b) => a.localeCompare(b));
    return ["All", ...ordered];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") {
      return [...menuItems].sort((a, b) => {
        const categoryA = normalizeCategory(a.categoryDisplay || a.category);
        const categoryB = normalizeCategory(b.categoryDisplay || b.category);
        if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    const normalizedActive = normalizeCategory(activeCategory);
    return menuItems.filter((item) => normalizeCategory(item.categoryDisplay || item.category) === normalizedActive);
  }, [menuItems, activeCategory]);

  const handleCategoryChange = (category) => {
    if (category === activeCategory) return;

    setIsFiltering(true);
    setTimeout(() => {
      if (typeof onCategoryChange === "function") {
        onCategoryChange(category);
      } else {
        setInternalActiveCategory(category);
      }
      setIsFiltering(false);
      gridAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
  };

  const handleAddToCart = (item, quantity = 1) => {
    if (item.isOutOfStock) {
      toast({
        title: "Item unavailable",
        description: `${item.name} is currently out of stock.`,
        variant: "destructive",
        duration: 2500,
      });
      return;
    }

    for (let count = 0; count < quantity; count += 1) {
      onAddToCart?.(item);
    }

    toast({
      title: "Added to cart",
      description: `${quantity} × ${item.name}`,
      duration: 2200,
    });
  };

  const openQuickView = (item) => {
    setSelectedItem(item);
    setQuickViewOpen(true);
  };

  return (
    <section id="menu" className="relative py-16 md:py-20 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.08),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_45%)]" />
      <div className="absolute -inset-20 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.24),transparent_68%)]" />

      <div className="absolute top-20 left-[12%] w-2 h-2 rounded-full bg-emerald-300/30 animate-pulse" />
      <div className="absolute top-44 right-[18%] w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:300ms]" />
      <div className="absolute bottom-24 left-[26%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse [animation-delay:600ms]" />
      <div className="absolute bottom-40 right-[28%] w-1.5 h-1.5 rounded-full bg-white/15 animate-pulse [animation-delay:900ms]" />

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
            Our <span className="text-primary">Hungarian</span> Menu
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Discover signature dishes and artisan bakery selections in a premium modern food gallery.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-emerald-300/80">
            <span className="w-10 h-px bg-emerald-400/30" />
            <Sparkles className="w-4 h-4" />
            <span className="w-10 h-px bg-emerald-400/30" />
          </div>
        </header>

        {showCategoryTabs ? (
          <div className="rounded-2xl bg-card/50 backdrop-blur-xl border border-border/70 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.35)] mb-8">
            <CategoryTabs categories={categories} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
          </div>
        ) : null}

        <div ref={gridAnchorRef} className="scroll-mt-28" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="rounded-2xl bg-card/50 border border-border/70 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden"
              >
                <div className="h-64 animate-pulse bg-muted/30" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-2/3 animate-pulse bg-muted/30 rounded" />
                  <div className="h-3 w-1/2 animate-pulse bg-muted/30 rounded" />
                  <div className="h-10 animate-pulse bg-muted/30 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length ? (
          <MenuGrid
            items={filteredItems}
            isFiltering={isFiltering}
            onQuickView={openQuickView}
            onAddToCart={handleAddToCart}
            formatPrice={formatPrice}
          />
        ) : (
          <div className="text-center py-20 rounded-2xl bg-card/50 border border-border/70">
            <p className="text-foreground/80 text-lg">No items available in this category yet.</p>
            <p className="text-muted-foreground mt-1 text-sm">Try another category or check back shortly.</p>
          </div>
        )}
      </div>

      <QuickViewModal
        item={selectedItem}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        formatPrice={formatPrice}
      />

      <FloatingCartWidget cartItems={cartItems} onOpenCart={onOpenCart} />
    </section>
  );
};

export default MenuSection;
