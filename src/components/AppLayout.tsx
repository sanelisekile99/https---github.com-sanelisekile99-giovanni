import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ArrowRight } from 'lucide-react';
import { getImageByKey } from '@/lib/imageMap';
import { imageCatalog } from '@/lib/imageCatalog';
import {
  getCollectionProducts,
  getProducts,
  getVisibleCollections,
  type LocalCollection,
  type LocalProduct,
} from '@/lib/localStore.generated';

const HERO_IMAGE = imageCatalog.campaignHero || imageCatalog.hero || '';
const LIFESTYLE_IMAGE = imageCatalog.lifestyle || '';

const resolveImageSrc = (value?: string) => {
  if (!value) return '';
  const src = value.trim();
  if (!src) return '';
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('/')
  ) {
    return src;
  }
  return `/${src}`;
};

export default function AppLayout() {
  const [newArrivals, setNewArrivals] = useState<LocalProduct[]>([]);
  const [collections, setCollections] = useState<LocalCollection[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<LocalProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setNewArrivals(getCollectionProducts('new-arrivals').slice(0, 8));
    setCollections(getVisibleCollections().filter(collection => collection.handle !== 'new-arrivals'));
    setFeaturedProducts(getProducts().filter(product => product.tags?.includes('featured')).slice(0, 4));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-heading text-2xl tracking-[0.15em] text-[#1A1A1A] font-light animate-pulse">
            GIOVANNI
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] max-h-[900px]">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Giovanni Collection"
            className="w-full h-full object-cover opacity-[0.85] animate-hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
        </div>
        <div className="relative h-full flex items-end pb-20 lg:pb-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-xl animate-fade-up">
              <p className="text-[11px] tracking-[0.35em] uppercase text-white/70 mb-4 font-light">
                Autumn / Winter 2026
              </p>
              <h2 className="font-heading text-4xl lg:text-6xl text-white font-light leading-[1.1] mb-6 tracking-[0.05em]">
                The Art of<br />Quiet Luxury
              </h2>
              <p className="text-white/70 text-sm font-light leading-relaxed mb-8 max-w-md tracking-wide">
                Discover our latest collection — where timeless craftsmanship meets modern minimalism. 
                Each piece is designed to transcend seasons.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-3 bg-white text-[#1A1A1A] px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#D4E5E1] transition-colors duration-300"
                >
                  Shop Collection
                  <ArrowRight size={14} strokeWidth={1.5} />
                </Link>
                <Link
                  to="/collections/limited-edition"
                  className="text-[11px] tracking-[0.2em] uppercase text-white border-b border-white/50 pb-0.5 hover:border-white transition-colors duration-300 font-light"
                >
                  Limited Edition
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Just In</p>
              <h2 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/collections/new-arrivals"
              className="hidden md:flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:opacity-60 transition-opacity"
            >
              View All
              <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {newArrivals.slice(0, 8).map(product => (
              <ProductCard
                key={product.id}
                product={product}
                imageOverride={product.product_type && product.product_type.toLowerCase().includes('bucket') ? imageCatalog.bucketHat : undefined}
              />
            ))}
          </div>
          <div className="mt-10 text-center md:hidden">
            <Link
              to="/collections/new-arrivals"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
            >
              View All
              <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Tiles */}
      <section className="py-4 lg:py-8">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Explore</p>
            <h2 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
              Collections
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
            {collections.map((col) => {
              const categoryImages: Record<string, string> = {
                't-shirts': imageCatalog.chocolateTShirt || '',
                'tshirts': imageCatalog.chocolateTShirt || '',
                'tshirt': imageCatalog.chocolateTShirt || '',
                'sweaters': imageCatalog.sweater || '',
                'sweater': imageCatalog.sweater || '',
                // cardigans removed
                'bucket-hats': imageCatalog.bucketHat || imageCatalog.blackTShirt || '',
                'bucket-hat': imageCatalog.bucketHat || imageCatalog.blackTShirt || '',
                'linen-womens-two-pieces': imageCatalog.womenLinenSet || '',
                'linen-womens-two-piece': imageCatalog.womenLinenSet || '',
                'linen-mens-two-pieces': imageCatalog.menLinenSet || '',
                'linen-mens-two-piece': imageCatalog.menLinenSet || '',
                'classic-giovanni': imageCatalog.classicGiovanniTShirt || '',
                'two-piece-sets': imageCatalog.womenLinenSet || imageCatalog.menLinenSet || '',
                'two-piece-set': imageCatalog.womenLinenSet || imageCatalog.menLinenSet || '',
                'limited-edition': imageCatalog.whiteTShirt || '',
                'limited': imageCatalog.whiteTShirt || '',
              };
              const normalizedHandle = (col.handle || '').toLowerCase();
              const inferredCollectionImage = normalizedHandle.includes('shirt')
                ? imageCatalog.chocolateTShirt || ''
                : normalizedHandle.includes('sweater')
                ? imageCatalog.sweater || ''
                : normalizedHandle.includes('bucket')
                ? imageCatalog.bucketHat || imageCatalog.blackTShirt || ''
                : normalizedHandle.includes('linen-womens-two-piece') || (normalizedHandle.includes('linen') && normalizedHandle.includes('women'))
                ? imageCatalog.womenLinenSet || ''
                : normalizedHandle.includes('linen-mens-two-piece') || (normalizedHandle.includes('linen') && normalizedHandle.includes('men'))
                ? imageCatalog.menLinenSet || ''
                : normalizedHandle.includes('two-piece') || normalizedHandle.includes('set')
                ? imageCatalog.womenLinenSet || imageCatalog.menLinenSet || ''
                : normalizedHandle.includes('limited')
                ? imageCatalog.whiteTShirt || ''
                : '';
              const collectionImage =
                categoryImages[normalizedHandle] || inferredCollectionImage || resolveImageSrc(col.image_url) || '';
              return (
                <Link
                  key={col.id}
                  to={`/collections/${col.handle}`}
                  className="group relative aspect-[3/4] bg-[#F8F6F3] overflow-hidden"
                >
                  <img
                    src={collectionImage}
                    alt={col.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-heading text-lg lg:text-xl text-white tracking-[0.1em] font-light">
                      {col.title}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 lg:py-28 bg-[#FAFAF8]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="aspect-[4/3] overflow-hidden flex items-center justify-center bg-[#FAF8F6]">
              <img
                src={getImageByKey('giovanni-logo') || getImageByKey('giovanni-logo.png') || LIFESTYLE_IMAGE}
                alt="Giovanni logo"
                className="w-full h-full object-contain p-8"
              />
            </div>
            <div className="max-w-lg">
              <div className="flex items-center gap-4 mb-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0]">Our Philosophy</p>
                {/* Giovanni logo next to heading */}
                <img src={getImageByKey('giovanni-logo') || getImageByKey('giovanni-logo.png') || ''} alt="Giovanni" className="h-8 w-auto" />
              </div>
              <h2 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A] mb-6 leading-tight">
                Less, but Better
              </h2>
              <p className="text-[15px] text-[#5A5A5A] font-light leading-[1.8] mb-6">
                At Giovanni, we believe luxury is found in restraint. Every piece in our collection is 
                designed with intention — from the selection of premium fabrics to the precision of each stitch. 
                We create garments that speak softly but leave a lasting impression.
              </p>
              <p className="text-[15px] text-[#5A5A5A] font-light leading-[1.8] mb-8">
                Our commitment to quality over quantity means fewer collections, better materials, and 
                timeless designs that transcend the cycle of trends.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:opacity-60 transition-opacity inline-flex items-center gap-2"
              >
                Discover More
                <ArrowRight size={12} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
            {featuredProducts.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Curated</p>
              <h2 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
                Editor's Picks
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {featuredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  imageOverride={product.product_type && product.product_type.toLowerCase().includes('bucket') ? imageCatalog.bucketHat : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mint accent banner */}
      <section className="bg-[#D4E5E1]">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20 text-center">
          <h2 className="font-heading text-2xl lg:text-3xl tracking-[0.1em] font-light text-[#1A1A1A] mb-4">
            Archive Collection — Now Available
          </h2>
          <p className="text-[14px] text-[#3A3A3A] font-light mb-8 max-w-md mx-auto leading-relaxed">
            Individually numbered pieces. Once they're gone, they're gone.
          </p>
          <Link
            to="/collections/limited-edition"
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
          >
            Shop Limited Edition
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
