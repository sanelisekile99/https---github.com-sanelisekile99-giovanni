// This file re-exports from localStore.ts to maintain backward compatibility
// All product and collection data is defined in localStore.ts

export {
  type LocalVariant,
  type LocalProduct,
  type LocalCollection,
  type CollectionCard,
  type LocalOrderItem,
  type LocalOrder,
  type OrderTrackingEvent,
  collections,
  collectionCards,
  products,
  productCollections,
  getVisibleCollections,
  getMainCollections,
  getProducts,
  getProductByHandle,
  getCollectionByHandle,
  getCollectionProducts,
  getRelatedProducts,
  createLocalOrder,
  updateLocalOrder,
  markLocalOrderPaid,
  getLocalOrdersByCustomerEmail,
  getAllLocalOrders,
  getLocalOrderItems,
} from './localStore';
