import { imageCatalog, resolveImageSrc } from '@/lib/imageCatalog';

export type LocalVariant = {
  id: string;
  product_id: string;
  title: string;
  option1: string;
  sku: string;
  price: number;
  position: number;
  inventory_qty: number | null;
};

export type LocalProduct = {
  id: string;
  name: string;
  handle: string;
  product_type: string;
  description: string;
  price: number;
  created_at: string;
  status: 'active';
  tags: string[];
  images: string[];
  has_variants: boolean;
  inventory_qty: number | null;
  variants: LocalVariant[];
  category?: string;
  collection?: 'classic' | 'core' | 'signature';
  product_sub_type?: 'tee' | 'shorts';
  isSet?: boolean;
};

export type LocalCollection = {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image_url?: string;
  is_visible: boolean;
  category?: 'main' | 'subcategory';
};

export type LocalOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_title: string | null;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

export type OrderTrackingEvent = {
  id: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  location?: string;
};

export type LocalOrder = {
  id: string;
  customer_id: string;
  status: 'paid' | 'awaiting_payment';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: Record<string, string>;
  payment_intent_id: string;
  customer_email: string;
  created_at: string;
  paymentStatus?: 'pending' | 'paid';
  orderStatus?: 'awaiting_payment' | 'confirmed';
  yoco_checkout_id?: string | null;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  estimated_delivery?: string | null;
  tracking_events?: OrderTrackingEvent[];
};

const productImages = {
  black: imageCatalog.blackTShirt || '',
  chocolate: imageCatalog.chocolateTShirt || '',
  ecru: imageCatalog.ecruTShirt || '',
  white: imageCatalog.whiteTShirt || '',
  sweater: imageCatalog.sweater || '',
};

const now = new Date().toISOString();

export const collections: LocalCollection[] = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    handle: 'new-arrivals',
    description: 'Fresh arrivals selected for the season.',
    image_url: productImages.chocolate,
    is_visible: true,
    category: 'main',
  },
  {
    id: 't-shirts',
    title: 'T-Shirts',
    handle: 't-shirts',
    description: 'Premium oversized cotton tees crafted for effortless elegance.',
    image_url: productImages.chocolate,
    is_visible: true,
    category: 'main',
  },
  {
    id: 'classic-tees',
    title: 'Classic Tees',
    handle: 'classic-tees',
    description: 'Timeless essentials in premium cotton with iconic branding.',
    image_url: productImages.chocolate,
    is_visible: true,
    category: 'subcategory',
  },
  {
    id: 'core-tees',
    title: 'Core Tees',
    handle: 'core-tees',
    description: 'The foundation of luxury casual wear with refined simplicity.',
    image_url: productImages.white,
    is_visible: true,
    category: 'subcategory',
  },
  {
    id: 'signature-tees',
    title: 'Signature Tees',
    handle: 'signature-tees',
    description: 'Premium signature collection with elevated craftsmanship.',
    image_url: productImages.chocolate,
    is_visible: true,
    category: 'subcategory',
  },
  {
    id: 'sweaters',
    title: 'Sweaters',
    handle: 'sweaters',
    description: 'Soft layers with a refined silhouette.',
    image_url: productImages.sweater || productImages.white,
    is_visible: true,
    category: 'main',
  },
  {
    id: 'two-piece-sets',
    title: 'Two-Piece Sets',
    handle: 'two-piece-sets',
    description: 'Coordinated pieces for a polished wardrobe.',
    image_url: productImages.white,
    is_visible: true,
    category: 'main',
  },

  {
    id: 'bucket-hats',
    title: 'Bucket Hats',
    handle: 'bucket-hats',
    description: 'Crafted bucket hats in various styles and finishes.',
    image_url: imageCatalog.bucketHat,
    is_visible: true,
    category: 'main',
  },
  {
    id: 'giovanni-signature',
    title: 'Giovanni Signature',
    handle: 'giovanni-signature',
    description: 'Exclusive signature collection with premium craftsmanship and elevated details.',
    image_url: productImages.chocolate,
    is_visible: true,
    category: 'subcategory',
  },
  {
    id: 'signature-shorts',
    title: 'Signature Shorts',
    handle: 'signature-shorts',
    description: 'Premium signature shorts to pair with or wear separately.',
    image_url: productImages.white,
    is_visible: true,
    category: 'main',
  },
  {
    id: 'formal-wear',
    title: 'Formal Wear',
    handle: 'formal-wear',
    description: 'Sophisticated formal shirts crafted for elevated occasions.',
    image_url: productImages.white,
    is_visible: true,
    category: 'main',
  },
];

