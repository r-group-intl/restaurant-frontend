import { useState, useEffect } from "react";
import { ArrowDown, Bike, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const BG = "/hero/BG_2.png";
const flower = "/hero/flower.png";
const flower2 = "/hero/flower2.png";
const HERO_VIDEO = "/Cinematic_Food_Commercial.mp4";

const HeroSection = ({ onViewMenu, tableNumber, onReserveTable }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // ✅ Put all hero images into array
  const images = [BG]; 

  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const scrollToMenu = () => {
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    onViewMenu?.();
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] flex items-center overflow-hidden">
      {/* Background (video first, fallback image if video fails) */}
      <div className="absolute inset-0">
        {!videoError ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={BG}
            onError={() => setVideoError(true)}
            aria-hidden="true"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${images[currentImage]})` }}
            aria-hidden="true"
          />
        )}

        {/* Overlays to ensure text readability */}
        <div className="absolute inset-0 bg-black/55"></div>
        <div className="absolute inset-0 bg-gradient-hero opacity-70"></div>
      </div>

      {/* Ambient overlays (no new colors; uses theme primitives) */}
      <div className="absolute inset-0 hero-noise pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl animate-pulse-gentle"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-gentle"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid gap-8 items-center">
          {/* Brand */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center lg:justify-start mb-6 animate-fade-in-up">
              <img
                src={flower2}
                alt="Decor"
                className="w-full max-w-[22rem] sm:max-w-[24rem] h-auto object-contain"
              />
            </div>

            <div className="animate-slide-in-left">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
                <span className="text-white drop-shadow-2xl">Restaurants</span>
                <br />
                <span className="text-gradient-primary text-shimmer">By Ronan</span>
              </h1>

              <div className="mt-4 flex items-center justify-center lg:justify-start">
                <img
                  src={flower}
                  alt="Decor"
                  className="w-full max-w-[18rem] sm:max-w-[22rem] h-auto object-contain opacity-95"
                />
              </div>

              <p className="mt-5 text-sm sm:text-base md:text-lg text-gray-200/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Experience the rich flavors of Hungary with traditional dishes crafted from authentic recipes —
                designed for modern dining.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-stretch sm:items-center">
                <Button
                  onClick={scrollToMenu}
                  size="lg"
                  className="btn-primary rounded-2xl group"
                >
                  View Menu
                  <ArrowDown className="w-4 h-4 ml-2 group-hover:translate-y-0.5 transition-transform" />
                </Button>
                <Button
                  onClick={() => onReserveTable?.()}
                  size="lg"
                  variant="outline"
                  className="rounded-2xl bg-white/5 border-white/15 text-white hover:bg-white/10 transition-smooth"
                >
                  {tableNumber ? `Dining at Table ${tableNumber}` : "Select Table"}
                </Button>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center">
                <Button
                  onClick={() => window.open("https://www.ubereats.com", "_blank")}
                  size="sm"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/10 px-6 py-3 rounded-2xl shadow-elegant transition-smooth group"
                >
                  <Truck className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Uber Eats
                </Button>
                <Button
                  onClick={() => window.open("https://www.pickme.lk", "_blank")}
                  size="sm"
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/10 px-6 py-3 rounded-2xl shadow-elegant transition-smooth group"
                >
                  <Bike className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  PickMe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-white/80 text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse-gentle"></span>
            QR ordering supported • Fast kitchen workflow
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-6 hidden md:flex flex-col items-center gap-2 text-white/70">
          <div className="text-xs tracking-widest">SCROLL</div>
          <div className="w-[2px] h-10 bg-white/20 overflow-hidden rounded-full">
            <div className="w-full h-1/2 bg-white/60 animate-scroll-indicator"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
