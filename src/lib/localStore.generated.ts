import { getImageByFileName, imageCatalog, imageFiles, resolveImageSrc } from '@/lib/imageCatalog';
import { normalizeImageKey } from '@/lib/imageMap';

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
  imageKey?: string;
  description: string;
  metadata?: {
    fabric?: string;
    fit?: string;
    care?: string;
    includes?: string;
    edition?: string;
  };
  price: number;
  created_at: string;
  status: 'active';
  tags: string[];
  images: string[];
  has_variants: boolean;
  inventory_qty: number | null;
  variants: LocalVariant[];
};

export type LocalCollection = {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image_url?: string;
  is_visible: boolean;
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
};

const FIXED_PRICE_CENTS = 159900;
const CORE_GIOVANNI_TSHIRT_PRICE_CENTS = 199900;
const CLASSIC_GIOVANNI_TSHIRT_PRICE_CENTS = 99900;
const SWEATER_PRICE_CENTS = 259900;

const BUCKET_HAT_PRICE_CENTS = 79900;
const WOMENS_LINEN_TWO_PIECE_PRICE_CENTS = 199900;
const MENS_LINEN_TWO_PIECE_PRICE_CENTS = 239900;
const LIMITED_EDITION_PRICE_CENTS = 139900;
const now = new Date().toISOString();

const normalizeTitle = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\.(png|jpe?g|webp|avif)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const inferProductType = (fileName: string) => {
  const lower = fileName.toLowerCase();
  if (lower.includes('premium linen shirt with sleek zipper')) return 'Limited Edition';
  if (lower.includes('minimalist _giovanni_ t-shirt display')) return '';
  if (lower.includes('classic giovanni')) return 'T-Shirts';
  // New: detect formal shirts by filename (e.g. "formal shirt", "formal")
  if (lower.includes('formal') || lower.includes('formal shirt')) return 'Formal Shirts';
  if ((lower.includes('linen') && lower.includes('(men)')) || (lower.includes('shirt and pants set') && !lower.includes('women'))) {
    return "Men's Two-Piece Linen Sets";
  }
  if (lower.includes('linen') && lower.includes('women')) return "Women's Two-Piece Linen Sets";
  if (lower.includes('bucket hat') || lower.includes('bucket-hat') || lower.includes('buckethat')) return 'Bucket Hats';
  if (lower.includes('sweater')) return 'Sweaters';
  if (lower.includes('two-piece') || lower.includes('set')) return 'Two-Piece Sets';
  if (lower.includes('limited')) return 'Limited Edition';
  if (lower.includes('t-shirt') || lower.includes('tee')) return 'T-Shirts';
  return '';
};

const getDisplayName = (fileName: string) => {
  const lower = fileName.toLowerCase();
  const overrides: Record<string, string> = {
    'black t-shirt with giovanni print.png': 'GIOVANNI Core - Black',
    'chocolate brown t-shirt with lettering.png': 'GIOVANNI Core - Chocolate',
    'crisp white t-shirt with _giovanni_ print.png': 'GIOVANNI Core - White',
    'ecru t-shirt with giovanni print.png': 'GIOVANNI Core - Ecru',
    'minimalist _giovanni_ t-shirt display.png': 'Giovanni Signature Tee',
    'chatgpt image mar 28, 2026, 10_22_27 am.png': 'Giovanni Lifestyle Image',
    'linen set in off-white(women).png': 'Off-White Linen Set',
    'dusty pink linen set (women).png': 'Dusty Pink Linen Set',
    'sage green linen set (women).png': 'Sage Green Linen Set',
    'charcoal gray linen (women).png': 'Charcoal Gray Linen Set',
    'classic giovanni t-shirts in black.png': 'Classic Giovanni Tee - Black',
    'classic giovanni t-shirts in white.png': 'Classic Giovanni Tee - White',
    'classic giovanni t-shirts in sage.png': 'Classic Giovanni Tee - Sage',
    'premium linen shirt with sleek zipper.png': 'GIOVANNI Premium Zip Shirt',
    'black giovanni crewneck sweater .png': 'Black Giovanni Crewneck Sweater',
    'giovanni sweater signature text.png': 'Giovanni Signature Text Sweater',
    'giovanni sweater with logo.png': 'Giovanni Logo Sweater',
    'sage green sweater embossed monogram.png': 'Sage Green Embossed Monogram Sweater',
    'white linen shirt and pants set(men).png': 'White Linen Shirt & Pants Set',
    'dark grey shirt and pants set(men).png': 'Dark Grey Shirt & Pants Set',
    'sage green linen set flat lay(men).png': 'Sage Green Linen Set',
    'beige linen shirt and pants set (1).png': 'Beige Linen Shirt & Pants Set',
    'giovanni bucket hat.png': 'GIOVANNI Bucket Hat',
  };

  if (overrides[lower]) return overrides[lower];

  return toTitleCase(normalizeTitle(fileName));
};

