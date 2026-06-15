import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getCollectionByHandle, getCollectionProducts, getProducts } from '@/lib/localStore.generated';
import type { LocalCollection, LocalProduct } from '@/lib/localStore.generated';

// Map collection handles to their product subcollection field and product sub-type
const collectionToProductFilter: Record<string, { collection: string; product_sub_type?: string }> = {
  'classic-tees': { collection: 'classic' },
  'core-tees': { collection: 'core' },
  'signature-tees': { collection: 'signature', product_sub_type: 'tee' },
  'signature-shorts': { collection: 'signature', product_sub_type: 'shorts' },
  'classic': { collection: 'classic' },
  'core': { collection: 'core' },
  'signature': { collection: 'signature', product_sub_type: 'tee' },
};

export default function CollectionPage() {
  const { handle, subcategory } = useParams<{ handle?: string; subcategory?: string }>();
  const [collection, setCollection] = useState<LocalCollection | null>(null);
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let collectionData: LocalCollection | null = null;
    let filteredProducts: LocalProduct[] = [];

    if (subcategory && !handle) {
      // Handle nested T-shirt routes: /collections/t-shirts/:subcategory
      // When route is /collections/t-shirts/classic, subcategory='classic', handle=undefined
      const collectionMap: Record<string, LocalCollection | null> = {
        classic: getCollectionByHandle('classic-tees'),
        core: getCollectionByHandle('core-tees'),
        signature: getCollectionByHandle('signature-tees'),
      };
      
      collectionData = collectionMap[subcategory] || null;
      if (collectionData) {
        const filterConfig = collectionToProductFilter[subcategory];
        filteredProducts = getProducts().filter((p) => {
          if (p.collection !== filterConfig.collection) return false;
          if (filterConfig.product_sub_type) {
            return p.product_sub_type === filterConfig.product_sub_type;
          }
          return true;
        });
      }
    } else if (handle === 't-shirts' && subcategory) {
      // Alternative: Handle nested T-shirt routes with both params
      const collectionMap: Record<string, LocalCollection | null> = {
        classic: getCollectionByHandle('classic-tees'),
        core: getCollectionByHandle('core-tees'),
        signature: getCollectionByHandle('signature-tees'),
      };
      
      collectionData = collectionMap[subcategory] || null;
      if (collectionData) {
        const filterConfig = collectionToProductFilter[subcategory];
        filteredProducts = getProducts().filter((p) => {
          if (p.collection !== filterConfig.collection) return false;
          if (filterConfig.product_sub_type) {
            return p.product_sub_type === filterConfig.product_sub_type;
          }
          return true;
        });
      }
    } else {
      // Handle regular collections and old-style T-shirt routes
      collectionData = getCollectionByHandle(handle);
      if (collectionData) {
        const filterConfig = collectionToProductFilter[collectionData.handle];
        if (filterConfig) {
          // Filter products by their collection field and product_sub_type for T-shirt subcategories
          filteredProducts = getProducts().filter((p) => {
            if (p.collection !== filterConfig.collection) return false;
            if (filterConfig.product_sub_type) {
              return p.product_sub_type === filterConfig.product_sub_type;
            }
            return true;
          });
        } else {
          // Use regular collection-based filtering for other collections
          filteredProducts = getCollectionProducts(collectionData.handle);
        }
      }
    }

    setCollection(collectionData);
    setProducts(filteredProducts);
    setLoading(false);
  }, [handle, subcategory]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      {/* Collection header */}
      <div className="bg-[#FAFAF8] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Collection</p>
          <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
            {collection?.title || 'Collection'}
          </h1>
          {collection?.description && (
            <p className="text-sm text-[#8B8B8B] font-light mt-3 max-w-md mx-auto">
              {collection.description}
            </p>
          )}
          <p className="text-sm text-[#A0A0A0] font-light mt-2">
            {products.length} {products.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#F0EDE9] mb-4" />
                <div className="h-3 bg-[#F0EDE9] w-16 mb-2" />
                <div className="h-4 bg-[#F0EDE9] w-32 mb-2" />
                <div className="h-3 bg-[#F0EDE9] w-20" />
              </div>
            ))}
          </div>
        ) : !collection ? (
          <div className="text-center py-20">
            <p className="text-[#8B8B8B] font-light text-lg mb-4">Collection not found</p>
            <Link
              to="/shop"
              className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
            >
              Browse All Products
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8B8B8B] font-light text-lg mb-4">No products in this collection yet</p>
            <Link
              to="/shop"
              className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
