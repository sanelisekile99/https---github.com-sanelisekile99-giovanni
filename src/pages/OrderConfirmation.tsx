import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import { getLocalOrder, getLocalOrderItems, updateLocalOrder, LocalOrder, LocalOrderItem } from '@/lib/localStore';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<LocalOrder | null>(null);
  const [orderItems, setOrderItems] = useState<LocalOrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const markPaid = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const loadedOrder = getLocalOrder(orderId);
      if (!loadedOrder) {
        setLoading(false);
        return;
      }

      if (searchParams.get('status') === 'success' && loadedOrder.status !== 'paid') {
        const updated = updateLocalOrder(orderId, {
          status: 'paid',
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
        });
        setOrder(updated || loadedOrder);
      } else {
        setOrder(loadedOrder);
      }

      setOrderItems(getLocalOrderItems(orderId));
      setLoading(false);
    };

    markPaid();
  }, [orderId, searchParams]);

  const formatPrice = (cents: number) => `R ${(cents / 100).toLocaleString('en-ZA')}`;

  const titleMessage = order?.status === 'paid'
    ? 'Your payment has been confirmed and your order is being prepared.'
    : 'Your order has been placed and is awaiting payment confirmation.';

  const subtitleMessage = order?.status === 'paid'
    ? 'Thank you for your purchase. You will receive an email summary shortly.'
    : 'Your payment is pending. Complete the payment in Yoco and refresh this page to see the final confirmation.';

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-heading text-xl tracking-[0.15em] text-[#1A1A1A] font-light animate-pulse">
          GIOVANNI
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="bg-white border-b border-[#F0EDE9]">
        <div className="max-w-[800px] mx-auto px-6 py-5 text-center">
          <Link to="/" className="font-heading text-xl tracking-[0.15em] font-light text-[#1A1A1A]">
            GIOVANNI
          </Link>
        </div>
      </header>

      <div className="max-w-[600px] mx-auto px-6 py-12 lg:py-20">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#D4E5E1] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={28} strokeWidth={1.5} className="text-[#1A1A1A]" />
          </div>
          <h1 className="font-heading text-3xl tracking-[0.05em] font-light text-[#1A1A1A] mb-3">
            Thank You
          </h1>
          <p className="text-sm text-[#8B8B8B] font-light">
            {titleMessage}
          </p>
        </div>

        {order && (
          <div className="bg-white p-6 lg:p-8 mb-6">
            {/* Order number + status */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F0EDE9]">
              <div className="flex items-center gap-3">
                <Package size={18} strokeWidth={1.5} className="text-[#8B8B8B]" />
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0]">
                    Order Number
                  </p>
                  <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">
                    {order.id.split('-')[0].toUpperCase()}
                  </p>
                </div>
              </div>
              {order.status === 'paid' && (
                <div className="flex items-center gap-1.5 bg-[#D4E5E1]/40 px-3 py-1.5">
                  <ShieldCheck size={12} strokeWidth={1.5} className="text-[#5A8A7A]" />
                  <span className="text-[10px] tracking-[0.15em] uppercase text-[#5A8A7A] font-medium">
                    Paid
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-3 mb-6">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#5A5A5A] font-light">
                    {item.product_name}
                    {item.variant_title ? ` (${item.variant_title})` : ''}
                    {' '}x{item.quantity}
                  </span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-[#F0EDE9] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B8B8B] font-light">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B8B8B] font-light">Shipping</span>
                {order.shipping === 0 ? (
                  <span className="text-[#7BAF9E] text-[12px]">Complimentary</span>
                ) : (
                  <span>{formatPrice(order.shipping)}</span>
                )}
              </div>
              {(order.tax > 0 || order.tax === 0) && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B8B8B] font-light">Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-[#F0EDE9]">
                <span>Total</span>
                <span className="text-base">{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Shipping address */}
            {order.shipping_address && (
              <div className="mt-6 pt-4 border-t border-[#F0EDE9]">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-2">
                  Shipping To
                </p>
                <div className="text-sm text-[#5A5A5A] font-light space-y-0.5">
                  <p className="font-medium text-[#1A1A1A]">
                    {order.shipping_address.name}
                  </p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state}{' '}
                    {order.shipping_address.zip}
                  </p>
                  <p>{order.shipping_address.country}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-[#8B8B8B] font-light mb-8">
          {subtitleMessage}
        </p>

        <div className="text-center space-y-4">
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-3.5 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
          >
            Continue Shopping
            <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
          <div>
            <Link
              to="/"
              className="text-[11px] tracking-[0.15em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
