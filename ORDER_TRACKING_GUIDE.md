# Order Tracking Implementation Guide

## Overview

Users can now track their orders with real-time status updates, estimated delivery dates, and detailed tracking events. The tracking system includes:

- **Customer-facing tracking page** - View order status with timeline of updates
- **Admin panel** - Manage tracking information and add status updates
- **Tracking utilities** - Helper functions for determining delivery status and progress

## Features Implemented

### 1. Order Tracking Data Structure

Extended `LocalOrder` type with tracking fields:
```typescript
tracking_number?: string | null;      // Carrier's tracking number
tracking_carrier?: string | null;     // Delivery carrier (DHL, FedEx, UPS, etc.)
estimated_delivery?: string | null;   // ISO date string
tracking_events?: OrderTrackingEvent[]; // Array of status updates
```

### 2. Tracking Status Events

Each tracking event contains:
```typescript
OrderTrackingEvent = {
  id: string;
  status: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  location?: string;
}
```

### 3. Pages and Routes

#### Customer Pages
- **`/order-tracking?id={orderId}`** - View order tracking details
  - Displays tracking timeline
  - Shows tracking number and carrier
  - Estimated delivery date
  - Order items and totals
  - Shipping address

#### Admin Pages  
- **`/admin/orders/tracking`** - Manage order tracking
  - Load all orders
  - Update tracking information
  - Add tracking events

### 4. Core Functions in `src/lib/localStore.ts`

```typescript
// Update tracking information
updateOrderTracking(orderId: string, trackingData: {
  tracking_number?: string;
  tracking_carrier?: string;
  estimated_delivery?: string;
})

// Add a tracking event (status update)
addTrackingEvent(orderId: string, event: Omit<OrderTrackingEvent, 'id'>)

// Retrieve tracking events
getTrackingEvents(orderId: string): OrderTrackingEvent[]

// Get latest status
getLatestTrackingEvent(orderId: string): OrderTrackingEvent | null
```

### 5. Tracking Utility Functions in `src/lib/trackingUtils.ts`

```typescript
// Get progress percentage (0-100)
getTrackingProgress(status: string): number

// Check if delivery is complete/cancelled
isTrackingCompleted(status: string): boolean

// Get next status in progression
getNextStatus(currentStatus: string): string | null

// Get days until delivery
getDaysUntilEstimatedDelivery(estimatedDeliveryDate: string): number

// Check if delivery is overdue
isDeliveryOverdue(estimatedDeliveryDate: string): boolean

// Format delivery date for display
formatEstimatedDelivery(estimatedDeliveryDate: string): string
```

### 6. Backend API Endpoints (in `server/index.js`)

#### POST `/api/orders/:orderId/tracking`
Update order tracking information.

```bash
curl -X POST http://localhost:3001/api/orders/abc-123/tracking \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_number": "1Z999AA10123456784",
    "tracking_carrier": "UPS",
    "estimated_delivery": "2026-05-15"
  }'
```

#### POST `/api/orders/:orderId/tracking/events`
Add a tracking event (status update).

```bash
curl -X POST http://localhost:3001/api/orders/abc-123/tracking/events \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "description": "Package picked up by carrier",
    "location": "Johannesburg Distribution Center"
  }'
```

#### GET `/api/orders/:orderId/tracking`
Retrieve order tracking information.

```bash
curl http://localhost:3001/api/orders/abc-123/tracking
```

## How to Use

### For Admins - Adding Tracking Information

1. Navigate to **Admin Dashboard** → **Manage Order Tracking**
2. Click **"Load All Orders"** to see all customer orders
3. Select an order from the dropdown
4. **Update Tracking Section:**
   - Enter tracking number (e.g., `1Z999AA10123456784`)
   - Select carrier from dropdown (DHL, FedEx, UPS, Aramex, PUDO, Local Delivery)
   - (Optional) Set estimated delivery date
   - Click **"Update Tracking"**
5. **Add Tracking Events Section:**
   - Select status from dropdown
   - Enter description of what happened
   - (Optional) Add location details
   - Click **"Add Event"**

### For Customers - Tracking Orders

1. Go to **My Account** 
2. Find your order in "Recent Orders"
3. Click **"Track"** button next to the order
4. View:
   - Current tracking status
   - Tracking number and carrier
   - Timeline of all tracking events
   - Estimated delivery date
   - Order items and shipping address

### For Developers - Programmatic Usage

```typescript
import { 
  updateOrderTracking, 
  addTrackingEvent,
  getTrackingEvents,
  getLatestTrackingEvent
} from '@/lib/localStore';

// When you receive payment confirmation
const order = getLocalOrder(orderId);

// Update with carrier info
updateOrderTracking(orderId, {
  tracking_number: '1Z999AA10123456784',
  tracking_carrier: 'UPS',
  estimated_delivery: '2026-05-15'
});

// Add initial event
addTrackingEvent(orderId, {
  status: 'processing',
  description: 'Order confirmed and payment received',
  timestamp: new Date().toISOString()
});

// Later, add more events
addTrackingEvent(orderId, {
  status: 'shipped',
  description: 'Package handed over to carrier',
  timestamp: new Date().toISOString(),
  location: 'JNB Distribution'
});

// Retrieve events
const events = getTrackingEvents(orderId);
const latest = getLatestTrackingEvent(orderId);
```

