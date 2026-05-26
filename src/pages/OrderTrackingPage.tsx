import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Home,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLocalOrder, getLocalOrderItems, getTrackingEvents, LocalOrder, LocalOrderItem, OrderTrackingEvent } from '@/lib/localStore';

const formatPrice = (cents: number) => `ZAR ${(cents / 100).toLocaleString('en-ZA')}`;

type TrackingStatus = 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';

const getStatusIcon = (status: TrackingStatus) => {
  switch (status) {
    case 'processing':
      return <Clock size={20} className="text-[#8B8B8B]" />;
    case 'shipped':
      return <Package size={20} className="text-[#8B8B8B]" />;
    case 'in_transit':
      return <Truck size={20} className="text-[#8B8B8B]" />;
    case 'out_for_delivery':
      return <MapPin size={20} className="text-[#FFA500]" />;
    case 'delivered':
      return <CheckCircle2 size={20} className="text-[#4CAF50]" />;
    case 'cancelled':
      return <AlertCircle size={20} className="text-[#E74C3C]" />;
    default:
      return <Package size={20} className="text-[#8B8B8B]" />;
  }
};

const getStatusLabel = (status: TrackingStatus): string => {
  switch (status) {
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'in_transit':
      return 'In Transit';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: TrackingStatus) => {
  switch (status) {
    case 'processing':
      return 'text-[#8B8B8B]';
    case 'shipped':
      return 'text-[#8B8B8B]';
    case 'in_transit':
      return 'text-[#8B8B8B]';
    case 'out_for_delivery':
      return 'text-[#FFA500]';
    case 'delivered':
      return 'text-[#4CAF50]';
    case 'cancelled':
      return 'text-[#E74C3C]';
    default:
      return 'text-[#8B8B8B]';
  }
};

interface TrackingPageState {
  order: LocalOrder | null;
  items: LocalOrderItem[];
  events: OrderTrackingEvent[];
  loading: boolean;
}

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [state, setState] = useState<TrackingPageState>({
    order: null,
    items: [],
    events: [],
    loading: true,
  });

  useEffect(() => {
    if (orderId) {
      const order = getLocalOrder(orderId);
      const items = getLocalOrderItems(orderId);
      const events = getTrackingEvents(orderId);

      setState({
        order,
        items,
        events,
        loading: false,
      });
    } else {
      setState({ order: null, items: [], events: [], loading: false });
    }
  }, [orderId]);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-heading text-xl tracking-[0.15em] text-[#1A1A1A] font-light animate-pulse">
          GIOVANNI
        </p>
      </div>
    );
  }

  if (!state.order) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <AlertCircle size={48} strokeWidth={1} className="text-[#8B8B8B] mb-4" />
          <p className="text-lg text-[#8B8B8B] font-light mb-6">Order not found</p>
          <Link
            to="/account"
            className="inline-flex items-center gap-2 py-3 px-8 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
          >
            Back to Orders
            <ArrowRight size={14} />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentStatus = state.events[state.events.length - 1]?.status || 'processing';
  const displayStatus = currentStatus as TrackingStatus;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      {/* Hero section */}
      <div className="bg-[#FAFAF8] py-12 lg:py-16">
        <div className="max-w-[1000px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">
            Order Tracking
          </p>
          <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
            Track Your Order
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-12 lg:py-16 flex-1">
        {/* Order header */}
        <div className="bg-white border border-[#F0EDE9] p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 pb-6 border-b border-[#F0EDE9]">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-1">
                Order Number
              </p>
              <p className="text-xl font-medium text-[#1A1A1A]">
                {state.order.id.split('-')[0].toUpperCase()}
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-1">
                Order Date
              </p>
              <p className="text-lg text-[#1A1A1A]">
                {new Date(state.order.created_at).toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-2">
                Total Amount
              </p>
              <p className="text-lg font-medium text-[#1A1A1A]">{formatPrice(state.order.total)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-2">
                Status
              </p>
              <p className={`text-lg font-medium ${getStatusColor(displayStatus)}`}>
                {getStatusLabel(displayStatus)}
              </p>
            </div>
            {state.order.tracking_carrier && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-2">
                  Carrier
                </p>
                <p className="text-lg font-medium text-[#1A1A1A]">{state.order.tracking_carrier}</p>
              </div>
            )}
            {state.order.estimated_delivery && (
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-2">
                  Est. Delivery
                </p>
                <p className="text-lg font-medium text-[#1A1A1A]">
                  {new Date(state.order.estimated_delivery).toLocaleDateString('en-ZA', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {state.order.tracking_number && (
            <div className="mt-6 pt-6 border-t border-[#F0EDE9]">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-2">
                Tracking Number
              </p>
              <p className="text-sm font-mono text-[#1A1A1A] bg-[#FAFAF8] p-3 rounded">
                {state.order.tracking_number}
              </p>
            </div>
          )}
        </div>

        {/* Tracking timeline */}
        <div className="bg-white border border-[#F0EDE9] p-6 lg:p-8 mb-8">
          <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-8">
            Tracking History
          </h2>

          {state.events.length === 0 ? (
            <div className="py-8 text-center">
              <Package size={32} className="text-[#D4E5E1] mx-auto mb-4" />
              <p className="text-[#8B8B8B] font-light">
                Order has been received. Tracking updates will appear here soon.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {state.events.map((event, index) => (
                <div key={event.id} className="flex gap-6 pb-8 last:pb-0">
                  {/* Timeline line and icon */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#FAFAF8] border border-[#F0EDE9] flex items-center justify-center">
                      {getStatusIcon(event.status as TrackingStatus)}
                    </div>
                    {index < state.events.length - 1 && (
                      <div className="w-0.5 h-12 bg-[#F0EDE9]"></div>
                    )}
                  </div>

                  {/* Event details */}
                  <div className="pt-1 flex-1">
                    <p className={`font-medium text-sm ${getStatusColor(event.status as TrackingStatus)}`}>
                      {getStatusLabel(event.status as TrackingStatus)}
                    </p>
                    <p className="text-sm text-[#5A5A5A] font-light mt-1">{event.description}</p>
                    {event.location && (
                      <p className="text-sm text-[#8B8B8B] font-light mt-1 flex items-center gap-2">
                        <MapPin size={14} />
                        {event.location}
                      </p>
                    )}
                    <p className="text-xs text-[#A0A0A0] mt-3">
                      {new Date(event.timestamp).toLocaleDateString('en-ZA', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order items */}
        <div className="bg-white border border-[#F0EDE9] p-6 lg:p-8 mb-8">
          <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
            Items in this Order
          </h2>

          <div className="space-y-4">
            {state.items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-[#F0EDE9] last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{item.product_name}</p>
                  {item.variant_title && (
                    <p className="text-xs text-[#8B8B8B] font-light mt-1">{item.variant_title}</p>
                  )}
                  <p className="text-xs text-[#A0A0A0] font-light mt-1">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-[#1A1A1A]">{formatPrice(item.total)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-[#F0EDE9]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#8B8B8B]">Subtotal</span>
              <span className="text-sm text-[#1A1A1A]">{formatPrice(state.order.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#8B8B8B]">Shipping</span>
              <span className="text-sm text-[#1A1A1A]">{formatPrice(state.order.shipping)}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EDE9] mb-4">
              <span className="text-sm text-[#8B8B8B]">Tax</span>
              <span className="text-sm text-[#1A1A1A]">{formatPrice(state.order.tax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1A1A1A]">Total</span>
              <span className="text-lg font-medium text-[#1A1A1A]">{formatPrice(state.order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white border border-[#F0EDE9] p-6 lg:p-8 mb-8">
          <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6 flex items-center gap-2">
            <Home size={16} />
            Shipping Address
          </h2>

          <div className="text-sm text-[#5A5A5A] font-light space-y-1">
            <p className="font-medium text-[#1A1A1A]">{state.order.shipping_address.name}</p>
            <p>{state.order.shipping_address.address}</p>
            <p>
              {state.order.shipping_address.city}
              {state.order.shipping_address.state && `, ${state.order.shipping_address.state}`}
              {state.order.shipping_address.zip && ` ${state.order.shipping_address.zip}`}
            </p>
            {state.order.shipping_address.country && (
              <p>{state.order.shipping_address.country}</p>
            )}
            {state.order.shipping_address.phone && (
              <p className="pt-2">{state.order.shipping_address.phone}</p>
            )}
          </div>
        </div>

        {/* Back to account link */}
        <div className="text-center">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 hover:text-[#8B8B8B] hover:border-[#8B8B8B] transition-colors"
          >
            Back to My Account
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
