import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ClientAccountProvider } from "@/contexts/ClientAccountContext";
import Index from "./pages/Index";
import ShopPage from "./pages/ShopPage";
import CollectionPage from "./pages/CollectionPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import WishlistPage from "./pages/WishlistPage";
import AccountPage from "./pages/AccountPage";
import AccountAuthPage from "./pages/AccountAuthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DebugProducts from "./pages/DebugProducts";
import NotFound from "./pages/NotFound";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

const queryClient = new QueryClient();

export default function HomePage() {
  return (
    <ThemeProvider defaultTheme="light">
      <ClientAccountProvider>
        <WishlistProvider>
          <CartProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/collections/:handle" element={<CollectionPage />} />
                    <Route path="/product/:handle" element={<ProductPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/account/auth" element={<AccountAuthPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route
                      path="/admin"
                      element={
                        <AdminProtectedRoute>
                          <AdminDashboardPage />
                        </AdminProtectedRoute>
                      }
                    />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                    <Route path="/debug-products" element={<DebugProducts />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </QueryClientProvider>
          </CartProvider>
        </WishlistProvider>
      </ClientAccountProvider>
    </ThemeProvider>
  );
}
