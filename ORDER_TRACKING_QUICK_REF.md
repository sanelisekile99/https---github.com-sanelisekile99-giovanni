# Order Tracking - Quick Reference

## 🎯 Quick Navigation

### For Customers
| Feature | URL | Access |
|---------|-----|--------|
| Track Order | `/order-tracking?id={orderId}` | After checkout or from My Account |
| My Orders | `/account` | View all orders + track buttons |
| Order Details | `/order-confirmation?id={orderId}` | View full order info |

### For Admins
| Feature | URL | Access |
|---------|-----|--------|
| Admin Dashboard | `/admin` | Main control center |
| Manage Tracking | `/admin/orders/tracking` | Update tracking info & events |

---

## 📋 Implementation Checklist

### Frontend Components
- ✅ `OrderTrackingPage.tsx` - Customer tracking view
- ✅ `AdminOrderTrackingPage.tsx` - Admin management interface
- ✅ `trackingUtils.ts` - Helper functions
- ✅ Routes added to `HomePage.tsx`
- ✅ Links added to `OrderConfirmation.tsx`
- ✅ Buttons added to `AccountPage.tsx`
- ✅ Admin button added to `AdminDashboardPage.tsx`

### Backend
- ✅ `POST /api/orders/:orderId/tracking` - Update tracking
- ✅ `POST /api/orders/:orderId/tracking/events` - Add events
- ✅ `GET /api/orders/:orderId/tracking` - Retrieve tracking

### Data Model
- ✅ Extended `LocalOrder` type
- ✅ Added `OrderTrackingEvent` type
- ✅ Added tracking functions to localStore

### Documentation
- ✅ `ORDER_TRACKING_GUIDE.md` - Full guide
- ✅ `ORDER_TRACKING_SETUP.md` - Setup summary
- ✅ `ORDER_TRACKING_QUICK_REF.md` - This file

---

## 🎨 UI Flows

### Customer Tracking Flow
```
Place Order → Confirmation Page → "Track Order" Link
                                      ↓
                            Order Tracking Page
                            ├─ Current Status
                            ├─ Tracking Number
                            ├─ Carrier Info
                            ├─ Estimated Delivery
                            ├─ Timeline of Events
                            ├─ Order Items
                            └─ Shipping Address
```

### Admin Tracking Flow
```
Admin Dashboard → "Manage Order Tracking" Button
                            ↓
                    Order Tracking Admin Page
                    ├─ Load All Orders
                    ├─ Select Order
                    ├─ Update Tracking Info
                    │  ├─ Tracking Number
                    │  ├─ Carrier (dropdown)
                    │  └─ Estimated Delivery
                    └─ Add Tracking Events
                       ├─ Status (dropdown)
                       ├─ Description
                       └─ Location (optional)
```

---

## 🔄 Tracking Statuses

```
🕐 Processing
  └─ Order confirmed, being prepared
  
📦 Shipped
  └─ Handed to carrier
  
🚚 In Transit
  └─ On the way to customer
  
📍 Out for Delivery
  └─ Arriving today/this shift
  
✅ Delivered
  └─ Successfully received
  
❌ Cancelled
  └─ Order cancelled
```

---

## 💾 Local Storage Keys

```javascript
// Orders list
localStorage.getItem('giovanni_orders')

// Individual order items
localStorage.getItem('giovanni_order_items_{orderId}')

// Example: Get tracking data
const orders = JSON.parse(localStorage.getItem('giovanni_orders') || '[]');
const order = orders.find(o => o.id === orderId);
console.log(order.tracking_number);
console.log(order.tracking_events);
```

---

## 🔌 API Quick Reference

### Update Tracking Info
```bash
POST /api/orders/abc-123/tracking
Content-Type: application/json

{
  "tracking_number": "1Z999AA10123456784",
  "tracking_carrier": "UPS",
  "estimated_delivery": "2026-05-15"
}
```

### Add Tracking Event
```bash
POST /api/orders/abc-123/tracking/events
Content-Type: application/json

{
  "status": "shipped",
  "description": "Package picked up by carrier",
  "location": "Johannesburg Hub"
}
```

### Get Tracking Info
```bash
GET /api/orders/abc-123/tracking
```

---

## 🛠️ Developer Functions

