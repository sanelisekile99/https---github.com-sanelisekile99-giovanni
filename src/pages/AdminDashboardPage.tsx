import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  getAllLocalOrders,
  getLocalOrderItems,
  getProducts,
  type LocalOrder,
  type LocalOrderItem,
} from '@/lib/localStore.generated';
import { logoutAdmin } from '@/lib/adminAuth';

const formatPrice = (cents: number) => `R ${(cents / 100).toLocaleString('en-ZA')}`;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LocalOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const refreshOrders = () => setOrders(getAllLocalOrders());
    refreshOrders();

    window.addEventListener('storage', refreshOrders);
    return () => window.removeEventListener('storage', refreshOrders);
  }, []);

  const products = useMemo(() => getProducts(), []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total || 0), 0),
    [orders],
  );

  const averageOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const lowStockCount = products.filter(product => (product.inventory_qty ?? 0) <= 5).length;

  // Customer analysis
  const customerAnalysis = useMemo(() => {
    const customerMap = new Map<string, { orders: LocalOrder[]; totalSpent: number; firstOrder: string; lastOrder: string }>();

    orders.forEach((order) => {
      const email = order.customer_email;
      const existing = customerMap.get(email);
      if (existing) {
        existing.orders.push(order);
        existing.totalSpent += order.total;
        existing.lastOrder = order.created_at > existing.lastOrder ? order.created_at : existing.lastOrder;
      } else {
        customerMap.set(email, {
          orders: [order],
          totalSpent: order.total,
          firstOrder: order.created_at,
          lastOrder: order.created_at,
        });
      }
    });

    const customers = Array.from(customerMap.entries()).map(([email, data]) => ({
      email,
      orderCount: data.orders.length,
      totalSpent: data.totalSpent,
      averageOrderValue: Math.round(data.totalSpent / data.orders.length),
      firstOrder: data.firstOrder,
      lastOrder: data.lastOrder,
    }));

    const uniqueCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.orderCount > 1).length;
    const averageCustomerLifetimeValue = customers.length ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length) : 0;

    return {
      uniqueCustomers,
      repeatCustomers,
      repeatCustomerRate: uniqueCustomers ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0,
      averageCustomerLifetimeValue,
      topCustomers: customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5),
      customers,
    };
  }, [orders]);

  // Revenue analysis by time periods
  const revenueAnalysis = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const last30Days = orders.filter(order => new Date(order.created_at) >= thirtyDaysAgo);
    const last7Days = orders.filter(order => new Date(order.created_at) >= sevenDaysAgo);

    const revenue30Days = last30Days.reduce((sum, order) => sum + order.total, 0);
    const revenue7Days = last7Days.reduce((sum, order) => sum + order.total, 0);

    return {
      revenue30Days,
      revenue7Days,
      orders30Days: last30Days.length,
      orders7Days: last7Days.length,
    };
  }, [orders]);

  // Customer acquisition over time (last 30 days)
  const customerAcquisition = useMemo(() => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newCustomersByDay = new Map<string, number>();

    customerAnalysis.customers.forEach(customer => {
      const firstOrderDate = new Date(customer.firstOrder);
      if (firstOrderDate >= thirtyDaysAgo) {
        const day = firstOrderDate.toISOString().slice(0, 10);
        newCustomersByDay.set(day, (newCustomersByDay.get(day) || 0) + 1);
      }
    });

    return Array.from(newCustomersByDay.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
  }, [customerAnalysis.customers]);

  const ordersByDate = useMemo(() => {
    const map = new Map<string, number>();

    orders.forEach((order) => {
      const day = new Date(order.created_at).toISOString().slice(0, 10);
      map.set(day, (map.get(day) || 0) + 1);
    });

    return [...map.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7);
  }, [orders]);

  const topSellingProducts = useMemo(() => {
    const quantityMap = new Map<string, number>();
    const productsById = new Map(products.map(product => [product.id, product]));

    orders.forEach((order) => {
      const items = getLocalOrderItems(order.id);
      items.forEach((item) => {
        quantityMap.set(item.product_id, (quantityMap.get(item.product_id) || 0) + item.quantity);
      });
    });

    return [...quantityMap.entries()]
      .map(([productId, quantity]) => ({
        productId,
        quantity,
        product: productsById.get(productId),
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders, products]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8),
    [orders],
  );

  const allOrders = useMemo(
    () => [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [orders],
  );

  // Get order items for each order
  const getOrderItems = (orderId: string) => getLocalOrderItems(orderId);

  // Get order summary for display
  const getOrderSummary = (order: LocalOrder) => {
    const items = getOrderItems(order.id);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    return {
      itemCount,
      items,
    };
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Header />

      <div className="h-[calc(2.5rem+5rem)]" />

      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#8B8B8B] mb-2">Control Center</p>
            <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.06em] font-light text-[#1A1A1A]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#6A6A6A] font-light mt-3">
              Monitor orders, revenue, and inventory performance.
            </p>
          </div>

          <button
            onClick={() => {
              logoutAdmin();
              navigate('/admin/login', { replace: true });
            }}
            className="h-10 px-5 border border-[#1A1A1A] text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            Logout Admin
          </button>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-10">
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Revenue</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{formatPrice(totalRevenue)}</p>
          </div>
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Orders</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{orders.length}</p>
          </div>
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Avg. Order Value</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{formatPrice(averageOrderValue)}</p>
          </div>
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Low Stock</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{lowStockCount}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-10">
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Unique Customers</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{customerAnalysis.uniqueCustomers}</p>
          </div>
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Repeat Customers</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{customerAnalysis.repeatCustomers}</p>
            <p className="text-[9px] text-[#8B8B8B] mt-1">{customerAnalysis.repeatCustomerRate}% rate</p>
          </div>
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Avg. Customer Value</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{formatPrice(customerAnalysis.averageCustomerLifetimeValue)}</p>
          </div>
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <p className="text-[10px] tracking-[0.22em] uppercase text-[#8B8B8B] mb-3">Revenue (30 Days)</p>
            <p className="font-heading text-2xl tracking-[0.03em] text-[#1A1A1A] font-light">{formatPrice(revenueAnalysis.revenue30Days)}</p>
            <p className="text-[9px] text-[#8B8B8B] mt-1">{revenueAnalysis.orders30Days} orders</p>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8 mb-10">
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A]">All Orders</h2>
              <span className="text-[10px] text-[#8B8B8B]">{allOrders.length} total</span>
            </div>

            {allOrders.length === 0 ? (
              <p className="text-sm text-[#8B8B8B] font-light">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full min-w-[700px]">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-[#F1EEEA]">
                      <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Order ID</th>
                      <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Customer</th>
                      <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Date</th>
                      <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Items</th>
                      <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Status</th>
                      <th className="text-right py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Total</th>
                      <th className="text-center py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order) => {
                      const summary = getOrderSummary(order);
                      return (
                        <tr key={order.id} className="border-b border-[#F6F3EF] last:border-b-0 hover:bg-[#FAFAF8]">
                          <td className="py-3 text-xs text-[#5A5A5A] font-light">#{order.id.slice(0, 8)}</td>
                          <td className="py-3 text-xs text-[#1A1A1A] max-w-32 truncate">{order.customer_email}</td>
                          <td className="py-3 text-xs text-[#5A5A5A] font-light">
                            {new Date(order.created_at).toLocaleDateString('en-ZA')}
                          </td>
                          <td className="py-3 text-xs text-[#5A5A5A] font-light">{summary.itemCount} items</td>
                          <td className="py-3 text-xs text-[#1A1A1A] capitalize">{order.status}</td>
                          <td className="py-3 text-xs text-[#1A1A1A] text-right font-medium">{formatPrice(order.total)}</td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowOrderDetails(true);
                              }}
                              className="text-[10px] text-[#8B8B8B] hover:text-[#1A1A1A] underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
              <h2 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Top Customers</h2>
              {customerAnalysis.topCustomers.length === 0 ? (
                <p className="text-sm text-[#8B8B8B] font-light">No customer data yet.</p>
              ) : (
                <ul className="space-y-3">
                  {customerAnalysis.topCustomers.map((customer, index) => (
                    <li key={customer.email} className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1A1A] leading-snug truncate">{customer.email}</p>
                        <p className="text-[11px] text-[#8B8B8B]">{customer.orderCount} orders</p>
                      </div>
                      <span className="text-[11px] tracking-[0.16em] uppercase text-[#8B8B8B] whitespace-nowrap">
                        {formatPrice(customer.totalSpent)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
              <h2 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Orders (Last 7 Days)</h2>
              {ordersByDate.length === 0 ? (
                <p className="text-sm text-[#8B8B8B] font-light">No recent orders.</p>
              ) : (
                <ul className="space-y-2">
                  {ordersByDate.map(([date, count]) => (
                    <li key={date} className="flex items-center justify-between border-b border-[#F6F3EF] py-2 last:border-b-0">
                      <span className="text-sm text-[#5A5A5A] font-light">{new Date(date).toLocaleDateString('en-ZA')}</span>
                      <span className="text-sm text-[#1A1A1A]">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1fr_1fr] gap-6 lg:gap-8 mb-10">
          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <h2 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Top Products</h2>
            {topSellingProducts.length === 0 ? (
              <p className="text-sm text-[#8B8B8B] font-light">No sales data yet.</p>
            ) : (
              <ul className="space-y-3">
                {topSellingProducts.map((entry) => (
                  <li key={entry.productId} className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[#1A1A1A] leading-snug">{entry.product?.name || 'Unknown product'}</p>
                    <span className="text-[11px] tracking-[0.16em] uppercase text-[#8B8B8B] whitespace-nowrap">
                      {entry.quantity} sold
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-[#ECE8E3] p-5 lg:p-6">
            <h2 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">New Customers (Last 7 Days)</h2>
            {customerAcquisition.length === 0 ? (
              <p className="text-sm text-[#8B8B8B] font-light">No new customers recently.</p>
            ) : (
              <ul className="space-y-2">
                {customerAcquisition.map(([date, count]) => (
                  <li key={date} className="flex items-center justify-between border-b border-[#F6F3EF] py-2 last:border-b-0">
                    <span className="text-sm text-[#5A5A5A] font-light">{new Date(date).toLocaleDateString('en-ZA')}</span>
                    <span className="text-sm text-[#1A1A1A]">{count} new</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-heading font-light text-[#1A1A1A]">
                  Order #{selectedOrder.id.slice(0, 8)}
                </h2>
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    setSelectedOrder(null);
                  }}
                  className="text-[#8B8B8B] hover:text-[#1A1A1A] text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8B8B8B]">Order ID:</span>
                      <span className="text-[#1A1A1A] font-mono">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B8B8B]">Date:</span>
                      <span className="text-[#1A1A1A]">
                        {new Date(selectedOrder.created_at).toLocaleString('en-ZA')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B8B8B]">Status:</span>
                      <span className="text-[#1A1A1A] capitalize">{selectedOrder.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B8B8B]">Payment ID:</span>
                      <span className="text-[#1A1A1A] font-mono text-xs">{selectedOrder.payment_intent_id}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#8B8B8B]">Customer ID:</span>
                      <span className="text-[#1A1A1A] font-mono">{selectedOrder.customer_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B8B8B]">Email:</span>
                      <span className="text-[#1A1A1A]">{selectedOrder.customer_email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Shipping Address</h3>
                <div className="bg-[#FAFAF8] p-4 rounded text-sm">
                  {Object.entries(selectedOrder.shipping_address).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-[#8B8B8B] capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="text-[#1A1A1A]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[11px] tracking-[0.22em] uppercase font-medium text-[#1A1A1A] mb-4">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#F1EEEA]">
                        <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Product</th>
                        <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Variant</th>
                        <th className="text-left py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">SKU</th>
                        <th className="text-center py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Qty</th>
                        <th className="text-right py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Unit Price</th>
                        <th className="text-right py-3 text-[10px] tracking-[0.16em] uppercase text-[#8B8B8B] font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getOrderItems(selectedOrder.id).map((item) => (
                        <tr key={item.id} className="border-b border-[#F6F3EF] last:border-b-0">
                          <td className="py-3 text-sm text-[#1A1A1A]">{item.product_name}</td>
                          <td className="py-3 text-sm text-[#5A5A5A]">{item.variant_title || '-'}</td>
                          <td className="py-3 text-sm text-[#5A5A5A] font-mono">{item.sku || '-'}</td>
                          <td className="py-3 text-sm text-[#1A1A1A] text-center">{item.quantity}</td>
                          <td className="py-3 text-sm text-[#1A1A1A] text-right">{formatPrice(item.unit_price)}</td>
                          <td className="py-3 text-sm text-[#1A1A1A] text-right font-medium">{formatPrice(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-[#F1EEEA] pt-6">
                <div className="flex justify-end">
                  <div className="text-right space-y-1">
                    <div className="flex justify-between w-48 text-sm">
                      <span className="text-[#8B8B8B]">Subtotal:</span>
                      <span className="text-[#1A1A1A]">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between w-48 text-sm">
                      <span className="text-[#8B8B8B]">Tax:</span>
                      <span className="text-[#1A1A1A]">{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between w-48 text-sm">
                      <span className="text-[#8B8B8B]">Shipping:</span>
                      <span className="text-[#1A1A1A]">{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between w-48 text-sm font-medium border-t border-[#F1EEEA] pt-1">
                      <span className="text-[#1A1A1A]">Total:</span>
                      <span className="text-[#1A1A1A]">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}