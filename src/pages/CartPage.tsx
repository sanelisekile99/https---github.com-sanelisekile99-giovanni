import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { getProducts } from '@/lib/localStore.generated';
import { useState } from 'react';

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const formatPrice = (cents: number) => `R ${(cents / 100).toLocaleString('en-ZA')}`;

  const handleProceedToCheckout = () => {
    // Validate that all products with variants have a variant selected
    const productsWithVariants = cart.filter(item => {
      const product = getProducts().find(p => p.id === item.product_id);
      return product?.has_variants && !item.variant_id;
    });

    if (productsWithVariants.length > 0) {
      setError('Please select a size for all products before continuing.');
      return;
    }

    setError('');
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 lg:py-16">
        <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A] mb-10">
          Your Bag
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={48} strokeWidth={1} className="mx-auto text-[#D0D0D0] mb-6" />
            <p className="text-lg text-[#8B8B8B] font-light mb-2">Your bag is empty</p>
            <p className="text-sm text-[#A0A0A0] font-light mb-8">
              Discover our collection and find something you love.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
            >
              Continue Shopping
              <ArrowRight size={14} strokeWidth={1.5} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Cart items */}
            <div className="lg:col-span-2">
              {/* Header row */}
              <div className="hidden lg:grid grid-cols-[1fr_120px_120px_40px] gap-4 pb-4 border-b border-[#F0EDE9] text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">
                <span>Product</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
                <span />
              </div>

              <div className="divide-y divide-[#F0EDE9]">
                {cart.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    className="py-6 lg:grid lg:grid-cols-[1fr_120px_120px_40px] lg:gap-4 lg:items-center"
                  >
                    {/* Product info */}
                    <div className="flex gap-5">
                      <div className="w-24 h-28 lg:w-28 lg:h-32 bg-[#F8F6F3] flex-shrink-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-[#1A1A1A] mb-1">{item.name}</h3>
                        {item.variant_title && (
                          <p className="text-[11px] text-[#8B8B8B] tracking-wide uppercase mb-1">
                            Size: {item.variant_title}
                          </p>
                        )}
                        <p className="text-sm font-light text-[#5A5A5A]">{formatPrice(item.price)}</p>

                        {/* Mobile quantity + remove */}
                        <div className="flex items-center justify-between mt-4 lg:hidden">
                          <div className="flex items-center border border-[#E8E5E1]">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                              className="px-3 py-2 hover:bg-[#F8F6F3] transition-colors"
                            >
                              <Minus size={12} strokeWidth={1.5} />
                            </button>
                            <span className="px-4 py-2 text-xs font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                              className="px-3 py-2 hover:bg-[#F8F6F3] transition-colors"
                            >
                              <Plus size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                          <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop quantity */}
                    <div className="hidden lg:flex items-center justify-center">
                      <div className="flex items-center border border-[#E8E5E1]">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-[#F8F6F3] transition-colors"
                        >
                          <Minus size={12} strokeWidth={1.5} />
                        </button>
                        <span className="px-3 py-1.5 text-xs font-medium min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-[#F8F6F3] transition-colors"
                        >
                          <Plus size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    {/* Desktop total */}
                    <div className="hidden lg:block text-right">
                      <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>

                    {/* Remove */}
                    <div className="hidden lg:flex justify-end">
                      <button
                        onClick={() => removeFromCart(item.product_id, item.variant_id)}
                        className="p-1 text-[#A0A0A0] hover:text-[#1A1A1A] transition-colors"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#FAFAF8] p-6 lg:p-8 sticky top-32">
                <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B8B8B] font-light">Subtotal</span>
                    <span className="font-medium">{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8B8B8B] font-light">Shipping</span>
                    <span className="text-[#7BAF9E] font-light text-[12px] tracking-wide">Free</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E5E1] pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-[#1A1A1A]">Total</span>
                    <span className="text-lg font-medium text-[#1A1A1A]">{formatPrice(cartTotal)}</span>
                  </div>
                  <p className="text-[11px] text-[#A0A0A0] font-light mt-1">Tax calculated at checkout</p>
                </div>

                {error && (
                  <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
                )}

                <button
                  onClick={handleProceedToCheckout}
                  className="block w-full text-center py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/shop"
                  className="block w-full text-center mt-3 py-3 text-[11px] tracking-[0.2em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