## Tracking Status Flow

```
Processing
    ↓
Shipped
    ↓
In Transit
    ↓
Out for Delivery
    ↓
Delivered (or Cancelled)
```

## UI Components

### Order Tracking Page (`OrderTrackingPage.tsx`)
- **Status Header** - Shows current status with color coding
- **Tracking Timeline** - Visual timeline of all events
- **Order Details** - Items, totals, dates
- **Shipping Address** - Delivery destination

### Admin Tracking Page (`AdminOrderTrackingPage.tsx`)
- **Order Selection** - Dropdown to choose order
- **Tracking Info Form** - Update carrier details
- **Event Form** - Add new tracking events
- **Status Messages** - Confirmation/error feedback

## Status Indicators

| Status | Icon | Color | Meaning |
|--------|------|-------|---------|
| Processing | Clock | Gray | Order being prepared |
| Shipped | Package | Gray | Handed to carrier |
| In Transit | Truck | Gray | On the way |
| Out for Delivery | Map Pin | Orange | Coming today |
| Delivered | Check Circle | Green | Successfully delivered |
| Cancelled | Alert | Red | Order cancelled |

## Integration Points

### OrderConfirmation Page
- Added **"Track Order"** link after successful payment
- Leads to tracking page with order ID

### AccountPage (My Account)
- Added **"Track"** button next to each order
- Quick access to tracking status

### AdminDashboardPage
- Added **"Manage Order Tracking"** button
- Links to admin tracking management interface

## Data Persistence

All tracking data is stored in `localStorage`:
- **Orders**: `giovanni_orders` key
- **Order items**: `giovanni_order_items_{orderId}` key
- **Tracking events**: Stored within order object

## Next Steps / Future Enhancements

1. **Database Integration**
   - Move from localStorage to Supabase/Database
   - Better performance and persistence

2. **Carrier API Integration**
   - Real-time tracking from DHL, UPS, etc.
   - Automatic status updates from carriers

3. **Email Notifications**
   - Send customers status update emails
   - Daily/immediate notifications

4. **SMS Notifications**
   - Send tracking updates via SMS
   - Delivery alerts

5. **Webhooks**
   - Receive carrier webhooks for real-time updates
   - Auto-sync with fulfillment system

6. **Advanced Features**
   - Proof of delivery photos
   - Delivery time windows
   - Redirect/re-delivery options
   - Return shipping tracking

## Testing

### Test Creating a Tracked Order

```typescript
// 1. Create an order (happens in checkout)
const { order, orderItems } = createLocalOrder({
  customer: {
    name: "Test User",
    email: "test@example.com",
    phone: "+27123456789",
    address: "123 Main St",
    city: "Johannesburg",
  },
  items: [
    {
      product_id: "p-black-oversized",
      name: "GIOVANNI Core - Black",
      quantity: 1,
      price: 169900,
    }
  ],
  subtotal: 169900,
  shipping: 5000,
  tax: 2549,
  total: 177449,
  status: 'paid',
});

// 2. Add tracking info (admin)
updateOrderTracking(order.id, {
  tracking_number: "1Z999AA10123456784",
  tracking_carrier: "UPS",
  estimated_delivery: "2026-05-15"
});

// 3. Add tracking events
addTrackingEvent(order.id, {
  status: 'processing',
  description: 'Order confirmed and being prepared',
  timestamp: new Date().toISOString()
});

addTrackingEvent(order.id, {
  status: 'shipped',
  description: 'Package handed to UPS',
  timestamp: new Date().toISOString(),
  location: 'Johannesburg, South Africa'
});

// 4. View on tracking page
// Navigate to: /order-tracking?id={order.id}
```

## Styling

All tracking components use the existing Giovanni design system:
- **Colors**: #1A1A1A (black), #8B8B8B (gray), #D4E5E1 (sage), #FAFAF8 (off-white)
- **Typography**: Font heading for titles, regular for body
- **Spacing**: Consistent with existing component spacing
- **Icons**: Lucide React icons

## Files Modified/Created

### Created
- `src/pages/OrderTrackingPage.tsx` - Customer tracking page
- `src/pages/AdminOrderTrackingPage.tsx` - Admin tracking management
- `src/lib/trackingUtils.ts` - Tracking helper functions

### Modified
- `src/lib/localStore.ts` - Added tracking types and functions
- `src/pages/OrderConfirmation.tsx` - Added track order link
- `src/pages/AccountPage.tsx` - Added track buttons
- `src/HomePage.tsx` - Added routes for tracking pages
- `src/pages/AdminDashboardPage.tsx` - Added tracking management link
- `server/index.js` - Added tracking API endpoints

## Troubleshooting

### Orders not loading in admin panel
- Check browser's localStorage
- Ensure orders exist with payment status 'paid'
- Refresh the page

### Tracking information not saving
- Check browser console for errors
- Ensure localStorage is enabled
- Check available storage space

### Events not appearing in timeline
- Verify event was successfully added
- Check localStorage: `localStorage.getItem('giovanni_orders')`
- Refresh the order tracking page

### Wrong delivery date calculation
- Verify ISO date format (YYYY-MM-DD)
- Check browser timezone settings
- Use `formatEstimatedDelivery()` for consistent formatting