const isProductImage = (fileName: string) => Boolean(inferProductType(fileName));

const inferColour = (value: string) => {
  const lower = value.toLowerCase();
  if (lower.includes('off-white') || lower.includes('off white')) return 'off-white';
  if (lower.includes('white')) return 'white';
  if (lower.includes('black')) return 'black';
  if (lower.includes('chocolate')) return 'chocolate';
  if (lower.includes('ecru')) return 'ecru';
  if (lower.includes('sage')) return 'sage green';
  if (lower.includes('dusty pink')) return 'dusty pink';
  if (lower.includes('charcoal')) return 'charcoal grey';
  if (lower.includes('beige')) return 'beige';
  if (lower.includes('dark grey') || lower.includes('dark gray')) return 'dark grey';
  return 'signature';
};

const buildProductDescription = (name: string, productType: string, fileName: string) => {
  const lower = fileName.toLowerCase();
  const colour = inferColour(`${name} ${fileName}`);

  if (productType === 'T-Shirts') {
    if (lower.includes('classic giovanni')) {
      return `Classic fit cotton tee in ${colour}, finished with clean GIOVANNI branding for daily wear and easy layering.`;
    }
    return `Premium heavyweight cotton tee in ${colour} with a relaxed silhouette and soft-touch finish for elevated everyday styling.`;
  }

  if (productType === 'Sweaters') {
    return `Luxury knit sweater in ${colour} with a structured-yet-soft hand feel, created for warmth without bulk.`;
  }

  if (productType === 'Bucket Hats') {
    const isCrochet = lower.includes('crochet bucket hat') || lower.includes('crotched bucket hat');
    const baseDescription = `One-size bucket hat in ${colour} with a clean GIOVANNI finish, made for lightweight comfort and everyday sun coverage.`;
    if (isCrochet) {
      return `${baseDescription} Available for pre-order with 14-21 day delivery.`;
    }
    return baseDescription;
  }

  if (productType === "Women's Two-Piece Linen Sets") {
    return `Women's two-piece linen set in ${colour}, cut for a breathable relaxed fit that transitions easily from day to evening.`;
  }

  if (productType === "Men's Two-Piece Linen Sets") {
    return `Men's two-piece linen set in ${colour}, tailored with a modern relaxed profile for effortless smart-casual dressing.`;
  }

  if (productType === 'Limited Edition') {
    return `Limited edition Giovanni piece produced in small quantities, featuring premium finishing and exclusive seasonal detailing.`;
  }

  return `${name} from the Giovanni local image catalog.`;
};

