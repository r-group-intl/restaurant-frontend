const DEFAULT_ITEMS = [
  'Authentic Hungarian flavors',
  'Fresh ingredients daily',
  'Dine-in • Takeaway • Delivery',
  'Fast kitchen workflow',
  'QR ordering supported',
  'Family-friendly atmosphere',
];

const RestaurantHighlightsMarquee = ({
  title = 'Discover',
  subtitle = 'A few things you\'ll love about us',
  items = DEFAULT_ITEMS,
}) => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!safeItems.length) return null;

  // Duplicate content so it loops seamlessly.
  const track = [...safeItems, ...safeItems];

  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        <header>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">{subtitle}</p>
        </header>

        <div className="mt-6 glass-card rounded-3xl overflow-hidden">
          <div className="relative">
            <div className="website-marquee" aria-label="Restaurant highlights">
              <div className="website-marquee-track">
                {track.map((text, index) => (
                  <div
                    key={`${text}-${index}`}
                    className="website-marquee-item"
                  >
                    <span className="inline-block w-2 h-2 rounded-full bg-primary/80" aria-hidden="true" />
                    <span className="text-sm sm:text-base font-medium text-foreground/90">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-14 bg-gradient-to-r from-card/90 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-14 bg-gradient-to-l from-card/90 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantHighlightsMarquee;