// Collection card type for display purposes
export type CollectionCard = {
  id: string;
  title: string;
  slug: string;
  image: string;
  category: 'main' | 'subcategory';
  description?: string;
};

// Collection cards for homepage grid - each card has a specific image matching its collection
export const collectionCards: CollectionCard[] = [
  {
    id: 'tshirts-card',
    title: 'T-Shirts',
    slug: 't-shirts',
    image: imageCatalog.chocolateTShirt || '',
    category: 'main',
    description: 'Premium oversized cotton tees crafted for effortless elegance.',
  },
  {
    id: 'classic-card',
    title: 'Classic',
    slug: 'classic-tees',
    image: imageCatalog.classicGiovanniTShirt || imageCatalog.blackTShirt || '',
    category: 'subcategory',
    description: 'Timeless essentials in premium cotton with iconic branding.',
  },
  {
    id: 'core-card',
    title: 'Core',
    slug: 'core-tees',
    image: imageCatalog.coreTShirt || imageCatalog.whiteTShirt || '',
    category: 'subcategory',
    description: 'The foundation of luxury casual wear with refined simplicity.',
  },
  {
    id: 'signature-card',
    title: 'Signature',
    slug: 'signature-tees',
    image: imageCatalog.signatureTShirt || imageCatalog.blackTShirt || '',
    category: 'subcategory',
    description: 'Premium signature collection with elevated craftsmanship.',
  },
  {
    id: 'signature-shorts-card',
    title: 'Signature Shorts',
    slug: 'signature-shorts',
    image: imageCatalog.signatureShorts || imageCatalog.blackTShirt || '',
    category: 'main',
    description: 'Premium signature shorts to pair with or wear separately.',
  },
  {
    id: 'sweaters-card',
    title: 'Sweaters',
    slug: 'sweaters',
    image: imageCatalog.sweater || imageCatalog.whiteTShirt || '',
    category: 'main',
    description: 'Soft layers with a refined silhouette.',
  },
  {
    id: 'formal-card',
    title: 'Formal Wear',
    slug: 'formal-wear',
    image: imageCatalog.formalShirt || imageCatalog.blackTShirt || '',
    category: 'main',
    description: 'Sophisticated formal shirts crafted for elevated occasions.',
  },
  {
    id: 'two-piece-card',
    title: 'Two-Piece Sets',
    slug: 'two-piece-sets',
    image: imageCatalog.womenLinenSet || imageCatalog.menLinenSet || imageCatalog.whiteTShirt || '',
    category: 'main',
    description: 'Coordinated pieces for a polished wardrobe.',
  },
  {
    id: 'bucket-card',
    title: 'Bucket Hats',
    slug: 'bucket-hats',
    image: imageCatalog.bucketHat || imageCatalog.blackTShirt || '',
    category: 'main',
    description: 'Crafted bucket hats in various styles and finishes.',
  },
];

