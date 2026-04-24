import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useClientAccount } from '@/contexts/ClientAccountContext';
import { ShoppingBag, X, Menu, Minus, Plus, Search, Heart, User } from 'lucide-react';
import { getVisibleCollections, type LocalCollection } from '@/lib/localStore.generated';
import AuthModal from '@/components/AuthModal';

type HeaderCollection = Pick<LocalCollection, 'id' | 'title' | 'handle'>;

export default function Header() {
  const { cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useClientAccount();
  const [collections, setCollections] = useState<HeaderCollection[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  useEffect(() => {
    setCollections(getVisibleCollections().map(({ id, title, handle }) => ({ id, title, handle })));
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const formatPrice = (cents: number) => `R ${(cents / 100).toLocaleString('en-ZA')}`;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.05)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-auto py-4 lg:py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2"
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>

            {/* Logo and Navigation - Desktop - Centered */}
            <div className="hidden lg:flex flex-col items-center gap-3 flex-1">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <h1 className="font-heading text-2xl tracking-[0.15em] text-[#1A1A1A] font-light">
                  GIOVANNI
                </h1>
              </Link>
              
              {/* Navigation items - smaller */}
              <nav className="flex items-center gap-6">
                <Link
                  to="/shop"
                  className="text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8B8B8B] transition-colors duration-300 font-light"
                >
                  Shop All
                </Link>
                {collections.filter(c => c.handle !== 'new-arrivals').map(col => (
                  <Link
                    key={col.id}
                    to={`/collections/${col.handle}`}
                    className="text-[9px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#8B8B8B] transition-colors duration-300 font-light"
                  >
                    {col.title}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-5 justify-end">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1 hover:opacity-60 transition-opacity"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <Link
                to="/wishlist"
                className="relative p-1 hover:opacity-60 transition-opacity"
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/account"
                  className="relative p-1 hover:opacity-60 transition-opacity"
                  aria-label="Account"
                >
                  <User size={18} strokeWidth={1.5} />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setAuthModalOpen(true);
                  }}
                  className="relative p-1 hover:opacity-60 transition-opacity"
                  aria-label="Sign in"
                >
                  <User size={18} strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-1 hover:opacity-60 transition-opacity"
                aria-label="Cart"
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div
          className={`overflow-hidden transition-all duration-300 bg-white border-t border-[#F0EDE9] ${
            searchOpen ? 'max-h-20' : 'max-h-0'
          }`}
        >
          <form onSubmit={handleSearch} className="max-w-[600px] mx-auto px-6 py-4">
            <div className="flex items-center gap-3 border-b border-[#1A1A1A] pb-2">
              <Search size={16} strokeWidth={1.5} className="text-[#8B8B8B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm font-light outline-none placeholder:text-[#C0C0C0] tracking-wide"
                autoFocus={searchOpen}
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                <X size={16} strokeWidth={1.5} className="text-[#8B8B8B]" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[300px] bg-white transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-10">
              <span className="font-heading text-xl tracking-[0.15em] font-light">GIOVANNI</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              <Link
                to="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[12px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium"
              >
                Shop All
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[12px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium"
              >
                Wishlist
              </Link>
              {isAuthenticated ? (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[12px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium"
                >
                  My Account
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalMode('signin');
                    setAuthModalOpen(true);
                  }}
                  className="text-left text-[12px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium"
                >
                  Sign In
                </button>
              )}
              {collections.map(col => (
                <Link
                  key={col.id}
                  to={`/collections/${col.handle}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[12px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium"
                >
                  {col.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <AuthModal
        open={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Cart Slide-out */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/30" onClick={() => setIsCartOpen(false)} />
        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white transition-transform duration-300 flex flex-col ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cart header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0EDE9]">
            <h2 className="font-heading text-xl tracking-[0.1em] font-light">Your Bag ({cartCount})</h2>
            <button onClick={() => setIsCartOpen(false)}>
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={40} strokeWidth={1} className="text-[#D0D0D0] mb-4" />
                <p className="text-sm text-[#8B8B8B] font-light tracking-wide">Your bag is empty</p>
                <button
                  onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                  className="mt-6 text-[11px] tracking-[0.2em] uppercase border-b border-[#1A1A1A] pb-0.5 hover:opacity-60 transition-opacity"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-4">
                    <div className="w-20 h-24 bg-[#F8F6F3] flex-shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-[#1A1A1A] truncate">{item.name}</h3>
                      {item.variant_title && (
                        <p className="text-[11px] text-[#8B8B8B] mt-0.5 tracking-wide uppercase">
                          Size: {item.variant_title}
                        </p>
                      )}
                      {import.meta.env.DEV && (
                        <p className="text-[10px] text-[#C0C0C0] mt-1 break-words">{item.image || 'no image'}</p>
                      )}
                      <p className="text-sm mt-1 font-light">{formatPrice(item.price)}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#E8E5E1]">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-[#F8F6F3] transition-colors"
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>
                          <span className="px-3 py-1 text-xs font-medium min-w-[32px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-[#F8F6F3] transition-colors"
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id, item.variant_id)}
                          className="text-[10px] tracking-[0.15em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart footer */}
          {cart.length > 0 && (
            <div className="border-t border-[#F0EDE9] px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#8B8B8B]">Subtotal</span>
                <span className="text-sm font-medium">{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-[11px] text-[#8B8B8B] font-light">
                Shipping calculated at checkout
              </p>
              <Link
                to="/cart"
                onClick={() => setIsCartOpen(false)}
                className="block w-full text-center py-3.5 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase hover:bg-[#333] transition-colors"
              >
                View Bag
              </Link>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full text-center py-3.5 border border-[#1A1A1A] text-[#1A1A1A] text-[11px] tracking-[0.25em] uppercase hover:bg-[#1A1A1A] hover:text-white transition-colors"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
