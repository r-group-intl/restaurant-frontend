import { ConciergeBell, CookingPot, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  {
    title: '5 STAR SERVICE',
    Icon: ConciergeBell,
    // Use existing theme primitives only (no new colors)
    ring: 'hsl(var(--primary) / 0.95)',
  },
  {
    title: 'FRESHLY MADE',
    Icon: CookingPot,
    ring: 'hsl(var(--primary) / 0.75)',
  },
  {
    title: 'SAFETY',
    Icon: ShieldCheck,
    ring: 'hsl(var(--primary) / 0.6)',
  },
  {
    title: 'TIMELY DELIVERY',
    Icon: Truck,
    ring: 'hsl(var(--primary) / 0.85)',
  },
];

const Ring = ({ ringColor, children }) => {
  return (
    <div
      className="relative grid place-items-center w-28 h-28 sm:w-32 sm:h-32"
      style={{
        background: `conic-gradient(from -90deg, ${ringColor} 0 25%, hsl(var(--border) / 0.9) 0 100%)`,
        borderRadius: '9999px',
      }}
    >
      <div className="absolute inset-[8px] rounded-full bg-background/90 border border-border/70" />
      <div className="relative grid place-items-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-xl shadow-card">
        {children}
      </div>
    </div>
  );
};

const CommitmentSection = () => {
  return (
    <section className="relative py-16 md:py-20 bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.10),transparent_40%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.08),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.03),transparent_45%)]" />
      <div className="absolute -inset-20 pointer-events-none bg-[radial-gradient(circle,rgba(0,0,0,0.24),transparent_68%)]" />

      <div className="absolute top-24 left-[10%] w-2 h-2 rounded-full bg-emerald-300/30 animate-pulse" />
      <div className="absolute top-52 right-[16%] w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse [animation-delay:300ms]" />
      <div className="absolute bottom-28 left-[22%] w-2.5 h-2.5 rounded-full bg-emerald-400/20 animate-pulse [animation-delay:600ms]" />
      <div className="absolute bottom-40 right-[26%] w-1.5 h-1.5 rounded-full bg-white/15 animate-pulse [animation-delay:900ms]" />

      <div className="container mx-auto px-4 relative z-10">
        <header className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Our <span className="text-primary">Commitment</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Quality you can taste — service, freshness, safety, and delivery you can trust.
          </p>
        </header>

        <div className="mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14 items-start justify-items-center">
          {ITEMS.map(({ title, Icon, ring }) => (
            <div key={title} className="text-center">
              <Ring ringColor={ring}>
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
              </Ring>
              <div className="mt-5 text-sm sm:text-base tracking-widest text-muted-foreground">
                {title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitmentSection;
