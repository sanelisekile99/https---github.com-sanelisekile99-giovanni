import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { getProducts, getVisibleCollections } from '@/lib/localStore.generated';
import type { LocalProduct, LocalCollection } from '@/lib/localStore.generated';

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [products, setProducts] = useState<LocalProduct[]>([]);
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProducts(getProducts().filter(product => product.status === 'active'));
    setCollections(getVisibleCollections().filter(collection => collection.handle !== 'new-arrivals'));
    setLoading(false);
  }, []);

  const productTypes = useMemo(() => {
    const types = [...new Set(products.map(p => p.product_type).filter(Boolean))];
    return types.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.product_type?.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(p => p.product_type === selectedType);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, selectedType, sortBy, searchQuery]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-[calc(2.5rem+5rem)]" />

      {/* Page header */}
      <div className="bg-[#FAFAF8] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">
            {searchQuery ? 'Search Results' : 'Browse'}
          </p>
          <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
            {searchQuery ? `"${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-sm text-[#8B8B8B] font-light mt-3">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F0EDE9]">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:opacity-60 transition-opacity"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filter
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:opacity-60 transition-opacity"
            >
              Sort
              <ChevronDown size={14} strokeWidth={1.5} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#F0EDE9] shadow-lg z-20 min-w-[180px]">
                  {[
                    { value: 'newest', label: 'Newest' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'name-asc', label: 'Alphabetical' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                      className={`block w-full text-left px-4 py-3 text-[11px] tracking-[0.15em] uppercase hover:bg-[#FAFAF8] transition-colors ${
                        sortBy === option.value ? 'text-[#1A1A1A] font-medium' : 'text-[#8B8B8B]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-8 pb-6 border-b border-[#F0EDE9]">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-colors ${
                  selectedType === 'all'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'border border-[#E8E5E1] text-[#5A5A5A] hover:border-[#1A1A1A]'
                }`}
              >
                All
              </button>
              {productTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition-colors ${
                    selectedType === type
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#E8E5E1] text-[#5A5A5A] hover:border-[#1A1A1A]'
                  }`}
                >
                  {type}
                </button>
              ))}
              {selectedType !== 'all' && (
                <button
                  onClick={() => setSelectedType('all')}
                  className="flex items-center gap-1 text-[11px] text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors ml-2"
                >
                  <X size={12} />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#F0EDE9] mb-4" />
                <div className="h-3 bg-[#F0EDE9] w-16 mb-2" />
                <div className="h-4 bg-[#F0EDE9] w-32 mb-2" />
                <div className="h-3 bg-[#F0EDE9] w-20" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#8B8B8B] font-light text-lg mb-4">No products found</p>
            <button
              onClick={() => { setSelectedType('all'); }}
              className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
