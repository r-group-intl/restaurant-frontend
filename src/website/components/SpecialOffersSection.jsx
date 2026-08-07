import { getImageUrlWithFallback } from '../../utils/imageUtils';

const SpecialOffersSection = ({ offers = [] }) => {
  const list = Array.isArray(offers) ? offers : [];
  if (!list.length) return null;

  return (
    <section className="relative py-16 md:py-20 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.08),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_45%)]" />
      <div className="absolute -inset-20 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.24),transparent_68%)]" />

      <div className="absolute top-24 left-[14%] w-2 h-2 rounded-full bg-emerald-300/30 animate-pulse" />
      <div className="absolute top-48 right-[18%] w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:300ms]" />
      <div className="absolute bottom-28 left-[28%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse [animation-delay:600ms]" />
      <div className="absolute bottom-44 right-[24%] w-1.5 h-1.5 rounded-full bg-white/15 animate-pulse [animation-delay:900ms]" />

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Special <span className="text-primary">Offers</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Limited-time deals curated by the restaurant.
          </p>
        </header>

        <div className="space-y-5 md:space-y-6">
          {list.map((offer) => (
            <article
              key={offer._id || offer.id || offer.title}
              className="relative overflow-hidden rounded-3xl glass-card min-h-[240px] sm:min-h-[320px] md:min-h-[360px]"
            >
              {offer.image ? (
                <img
                  src={getImageUrlWithFallback(offer.image)}
                  alt={offer.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />

              <div className="relative h-full p-7 sm:p-10 flex flex-col justify-center">
                <div className="max-w-3xl">
                  {offer.badge ? (
                    <div className="inline-flex items-center rounded-full bg-primary/15 text-primary px-3 py-1 text-xs font-semibold border border-primary/20">
                      {offer.badge}
                    </div>
                  ) : null}

                  <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{offer.title}</h3>
                  {offer.subtitle ? (
                    <p className="mt-2 text-base sm:text-lg text-muted-foreground">{offer.subtitle}</p>
                  ) : null}
                  {offer.description ? (
                    <p className="mt-3 text-base sm:text-lg text-foreground/80">{offer.description}</p>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;
