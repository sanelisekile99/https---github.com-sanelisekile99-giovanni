/**
 * YOCO Payment Integration Utilities
 * 
 * This module provides utilities for handling YOCO payments in the application.
 * Currently supports EFT (Electronic Funds Transfer) payments.
 */

export interface YocoPaymentInitiationRequest {
  amount: number; // Amount in cents
  currency: 'ZAR' | 'MUR';
  email: string;
  phone?: string;
  metadata?: Record<string, unknown>;
}

export interface YocoPaymentResult {
  id: string;
  reference?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: 'EFT' | 'CARD';
  timestamp: string;
}

/**
 * Initiates an EFT payment with YOCO
 * 
 * @param request - Payment initiation request details
 * @returns Promise with payment result containing reference ID
 * 
 * @example
 * ```typescript
 * const result = await initiateEFTPayment({
 *   amount: 50000, // R500.00
 *   currency: 'ZAR',
 *   email: 'customer@example.com',
 * });
 * console.log(`Payment reference: ${result.reference}`);
 * ```
 */
export async function initiateEFTPayment(
  request: YocoPaymentInitiationRequest
): Promise<YocoPaymentResult> {
  // In production, this would call your backend API
  // which then calls YOCO's server-to-server API
  
  // Backend endpoint would look like:
  // POST /api/payments/initiate-eft
  // Body: { amount, currency, email, phone, metadata }
  
  // For now, return a mock response for demo
  return {
    id: crypto.randomUUID(),
    reference: crypto.randomUUID(),
    status: 'pending',
    paymentMethod: 'EFT',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Verifies an EFT payment status with YOCO
 * 
 * @param paymentId - The payment ID to verify
 * @returns Promise with updated payment status
 * 
 * @example
 * ```typescript
 * const status = await verifyEFTPayment('payment-id-123');
 * if (status.status === 'completed') {
 *   console.log('Payment successful!');
 * }
 * ```
 */
export async function verifyEFTPayment(
  paymentId: string
): Promise<YocoPaymentResult> {
  // In production, this would call:
  // GET /api/payments/{paymentId}/status
  
  // For demo, simulate a pending payment
  return {
    id: paymentId,
    status: 'pending',
    paymentMethod: 'EFT',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Formats payment amount for display
 * 
 * @param amountInCents - Amount in cents
 * @returns Formatted currency string
 */
export function formatPaymentAmount(amountInCents: number): string {
  const zar = (amountInCents / 100).toLocaleString('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  });
  return zar;
}

/**
 * Generates a user-friendly payment reference display
 * 
 * @param reference - Full reference UUID
 * @returns Formatted reference for display
 */
export function formatPaymentReference(reference: string): string {
  // Show first and last 8 characters for easier copy-paste
  if (reference.length > 20) {
    return `${reference.substring(0, 8)}...${reference.substring(reference.length - 8)}`;
  }
  return reference;
}
