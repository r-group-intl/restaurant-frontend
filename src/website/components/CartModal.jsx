import { X, Minus, Plus, Receipt, User, MapPin, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { api } from "../../lib/api";

const CartModal = ({ isOpen, onClose, cartItems, tableNumber, onUpdateQuantity, onRemoveItem, onOrderPlaced }) => {
  const [isPlacing, setIsPlacing] = useState(false);
  
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateQuantity(itemId, newQuantity);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    
    setIsPlacing(true);
    try {
      // Convert cart items to order format
      const orderItems = cartItems.map(item => ({
        menuItemId: item.id, // Use the item id which is mapped from _id in MenuSection
        dishName: item.name,
        category: item.category || 'Main Dish',
        price: item.price,
        qty: item.quantity
      }));

      const orderData = {
        orderType: 'table',
        table: tableNumber,
        items: orderItems,
        placedBy: 'customer' // This is a customer order from website
      };

      const response = await api.post('/orders/customer', orderData);
      
      // Success - show confirmation and clear cart
      alert(`✅ Order placed successfully!\n\nOrder ID: ${response.data.orderId}\nTable: ${tableNumber}\nTotal: LKR ${total.toFixed(2)}\n\nYour order has been sent to the kitchen. Please wait for service.`);
      
      // Clear the cart and close modal
      if (onOrderPlaced) {
        onOrderPlaced(); // This should clear the cart in parent component
      }
      onClose();
      
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`❌ Failed to place order: ${error.response?.data?.message || 'Please try again or contact staff.'}`);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div className="glass-card rounded-2xl max-w-md w-full max-h-[90vh] border border-red-100 animate-scale-in flex flex-col">
        
        {/* Professional Header - Fixed */}
        <div className="bg-gradient-primary text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">


            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-smooth hover-scale"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Professional Table Info */}
          <div className="mt-1 flex items-center justify-between bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold">Table {tableNumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">Guest Order</span>
            </div>
          </div>
        </div>

        {/* Professional Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-gray-500 font-medium">No items selected yet</p>
                <p className="text-gray-400 text-sm mt-1">Browse our menu to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="glass-effect rounded-xl p-4 border border-red-100 hover-lift transition-smooth">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                       
      
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-bold text-red-600">LKR{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Professional Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 bg-white rounded-xl border border-red-200 p-1 shadow-md">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-smooth"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-smooth"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          LKR {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Professional Order Total - Fixed */}
        {cartItems.length > 0 && (
          <div className="border-t border-red-100 p-1 bg-gradient-subtle flex-shrink-0">
            <div className="space-y-3">
              <div className="flex justify-between text-white">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>LKR{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Tax (10%)</span>
                <span>LKR{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-red-200 pt-3">
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-white">LKR{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Professional Action Buttons */}
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 "
              >
                Continue Ordering
              </Button>
              <Button
                className="flex-1 btn-primary group"
                onClick={handlePlaceOrder}
                disabled={isPlacing || cartItems.length === 0}
              >
                <ChefHat className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                {isPlacing ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>

            {/* Professional Instructions */}
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <Receipt className="w-4 h-4" />
                <p className="text-sm font-medium text-center">
                  Present this order summary to your waiter for confirmation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