const buildProductMetadata = (productType: string, fileName: string) => {
  const lower = fileName.toLowerCase();

  if (productType === 'T-Shirts') {
    return {
      fabric: 'Heavyweight cotton jersey',
      fit: lower.includes('classic giovanni') ? 'Classic fit' : 'Relaxed oversized fit',
      care: 'Cold wash, inside-out, air dry',
    };
  }

  if (productType === 'Sweaters') {
    return {
      fabric: 'Soft-touch knit',
      fit: 'Regular comfort fit',
      care: 'Cold gentle wash, flat dry',
    };
  }

  if (productType === 'Bucket Hats') {
    const isCrochet = lower.includes('crochet bucket hat') || lower.includes('crotched bucket hat');
    return {
      fabric: lower.includes('crochet') ? 'Crochet knit' : 'Structured cotton twill',
      fit: 'One Size',
      care: 'Spot clean only',
      includes: 'Single hat',
      ...(isCrochet && { delivery: '14-21 days (pre-order)' }),
    };
  }

  if (productType === "Women's Two-Piece Linen Sets" || productType === "Men's Two-Piece Linen Sets") {
    return {
      fabric: 'Breathable linen blend',
      fit: 'Relaxed set fit',
      care: 'Cold wash, low iron',
      includes: 'Shirt and pants',
    };
  }

  if (productType === 'Limited Edition') {
    return {
      fabric: 'Premium cotton blend',
      fit: 'Tailored relaxed fit',
      care: 'Cold wash, delicate cycle',
      edition: 'Limited seasonal release',
    };
  }

  return undefined;
};

const buildProductFromFile = (fileName: string): LocalProduct | null => {
  const imageUrl = getImageByFileName(fileName);
  if (!imageUrl) return null;

  const productType = inferProductType(fileName);
  if (!productType) return null;

  const name = getDisplayName(fileName);
  const lower = fileName.toLowerCase();
  const isCoreGiovanniTee =
    lower.includes('black t-shirt with giovanni print') ||
    lower.includes('chocolate brown t-shirt with lettering') ||
    lower.includes('crisp white t-shirt with _giovanni_ print') ||
    lower.includes('ecru t-shirt with giovanni print');
  const isClassicGiovanniTee = lower.includes('classic giovanni');
  const productId = `p-${slugify(fileName)}`;
  const isFeatured = lower.includes('black') || lower.includes('chocolate') || lower.includes('limited') || lower.includes('classic giovanni');
  const price = isCoreGiovanniTee
    ? CORE_GIOVANNI_TSHIRT_PRICE_CENTS
    : lower.includes('black bucket hat')
    ? 59900
    : lower.includes('crochet bucket hat') || lower.includes('crotched bucket hat')
    ? 99900
    : isClassicGiovanniTee
    ? CLASSIC_GIOVANNI_TSHIRT_PRICE_CENTS
    : productType === 'Bucket Hats'
    ? BUCKET_HAT_PRICE_CENTS
    : productType === 'Sweaters'
    ? SWEATER_PRICE_CENTS
    : productType === "Women's Two-Piece Linen Sets"
    ? WOMENS_LINEN_TWO_PIECE_PRICE_CENTS
    : productType === "Men's Two-Piece Linen Sets"
    ? MENS_LINEN_TWO_PIECE_PRICE_CENTS
    : productType === 'Limited Edition'
    ? LIMITED_EDITION_PRICE_CENTS
    : FIXED_PRICE_CENTS;

  return {
    id: productId,
    name,
    handle: slugify(name),
    product_type: productType,
  // Normalized key (filename-like) which maps to an imported image URL via imageMap
  imageKey: normalizeImageKey(fileName),
    description: buildProductDescription(name, productType, fileName),
    metadata: buildProductMetadata(productType, fileName),
    price,
    created_at: now,
    status: 'active',
    tags: (() => {
      const base = isFeatured ? ['featured'] : [];
      // Sage green embossed monogram sweater should be available for pre-order
      if (lower.includes('sage green sweater embossed monogram') || lower.includes('sage green sweater')) {
        base.push('pre-order');
      }
      // All linen sets are pre-order — check filename and inferred productType
      if (lower.includes('linen') || productType.toLowerCase().includes('linen')) {
        base.push('pre-order');
      }
      // Crochet bucket hat is available for pre-order only
      if (lower.includes('crochet bucket hat') || lower.includes('crotched bucket hat')) {
        base.push('pre-order');
      }
      return base;
    })(),
  images: [resolveImageSrc(imageUrl) || imageUrl],
    has_variants: false,
    inventory_qty: (() => {
      // Pre-order items have 0 inventory
      if (lower.includes('sage green sweater embossed monogram') || lower.includes('sage green sweater')) {
        return 0;
      }
      if (lower.includes('linen') || productType.toLowerCase().includes('linen')) {
        return 0;
      }
      if (lower.includes('crochet bucket hat') || lower.includes('crotched bucket hat')) {
        return 0;
      }
      return 8;
    })(),
    variants: [],
  };
};


