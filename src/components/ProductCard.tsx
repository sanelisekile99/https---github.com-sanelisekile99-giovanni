import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { imageCatalog, resolveImageSrc } from '@/lib/imageCatalog';
import { getImageByKey } from '@/lib/imageMap';

type ProductVariant = {
  price?: number;
  inventory_qty?: number | null;
};

type ProductLike = {
  id?: string;
  name: string;
  handle: string;
  product_type?: string;
  tags?: string[];
  images?: string[];
  image?: string;
  image_url?: string;
  imageKey?: string;
  has_variants?: boolean;
  variants?: ProductVariant[];
  inventory_qty?: number | null;
  price?: number;
};

interface ProductCardProps {
  product: ProductLike;
  className?: string;
  imageOverride?: string;
}

export default function ProductCard({ product, className = '', imageOverride }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const getLocalImage = () => {
  const type = (product.product_type || '').toLowerCase();
  const handle = (product.handle || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const tagsStr = (product.tags || []).map(t => String(t).toLowerCase()).join(' ');
    const key = `${handle}-${name}`;

    if (name.includes('lettering') || (name.includes('brown') && name.includes('shirt'))) {
      return imageCatalog.chocolateTShirt;
    }

    if (type.includes('chocolate') || handle.includes('chocolate') || name.includes('chocolate')) {
      return imageCatalog.chocolateTShirt;
    }

    if (type.includes('black') || handle.includes('black') || name.includes('black')) {
      return imageCatalog.blackTShirt;
    }

    if (type.includes('white') || handle.includes('white') || name.includes('white') || name.includes('crisp')) {
      return imageCatalog.whiteTShirt;
    }

    if (type.includes('ecru') || handle.includes('ecru') || name.includes('ecru')) {
      return imageCatalog.ecruTShirt;
    }

    if (type.includes('shirt') || handle.includes('shirt') || name.includes('shirt')) {
      const tShirtImages = [
        imageCatalog.blackTShirt,
        imageCatalog.chocolateTShirt,
        imageCatalog.ecruTShirt,
        imageCatalog.whiteTShirt,
      ];
      const hash = key.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      return tShirtImages[hash % tShirtImages.length];
    }

    if (
      type.includes('bucket hat') ||
      handle.includes('bucket-hat') ||
      handle.includes('buckethat') ||
      name.includes('bucket hat') ||
      // also check tags — collection pages often include products by tag
      tagsStr.includes('bucket') && tagsStr.includes('hat') ||
      tagsStr.includes('bucket-hat') ||
      tagsStr.includes('buckethat') ||
      tagsStr.includes('bucket hats')
    ) {
  // Prefer explicit bucket hat catalog image; only fallback to t-shirt
  // as a last resort for missing assets.
  return imageCatalog.bucketHat || imageCatalog.blackTShirt;
    }

    if (type.includes('sweater') || handle.includes('sweater') || name.includes('sweater')) {
      return imageCatalog.sweater;
    }

    if (name.includes('classic giovanni')) {
      return imageCatalog.classicGiovanniTShirt;
    }

    if (type.includes('linen') && (type.includes('women') || handle.includes('women') || name.includes('women'))) {
      return imageCatalog.womenLinenSet;
    }

    if (type.includes('linen') && (type.includes('men') || handle.includes('men') || name.includes('men'))) {
      return imageCatalog.menLinenSet;
    }

    if (type.includes('linen') || handle.includes('linen') || name.includes('linen')) {
      return imageCatalog.menLinenSet || imageCatalog.womenLinenSet;
    }

    if (handle.includes('limited') || name.includes('limited')) {
      return imageCatalog.whiteTShirt;
    }

    return undefined;
  };

  const getPrice = () => {
    if (product.has_variants && product.variants?.length > 0) {
      const sorted = [...product.variants].sort((a, b) => (a.price || 0) - (b.price || 0));
      return sorted[0].price;
    }
    return product.price;
  };

  const getInStock = () => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.some(v => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product.has_variants) return true;
    if (product.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };

  const price = getPrice() || 0;
  const inStock = getInStock();
  const isLimited = product.tags?.includes('limited-edition');
  const isPreOrder = product.tags?.includes('pre-order');
  const wished = isInWishlist(product.handle);
  // Prefer explicit key-based image mapping
  const keyImage = getImageByKey(product.imageKey);
  const dbImage = keyImage || resolveImageSrc(product.images?.[0] || product.image || product.image_url);
  const productImage = resolveImageSrc(imageOverride) || dbImage || getLocalImage();
  if (!productImage && process.env.NODE_ENV === 'development') {
    console.warn('[ProductCard] missing product image for', product.handle, { imageKey: product.imageKey, images: product.images });
  }
  return (
    <Link
      to={`/product/${product.handle}`}
      className={`group block ${className}`}
    >
      <div className="relative aspect-[4/5] bg-[#F8F6F3] overflow-hidden mb-4">
        {productImage ? (
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            style={{
              // default behaviour: show full image but keep it centered
              objectFit: 'contain',
              objectPosition: (() => {
                const type = (product.product_type || '').toLowerCase();
                const name = (product.name || '').toLowerCase();
                const handle = (product.handle || '').toLowerCase();

                // Hats and bucket-hat style items tend to sit better aligned toward the top
                if (type.includes('hat') || name.includes('hat') || handle.includes('bucket') || name.includes('bucket') || handle.includes('bucket-hat')) {
                  return 'top center';
                }

                // Full outfits / sets sometimes need a bit more room above/below — keep center
                if (name.includes('set') || type.includes('set') || name.includes('linen') || type.includes('linen')) {
                  return 'center';
                }

                // Sweaters look better centered vertically
                if (type.includes('sweater') || name.includes('sweater')) {
                  return 'center';
                }

                // Default: center the image
                return 'center';
              })(),
              // Add a small amount of internal spacing for hats so they don't visually touch the card edges
              padding: ((): string | undefined => {
                const type = (product.product_type || '').toLowerCase();
                const name = (product.name || '').toLowerCase();
                const handle = (product.handle || '').toLowerCase();
                if (type.includes('hat') || name.includes('hat') || handle.includes('bucket') || name.includes('bucket') || handle.includes('bucket-hat')) {
                  return '0.5rem';
                }
                return undefined;
              })(),
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-[#A0A0A0]">No image</div>
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isLimited && (
            <span className="bg-[#1A1A1A] text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
              Limited Edition
            </span>
          )}
          {isPreOrder && (
            <span className="bg-[#C07A2B] text-white text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
              Pre-order
            </span>
          )}
          {!inStock && (
            <span className="bg-white/90 text-[#1A1A1A] text-[9px] tracking-[0.2em] uppercase px-3 py-1.5 font-medium">
              Sold Out
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product.handle);
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] flex items-center justify-center transition-colors"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} strokeWidth={1.7} className={wished ? 'fill-[#1A1A1A]' : ''} />
        </button>

        {/* Quick view hint */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="bg-white/95 backdrop-blur-sm text-center py-3">
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A]">
              View Details
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] font-medium">
          {product.product_type}
        </p>
        <h3 className="text-sm font-medium text-[#1A1A1A] tracking-wide group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <p className="text-sm font-light text-[#5A5A5A]">
          R {(price / 100).toLocaleString('en-ZA')}
        </p>
      </div>
    </Link>
  );
}
