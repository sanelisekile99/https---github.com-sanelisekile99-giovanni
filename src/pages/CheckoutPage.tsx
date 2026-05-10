// Yoco SDK interfaces (for type safety)
interface YocoInlineConfig {
  publicKey: string;
  amountInCents: number;
  currency: 'ZAR' | 'MUR';
  amount?: number;
  layout?: 'plain' | 'basic' | 'field';
}

interface YocoInlineInstance {
  mount: (element: HTMLElement) => void;
  tokenize: () => Promise<{ token?: string; error?: { message: string } }>;
}

// Extend window interface for Yoco SDK
declare global {
  interface Window {
    YocoSDK?: { Inline: new (config: YocoInlineConfig) => YocoInlineInstance };
    yocoSdkLoaded?: boolean;
    yocoSdkError?: boolean;
  }
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useClientAccount } from '@/contexts/ClientAccountContext';
import { ChevronLeft, Lock, Check, Loader2 } from 'lucide-react';
import { createLocalOrder, getProductByHandle, getProducts, updateLocalOrder } from '@/lib/localStore';

// ── Helpers ──────────────────────────────────────────────────────────
const formatPrice = (cents: number) => `R ${(cents / 100).toLocaleString('en-ZA')}`;

const SA_PROVINCES_AND_CITIES: Record<string, string[]> = {
  'Eastern Cape': ['Gqeberha', 'East London', 'Mthatha', 'Grahamstown'],
  'Free State': ['Bloemfontein', 'Welkom', 'Bethlehem', 'Sasolburg'],
  Gauteng: ['Johannesburg', 'Pretoria', 'Soweto', 'Midrand'],
  'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Newcastle'],
  Limpopo: ['Polokwane', 'Tzaneen', 'Thohoyandou', 'Mokopane'],
  Mpumalanga: ['Mbombela', 'Witbank', 'Secunda', 'Middelburg'],
  'North West': ['Mahikeng', 'Rustenburg', 'Klerksdorp', 'Potchefstroom'],
  'Northern Cape': ['Kimberley', 'Upington', 'Kuruman', 'Springbok'],
  'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George'],
};

const SA_PROVINCES = Object.keys(SA_PROVINCES_AND_CITIES);

