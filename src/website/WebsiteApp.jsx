import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import CommitmentSection from './components/CommitmentSection';
import CategoryCarouselSection from './components/CategoryCarouselSection';
import SpecialOffersSection from './components/SpecialOffersSection';
import MenuSection from './components/MenuSection';
import RestaurantNavbar from './components/RestaurantNavbar';
import RestaurantFooter from './components/RestaurantFooter';
import ScrollToTop from './components/ScrollToTop';
import CartModal from './components/CartModal';
import TableSelection from './components/TableSelection';
import api from '../inventory/services/api';
import './index.css';

function WebsiteApp() {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState(null);
  const [isTableLocked, setIsTableLocked] = useState(false);
  const [websiteTheme, setWebsiteTheme] = useState('dark');
  const [activeCategory, setActiveCategory] = useState('All');
  const [publicMenuItems, setPublicMenuItems] = useState([]);
  const [specialOffers, setSpecialOffers] = useState([]);
  const [websiteCategories, setWebsiteCategories] = useState([]);

  useEffect(() => {
    // Website-only theme (scoped wrapper) – does not affect inventory
    const media = window.matchMedia?.('(prefers-color-scheme: light)');
    const stored = localStorage.getItem('website_theme');
    const initial = stored === 'light' || stored === 'dark'
      ? stored
      : (media?.matches ? 'light' : 'dark');
    setWebsiteTheme(initial);

    const onChange = (event) => {
      // Respect system changes only when no explicit preference is stored
      const saved = localStorage.getItem('website_theme');
      if (saved === 'light' || saved === 'dark') return;
      setWebsiteTheme(event.matches ? 'light' : 'dark');
    };

    if (media?.addEventListener) {
      media.addEventListener('change', onChange);
    } else if (media?.addListener) {
      media.addListener(onChange);
    }

    // Check URL for table parameter (QR code support)
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    
    if (tableParam) {
      const tableNum = parseInt(tableParam, 10);
      if (tableNum >= 1 && tableNum <= 20) {
        setTableNumber(tableNum);
        setIsTableLocked(true); // Lock table when coming from QR
        
        // Store in sessionStorage to prevent URL manipulation
        sessionStorage.setItem('qrTable', tableNum.toString());
        sessionStorage.setItem('tableLocked', 'true');
      }
    } else {
      // Check if there's a locked table in session
      const savedTable = sessionStorage.getItem('qrTable');
      const tableLocked = sessionStorage.getItem('tableLocked') === 'true';
      
      if (savedTable && tableLocked) {
        setTableNumber(parseInt(savedTable, 10));
        setIsTableLocked(true);
      } else {
        // Check if user has a saved table preference
        const userTablePreference = localStorage.getItem('website_table_preference');
        if (userTablePreference) {
          setTableNumber(parseInt(userTablePreference, 10));
          setIsTableLocked(false);
        }
        // If no table preference, user can select table via navbar
      }
    }

    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);

      if (media?.removeEventListener) {
        media.removeEventListener('change', onChange);
      } else if (media?.removeListener) {
        media.removeListener(onChange);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const OFFERS_API_TIMEOUT_MS = 7000;

    const loadSpecialOffers = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('Special offers request timeout'));
          }, OFFERS_API_TIMEOUT_MS);
        });

        const response = await Promise.race([api.get('/public/special-offers'), timeoutPromise]);
        if (!isMounted) return;
        setSpecialOffers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (isMounted) {
          setSpecialOffers([]);
        }
      }
    };

    loadSpecialOffers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const CATEGORIES_API_TIMEOUT_MS = 7000;

    const loadWebsiteCategories = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(new Error('Website categories request timeout'));
          }, CATEGORIES_API_TIMEOUT_MS);
        });

        const response = await Promise.race([api.get('/public/website-categories'), timeoutPromise]);
        if (!isMounted) return;
        setWebsiteCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (isMounted) {
          setWebsiteCategories([]);
        }
      }
    };

    loadWebsiteCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const handleOrderPlaced = () => {
    // Clear the cart after successful order
    setCart([]);
  };

  const handleTableChange = (newTableNumber) => {
    // Only allow table changes if not locked by QR code
    if (!isTableLocked) {
      setTableNumber(newTableNumber);
      // Save user's table preference
      localStorage.setItem('website_table_preference', newTableNumber.toString());
    }
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className={`website-theme ${websiteTheme === 'light' ? 'light' : ''} min-h-screen bg-background flex items-center justify-center`}>
        <div className="text-center px-6">
          <div className="w-14 h-14 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-5"></div>
          <p className="text-foreground text-lg font-semibold">Restaurants By Ronan</p>
          <p className="text-muted-foreground text-sm mt-2">Preparing your dining experience…</p>
          {tableNumber && (
            <p className="text-primary text-sm mt-1">Table {tableNumber}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`website-theme ${websiteTheme === 'light' ? 'light' : ''} min-h-screen bg-background text-foreground`}>
      <RestaurantNavbar 
        cartItems={cart} 
        onCartClick={() => setIsCartOpen(true)}
        tableNumber={tableNumber}
        onTableChange={handleTableChange}
        isTableLocked={isTableLocked}
      />
      <main className="pt-16 md:pt-20">
        <HeroSection tableNumber={tableNumber} />
        <CommitmentSection />
        <SpecialOffersSection offers={specialOffers} />
        <CategoryCarouselSection
          categories={websiteCategories}
          menuItems={publicMenuItems}
          activeCategory={activeCategory}
          onSelectCategory={(category) => {
            setActiveCategory(category);
            setTimeout(() => {
              document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
          }}
        />
        <MenuSection
          onAddToCart={handleAddToCart}
          cartItems={cart}
          onOpenCart={() => setIsCartOpen(true)}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          showCategoryTabs={false}
          onMenuItemsLoaded={setPublicMenuItems}
        />
      </main>
      
      <RestaurantFooter />
      <ScrollToTop />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        tableNumber={tableNumber}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
}

export default WebsiteApp;