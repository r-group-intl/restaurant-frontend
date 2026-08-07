import { MapPin, Phone, Clock, Star, Utensils, Heart, ChefHat } from "lucide-react";

const RestaurantFooter = () => {
  return (
    <footer className="bg-gradient-dark text-foreground py-16 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Professional Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Professional Restaurant Info */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/Logo W.png" 
                  alt="WOW Restaurant Logo" 
                  className="w-12 h-12 rounded-full object-cover shadow-elegant"
                />
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md -z-10"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold">Restaurants By Ronan</h3>
                <p className="text-primary text-sm font-medium">CRAVE INTERNATIONALLY ENJOY LOCALLY</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Experience the rich flavors of Hungary with our traditional dishes, 
              crafted with authentic recipes passed down through generations.
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-primary fill-current" />
              ))}
              <span className="text-muted-foreground ml-2 font-medium">4.9/5 Excellence</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-primary fill-current animate-pulse-gentle" />
              <span className="text-muted-foreground text-sm">Made with Hungarian passion</span>
            </div>
          </div>

          {/* Professional Contact Info */}
          <div className="space-y-4 animate-fade-in-up animate-delay-100">
            <h4 className="text-lg font-semibold flex items-center">
              <Phone className="w-5 h-5 text-primary mr-2" />
              Contact Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-card/50 border border-border/60">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium">The Hungarian Center 288/12L </p>
                  <p className="text-muted-foreground">Royal Gardens , Rajagiriya</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-card/50 border border-border/60">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-foreground font-medium">+94 777 66 9191</p>
              </div>
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-card/50 border border-border/60">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">Daily: 9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Quick Links */}
          <div className="space-y-4 animate-fade-in-up animate-delay-200">
            <h4 className="text-lg font-semibold flex items-center">
              <ChefHat className="w-5 h-5 text-primary mr-2" />
              Quick Links
            </h4>
            <div className="space-y-3">
              <a href="#menu" className="block text-muted-foreground hover:text-primary transition-smooth hover:translate-x-2 group">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:bg-primary/80 transition-colors"></span>
                  Our Menu (Étlapunk)
                </span>
              </a>

              <a href="#reservations" className="block text-muted-foreground hover:text-primary transition-smooth hover:translate-x-2 group">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 group-hover:bg-primary/80 transition-colors"></span>
                  Reservations (Foglalás)
                </span>
              </a>
              <a href="#events" className="block text-muted-foreground hover:text-primary transition-smooth hover:translate-x-2 group">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-white/60 rounded-full mr-3 group-hover:bg-primary/80 transition-colors"></span>
                  Private Events (Rendezvények)
                </span>
              </a>

            </div>
          </div>

          {/* Professional Hungarian Specialties */}
          <div className="space-y-4 animate-fade-in-up animate-delay-300">
            <h4 className="text-lg font-semibold flex items-center">
              <Utensils className="w-5 h-5 text-primary mr-2" />
              Hungarian Specialties
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/40 transition-colors">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse-gentle"></div>
                <span className="text-muted-foreground">Authentic </span>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/40 transition-colors">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-muted-foreground">Traditional </span>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/40 transition-colors">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Homemade </span>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/40 transition-colors">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-muted-foreground">QR Code Ordering</span>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/40 transition-colors">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-muted-foreground">Fresh Daily Ingredients</span>
              </div>
              <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-card/40 transition-colors">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="text-muted-foreground">Family Recipes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Professional Copyright */}
            <div className="text-center md:text-left animate-fade-in-up">
              <p className="text-muted-foreground">
                © 2025 Restaurants By Ronan |             <a 
              href="/inventory"
              className="font-medium text-muted-foreground hover:text-blue-600 transition-smooth hover-scale hover-glow text-sm"
            >
              Staff Portal
            </a>
              </p>
              <p className="text-muted-foreground text-sm mt-1 flex items-center justify-center md:justify-start">
                <span>Powered by Ronan Group IT Team</span>
                <span className="mx-2">•</span>

              </p>
            </div>

            {/* Professional Table Info */}
            <div className="flex items-center space-x-3 bg-gradient-primary rounded-xl px-6 py-3 shadow-elegant animate-fade-in-up animate-delay-100">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Professional QR Menu</p>
                <p className="text-white/80 text-xs">Scan to order • Jó étvágyat!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RestaurantFooter;