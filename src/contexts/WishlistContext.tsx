import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type WishlistEntry = {
  handle: string;
  addedAt: string;
};

interface WishlistContextType {
  wishlist: WishlistEntry[];
  wishlistCount: number;
  addToWishlist: (handle: string) => void;
  removeFromWishlist: (handle: string) => void;
  toggleWishlist: (handle: string) => void;
  isInWishlist: (handle: string) => boolean;
  clearWishlist: () => void;
}

const WISHLIST_STORAGE_KEY = 'ecom_wishlist';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistEntry[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as WishlistEntry[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => typeof item?.handle === 'string' && item.handle.trim().length > 0);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const isInWishlist = useCallback((handle: string) => {
    return wishlist.some(item => item.handle === handle);
  }, [wishlist]);

  const addToWishlist = useCallback((handle: string) => {
    if (!handle) return;
    setWishlist(prev => {
      if (prev.some(item => item.handle === handle)) return prev;
      return [{ handle, addedAt: new Date().toISOString() }, ...prev];
    });
  }, []);

  const removeFromWishlist = useCallback((handle: string) => {
    setWishlist(prev => prev.filter(item => item.handle !== handle));
  }, []);

  const toggleWishlist = useCallback((handle: string) => {
    if (!handle) return;
    setWishlist(prev => {
      const exists = prev.some(item => item.handle === handle);
      if (exists) return prev.filter(item => item.handle !== handle);
      return [{ handle, addedAt: new Date().toISOString() }, ...prev];
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    wishlist,
    wishlistCount: wishlist.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  }), [wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist, clearWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}