export const products: LocalProduct[] = imageFiles
  .filter(isProductImage)
  .map(buildProductFromFile)
  .filter((product): product is LocalProduct => Boolean(product));

// DEBUG: print product -> product_type -> image mapping to help diagnose mismatches
try {
  if (import.meta.env.DEV) {
    console.log('\n[localStore] GENERATED PRODUCTS (handle | product_type | image | imageKey):');
    products.forEach(p => {
      console.log(`localStore -> ${p.handle} | ${p.product_type} | ${p.images?.[0] || ''} | ${p.imageKey || ''}`);
    });
  }
} catch (e) {
  // ignore in non-browser environments
}

const productById = new Map(products.map(product => [product.id, product]));
const productByHandle = new Map(products.map(product => [product.handle, product]));
const hasBucketHatProducts = products.some((product) => product.product_type === 'Bucket Hats');
const hasClassicGiovanniTeeProducts = products.some(
  (product) => product.product_type === 'T-Shirts' && !product.handle.startsWith('giovanni-core-')
);

export const collections: LocalCollection[] = [
  {
    id: 'new-arrivals',
    title: 'New Arrivals',
    handle: 'new-arrivals',
    description: 'Fresh arrivals selected for the season.',
    image_url: imageCatalog.blackTShirt || products[0]?.images?.[0],
    is_visible: true,
  },
  {
    id: 't-shirts',
    title: 'T-Shirts',
    handle: 't-shirts',
    description: 'Core Giovanni tees crafted for effortless elegance.',
    image_url: imageCatalog.blackTShirt || products.find(product => product.product_type === 'T-Shirts')?.images?.[0],
    is_visible: true,
  },
  {
    id: 'formal-shirts',
    title: 'Formal Shirts',
    handle: 'formal-shirts',
    description: 'Crisp formal shirts for elevated tailoring.',
    image_url: products.find(product => product.product_type === "Formal Shirts")?.images?.[0] || '',
    is_visible: true,
  },
  {
    id: 'classic-giovanni',
    title: 'Giovanni Classics',
    handle: 'classic-giovanni',
    description: 'Alternate Giovanni tee colourways and signature styles.',
    image_url: imageCatalog.classicGiovanniTShirt || imageCatalog.chocolateTShirt || products.find(product => product.product_type === 'T-Shirts')?.images?.[0],
    is_visible: hasClassicGiovanniTeeProducts,
  },
  {
    id: 'sweaters',
    title: 'Sweaters',
    handle: 'sweaters',
    description: 'Soft layers with a refined silhouette.',
    image_url: imageCatalog.sweater || imageCatalog.whiteTShirt || '',
    is_visible: true,
  },
  {
    id: 'bucket-hats',
    title: 'Bucket Hats',
    handle: 'bucket-hats',
    description: 'Everyday bucket hats with a clean GIOVANNI finish.',
    image_url: imageCatalog.bucketHat || imageCatalog.blackTShirt || '',
    is_visible: hasBucketHatProducts,
  },
  {
    id: 'two-piece-sets',
    title: 'Linen',
    handle: 'two-piece-sets',
    description: 'Men and women linen sets in one collection.',
    image_url: imageCatalog.womenLinenSet || imageCatalog.menLinenSet || '',
    is_visible: true,
  },
  {
    id: 'limited-edition',
    title: 'Limited Edition',
    handle: 'limited-edition',
    description: 'Small-batch pieces with exclusive finishes.',
  image_url: imageCatalog.premiumLinenShirt || imageCatalog.whiteTShirt || '',
    // Hidden for now — populate later
    is_visible: false,
  },
];

