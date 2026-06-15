import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight } from 'lucide-react';
import { getMainCollections, getCollectionProducts } from '@/lib/localStore.generated';
import { imageCatalog, resolveImageSrc } from '@/lib/imageCatalog';
import type { LocalCollection } from '@/lib/localStore.generated';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setCollections(getMainCollections());
    setLoading(false);
  }, []);

  const handleCollectionClick = (handle: string) => {
    if (handle === 't-shirts') {
      navigate('/collections/t-shirts');
    } else {
      navigate(`/collections/${handle}`);
    }
  };

  const getCollectionStats = (handle: string) => {
    const products = getCollectionProducts(handle);
    return products.length;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      {/* Hero Section */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h1 className="font-heading text-4xl lg:text-5xl tracking-[0.05em] font-light text-[#1A1A1A] mb-4">
            COLLECTIONS
          </h1>
          <p className="text-base lg:text-lg text-[#666666] font-light max-w-2xl mx-auto leading-relaxed">
            Explore our curated collections of premium apparel and accessories.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#F0EDE9] mb-4 rounded" />
                <div className="h-6 bg-[#F0EDE9] w-3/4 mb-2 rounded" />
                <div className="h-4 bg-[#F0EDE9] w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleCollectionClick(collection.handle)}
                className="group relative h-[500px] lg:h-[600px] overflow-hidden rounded-lg transition-all duration-500 cursor-pointer hover:shadow-xl"
              >
                {/* Background Image */}
                <img
                  src={
                    collection.image_url && collection.image_url.startsWith('src/images/')
                      ? resolveImageSrc(collection.image_url)
                      : collection.image_url || ''
                  }
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent transition-opacity duration-500 group-hover:from-black/70 group-hover:via-black/40" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  <div className="space-y-3 transform transition-transform duration-500 group-hover:translate-y-0">
                    <h3 className="text-white font-heading text-2xl lg:text-3xl tracking-[0.05em] font-light">
                      {collection.title}
                    </h3>
                    {collection.description && (
                      <p className="text-white/80 text-sm font-light line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                    <p className="text-white/60 text-xs tracking-[0.1em] uppercase">
                      {getCollectionStats(collection.handle)} {getCollectionStats(collection.handle) === 1 ? 'Item' : 'Items'}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <span className="text-white text-xs tracking-[0.15em] uppercase font-light">
                        Explore
                      </span>
                      <ArrowRight size={14} className="text-white transform transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
