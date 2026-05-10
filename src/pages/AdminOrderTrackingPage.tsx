import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLocalOrder, updateOrderTracking, addTrackingEvent, LocalOrder } from '@/lib/localStore';

export default function AdminOrderTrackingPage() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [trackingCarrier, setTrackingCarrier] = useState<string>('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');
  const [eventStatus, setEventStatus] = useState<string>('shipped');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [eventLocation, setEventLocation] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleLoadOrders = () => {
    // Get all orders from localStorage
    const orderKey = 'giovanni_orders';
    try {
      const stored = localStorage.getItem(orderKey);
      const parsedOrders = stored ? JSON.parse(stored) : [];
      setOrders(parsedOrders);
      setMessage(`Loaded ${parsedOrders.length} orders`);
    } catch (error) {
      setMessage('Error loading orders');
    }
  };

  const handleUpdateTracking = () => {
    if (!selectedOrderId || !trackingNumber || !trackingCarrier) {
      setMessage('Please fill in all tracking fields');
      return;
    }

    try {
      updateOrderTracking(selectedOrderId, {
        tracking_number: trackingNumber,
        tracking_carrier: trackingCarrier,
        estimated_delivery: estimatedDelivery || undefined,
      });
      setMessage('✓ Tracking information updated');
      setTrackingNumber('');
      setTrackingCarrier('');
      setEstimatedDelivery('');
    } catch (error) {
      setMessage('Error updating tracking');
    }
  };

  const handleAddEvent = () => {
    if (!selectedOrderId || !eventStatus || !eventDescription) {
      setMessage('Please fill in status and description');
      return;
    }

    try {
      addTrackingEvent(selectedOrderId, {
        status: eventStatus as 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled',
        description: eventDescription,
        timestamp: new Date().toISOString(),
        location: eventLocation || undefined,
      });
      setMessage('✓ Tracking event added');
      setEventDescription('');
      setEventLocation('');
    } catch (error) {
      setMessage('Error adding tracking event');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-6">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Admin
          </Link>
          <h1 className="font-heading text-3xl tracking-[0.05em] font-light text-[#1A1A1A]">
            Manage Order Tracking
          </h1>
          <p className="text-sm text-[#8B8B8B] font-light mt-2">
            Update tracking information and add tracking events for customer orders
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded ${
              message.startsWith('✓') ? 'bg-[#D4E5E1] text-[#2D5C4E]' : 'bg-[#FFE5E5] text-[#A61E1E]'
            }`}
          >
            {message}
          </div>
        )}

        {/* Load orders button */}
        <div className="mb-8 bg-white border border-[#F0EDE9] p-6">
          <button
            onClick={handleLoadOrders}
            className="py-2 px-6 bg-[#1A1A1A] text-white text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#333] transition-colors"
          >
            Load All Orders
          </button>
        </div>

        {/* Orders list */}
        {orders.length > 0 && (
          <div className="mb-8 bg-white border border-[#F0EDE9] p-6">
            <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-4">
              Select an Order
            </h2>
            <select
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
            >
              <option value="">-- Choose an order --</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order {order.id.split('-')[0].toUpperCase()} • {order.customer_email} •{' '}
                  {new Date(order.created_at).toLocaleDateString('en-ZA')}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Update tracking form */}
        {selectedOrderId && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Tracking info */}
            <div className="bg-white border border-[#F0EDE9] p-6">
              <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
                Tracking Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] block mb-2">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g., 1Z999AA10123456784"
                    className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] block mb-2">
                    Carrier
                  </label>
                  <select
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                    className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
                  >
                    <option value="">-- Select carrier --</option>
                    <option value="DHL">DHL</option>
                    <option value="FedEx">FedEx</option>
                    <option value="UPS">UPS</option>
                    <option value="Aramex">Aramex</option>
                    <option value="PUDO">PUDO Point</option>
                    <option value="Local Delivery">Local Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] block mb-2">
                    Estimated Delivery (Optional)
                  </label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
                  />
                </div>

                <button
                  onClick={handleUpdateTracking}
                  className="w-full py-3 px-6 bg-[#1A1A1A] text-white text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#333] transition-colors"
                >
                  Update Tracking
                </button>
              </div>
            </div>

            {/* Add tracking event */}
            <div className="bg-white border border-[#F0EDE9] p-6">
              <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
                Add Tracking Event
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] block mb-2">
                    Status
                  </label>
                  <select
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value)}
                    className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] block mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="e.g., Package picked up by carrier"
                    rows={3}
                    className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#A0A0A0] block mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g., Johannesburg Distribution Center"
                    className="w-full p-3 border border-[#F0EDE9] rounded text-sm"
                  />
                </div>

                <button
                  onClick={handleAddEvent}
                  className="w-full py-3 px-6 bg-[#1A1A1A] text-white text-[11px] tracking-[0.2em] uppercase font-medium hover:bg-[#333] transition-colors"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
