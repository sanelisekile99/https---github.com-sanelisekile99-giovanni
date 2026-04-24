// Disable fast-refresh rule: this file intentionally exports a provider and
// a hook (not just components) and the runtime-side local store import is
// handled dynamically. Silencing the rule here prevents false positives in
// development.
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { resolveImageSrc } from '@/lib/imageCatalog';
import { products as syncProducts } from '@/lib/localStore';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  name: string;
  variant_title?: string;
  sku?: string;
  price: number; // in cents (ZAR)
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('ecom_cart');
      if (!stored) return [];
      const parsed: CartItem[] = JSON.parse(stored);

      // Resolve whatever image value was stored (it may already be a resolved
      // imported URL or a path). We'll attempt to re-resolve against the
      // local product catalog on mount below to prefer current build assets.
      return parsed.map(item => ({
        ...item,
        price: item.price || 0,
        image: resolveImageSrc(item.image),
      }));
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(cart));
  }, [cart]);

  // On first mount, attempt to re-resolve stored cart images using the
  // generated local product catalog. We import dynamically to avoid
  // evaluating the local store at module load time (which can print/log and
  // cause fast-refresh issues in dev). This ensures stored cart items refer
  // to the current build's imported asset URLs instead of stale values.
  useEffect(() => {
    if (!cart || cart.length === 0) return;
    (async () => {
      try {
        const mod = await import('@/lib/localStore.generated');
        const products = mod.getProducts();
        setCart(prev => prev.map(item => {
          const product = products.find(p => p.id === item.product_id);
          const preferredImage = product?.images?.[0] || item.image;
          return { ...item, image: resolveImageSrc(preferredImage) };
        }));
      } catch (e) {
        // ignore — we'll keep the stored image if resolution fails
      }
    })();
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    // Defensive: ensure products that require a size/variant cannot be added
    // without a selected size. We use the synchronous `syncProducts` list
    // to determine whether the product has variants or renders multiple
    // sizes (S/M/L/XL). If so and no variant_id/variant_title is provided,
    // we block the add to prevent invalid cart state.
    const productMeta = syncProducts.find(p => p.id === item.product_id);
    const variantCount = productMeta?.variants?.length || 0;
    const isBucketHat = (productMeta?.product_type || '').toLowerCase().includes('bucket');
    const variantSizes: string[] = Array.from(new Set((productMeta?.variants?.map(v => v.option1).filter(Boolean) as string[]) || []));
    const sizes: string[] = variantSizes.length > 0 ? variantSizes : isBucketHat ? ['One Size'] : ['S', 'M', 'L', 'XL'];
    const requiresSize = variantCount > 0 || (!(sizes.length === 1 && sizes[0] === 'One Size') && sizes.length > 0);

    if (requiresSize && !item.variant_id && !item.variant_title) {
      // Silently ignore and warn in development.
      if (process.env.NODE_ENV === 'development') {
        console.warn('[CartContext] blocked addToCart: missing size/variant', item.product_id, { requiresSize, sizes, variantCount });
      }
      return;
    }

    const normalizedItem: Omit<CartItem, 'quantity'> = {
      ...item,
      price: item.price || 0,
      image: resolveImageSrc(item.image),
    };
    setCart(prev => {
      const existingIndex = prev.findIndex(
        i => i.product_id === normalizedItem.product_id && i.variant_id === normalizedItem.variant_id
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          price: normalizedItem.price,
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [...prev, { ...normalizedItem, quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCart(prev => prev.filter(
      i => !(i.product_id === productId && i.variant_id === variantId)
    ));
  }, []);

  const updateQuantity = useCallback((productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart(prev =>
      prev.map(i =>
        i.product_id === productId && i.variant_id === variantId
          ? { ...i, quantity }
          : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('ecom_cart');
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, removeFromCart, updateQuantity, clearCart,
        cartCount, cartTotal, isCartOpen, setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
