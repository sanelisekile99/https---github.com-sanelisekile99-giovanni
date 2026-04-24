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
  },
  {
    id: 't-shirts',
    title: 'T-Shirts',
    handle: 't-shirts',
    description: 'Premium oversized cotton tees crafted for effortless elegance.',
    image_url: productImages.chocolate,
    is_visible: true,
  },
  {
    id: 'sweaters',
    title: 'Sweaters',
    handle: 'sweaters',
    description: 'Soft layers with a refined silhouette.',
    image_url: productImages.sweater || productImages.white,
    is_visible: true,
  },
  {
    id: 'two-piece-sets',
    title: 'Two-Piece Sets',
    handle: 'two-piece-sets',
    description: 'Coordinated pieces for a polished wardrobe.',
    image_url: productImages.white,
    is_visible: true,
  },
  {
    id: 'limited-edition',
    title: 'Limited Edition',
    handle: 'limited-edition',
    description: 'Small-batch pieces with exclusive finishes.',
    image_url: productImages.white,
    is_visible: true,
  },
];

export const products: LocalProduct[] = [
  {
    id: 'p-black-oversized',
    name: 'GIOVANNI Core - Black',
    handle: 'essentials-oversized-tee',
    product_type: 'T-Shirts',
    description: 'An oversized cotton tee in deep black with the signature Giovanni wordmark.',
    price: 169900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
  images: ['src/images/Black T-shirt with Giovanni print.png'],
    has_variants: false,
    inventory_qty: 12,
    variants: [],
  },
  {
    id: 'p-chocolate-relaxed',
    name: 'GIOVANNI Core - Chocolate',
    handle: 'linen-blend-relaxed-tee',
    product_type: 'T-Shirts',
    description: 'A relaxed tee rendered in rich chocolate brown with a minimal front print.',
    price: 169900,
    created_at: now,
    status: 'active',
    tags: ['featured'],
  images: ['src/images/Chocolate brown T-shirt with lettering.png'],
    has_variants: false,
    inventory_qty: 10,
    variants: [],
  },
  {
    id: 'p-ecru-pocket',
    name: 'GIOVANNI Core - Ecru',
    handle: 'structured-pocket-tee',
    product_type: 'T-Shirts',
    description: 'A soft ecru tee with a clean, structured shape and pared-back detail.',
    price: 169900,
    created_at: now,
    status: 'active',
    tags: [],
  images: ['src/images/Ecru T-shirt with Giovanni print.png'],
    has_variants: false,
    inventory_qty: 11,
    variants: [],
  },
  {
    id: 'p-white-classic',
    name: 'GIOVANNI Core - White',
    handle: 'heavyweight-classic-tee',
    product_type: 'T-Shirts',
    description: 'A crisp white heavyweight tee for a sharp, timeless fit.',
    price: 169900,
    created_at: now,
    status: 'active',
    tags: [],
  images: ['src/images/Crisp white T-shirt with _GIOVANNI_ print.png'],
    has_variants: false,
    inventory_qty: 8,
    variants: [],
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
    id: 'p-limited-1',
    name: 'Limited Edition Minimal Tee',
    handle: 'limited-edition-minimal-tee',
    product_type: 'Limited Edition',
    description: 'A limited run tee created in very small quantities.',
    price: 169900,
    created_at: now,
    status: 'active',
    tags: ['limited-edition', 'featured'],
  images: ['src/images/Crisp white T-shirt with _GIOVANNI_ print.png'],
    has_variants: false,
    inventory_qty: 2,
    variants: [],
  },
];

export const productCollections = [
  { product_id: 'p-black-oversized', collection_id: 't-shirts', position: 1 },
  { product_id: 'p-chocolate-relaxed', collection_id: 't-shirts', position: 2 },
  { product_id: 'p-ecru-pocket', collection_id: 't-shirts', position: 3 },
  { product_id: 'p-white-classic', collection_id: 't-shirts', position: 4 },
  { product_id: 'p-two-piece-1', collection_id: 'two-piece-sets', position: 1 },
  { product_id: 'p-limited-1', collection_id: 'limited-edition', position: 1 },
  { product_id: 'p-black-oversized', collection_id: 'new-arrivals', position: 1 },
  { product_id: 'p-chocolate-relaxed', collection_id: 'new-arrivals', position: 2 },
  { product_id: 'p-limited-1', collection_id: 'new-arrivals', position: 4 },
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