// ── Main checkout page ───────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { currentClient, isAuthenticated } = useClientAccount();

  const [step, setStep] = useState<'shipping' | 'review'>('shipping');
  const [processing, setProcessing] = useState(false);

  // Shipping address
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'South Africa',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const availableCities = SA_PROVINCES_AND_CITIES[shippingAddress.state] || [];

  // Costs
  const [shippingCost, setShippingCost] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [costsLoading, setCostsLoading] = useState(false);

  // Payment form state
  const [paymentError, setPaymentError] = useState('');
  
  // Card form fields
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Yoco payment state
  const [yocoLoading, setYocoLoading] = useState(false);
  const [yocoError, setYocoError] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // ── Derived values (computed early for use in effects) ─────────
  const subtotal = cartTotal;
  const total = subtotal + shippingCost + tax;

  // (Popup removed) Payment flow will create the order after payment initiation.

  // ── Validate shipping form ──────────────────────────────────────
  const validateShipping = useCallback(() => {
    const e: Record<string, string> = {};
    if (!shippingAddress.name.trim()) e.name = 'Name is required';
    if (!shippingAddress.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingAddress.email)) e.email = 'Invalid email';
    if (!shippingAddress.phone.trim()) e.phone = 'Phone is required';
    if (!shippingAddress.address.trim()) e.address = 'Address is required';
    if (!shippingAddress.city.trim()) e.city = 'City is required';
    if (!shippingAddress.state.trim()) e.state = 'Province is required';
    if (!shippingAddress.zip.trim()) e.zip = 'Postal code is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [shippingAddress]);

  // ── Move to review: calculate shipping + tax + create PaymentIntent
  const handleContinueToReview = useCallback(async () => {
    if (!validateShipping()) return;

    // Validate that all products with variants have a variant selected
    const productsWithVariants = cart.filter(item => {
      const product = getProducts().find(p => p.id === item.product_id);
      return product?.has_variants && !item.variant_id;
    });

    if (productsWithVariants.length > 0) {
      setPaymentError('Please select a size for all products before continuing.');
      return;
    }

    setCostsLoading(true);
    setPaymentError('');
    setStep('review');
    window.scrollTo(0, 0);

    // Calculate South African VAT (15% on subtotal)
    const vatRate = 0.15;
    const calculatedTax = Math.round(cartTotal * vatRate);

    setShippingCost(0);
    setTax(calculatedTax);
    setTaxRate(vatRate);
    setCostsLoading(false);
  }, [validateShipping, cartTotal, cart]);

  const handlePlaceOrder = async () => {
    console.log('[Checkout] handlePlaceOrder called');
    
    if (!validateShipping()) {
      console.log('[Checkout] Shipping validation failed');
      return;
    }

    // Validate card inputs
    if (!cardholderName.trim()) {
      setPaymentError('Please enter cardholder name');
      console.log('[Checkout] Missing cardholder name');
      return;
    }
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 13) {
      setPaymentError('Please enter a valid card number');
      console.log('[Checkout] Invalid card number length:', cleanCardNumber.length);
      return;
    }
    if (!expiryMonth || !expiryYear) {
      setPaymentError('Please enter card expiry date');
      console.log('[Checkout] Missing expiry date');
      return;
    }
    if (!cvv || cvv.length < 3) {
      setPaymentError('Please enter a valid CVV');
      console.log('[Checkout] Invalid CVV length:', cvv.length);
      return;
    }

    console.log('[Checkout] Card validation passed, starting payment');
    setProcessing(true);
    setPaymentError('');

    try {
      const subtotal = cartTotal;
      const shipping = 0;
      const taxCents = tax;
      const totalAmount = subtotal + shipping + taxCents;

      console.log('[Checkout] Payment amounts:', { subtotal, shipping, taxCents, totalAmount });

      // Yoco requires integer amounts in cents.
      const amount = Number.isFinite(totalAmount) ? Math.round(totalAmount) : NaN;
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('Invalid order total. Please refresh and try again.');
      }

      console.log('[Checkout] Creating local order...');
      // Create local order
      const localOrder = createLocalOrder({
        customer: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        },
        items: cart.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          variant_title: item.variant_title,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        shipping,
        tax: taxCents,
        total: totalAmount,
        paymentIntentId: '',
        status: 'awaiting_payment',
        paymentStatus: 'pending',
        orderStatus: 'awaiting_payment',
        shippingAddress,
      });

      const orderId = localOrder.order.id;
      console.log('[Checkout] Order created:', orderId, 'Full object:', localOrder);
      
      if (!orderId) {
        throw new Error('Failed to create order - no ID returned');
      }
      
      setCurrentOrderId(orderId);
      setYocoLoading(true);

      // Send card details to backend for tokenization and payment
      console.log('[Checkout] Sending card details to backend for processing...');
      
      const chargeUrl = '/api/payments/charge';
      console.log('[Checkout] Sending payment request to:', chargeUrl);
      
      const requestPayload = {
        amountInCents: amount,
        currency: 'ZAR',
        cardNumber: cleanCardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        metadata: {
          orderId: orderId,
          customerEmail: shippingAddress.email,
        },
      };
      
      console.log('[Checkout] Payment request payload:', { ...requestPayload, cardNumber: 'REDACTED', cvv: 'REDACTED' });

      const chargeResponse = await fetch(chargeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('[Checkout] Payment response status:', chargeResponse.status);
      
      let chargeData;
      try {
        chargeData = await chargeResponse.json();
      } catch (parseError) {
        console.error('[Checkout] Failed to parse response:', parseError);
        throw new Error('Invalid response from payment server');
      }

      console.log('[Checkout] Payment response data:', chargeData);

      if (!chargeResponse.ok) {
        const errorMsg = chargeData?.message || chargeData?.error || 'Payment processing failed';
        console.error('[Checkout] Payment API error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('[Checkout] Payment successful:', chargeData);

      // Update order with payment info
      try {
        updateLocalOrder(orderId, {
          paymentStatus: 'paid',
        });
        console.log('[Checkout] Order updated with payment status');
      } catch (updateError) {
        console.error('[Checkout] Failed to update order:', updateError);
        // Don't throw - payment was successful, just redirect anyway
      }

      // Redirect to success page
      console.log('[Checkout] Redirecting to order confirmation');
      setYocoLoading(false);
      setProcessing(false);
      window.location.href = `/order-confirmation?id=${orderId}&status=success`;
    } catch (error) {
      console.error('[Checkout] Payment error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      console.error('[Checkout] Error message:', errorMsg);
      setPaymentError(errorMsg);
      setYocoLoading(false);
      setProcessing(false);
    }
  };

  const handleYocoSuccess = async (result: unknown) => {
    console.log('[Checkout] Yoco payment successful:', result);
    
    if (!currentOrderId) {
      setPaymentError('Order ID lost during payment');
      return;
    }

    try {
      // Update order with payment status
      updateLocalOrder(currentOrderId, {
        paymentStatus: 'paid',
        status: 'awaiting_payment',
      });

      // Redirect to success page
      window.location.href = `/order-confirmation?id=${currentOrderId}&status=success`;
    } catch (error) {
      console.error('[Checkout] Failed to update order:', error);
      setPaymentError('Payment succeeded but failed to update order');
      setProcessing(false);
    }
  };

  const handleYocoError = (error: unknown) => {
    console.error('[Checkout] Yoco payment error:', error);
    setPaymentError(error instanceof Error ? error.message : 'Payment failed');
    setYocoLoading(false);
    setProcessing(false);
  };

  const inputClass = (field: string) =>
    `w-full h-12 px-4 py-3 border ${
      errors[field] ? 'border-red-300' : 'border-[#E8E5E1]'
    } text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white box-border`;

  // ── Stripe Elements appearance (GIOVANNI aesthetic) ────────────
  const stripeAppearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#1A1A1A',
      colorBackground: '#FFFFFF',
      colorText: '#1A1A1A',
      colorDanger: '#C0392B',
      fontFamily: 'Inter, sans-serif',
      fontSizeBase: '14px',
      spacingUnit: '4px',
      borderRadius: '0px',
      colorTextPlaceholder: '#C0C0C0',
    },
    rules: {
      '.Input': {
        border: '1px solid #E8E5E1',
        padding: '12px 16px',
        fontSize: '14px',
        transition: 'border-color 0.2s ease',
      },
      '.Input:focus': {
        border: '1px solid #1A1A1A',
        boxShadow: 'none',
      },
      '.Label': {
        fontSize: '11px',
        letterSpacing: '0.15em',
        textTransform: 'uppercase' as const,
        fontWeight: '500',
        color: '#1A1A1A',
        marginBottom: '8px',
      },
      '.Tab': {
        border: '1px solid #E8E5E1',
        backgroundColor: '#FAFAF8',
      },
      '.Tab--selected': {
        border: '1px solid #1A1A1A',
        backgroundColor: '#FFFFFF',
      },
    },
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Minimal header */}
      <header className="bg-white border-b border-[#F0EDE9]">
        <div className="max-w-[1000px] mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/"
            className="font-heading text-xl tracking-[0.15em] font-light text-[#1A1A1A]"
          >
            GIOVANNI
          </Link>
          <div className="flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase text-[#8B8B8B]">
            <Lock size={12} strokeWidth={1.5} />
            Secure Checkout
          </div>
        </div>
      </header>

      <div className="max-w-[1000px] mx-auto px-6 py-8 lg:py-12">
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-8 mb-10">
          <button
            onClick={() => setStep('shipping')}
            className={`text-[11px] tracking-[0.2em] uppercase font-medium transition-colors ${
              step === 'shipping' ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'
            }`}
          >
            1. Shipping
          </button>
          <div className="w-12 h-px bg-[#E8E5E1]" />
          <span
            className={`text-[11px] tracking-[0.2em] uppercase font-medium ${
              step === 'review' ? 'text-[#1A1A1A]' : 'text-[#A0A0A0]'
            }`}
          >
            2. Payment
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-14">
          {/* ── LEFT COLUMN ─────────────────────────────────────── */}
          <div>
            {step === 'shipping' ? (
              /* ── SHIPPING FORM ──────────────────────────────── */
              <div className="bg-white p-6 lg:p-8">
                <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
                  Shipping Information
                </h2>

                {isAuthenticated && currentClient && (
                  <p className="text-[12px] text-[#8B8B8B] font-light mb-4">
                    Signed in as <span className="text-[#1A1A1A]">{currentClient.email}</span>
                  </p>
                )}

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={shippingAddress.name}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, name: e.target.value })
                      }
                      className={inputClass('name')}
                    />
                    {errors.name && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={shippingAddress.email}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, email: e.target.value })
                        }
                        className={inputClass('email')}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, phone: e.target.value })
                        }
                        className={inputClass('phone')}
                      />
                      {errors.phone && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address: e.target.value })
                      }
                      className={inputClass('address')}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-[11px] mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <select
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        className={inputClass('city')}
                      >
                        <option value="">Select City</option>
                        {availableCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <select
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            state: e.target.value,
                            city: '',
                          })
                        }
                        className={inputClass('state')}
                      >
                        <option value="">Select Province</option>
                        {SA_PROVINCES.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={shippingAddress.zip}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, zip: e.target.value })
                        }
                        className={inputClass('zip')}
                      />
                      {errors.zip && (
                        <p className="text-red-400 text-[11px] mt-1">{errors.zip}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Country"
                      value={shippingAddress.country}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, country: e.target.value })
                      }
                      className={inputClass('country')}
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinueToReview}
                  className="w-full mt-8 py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              /* ── REVIEW + PAYMENT STEP ─────────────────────── */
              <div>
                {/* Shipping summary */}
                <div className="bg-white p-6 lg:p-8 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A]">
                      Shipping To
                    </h2>
                    <button
                      onClick={() => setStep('shipping')}
                      className="text-[11px] tracking-[0.15em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-[#5A5A5A] font-light space-y-1">
                    <p className="font-medium text-[#1A1A1A]">{shippingAddress.name}</p>
                    <p>{shippingAddress.address}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
                    </p>
                    <p>{shippingAddress.country}</p>
                    <p className="mt-2">{shippingAddress.email}</p>
                    <p>{shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-white p-6 lg:p-8 mb-4">
                  <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-4">
                    Items ({cart.length})
                  </h2>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={`${item.product_id}-${item.variant_id}`}
                        className="flex gap-4"
                      >
                        <div className="w-16 h-20 bg-[#F8F6F3] flex-shrink-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-[#1A1A1A]">
                            {item.name}
                          </h3>
                          {item.variant_title && (
                            <p className="text-[11px] text-[#8B8B8B] tracking-wide uppercase">
                              Size: {item.variant_title}
                            </p>
                          )}
                          <p className="text-[12px] text-[#8B8B8B] mt-0.5">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment section */}
                <div className="bg-white p-6 lg:p-8 mb-4">
                  <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
                    Place Order
                  </h2>

                  {costsLoading ? (
                    <div className="flex items-center justify-center py-10 gap-3 text-[#8B8B8B]">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm font-light tracking-wide">Preparing your order…</span>
                    </div>
                  ) : paymentError ? (
                    <div className="bg-red-50/50 border border-red-100 p-6">
                      <p className="text-sm text-red-600 font-light">{paymentError}</p>
                      <button
                        onClick={handlePlaceOrder}
                        className="mt-3 text-[11px] tracking-[0.15em] uppercase text-[#1A1A1A] underline hover:opacity-60 transition-opacity"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-sm text-[#5A5A5A] font-light leading-relaxed">
                        Enter your card details below to complete your purchase securely.
                      </p>

                      {/* Card Details Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] tracking-[0.15em] uppercase font-medium text-[#1A1A1A] mb-3">
                            Card Details
                          </label>
                          
                          <div className="space-y-3">
                            <div>
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                className="w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white"
                              />
                            </div>
                            
                            <div>
                              <input
                                type="text"
                                placeholder="Card Number"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 19))}
                                maxLength={19}
                                className="w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white"
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <input
                                  type="text"
                                  placeholder="MM"
                                  value={expiryMonth}
                                  onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                  maxLength={2}
                                  className="w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white text-center"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="YY"
                                  value={expiryYear}
                                  onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                  maxLength={2}
                                  className="w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white text-center"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  placeholder="CVV"
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                  maxLength={4}
                                  className="w-full h-12 px-4 py-3 border border-[#E8E5E1] text-sm font-light placeholder:text-[#C0C0C0] outline-none focus:border-[#1A1A1A] transition-colors tracking-wide bg-white text-center"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handlePlaceOrder}
                        disabled={processing}
                        className="w-full py-4 bg-[#1A1A1A] text-white text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {processing ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Processing Payment…
                          </>
                        ) : (
                          `Complete Payment - ${formatPrice(total)}`
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setStep('shipping')}
                  className="flex items-center gap-2 mx-auto mt-4 text-[11px] tracking-[0.15em] uppercase text-[#8B8B8B] hover:text-[#1A1A1A] transition-colors"
                >
                  <ChevronLeft size={14} strokeWidth={1.5} />
                  Back to Shipping
                </button>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY SIDEBAR ───────────────────────────── */}
          <div className="order-first lg:order-last">
            <div className="bg-white p-6 lg:p-8 sticky top-8">
              <h2 className="text-[11px] tracking-[0.25em] uppercase font-medium text-[#1A1A1A] mb-6">
                Order Summary
              </h2>

              {/* Mini cart items */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-[#5A5A5A] font-light truncate mr-4">
                      {item.name}{' '}
                      {item.variant_title ? `(${item.variant_title})` : ''} x
                      {item.quantity}
                    </span>
                    <span className="font-medium flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#F0EDE9] pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B8B8B] font-light">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B8B8B] font-light">Shipping</span>
                  {step === 'review' ? (
                    shippingCost === 0 ? (
                      <span className="text-[#7BAF9E] font-light text-[12px]">
                        Complimentary
                      </span>
                    ) : (
                      <span className="font-medium">
                        {formatPrice(shippingCost)}
                      </span>
                    )
                  ) : (
                    <span className="text-[#A0A0A0] font-light text-[12px]">
                      Calculated next
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#8B8B8B] font-light">
                    Tax{taxRate > 0 ? ` (${taxRate}%)` : ''}
                  </span>
                  {step === 'review' ? (
                    <span className="font-medium">{formatPrice(tax)}</span>
                  ) : (
                    <span className="text-[#A0A0A0] font-light text-[12px]">
                      Calculated next
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E8E5E1] pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-[#1A1A1A]">Total</span>
                  <span className="text-lg font-medium text-[#1A1A1A]">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-4 border-t border-[#F0EDE9] space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-[#A0A0A0] font-light">
                  <Check size={12} strokeWidth={1.5} className="text-[#7BAF9E]" />
                  Complimentary worldwide shipping
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#A0A0A0] font-light">
                  <Lock size={12} strokeWidth={1.5} className="text-[#7BAF9E]" />
                  Secure encrypted payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
