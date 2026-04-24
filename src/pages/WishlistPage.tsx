import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProductByHandle } from '@/lib/localStore.generated';

export default function WishlistPage() {
  const { wishlist, wishlistCount, clearWishlist } = useWishlist();

  const wishlistedProducts = wishlist
    .map(item => ({ entry: item, product: getProductByHandle(item.handle) }))
    .filter(item => Boolean(item.product));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      <div className="bg-[#FAFAF8] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Saved Items</p>
          <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
            Wishlist
          </h1>
          <p className="text-sm text-[#8B8B8B] font-light mt-3">
            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
        {wishlistedProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8B8B8B] font-light text-lg mb-4">Your wishlist is empty</p>
            <Link
              to="/shop"
              className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={clearWishlist}
                className="text-[11px] tracking-[0.2em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {wishlistedProducts.map(({ entry, product }) => (
                <ProductCard key={entry.handle} product={product!} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
