import { OrderTrackingEvent } from '@/lib/localStore';

export const trackingStatusHierarchy = {
  processing: 0,
  shipped: 1,
  in_transit: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 5,
};

export const getTrackingProgress = (status: string): number => {
  const statusMap = {
    processing: 25,
    shipped: 50,
    in_transit: 65,
    out_for_delivery: 85,
    delivered: 100,
    cancelled: 0,
  };
  return (statusMap as Record<string, number>)[status] || 0;
};

export const isTrackingCompleted = (status: string): boolean => {
  return status === 'delivered' || status === 'cancelled';
};

export const getNextStatus = (currentStatus: string): string | null => {
  const statuses = ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentIndex = statuses.indexOf(currentStatus);
  return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
};

export const getDaysUntilEstimatedDelivery = (estimatedDeliveryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const delivery = new Date(estimatedDeliveryDate);
  delivery.setHours(0, 0, 0, 0);
  
  const diff = delivery.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isDeliveryOverdue = (estimatedDeliveryDate: string): boolean => {
  return getDaysUntilEstimatedDelivery(estimatedDeliveryDate) < 0;
};

export const formatEstimatedDelivery = (estimatedDeliveryDate: string): string => {
  const days = getDaysUntilEstimatedDelivery(estimatedDeliveryDate);
  
  if (days < 0) {
    return 'Overdue';
  } else if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Tomorrow';
  } else if (days <= 7) {
    return `In ${days} days`;
  } else {
    return new Date(estimatedDeliveryDate).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      year: estimatedDeliveryDate.includes(new Date().getFullYear().toString()) ? undefined : 'numeric',
    } as Intl.DateTimeFormatOptions);
  }
};
