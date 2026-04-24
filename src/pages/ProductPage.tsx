import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Minus, Plus, Check, ChevronLeft } from 'lucide-react';
import { imageCatalog, resolveImageSrc } from '@/lib/imageCatalog';
import { getImageByKey } from '@/lib/imageMap';
import { getProductByHandle, getRelatedProducts, LocalProduct, LocalVariant } from '@/lib/localStore.generated';

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<LocalProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<LocalVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedProducts, setRelatedProducts] = useState<LocalProduct[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState<string>('');

  const getLocalProductImage = (item: LocalProduct | null) => {
    const type = (item?.product_type || '').toLowerCase();
    const productHandle = (item?.handle || '').toLowerCase();
    const name = (item?.name || '').toLowerCase();

    if (name.includes('lettering') || (name.includes('brown') && name.includes('shirt'))) {
      return imageCatalog.chocolateTShirt;
    }

    if (type.includes('chocolate') || productHandle.includes('chocolate') || name.includes('chocolate')) {
      return imageCatalog.chocolateTShirt;
    }
    if (type.includes('black') || productHandle.includes('black') || name.includes('black')) {
      return imageCatalog.blackTShirt;
    }
    if (type.includes('white') || productHandle.includes('white') || name.includes('white') || name.includes('crisp')) {
      return imageCatalog.whiteTShirt;
    }
    if (type.includes('ecru') || productHandle.includes('ecru') || name.includes('ecru')) {
      return imageCatalog.ecruTShirt;
    }

    return undefined;
  };

  const getDbProductImage = (item: LocalProduct | null) => {
    // Prefer explicit key-based mapping (import-time map) when available.
    const keyImage = getImageByKey(item?.imageKey);
    if (keyImage) return keyImage;
    return resolveImageSrc(item?.images?.[0]);
  };

  const getVariantLabel = (item: LocalProduct | LocalVariant | null) => {
    const rawName = (item && 'name' in item && item.name) ? (item as LocalProduct).name.toLowerCase() : '';
    const rawHandle = (item && 'handle' in item && item.handle) ? (item as LocalProduct).handle.toLowerCase() : '';
    const rawTitle = (item && 'title' in item && (item as LocalVariant).title) ? (item as LocalVariant).title.toLowerCase() : '';

    if (rawHandle.includes('black') || rawName.includes('black') || rawTitle.includes('black')) return 'Black';
    if (rawHandle.includes('white') || rawName.includes('white') || rawName.includes('crisp') || rawTitle.includes('white')) return 'White';
    if (rawHandle.includes('chocolate') || rawName.includes('chocolate') || rawTitle.includes('chocolate')) return 'Chocolate';
    if (rawHandle.includes('ecru') || rawName.includes('ecru') || rawTitle.includes('ecru')) return 'Ecru';
    if (rawHandle.includes('sage') || rawName.includes('sage') || rawTitle.includes('sage')) return 'Sage';

    const nameValue = (item && 'name' in item && item.name) ? (item as LocalProduct).name : (item && 'title' in item ? (item as LocalVariant).title : undefined);
    const suffix = nameValue && nameValue.includes(' - ') ? nameValue.split(' - ').pop() : nameValue;
    return (suffix as string) || 'Colour';
  };

  const isColorSwatchCollection = product?.product_type === 'T-Shirts' || product?.product_type?.includes('Linen');

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    setSelectedVariant(null);
    setSelectedSize('');
    setQuantity(1);
    setAddedToCart(false);

    const data = getProductByHandle(handle);
    if (data) {
      setProduct(data);
      setRelatedProducts(getRelatedProducts(data));
      if ((data.product_type || '').toLowerCase().includes('bucket')) {
        setSelectedSize('One Size');
      }
    } else {
      setProduct(null);
      setRelatedProducts([]);
    }

    setLoading(false);
  }, [handle]);

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setAddedToCart(false);
    setError(''); // Clear any size selection errors
    const variant = product?.variants?.find((v: LocalVariant) =>
      v.option1 === size || (v.title && v.title.toLowerCase().includes(size.toLowerCase()))
    );
    if (variant) setSelectedVariant(variant);
  };

  const isBucketHat = (product?.product_type || '').toLowerCase().includes('bucket');
  const variantSizes: string[] = Array.from(
    new Set((product?.variants?.map((v: LocalVariant) => v.option1).filter(Boolean) as string[]) || [])
  );
  const sizes: string[] = variantSizes.length > 0 ? variantSizes : isBucketHat ? ['One Size'] : ['S', 'M', 'L', 'XL'];
  // Determine whether we should require a size selection before adding to cart.
  // We require a selection when the product has explicit variants, or when
  // the UI renders multiple size options (S/M/L/XL etc.). We do NOT require
  // a selection for one-size items (e.g. bucket hats showing "One Size").
  const hasVariants = (() => {
    if (!product) return false;
    const variantCount = product.variants?.length || 0;
    if (variantCount > 0) return true;
    // If no explicit variants but sizes array contains more than one size
    // (and is not a single "One Size"), require a selection.
    if (!(sizes.length === 1 && sizes[0] === 'One Size') && sizes.length > 0) return true;
    return false;
  })();

  const getInStock = (): boolean => {
    if (selectedVariant) {
      if (selectedVariant.inventory_qty == null) return true;
      return selectedVariant.inventory_qty > 0;
    }
    if (product?.variants && product.variants.length > 0) {
      return product.variants.some((v: LocalVariant) => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product?.has_variants) return true;
    if (product?.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };
  const inStock = getInStock();
  const isPreOrder = product?.tags?.includes('pre-order');

  // Require an explicit size selection when the product requires it.
  const requireSizeSelection = hasVariants && !(selectedVariant || (selectedSize && selectedSize.length > 0));

  const handleAddToCart = () => {
    if (!product) return;
    if (isPreOrder) return; // do not allow adding pre-order items to cart
    if (requireSizeSelection) {
      setError('Please select a size before adding to cart.');
      return;
    }
    if (!inStock) return;

    setError(''); // Clear any previous errors

    const selectedPrice = selectedVariant?.price || product.price || 0;

    addToCart(
      {
        product_id: product.id,
        variant_id: selectedVariant?.id || undefined,
        name: product.name,
        variant_title: selectedVariant?.title || selectedSize || undefined,
  sku: (selectedVariant as unknown as { sku?: string })?.sku || product.handle,
        price: selectedPrice,
  // Ensure we store a resolved/imported URL (not a raw "src/images/..."
  // path). resolveImageSrc will return an imported asset URL when the
  // filename matches an entry in the build-time image map.
  image: resolveImageSrc(getDbProductImage(product) || getLocalProductImage(product)),
      },
      quantity
    );

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const productImage = getDbProductImage(product) || getLocalProductImage(product);
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="h-[calc(2.5rem+5rem)]" />
        <div className="text-center py-20">
          <p className="text-[#8B8B8B] font-light text-lg mb-4">Product not found</p>
          <Link
            to="/shop"
            className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
          >
            Browse All Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-white"
    >
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#A0A0A0]">
          <Link to="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1A1A1A] transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-[#5A5A5A]">{product.name}</span>
        </div>
      </div>

      {/* Product detail */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-[4/5] bg-[#F8F6F3] overflow-hidden">
            {productImage && (
              <img
                src={productImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Details */}
          <div className="lg:py-6">
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">
              {product.product_type}
            </p>
            <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A] mb-4">
              {product.name}
            </h1>
            <p className="text-xl font-light text-[#1A1A1A] mb-6">
              R {(currentPrice / 100).toLocaleString('en-ZA')}
            </p>

            {/* Free shipping badge */}
            <div className="flex items-center gap-2 mb-6 text-[11px] tracking-[0.15em] uppercase text-[#8B8B8B]">
              <Check size={14} strokeWidth={1.5} className="text-[#7BAF9E]" />
              Free Shipping
            </div>

            <p className="text-[14px] text-[#5A5A5A] font-light leading-[1.8] mb-8">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium">
                  Size {selectedSize && `— ${selectedSize}`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const variant = product.variants?.find((v: LocalVariant) => v.option1 === size);
                  const sizeInStock = variant
                    ? (variant.inventory_qty == null || variant.inventory_qty > 0)
                    : true;

                  return (
                    <button
                      key={size}
                      onClick={() => sizeInStock && handleSizeSelect(size)}
                      disabled={!sizeInStock}
                      className={`min-w-[52px] h-12 px-4 text-[12px] tracking-[0.15em] uppercase transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-[#1A1A1A] text-white border border-[#1A1A1A]'
                          : sizeInStock
                          ? 'border border-[#E8E5E1] text-[#1A1A1A] hover:border-[#1A1A1A]'
                          : 'border border-[#F0EDE9] text-[#D0D0D0] cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <span className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium block mb-3">
                Quantity
              </span>
              <div className="inline-flex items-center border border-[#E8E5E1]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-[#F8F6F3] transition-colors"
                >
                  <Minus size={14} strokeWidth={1.5} />
                </button>
                <span className="px-5 py-3 text-sm font-medium min-w-[48px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-[#F8F6F3] transition-colors"
                >
                  <Plus size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-600 text-sm text-center font-light">
                {error}
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={requireSizeSelection || !inStock}
              className={`w-full py-4 text-[11px] tracking-[0.25em] uppercase font-medium transition-all duration-300 ${
                addedToCart
                  ? 'bg-[#7BAF9E] text-white'
                  : !inStock
                  ? 'bg-[#E8E5E1] text-[#A0A0A0] cursor-not-allowed'
                  : 'bg-[#1A1A1A] text-white hover:bg-[#333]'
              }`}
            >
              {addedToCart
                ? 'Added to Bag'
                : !inStock
                ? 'Sold Out'
                : hasVariants && !selectedSize
                ? 'Select a Size'
                : 'Add to Bag'
              }
            </button>

            {/* Product details */}
            <div className="mt-10 pt-8 border-t border-[#F0EDE9] space-y-4">
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] font-medium mb-4">
                Details
              </h3>
              {product.metadata && (
                <div className="space-y-3">
                  {product.metadata.fabric && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#8B8B8B] font-light">Fabric</span>
                      <span className="text-[#1A1A1A] font-light">{product.metadata.fabric}</span>
                    </div>
                  )}
                  {product.metadata.fit && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#8B8B8B] font-light">Fit</span>
                      <span className="text-[#1A1A1A] font-light">{product.metadata.fit}</span>
                    </div>
                  )}
                  {product.metadata.care && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#8B8B8B] font-light">Care</span>
                      <span className="text-[#1A1A1A] font-light">{product.metadata.care}</span>
                    </div>
                  )}
                  {/* weight not provided in metadata type */}
                  {product.metadata.includes && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#8B8B8B] font-light">Includes</span>
                      <span className="text-[#1A1A1A] font-light">{product.metadata.includes}</span>
                    </div>
                  )}
                  {product.metadata.edition && (
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#8B8B8B] font-light">Edition</span>
                      <span className="text-[#1A1A1A] font-light">{product.metadata.edition}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-[#FAFAF8]">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <h2 className="font-heading text-2xl lg:text-3xl tracking-[0.05em] font-light text-[#1A1A1A] text-center mb-10">
              {isColorSwatchCollection ? 'Also available in' : 'You May Also Like'}
            </h2>

            {isColorSwatchCollection ? (
              <div className="flex gap-4 overflow-x-auto pb-2 justify-start lg:justify-center">
                {relatedProducts.map(p => (
                  <Link
                    key={p.id}
                    to={`/product/${p.handle}`}
                    className="shrink-0 w-[120px] text-center group"
                  >
                    <div className="bg-white border border-[#E8E5E1] p-2 aspect-[4/5] flex items-center justify-center overflow-hidden">
                      <img
                        src={getDbProductImage(p) || getLocalProductImage(p)}
                        alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-2 text-[10px] tracking-[0.18em] uppercase text-[#1A1A1A]">
                      {getVariantLabel(p)}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </motion.div>
  );
}
