import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useClientAccount } from '@/contexts/ClientAccountContext';
import { getLocalOrdersByCustomerEmail } from '@/lib/localStore.generated';

const formatPrice = (cents: number) => `R ${(cents / 100).toLocaleString('en-ZA')}`;

export default function AccountPage() {
  const navigate = useNavigate();
  const { currentClient, isAuthenticated, logoutClient } = useClientAccount();

  const orders = currentClient ? getLocalOrdersByCustomerEmail(currentClient.email) : [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="h-[calc(2.5rem+5rem)]" />

      <div className="bg-[#FAFAF8] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#A0A0A0] mb-2">Client Area</p>
          <h1 className="font-heading text-3xl lg:text-4xl tracking-[0.05em] font-light text-[#1A1A1A]">
            My Account
          </h1>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 lg:px-12 py-10 lg:py-14">
        {!isAuthenticated || !currentClient ? (
          <div className="text-center py-16">
            <p className="text-lg text-[#8B8B8B] font-light mb-5">You are not signed in.</p>
            <Link
              to="/account/auth"
              className="inline-block py-3 px-8 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[340px_1fr] gap-8">
            <aside className="bg-[#FAFAF8] p-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#A0A0A0] mb-3">Profile</p>
              <h2 className="font-heading text-2xl tracking-[0.05em] font-light text-[#1A1A1A] mb-1">
                {currentClient.name}
              </h2>
              <p className="text-sm text-[#5A5A5A] font-light mb-6">{currentClient.email}</p>
              {typeof currentClient.birthdayMonth === 'number' && typeof currentClient.birthdayDay === 'number' && (
                <p className="text-xs text-[#8B8B8B] font-light mb-6 tracking-[0.08em] uppercase">
                  Birthday: {String(currentClient.birthdayMonth).padStart(2, '0')}/{String(currentClient.birthdayDay).padStart(2, '0')}
                </p>
              )}

              <button
                onClick={async () => {
                  await logoutClient();
                  navigate('/account/auth');
                }}
                className="text-[11px] tracking-[0.2em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors"
              >
                Sign Out
              </button>
            </aside>

            <section>
              <h3 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-5">
                Recent Orders
              </h3>

              {orders.length === 0 ? (
                <div className="border border-[#F0EDE9] p-8 text-center">
                  <p className="text-[#8B8B8B] font-light mb-4">No orders yet.</p>
                  <Link
                    to="/shop"
                    className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-[#F0EDE9] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <p className="text-[11px] tracking-[0.15em] uppercase text-[#8B8B8B]">
                          Order {order.id.split('-')[0]}
                        </p>
                        <p className="text-sm text-[#1A1A1A] font-medium">{formatPrice(order.total)}</p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[#8B8B8B] font-light">
                          {new Date(order.created_at).toLocaleDateString('en-ZA')}
                        </p>
                        <Link
                          to={`/order-confirmation?id=${order.id}`}
                          className="text-[11px] tracking-[0.2em] uppercase text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5"
                        >
                          View Order
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