const FEATURED_LINEN_HANDLES = new Set([
  'off-white-linen-set',
  'dusty-pink-linen-set',
  'white-linen-shirt-pants-set',
  'dark-grey-shirt-pants-set',
]);

const productCollections = products.flatMap((product, index) => {
  const links: Array<{ product_id: string; collection_id: string; position: number }> = [];
  if (product.product_type === 'T-Shirts') {
    if (product.handle.startsWith('giovanni-core-')) {
      links.push({ product_id: product.id, collection_id: 't-shirts', position: index + 1 });
    } else {
      links.push({ product_id: product.id, collection_id: 'classic-giovanni', position: index + 1 });
    }
  }
  // Map formal shirts into the dedicated collection
  if (product.product_type === 'Formal Shirts') links.push({ product_id: product.id, collection_id: 'formal-shirts', position: index + 1 });
  // Cardigans collection removed
  if (product.product_type === 'Bucket Hats') links.push({ product_id: product.id, collection_id: 'bucket-hats', position: index + 1 });
  if (product.product_type === 'Sweaters' && product.handle !== 'ecru-sweater') links.push({ product_id: product.id, collection_id: 'sweaters', position: index + 1 });
  if ((product.product_type === "Women's Two-Piece Linen Sets" || product.product_type === "Men's Two-Piece Linen Sets") && FEATURED_LINEN_HANDLES.has(product.handle)) {
    links.push({ product_id: product.id, collection_id: 'two-piece-sets', position: index + 1 });
  }
  if (product.product_type === 'Two-Piece Sets' && FEATURED_LINEN_HANDLES.has(product.handle)) {
    links.push({ product_id: product.id, collection_id: 'two-piece-sets', position: index + 1 });
  }
  // Limited Edition intentionally left empty for now
  if (index < 4) links.push({ product_id: product.id, collection_id: 'new-arrivals', position: index + 1 });
  return links;
});

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
export const getProducts = () => [...products];
export const getProductByHandle = (handle?: string) => (handle ? productByHandle.get(handle) || null : null);
export const getCollectionByHandle = (handle?: string) => collections.find(collection => collection.handle === handle);
export const getCollectionProducts = (handle?: string) => {
  const collection = getCollectionByHandle(handle);
  if (!collection) return [];

  const productIds = productCollections
    .filter(link => link.collection_id === collection.id)
    .sort((a, b) => a.position - b.position)
    .map(link => link.product_id);

  return productIds
    .map(id => productById.get(id))
    .filter((product): product is LocalProduct => Boolean(product));
};

export const getRelatedProducts = (product: LocalProduct, limit = 4) =>
  product.product_type === 'T-Shirts' || product.product_type.includes('Linen') || product.handle.includes('linen')
    ? products
        .filter((candidate) => {
          if (candidate.id === product.id) return false;
          
          // For T-Shirts, match only T-Shirts
          if (product.product_type === 'T-Shirts') {
            if (candidate.product_type !== 'T-Shirts') return false;
            
            const isCore = product.handle.startsWith('giovanni-core-');
            const isClassic = product.handle.startsWith('classic-giovanni-tee-');
            
            if (isCore) return candidate.handle.startsWith('giovanni-core-');
            if (isClassic) return candidate.handle.startsWith('classic-giovanni-tee-');
            
            return true;
          }
          
          // For Linen sets, match EXACT product type (Men's vs Women's)
          if (product.product_type.includes('Linen')) {
            return candidate.product_type === product.product_type;
          }
          
          return true;
        })
        .slice(0, limit)
    : products
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
  const orderItems: LocalOrderItem[] = items.map(item => ({
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

export const getLocalOrdersByCustomerEmail = (email: string) => {
  const orders = readOrders();
  return orders.filter(order => order.customer_email === email);
};

export const getAllLocalOrders = () => {
  return readOrders();
};

export const getLocalOrderItems = (orderId: string) => {
  try {
    const stored = localStorage.getItem(`giovanni_order_items_${orderId}`);
    if (!stored) return [];
    return JSON.parse(stored) as LocalOrderItem[];
  } catch {
    return [];
  }
};