### Import tracking functions
```typescript
import {
  updateOrderTracking,
  addTrackingEvent,
  getTrackingEvents,
  getLatestTrackingEvent
} from '@/lib/localStore';

import {
  getTrackingProgress,
  isTrackingCompleted,
  getNextStatus,
  getDaysUntilEstimatedDelivery,
  isDeliveryOverdue,
  formatEstimatedDelivery
} from '@/lib/trackingUtils';
```

### Update tracking
```typescript
updateOrderTracking(orderId, {
  tracking_number: '1Z999AA10123456784',
  tracking_carrier: 'UPS',
  estimated_delivery: '2026-05-15'
});
```

### Add event
```typescript
addTrackingEvent(orderId, {
  status: 'shipped',
  description: 'Package shipped',
  location: 'JNB Hub',
  timestamp: new Date().toISOString()
});
```

### Get events
```typescript
const events = getTrackingEvents(orderId);
const latest = getLatestTrackingEvent(orderId);
```

### Utility functions
```typescript
getTrackingProgress('shipped');        // Returns 50 (%)
isTrackingCompleted('delivered');      // Returns true
getNextStatus('in_transit');           // Returns 'out_for_delivery'
getDaysUntilEstimatedDelivery(date);   // Returns 3 (days)
isDeliveryOverdue(date);               // Returns false
formatEstimatedDelivery(date);         // Returns "In 3 days"
```

---

## 🧪 Testing Scenario

### Create & Track an Order

1. **Create order** (checkout flow)
   ```typescript
   const { order } = createLocalOrder({
     customer: { name, email, phone, address, city },
     items: [{ product_id, name, quantity, price }],
     subtotal, shipping, tax, total,
     status: 'paid'
   });
   ```

2. **Admin adds tracking**
   ```typescript
   updateOrderTracking(order.id, {
     tracking_number: '1Z999AA10123456784',
     tracking_carrier: 'UPS',
     estimated_delivery: '2026-05-15'
   });
   ```

3. **Admin adds events**
   ```typescript
   addTrackingEvent(order.id, {
     status: 'processing',
     description: 'Order confirmed',
     timestamp: new Date().toISOString()
   });
   
   addTrackingEvent(order.id, {
     status: 'shipped',
     description: 'Package picked up',
     location: 'Johannesburg',
     timestamp: new Date().toISOString()
   });
   ```

4. **Customer views**
   - Navigate to: `/order-tracking?id={order.id}`
   - Sees: Timeline, carrier info, delivery date
   - Or: Click "Track" from `/account`

---

## 📱 Mobile Optimization

All tracking pages are fully responsive:
- ✅ Timeline adapts for small screens
- ✅ Two-column layout becomes single column
- ✅ Forms stack vertically
- ✅ Touch-friendly buttons
- ✅ Readable on all sizes

---

## 🎯 Color Coding

| Status | Color | Hex |
|--------|-------|-----|
| Primary Text | Black | #1A1A1A |
| Secondary Text | Gray | #8B8B8B |
| Success (Delivered) | Green | #4CAF50 |
| Warning (Out for Delivery) | Orange | #FFA500 |
| Error (Cancelled) | Red | #E74C3C |
| Background | Off-white | #FAFAF8 |
| Border | Light | #F0EDE9 |

---

## 📊 Features Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Customer tracking page | ✅ Complete | `/order-tracking?id=...` |
| Admin management | ✅ Complete | `/admin/orders/tracking` |
| Update tracking info | ✅ Complete | Carrier, number, date |
| Add tracking events | ✅ Complete | Status, description, location |
| Timeline display | ✅ Complete | Visual event history |
| Mobile responsive | ✅ Complete | All devices |
| Email notifications | ⏳ Future | Send status updates |
| SMS alerts | ⏳ Future | Delivery notifications |
| Carrier API sync | ⏳ Future | Real-time tracking |
| Database persistence | ⏳ Future | Supabase/Database |

---

## 🚀 Getting Started

### For Customers
1. Place an order and pay
2. Click "Track Order" on confirmation page
3. Monitor delivery progress in real-time

### For Admins
1. Go to Admin Dashboard
2. Click "Manage Order Tracking"
3. Select an order
4. Enter carrier info and add status updates
5. Customer sees updates automatically

### For Developers
1. Import functions from `@/lib/localStore`
2. Use `updateOrderTracking()` to set carrier info
3. Use `addTrackingEvent()` to log status changes
4. Use utility functions for progress calculations

---

**Last Updated**: May 10, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
