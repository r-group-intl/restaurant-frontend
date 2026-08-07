import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart, Phone, MapPin, ChevronDown, Users, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebsiteAuth } from "../hooks/useWebsiteAuth";

const RestaurantNavbar = ({ cartItems = [], onCartClick, tableNumber, onTableChange, isTableLocked = false }) => {
  const { user, logout } = useWebsiteAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  const tableNumbers = Array.from({ length: 20 }, (_, i) => i + 1); // Tables 1-20

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleTableSelect = (tableNum) => {
    if (!isTableLocked) {
      onTableChange(tableNum);
      setShowTableDropdown(false);
    } else {
      alert('🔒 Table is locked by QR code. You cannot change tables.');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-md border-b border-border' 
        : 'bg-background/40 backdrop-blur-md border-b border-border/60'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Professional Dark Logo & Brand */}
          <div className="flex items-center space-x-3 animate-slide-in-left">
            <div className="relative">
              <img 
                src="/Logo W.png" 
                alt="WOW Restaurant Logo" 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-glow hover-scale transition-smooth"
              />
              <div className="absolute -inset-1 bg-primary/25 rounded-full blur-md -z-10 animate-pulse-gentle"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg md:text-xl text-foreground">
                Restaurants By Ronan
              </h1>
              <p className="text-xs text-primary">
                CRAVE INTERNATIONALLY ENJOY LOCALLY
                
              </p>
            </div>
          </div>

          {/* Mobile Table Selection - Always Visible */}
          <div className="md:hidden flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTableDropdown(!showTableDropdown)}
              className="flex items-center space-x-1 bg-card/60 border-border text-foreground hover:bg-card/80 hover:border-primary transition-smooth"
            >
              <Users className="w-3 h-3" />
              <span className="text-xs">{tableNumber ? `T${tableNumber}` : 'Table'}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>

          {/* Professional Dark Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => scrollToSection('menu')}
              className="font-medium text-muted-foreground hover:text-primary transition-smooth hover-scale hover-glow"
            >
              Menu
            </button>


            {/* Professional Dark Table Selection Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTableDropdown(!showTableDropdown)}
                className={`flex items-center space-x-2 bg-card/60 border-border text-foreground hover:bg-card/80 hover:border-primary shadow-glow transition-smooth hover-scale hover-glow ${
                  isTableLocked ? 'border-orange-500' : ''
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{tableNumber ? `Table ${tableNumber}` : 'Select Table'}</span>
                {isTableLocked && <span className="text-orange-400">🔒</span>}
                <ChevronDown className="w-3 h-3" />
              </Button>

              {showTableDropdown && (
                <div className="absolute top-full mt-2 right-0 rounded-2xl p-2 min-w-[200px] max-h-60 overflow-y-auto animate-scale-in shadow-glow border border-border bg-card/80 backdrop-blur-xl">
                  <div className="text-sm font-semibold text-muted-foreground px-3 py-2 border-b border-border">
                    {isTableLocked ? '🔒 Table Locked (QR)' : 'Select Your Table'}
                  </div>
                  {isTableLocked ? (
                    <div className="p-3 text-center text-sm text-orange-300">
                      This table is locked via QR code.
                      <br />You cannot change tables.
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {tableNumbers.map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            handleTableSelect(num);
                            setShowTableDropdown(false);
                          }}
                          className={`p-2 text-sm rounded-lg transition-all hover:scale-105 ${
                            tableNumber === num
                              ? 'bg-primary text-primary-foreground shadow-lg'
                              : 'bg-muted/40 text-foreground hover:bg-muted/60'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1 text-sm text-muted-foreground transition-smooth">
              <Phone className="w-4 h-4" />
              <span>+94 777 66 9191</span>
            </div>

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 bg-card/60 border-border text-foreground hover:bg-card/80 hover:border-blue-500 transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">{user?.name}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>

              {showUserMenu && (
                <div className="absolute top-full mt-2 right-0 bg-card/90 backdrop-blur-md rounded-2xl p-2 min-w-[200px] shadow-2xl border border-border z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="font-medium text-foreground">{user?.name}</div>
                    <div className="text-sm text-muted-foreground">{user?.email}</div>
                    <div className="text-xs text-blue-400 mt-1">Role: {user?.role}</div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-primary hover:text-primary/90 hover:bg-muted/40 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Professional Dark Cart & Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4 animate-slide-in-right">
            {/* Professional Dark Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative bg-card/60 border-border text-foreground hover:bg-card/80 hover:border-primary shadow-glow transition-smooth hover-scale hover-glow"
            >
              <ShoppingCart className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Cart</span>
              {cartItemCount > 0 && (
                <Badge className="badge-primary absolute -top-2 -right-2 text-xs min-w-[1.25rem] h-5 flex items-center justify-center animate-pulse-gentle shadow-glow">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-muted-foreground hover:text-primary transition-smooth hover-scale"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Professional Dark Mobile Menu */}
        {isOpen && (
          <div className="md:hidden rounded-2xl m-4 p-6 animate-slide-in-up border border-border shadow-glow bg-card/80 backdrop-blur-xl">
            <div className="space-y-4">
              <button
                onClick={() => scrollToSection('menu')}
                className="block w-full text-left text-muted-foreground hover:text-primary font-medium py-2 transition-smooth hover-glow"
              >
                Menu
              </button>

              {/* Professional Dark Mobile Table Selection */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-muted-foreground font-medium">Current Table:</span>
                  {tableNumber ? (
                    <Badge className="badge-secondary">Table {tableNumber}</Badge>
                  ) : (
                    <Badge className="badge-outline">No Table Selected</Badge>
                  )}
                </div>
                {!isTableLocked && (
                  <div className="grid grid-cols-5 gap-2">
                    {tableNumbers.slice(0, 15).map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          handleTableSelect(num);
                          setIsOpen(false);
                        }}
                        className={`p-2 text-sm rounded-xl transition-all hover:scale-105 ${
                          tableNumber === num
                            ? 'bg-primary text-primary-foreground shadow-lg'
                            : 'bg-muted/40 text-foreground hover:bg-muted/60 hover:text-primary'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                )}
                {!isTableLocked && (
                  <button
                    onClick={() => {
                      setShowTableDropdown(true);
                      setIsOpen(false);
                    }}
                    className="w-full mt-2 text-sm text-primary hover:text-primary/90 transition-smooth"
                  >
                    More tables (16-20)...
                  </button>
                )}
                {isTableLocked && (
                  <div className="text-center text-sm text-orange-300 mt-2">
                    🔒 Table locked via QR code
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Budapest, Hungary</span>
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+94 1 234 5678</span>
                </div>
              </div>
              
              {/* Mobile User Info */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-gray-400">{user?.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-primary hover:text-primary/90 hover:bg-gray-700/50 rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
              
              <Button 
                className="w-full btn-primary mt-4 hover-glow"
                onClick={() => setIsOpen(false)}
              >
                Order Now
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Table Dropdown - Positioned for mobile */}
      {showTableDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50" 
            onClick={() => setShowTableDropdown(false)}
          />
          <div className="md:hidden fixed top-20 left-4 right-4 z-50 rounded-2xl p-4 animate-scale-in shadow-glow border border-border bg-card/85 backdrop-blur-xl">
            <div className="text-sm font-semibold text-muted-foreground px-3 py-2 border-b border-border mb-4">
              {isTableLocked ? '🔒 Table Locked (QR)' : 'Select Your Table'}
            </div>
            {isTableLocked ? (
              <div className="text-center text-sm text-orange-300">
                This table is locked via QR code.
                <br />You cannot change tables.
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                {tableNumbers.map((num) => (
                  <button
                    key={num}
                    onClick={() => handleTableSelect(num)}
                    className={`p-3 text-sm rounded-xl transition-all hover:scale-105 ${
                      tableNumber === num
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted/40 text-foreground hover:bg-muted/60 hover:text-primary'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default RestaurantNavbar;