export const products: LocalProduct[] = [
  {
    id: 'p-black-oversized',
    name: 'GIOVANNI Core - Black',
    handle: 'essentials-oversized-tee',
    product_type: 'T-Shirts',
    description: 'An oversized cotton tee in deep black with the signature Giovanni wordmark.',
    price: 229900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
    images: ['src/images/Black T-shirt with Giovanni print.png'],
    has_variants: false,
    inventory_qty: 12,
    variants: [],
    category: 't-shirts',
    collection: 'core',
  },
  {
    id: 'p-ecru-pocket',
    name: 'GIOVANNI Core - Ecru',
    handle: 'structured-pocket-tee',
    product_type: 'T-Shirts',
    description: 'A soft ecru tee with a clean, structured shape and pared-back detail.',
    price: 229900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Ecru T-shirt with Giovanni print.png'],
    has_variants: false,
    inventory_qty: 11,
    variants: [],
    category: 't-shirts',
    collection: 'core',
  },
  {
    id: 'p-white-classic',
    name: 'GIOVANNI Core - White',
    handle: 'heavyweight-classic-tee',
    product_type: 'T-Shirts',
    description: 'A crisp white heavyweight tee for a sharp, timeless fit.',
    price: 229900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Crisp white T-shirt with _GIOVANNI_ print.png'],
    has_variants: false,
    inventory_qty: 8,
    variants: [],
    category: 't-shirts',
    collection: 'core',
  },
  {
    id: 'p-two-piece-1',
    name: 'Relaxed Two-Piece Set',
    handle: 'relaxed-two-piece-set',
    product_type: 'Two-Piece Sets',
    description: 'An easy set designed for coordinated dressing.',
    price: 249900,
    created_at: now,
    status: 'active',
    tags: [],
  images: ['src/images/Linen set in off-white(women).png'],
    has_variants: false,
    inventory_qty: 6,
    variants: [],
  },
  {
    id: 'p-two-piece-beige',
    name: 'Beige Linen Two-Piece Set',
    handle: 'beige-linen-two-piece',
    product_type: 'Two-Piece Sets',
    description: 'Luxurious beige linen shirt and pants set for effortless elegance.',
    price: 289900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Beige linen shirt and pants set (1).png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
  {
    id: 'p-two-piece-charcoal-women',
    name: 'Charcoal Gray Linen Set - Women',
    handle: 'charcoal-linen-set-women',
    product_type: 'Two-Piece Sets',
    description: 'Sophisticated charcoal gray linen set with refined tailoring for women.',
    price: 269900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Charcoal gray linen (women).png'],
    has_variants: false,
    inventory_qty: 4,
    variants: [],
  },
  {
    id: 'p-two-piece-grey-men',
    name: 'Dark Grey Linen Set - Men',
    handle: 'dark-grey-linen-set-men',
    product_type: 'Two-Piece Sets',
    description: 'Premium dark grey linen shirt and pants set tailored for men.',
    price: 279900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Dark grey shirt and pants set(MEN).png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
  {
    id: 'p-two-piece-dusty-pink',
    name: 'Dusty Pink Linen Set - Women',
    handle: 'dusty-pink-linen-set-women',
    product_type: 'Two-Piece Sets',
    description: 'Elegant dusty pink linen set with soft tones and refined finishes.',
    price: 269900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Dusty pink linen set (women).png'],
    has_variants: false,
    inventory_qty: 4,
    variants: [],
  },
  {
    id: 'p-two-piece-sage-women',
    name: 'Sage Green Linen Set - Women',
    handle: 'sage-green-linen-set-women',
    product_type: 'Two-Piece Sets',
    description: 'Luxurious sage green linen set with elevated craftsmanship for women.',
    price: 269900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Sage green linen set (women).png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
  {
    id: 'p-two-piece-sage-men',
    name: 'Sage Green Linen Set - Men',
    handle: 'sage-green-linen-set-men',
    product_type: 'Two-Piece Sets',
    description: 'Premium sage green linen shirt and pants set tailored for men.',
    price: 279900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Sage green linen set flat lay(MEN).png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
  {
    id: 'p-two-piece-white-men',
    name: 'White Linen Set - Men',
    handle: 'white-linen-set-men',
    product_type: 'Two-Piece Sets',
    description: 'Crisp white linen shirt and pants set with timeless elegance for men.',
    price: 279900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/White linen shirt and pants set(MEN).png'],
    has_variants: false,
    inventory_qty: 6,
    variants: [],
  },

  {
    id: 'p-bucket-black',
    name: 'Giovanni Bucket Hat - Black',
    handle: 'bucket-hat-black',
    product_type: 'Bucket Hats',
    description: 'Classic black bucket hat with the Giovanni logo.',
    price: 59900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Black bucket hat logo.png'],
    has_variants: false,
    inventory_qty: 8,
    variants: [],
  },
  {
    id: 'p-bucket-offwhite',
    name: 'Giovanni Bucket Hat - Off-White',
    handle: 'bucket-hat-offwhite',
    product_type: 'Bucket Hats',
    description: 'Elegant off-white bucket hat with refined details.',
    price: 79900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Off-white bucket hat details.png'],
    has_variants: false,
    inventory_qty: 6,
    variants: [],
  },
  {
    id: 'p-bucket-olive',
    name: 'Giovanni Bucket Hat - Olive',
    handle: 'bucket-hat-olive',
    product_type: 'Bucket Hats',
    description: 'Sophisticated olive green bucket hat with premium finish.',
    price: 79900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Sage green bucket hat details.png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
  {
    id: 'p-bucket-denim',
    name: 'Giovanni Bucket Hat - Denim',
    handle: 'bucket-hat-denim',
    product_type: 'Bucket Hats',
    description: 'Classic blue denim bucket hat with timeless appeal.',
    price: 79900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Blue denim bucket hat.png'],
    has_variants: false,
    inventory_qty: 7,
    variants: [],
  },
  {
    id: 'p-bucket-crochet',
    name: 'Giovanni Bucket Hat - Crochet',
    handle: 'bucket-hat-crochet',
    product_type: 'Bucket Hats',
    description: 'Artisanal crochet bucket hat with elegant cream finish.',
    price: 99900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
    images: ['src/images/Elegant cream crochet bucket hat.png'],
    has_variants: false,
    inventory_qty: 4,
    variants: [],
  },
  {
    id: 'p-sage-core',
    name: 'GIOVANNI Core - Sage',
    handle: 'sage-core-tee',
    product_type: 'T-Shirts',
    description: 'A refined sage green tee with the iconic Giovanni signature print.',
    price: 229900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
    images: ['src/images/GIOVANNI Core Tee - Sage.png'],
    has_variants: false,
    inventory_qty: 9,
    variants: [],
    category: 't-shirts',
    collection: 'core',
  },
  {
    id: 'p-signature-jet-black',
    name: 'GV Signature Tee - Jet Black',
    handle: 'signature-tee-jet-black',
    product_type: 'T-Shirts',
    description: 'Premium signature tee in jet black with iconic Giovanni branding and elevated craftsmanship.',
    price: 179900,
    created_at: now,
    status: 'active',
    tags: ['featured', 'signature', 'SET'],
    images: ['src/images/GIOVANNI Signature Tee - black.png'],
    has_variants: false,
    inventory_qty: 7,
    variants: [],
    category: 't-shirts',
    collection: 'signature',
    product_sub_type: 'tee',
    isSet: true,
  },
  {
    id: 'p-signature-offwhite',
    name: 'GV Signature Tee - Off White',
    handle: 'signature-tee-offwhite',
    product_type: 'T-Shirts',
    description: 'Premium signature tee in off white with refined Giovanni logo detail and premium construction.',
    price: 179900,
    created_at: now,
    status: 'active',
    tags: ['featured', 'signature', 'SET'],
    images: ['src/images/GIOVANNI Signature Tee - off-white.png'],
    has_variants: false,
    inventory_qty: 6,
    variants: [],
    category: 't-shirts',
    collection: 'signature',
    product_sub_type: 'tee',
    isSet: true,
  },
  {
    id: 'p-signature-sage',
    name: 'GV Signature Tee - Sage Green',
    handle: 'signature-tee-sage',
    product_type: 'T-Shirts',
    description: 'Premium signature tee in sage green with subtle Giovanni branding and elevated finish.',
    price: 179900,
    created_at: now,
    status: 'active',
    tags: ['featured', 'signature', 'SET'],
    images: ['src/images/GIOVANNI Signature Tee - Sage.png'],
    has_variants: false,
    inventory_qty: 8,
    variants: [],
    category: 't-shirts',
    collection: 'signature',
    product_sub_type: 'tee',
    isSet: true,
  },
  {
    id: 'p-signature-short-black',
    name: 'GIOVANNI Signature Shorts - Black',
    handle: 'giovanni-signature-short-black',
    product_type: 'Shorts',
    description: 'Premium signature shorts in jet black, perfect as a set with signature tees.',
    price: 119900,
    created_at: now,
    status: 'active',
    tags: ['signature', 'SET'],
    images: ['src/images/GIOVANNI Signature short-black.png'],
    has_variants: false,
    inventory_qty: 8,
    variants: [],
    category: 'shorts',
    collection: 'signature',
    product_sub_type: 'shorts',
    isSet: true,
  },
  {
    id: 'p-signature-short-white',
    name: 'GIOVANNI Signature Shorts - White',
    handle: 'giovanni-signature-short-white',
    product_type: 'Shorts',
    description: 'Premium signature shorts in pure white, perfect as a set with signature tees.',
    price: 119900,
    created_at: now,
    status: 'active',
    tags: ['signature', 'SET'],
    images: ['src/images/GIOVANNI Signature short-white.png'],
    has_variants: false,
    inventory_qty: 7,
    variants: [],
    category: 'shorts',
    collection: 'signature',
    product_sub_type: 'shorts',
    isSet: true,
  },
  {
    id: 'p-classic-black',
    name: 'Classic GIOVANNI Tee - Black',
    handle: 'classic-tee-black',
    product_type: 'T-Shirts',
    description: 'Iconic classic GIOVANNI tee in deep black with timeless branding.',
    price: 99900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
    images: ['src/images/Classic GIOVANNI T-shirts in black.png'],
    has_variants: false,
    inventory_qty: 15,
    variants: [],
    category: 't-shirts',
    collection: 'classic',
  },
  {
    id: 'p-classic-sage',
    name: 'Classic GIOVANNI Tee - Sage',
    handle: 'classic-tee-sage',
    product_type: 'T-Shirts',
    description: 'Timeless sage green GIOVANNI tee with iconic branding.',
    price: 99900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Classic Giovanni T-shirts in sage.png'],
    has_variants: false,
    inventory_qty: 12,
    variants: [],
    category: 't-shirts',
    collection: 'classic',
  },
  {
    id: 'p-classic-white',
    name: 'Classic GIOVANNI Tee - White',
    handle: 'classic-tee-white',
    product_type: 'T-Shirts',
    description: 'Pure white classic GIOVANNI tee with refined simplicity.',
    price: 99900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Classic Giovanni T-shirts in white.png'],
    has_variants: false,
    inventory_qty: 14,
    variants: [],
    category: 't-shirts',
    collection: 'classic',
  },
  {
    id: 'p-formal-black',
    name: 'Giovanni Formal Shirt - Black',
    handle: 'formal-shirt-black',
    product_type: 'Formal Wear',
    description: 'Sophisticated black formal shirt crafted for elevated occasions with premium finishes.',
    price: 239900,
    created_at: now,
    status: 'active',
    tags: ['formal'],
    images: ['src/images/black Giovanni formal shirt.png'],
    has_variants: false,
    inventory_qty: 8,
    variants: [],
  },
  {
    id: 'p-formal-white',
    name: 'Giovanni Formal Shirt - White',
    handle: 'formal-shirt-white',
    product_type: 'Formal Wear',
    description: 'Crisp white formal shirt with refined tailoring for professional elegance.',
    price: 239900,
    created_at: now,
    status: 'active',
    tags: ['formal'],
    images: ['src/images/white Giovanni formal shirt.png'],
    has_variants: false,
    inventory_qty: 10,
    variants: [],
  },
  {
    id: 'p-formal-blue',
    name: 'Giovanni Formal Shirt - Blue',
    handle: 'formal-shirt-blue',
    product_type: 'Formal Wear',
    description: 'Rich blue formal shirt combining sophistication with subtle styling.',
    price: 239900,
    created_at: now,
    status: 'active',
    tags: ['formal'],
    images: ['src/images/blue Giovanni formal shirt.png'],
    has_variants: false,
    inventory_qty: 7,
    variants: [],
  },
  {
    id: 'p-formal-navy',
    name: 'Giovanni Formal Shirt - Navy',
    handle: 'formal-shirt-navy',
    product_type: 'Formal Wear',
    description: 'Deep navy formal shirt with premium fabric and impeccable construction.',
    price: 239900,
    created_at: now,
    status: 'active',
    tags: ['formal'],
    images: ['src/images/navy Giovanni formal shirt.png'],
    has_variants: false,
    inventory_qty: 9,
    variants: [],
  },
  {
    id: 'p-sweater-black',
    name: 'Giovanni Crewneck Sweater - Black',
    handle: 'crewneck-sweater-black',
    product_type: 'Sweaters',
    description: 'Luxurious black crewneck sweater with refined craftsmanship and timeless appeal.',
    price: 249900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
    images: ['src/images/Black Giovanni crewneck sweater .png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
  {
    id: 'p-sweater-signature-text',
    name: 'Giovanni Signature Text Sweater',
    handle: 'signature-text-sweater',
    product_type: 'Sweaters',
    description: 'Premium sweater featuring iconic Giovanni signature text with elevated finishes.',
    price: 269900,
    created_at: now,
    status: 'active',
    tags: ['featured', 'signature'],
    images: ['src/images/Giovanni sweater signature text.png'],
    has_variants: false,
    inventory_qty: 4,
    variants: [],
  },
  {
    id: 'p-sweater-logo',
    name: 'Giovanni Logo Sweater',
    handle: 'logo-sweater',
    product_type: 'Sweaters',
    description: 'Elegant sweater with refined Giovanni logo detail and premium construction.',
    price: 269900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Giovanni sweater with logo.png'],
    has_variants: false,
    inventory_qty: 6,
    variants: [],
  },
  {
    id: 'p-sweater-sage',
    name: 'Giovanni Sweater - Sage Green',
    handle: 'sweater-sage-monogram',
    product_type: 'Sweaters',
    description: 'Sophisticated sage green sweater with embossed monogram detailing.',
    price: 259900,
    created_at: now,
    status: 'active',
    tags: [],
    images: ['src/images/Sage green sweater embossed monogram.png'],
    has_variants: false,
    inventory_qty: 5,
    variants: [],
  },
];

export const productCollections = [
  // Classic Tees Collection
  { product_id: 'p-classic-black', collection_id: 'classic-tees', position: 1 },
  { product_id: 'p-classic-sage', collection_id: 'classic-tees', position: 2 },
  { product_id: 'p-classic-white', collection_id: 'classic-tees', position: 3 },
  
  // Core Tees Collection
  { product_id: 'p-black-oversized', collection_id: 'core-tees', position: 1 },
  { product_id: 'p-ecru-pocket', collection_id: 'core-tees', position: 2 },
  { product_id: 'p-white-classic', collection_id: 'core-tees', position: 3 },
  { product_id: 'p-sage-core', collection_id: 'core-tees', position: 4 },
  
  // Signature Tees Collection
  { product_id: 'p-signature-jet-black', collection_id: 'signature-tees', position: 1 },
  { product_id: 'p-signature-offwhite', collection_id: 'signature-tees', position: 2 },
  { product_id: 'p-signature-sage', collection_id: 'signature-tees', position: 3 },
  
  // Two-Piece Sets
  { product_id: 'p-two-piece-1', collection_id: 'two-piece-sets', position: 1 },
  { product_id: 'p-two-piece-beige', collection_id: 'two-piece-sets', position: 2 },
  { product_id: 'p-two-piece-charcoal-women', collection_id: 'two-piece-sets', position: 3 },
  { product_id: 'p-two-piece-grey-men', collection_id: 'two-piece-sets', position: 4 },
  { product_id: 'p-two-piece-dusty-pink', collection_id: 'two-piece-sets', position: 5 },
  { product_id: 'p-two-piece-sage-women', collection_id: 'two-piece-sets', position: 6 },
  { product_id: 'p-two-piece-sage-men', collection_id: 'two-piece-sets', position: 7 },
  { product_id: 'p-two-piece-white-men', collection_id: 'two-piece-sets', position: 8 },
  
  // Giovanni Signature (tees and shorts)
  { product_id: 'p-signature-jet-black', collection_id: 'giovanni-signature', position: 1 },
  { product_id: 'p-signature-offwhite', collection_id: 'giovanni-signature', position: 2 },
  { product_id: 'p-signature-sage', collection_id: 'giovanni-signature', position: 3 },
  { product_id: 'p-signature-short-black', collection_id: 'giovanni-signature', position: 4 },
  { product_id: 'p-signature-short-white', collection_id: 'giovanni-signature', position: 5 },
  
  // New Arrivals
  { product_id: 'p-black-oversized', collection_id: 'new-arrivals', position: 1 },
  { product_id: 'p-ecru-pocket', collection_id: 'new-arrivals', position: 2 },
  { product_id: 'p-white-classic', collection_id: 'new-arrivals', position: 3 },
  { product_id: 'p-sage-core', collection_id: 'new-arrivals', position: 4 },
  { product_id: 'p-signature-jet-black', collection_id: 'new-arrivals', position: 5 },
  { product_id: 'p-signature-offwhite', collection_id: 'new-arrivals', position: 6 },
  { product_id: 'p-signature-sage', collection_id: 'new-arrivals', position: 7 },
  
  // Signature Shorts
  { product_id: 'p-signature-short-black', collection_id: 'signature-shorts', position: 1 },
  { product_id: 'p-signature-short-white', collection_id: 'signature-shorts', position: 2 },
  
  // Formal Wear
  { product_id: 'p-formal-black', collection_id: 'formal-wear', position: 1 },
  { product_id: 'p-formal-white', collection_id: 'formal-wear', position: 2 },
  { product_id: 'p-formal-blue', collection_id: 'formal-wear', position: 3 },
  { product_id: 'p-formal-navy', collection_id: 'formal-wear', position: 4 },
  
  // Sweaters
  { product_id: 'p-sweater-black', collection_id: 'sweaters', position: 1 },
  { product_id: 'p-sweater-signature-text', collection_id: 'sweaters', position: 2 },
  { product_id: 'p-sweater-logo', collection_id: 'sweaters', position: 3 },
  { product_id: 'p-sweater-sage', collection_id: 'sweaters', position: 4 },
  
  // Bucket Hats
  { product_id: 'p-bucket-black', collection_id: 'bucket-hats', position: 1 },
  { product_id: 'p-bucket-offwhite', collection_id: 'bucket-hats', position: 2 },
  { product_id: 'p-bucket-olive', collection_id: 'bucket-hats', position: 3 },
  { product_id: 'p-bucket-denim', collection_id: 'bucket-hats', position: 4 },
  { product_id: 'p-bucket-crochet', collection_id: 'bucket-hats', position: 5 },
];

const orderKey = 'giovanni_orders';

const readOrders = (): LocalOrder[] => {
  try {
    const stored = localStorage.getItem(orderKey);
    return stored ? (JSON.parse(stored) as LocalOrder[]) : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders: LocalOrder[]) => {
  localStorage.setItem(orderKey, JSON.stringify(orders));
};

export const getVisibleCollections = () => collections.filter(collection => collection.is_visible);
export const getMainCollections = () => collections.filter(collection => collection.is_visible && collection.category === 'main');
export const getProducts = () => [...products];
export const getProductByHandle = (handle?: string) => products.find(product => product.handle === handle);
export const getCollectionByHandle = (handle?: string) => collections.find(collection => collection.handle === handle);
export const getCollectionProducts = (handle?: string) => {
  const collection = getCollectionByHandle(handle);
  if (!collection) return [];
  const productIds = productCollections
    .filter(link => link.collection_id === collection.id)
    .sort((a, b) => a.position - b.position)
    .map(link => link.product_id);

  return productIds
    .map(id => products.find(product => product.id === id))
    .filter((product): product is LocalProduct => Boolean(product));
};

export const getRelatedProducts = (product: LocalProduct, limit = 4) =>
  products
    .filter(candidate => candidate.id !== product.id && candidate.product_type === product.product_type)
    .slice(0, limit);

export const createLocalOrder = ({
  customer,
  items,
  subtotal,
  shipping,
  tax,
  total,
  paymentIntentId = '',
  status = 'paid',
  paymentStatus,
  orderStatus,
  shippingAddress,
  yocoCheckoutId,
}: {
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    name: string;
    variant_title?: string | null;
    sku?: string | null;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentIntentId?: string;
  status?: 'paid' | 'awaiting_payment';
  paymentStatus?: 'pending' | 'paid';
  orderStatus?: 'awaiting_payment' | 'confirmed';
  shippingAddress?: Record<string, string>;
  yocoCheckoutId?: string;
}) => {
  const orderId = crypto.randomUUID();
  const orders = readOrders();
  const orderItems: LocalOrderItem[] = items.map((item, index) => ({
    id: crypto.randomUUID(),
    order_id: orderId,
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    product_name: item.name,
    variant_title: item.variant_title || null,
    sku: item.sku || null,
    quantity: item.quantity,
    unit_price: item.price,
    total: item.price * item.quantity,
  }));

  const order: LocalOrder = {
    id: orderId,
    customer_id: customer.email,
    status,
    subtotal,
    tax,
    shipping,
    total,
    shipping_address:
      shippingAddress || {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
        country: customer.country || '',
      },
    payment_intent_id: paymentIntentId || '',
    customer_email: customer.email,
    created_at: new Date().toISOString(),
    paymentStatus: paymentStatus ?? (status === 'paid' ? 'paid' : 'pending'),
    orderStatus: orderStatus ?? (status === 'paid' ? 'confirmed' : 'awaiting_payment'),
    yoco_checkout_id: yocoCheckoutId || null,
  };

  orders.unshift(order);
  writeOrders(orders);
  localStorage.setItem(`giovanni_order_items_${orderId}`, JSON.stringify(orderItems));

  return { order, orderItems };
};

export const updateLocalOrder = (orderId: string, updates: Partial<LocalOrder>) => {
  const orders = readOrders();
  const index = orders.findIndex(order => order.id === orderId);
  if (index === -1) return null;

  const updated = {
    ...orders[index],
    ...updates,
  };

  orders[index] = updated;
  writeOrders(orders);
  return updated;
};

export const markLocalOrderPaid = (orderId: string) =>
  updateLocalOrder(orderId, {
    status: 'paid',
    paymentStatus: 'paid',
    orderStatus: 'confirmed',
  });

export const getLocalOrder = (orderId?: string) => {
  if (!orderId) return null;
  return readOrders().find(order => order.id === orderId) || null;
};

export const getLocalOrderItems = (orderId?: string) => {
  if (!orderId) return [];
  try {
    const stored = localStorage.getItem(`giovanni_order_items_${orderId}`);
    return stored ? (JSON.parse(stored) as LocalOrderItem[]) : [];
  } catch {
    return [];
  }
};

// Tracking functions
export const updateOrderTracking = (orderId: string, trackingData: {
  tracking_number?: string;
  tracking_carrier?: string;
  estimated_delivery?: string;
  status?: string;
}) => {
  return updateLocalOrder(orderId, {
    tracking_number: trackingData.tracking_number,
    tracking_carrier: trackingData.tracking_carrier,
    estimated_delivery: trackingData.estimated_delivery,
  });
};

export const addTrackingEvent = (orderId: string, event: Omit<OrderTrackingEvent, 'id'>) => {
  const order = getLocalOrder(orderId);
  if (!order) return null;

  const trackingEvents = order.tracking_events || [];
  const newEvent: OrderTrackingEvent = {
    id: crypto.randomUUID(),
    ...event,
  };

  trackingEvents.push(newEvent);
  return updateLocalOrder(orderId, { tracking_events: trackingEvents });
};

export const getTrackingEvents = (orderId: string): OrderTrackingEvent[] => {
  const order = getLocalOrder(orderId);
  return order?.tracking_events || [];
};

export const getLatestTrackingEvent = (orderId: string): OrderTrackingEvent | null => {
  const events = getTrackingEvents(orderId);
  if (events.length === 0) return null;
  return events[events.length - 1];
};

export const getLocalOrdersByCustomerEmail = (email: string) => {
  const orders = readOrders();
  return orders.filter(order => order.customer_email === email);
};

export const getAllLocalOrders = () => {
  return readOrders();
};
