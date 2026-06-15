# Collection Cards Image Fix - Complete Solution

## Overview
Fixed collection card images to ensure each card displays an image matching its collection name and properly links to the correct filtered products.

## Changes Made

### 1. Enhanced imageCatalog.ts
Added new image resolution helpers for collection-specific images:
- `coreTShirt`: Resolves to "GIOVANNI Core Tee - Sage.png"
- `signatureTShirt`: Resolves to "GIOVANNI Signature Tee - black/off-white/sage.png"
- `signatureShorts`: Resolves to "GIOVANNI Signature short" variants
- `classicGiovanniTShirt`: Already existing - resolves to "Classic Giovanni T-shirts" variants

### 2. Created Collection Card System in localStore.ts
**New Type:**
```typescript
export type CollectionCard = {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: 'main' | 'subcategory';
  description?: string;
};
```

**New Export:** `collectionCards` array with 9 collection cards:
1. **T-Shirts** (`t-shirts`) - Shows chocolate brown tee
2. **Classic** (`classic-tees`) - Shows classic Giovanni tee
3. **Core** (`core-tees`) - Shows core tee (Sage)
4. **Signature** (`signature-tees`) - Shows signature tee (Black)
5. **Signature Shorts** (`signature-shorts`) - Shows signature shorts
6. **Sweaters** (`sweaters`) - Shows sweater
7. **Formal Wear** (`formal-wear`) - Shows formal shirt
8. **Two-Piece Sets** (`two-piece-sets`) - Shows linen sets
9. **Bucket Hats** (`bucket-hats`) - Shows bucket hat

Each card maps to its collection slug, ensuring clicking a card navigates to the correct filtered collection.

### 3. Updated localStore.generated.ts
Added exports for:
- `type CollectionCard`
- `collectionCards`

### 4. Refactored AppLayout.tsx
**Before:** Used complex conditional logic with categoryImages object and inferredCollectionImage fallback
**After:** Simplified to use `collectionCards` array directly

```tsx
{collectionCards.map((card) => (
  <Link
    key={card.id}
    to={`/collections/${card.slug}`}
    className="group relative aspect-[3/4] bg-[#F8F6F3] overflow-hidden flex items-center justify-center"
  >
    <img
      src={card.image}
      alt={card.title}
      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-5">
      <h3 className="font-heading text-lg lg:text-xl text-white tracking-[0.1em] font-light">
        {card.title}
      </h3>
    </div>
  </Link>
))}
```

## Product Structure
Products maintain the following fields for proper filtering:
- `collection`: 'classic' | 'core' | 'signature'
- `product_sub_type`: 'tee' | 'shorts' (for signature items to distinguish tees from shorts)

## Filtering Logic (CollectionPage.tsx)
Collection handles map to specific filters:

| Route | Filter |
|-------|--------|
| `/collections/classic-tees` | `collection: 'classic'` |
| `/collections/core-tees` | `collection: 'core'` |
| `/collections/signature-tees` | `collection: 'signature', product_sub_type: 'tee'` |
| `/collections/signature-shorts` | `collection: 'signature', product_sub_type: 'shorts'` |

## Product Counts After Fix
- **Classic Tees**: 3 products (black, sage, white)
- **Core Tees**: 4 products (black, ecru, white, sage)
- **Signature Tees**: 3 products (black, off-white, sage)
- **Signature Shorts**: 2 products (black, white)
- **Formal Wear**: 4 shirts (various colors)
- **Sweaters**: Available
- **Bucket Hats**: Available
- **Two-Piece Sets**: Available (linen sets for men and women)

## Image Files Used
All collection cards use images from `src/images/`:
- Classic: `Classic GIOVANNI T-shirts in black.png`
- Core: `GIOVANNI Core Tee - Sage.png`
- Signature: `GIOVANNI Signature Tee - black.png`
- Shorts: `GIOVANNI Signature short-black.png`
- Formal: `black Giovanni formal shirt.png`
- Sweaters: `Giovanni sweater signature text.png`
- Bucket Hats: `black bucket hat logo.png`
- Two-Piece Sets: `Linen set in off-white(women).png`

## Testing Verification
To verify the fix works correctly:

1. **Homepage Collection Cards**: Each card should display the image matching its title
   - Classic card shows classic Giovanni tee
   - Core card shows core tee (Sage)
   - Signature card shows signature tee (Black)
   - Shorts card shows signature shorts

2. **Navigation**: Clicking each card navigates to correct collection
   - `/collections/classic-tees` → Shows 3 classic tees
   - `/collections/core-tees` → Shows 4 core tees
   - `/collections/signature-tees` → Shows 3 signature tees (NO shorts)
   - `/collections/signature-shorts` → Shows 2 signature shorts (NO tees)

3. **Image Resolution**: Each card image loads properly with correct fallbacks

## Benefits of This Approach
✅ **Centralized Collection Data**: All collection metadata in one place
✅ **Explicit Mapping**: No ambiguous image resolution logic
✅ **Scalable**: Easy to add new collections
✅ **Consistent UX**: Card images always match collection names
✅ **Type-Safe**: TypeScript types ensure consistency
✅ **Performance**: Simplified rendering logic vs. complex conditionals
