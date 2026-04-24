import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const YOCO_BASE_URL = 'https://payments.yoco.com/api';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

/**
 * Create a Yoco checkout session (for hosted checkout)
 * @param {Object} checkoutData
 * @param {number} checkoutData.amountInCents - Amount in cents
 * @param {string} checkoutData.currency - Currency code (ZAR)
 * @param {string} checkoutData.successUrl - URL to redirect on success
 * @param {string} checkoutData.cancelUrl - URL to redirect on cancel
 * @param {Object} checkoutData.metadata - Additional metadata
 * @returns {Promise<Object>} Checkout session result with redirectUrl
 */
export async function createYocoCheckout({ amountInCents, currency, successUrl, cancelUrl, metadata = {} }) {
  console.log('YOCO_SECRET_KEY check:', !!YOCO_SECRET_KEY);
  if (!YOCO_SECRET_KEY) {
    console.error('ERROR: YOCO_SECRET_KEY environment variable is missing or empty');
    throw new Error('YOCO_SECRET_KEY environment variable is required');
  }

  if (!YOCO_SECRET_KEY.startsWith('sk_live_') && !YOCO_SECRET_KEY.startsWith('sk_test_')) {
    console.error('ERROR: YOCO_SECRET_KEY does not appear to be a valid Yoco secret key format');
    throw new Error('Invalid YOCO_SECRET_KEY format');
  }

  console.log('Creating YOCO checkout session with:', {
    amount: amountInCents,
    currency,
    successUrl,
    cancelUrl,
    hasSecretKey: !!YOCO_SECRET_KEY,
    keyType: YOCO_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  });

  const requestBody = {
    amount: amountInCents,
    currency,
    successUrl,
    cancelUrl,
    metadata: {
      ...metadata,
      source: 'giovanni-ecommerce',
      timestamp: new Date().toISOString(),
    },
  };

  console.log('Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${YOCO_BASE_URL}/checkouts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('YOCO checkout API response status:', response.status);
    console.log('YOCO checkout API response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      const textResponse = await response.text();
      console.error('Raw response text:', textResponse);
      throw new Error(`Invalid JSON response from Yoco API: ${response.status}`);
    }

    console.log('YOCO checkout API response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Yoco checkout API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: data,
        request: requestBody
      });
      throw new Error(data.message || data.error || `Checkout creation failed: ${response.status} ${response.statusText}`);
    }

    const normalizeTimestamp = (createdAt) => {
      if (!createdAt) return new Date().toISOString();
      const numeric = Number(createdAt);
      if (!Number.isNaN(numeric) && createdAt !== '') {
        return new Date(numeric * 1000).toISOString();
      }
      return new Date(createdAt).toISOString();
    };

    const createdAt = data.createdAt ? normalizeTimestamp(data.createdAt) : new Date().toISOString();

    console.log('Yoco checkout created:', {
      id: data.id,
      redirectUrl: data.redirectUrl,
      amount: data.amount,
      currency: data.currency,
    });

    return {
      success: true,
      checkoutId: data.id,
      redirectUrl: data.redirectUrl,
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
      createdAt,
    };

  } catch (error) {
    console.error('Yoco checkout creation error:', error);
    throw error;
  }
}

/**
 * Process a Yoco payment using a token
 * @param {Object} paymentData
 * @param {string} paymentData.token - Yoco payment token from frontend
 * @param {number} paymentData.amountInCents - Amount in cents
 * @param {string} paymentData.currency - Currency code (ZAR)
 * @param {Object} paymentData.metadata - Additional metadata
 * @returns {Promise<Object>} Payment result
 */
export async function processYocoPayment({ token, amountInCents, currency, metadata = {} }) {
  if (!YOCO_SECRET_KEY) {
    throw new Error('YOCO_SECRET_KEY environment variable is required');
  }

  try {
    const response = await fetch(`${YOCO_BASE_URL}/charges/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        token,
        amountInCents,
        currency,
        metadata: {
          ...metadata,
          source: 'giovanni-ecommerce',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Yoco API error:', data);
      throw new Error(data.message || `Payment failed: ${response.status}`);
    }

    const normalizeTimestamp = (createdAt) => {
      if (!createdAt) return new Date().toISOString();
      const numeric = Number(createdAt);
      if (!Number.isNaN(numeric) && createdAt !== '') {
        return new Date(numeric * 1000).toISOString();
      }
      return new Date(createdAt).toISOString();
    };

    const createdAt = data.createdAt ? normalizeTimestamp(data.createdAt) : new Date().toISOString();

    console.log('Yoco payment successful:', {
      id: data.id,
      status: data.status,
      amount: data.amountInCents,
      currency: data.currency,
    });

    return {
      success: true,
      paymentId: data.id,
      status: data.status,
      amount: data.amountInCents,
      currency: data.currency,
      metadata: data.metadata,
      createdAt,
    };

  } catch (error) {
    console.error('Yoco payment processing error:', error);
    throw error;
  }
}

/**
 * Refund a Yoco payment
 * @param {string} chargeId - Yoco charge ID
 * @param {number} amountInCents - Amount to refund (optional, full refund if not specified)
 * @returns {Promise<Object>} Refund result
 */
export async function refundYocoPayment(chargeId, amountInCents = null) {
  if (!YOCO_SECRET_KEY) {
    throw new Error('YOCO_SECRET_KEY environment variable is required');
  }

  try {
    const body = amountInCents ? { amountInCents } : {};

    const response = await fetch(`${YOCO_BASE_URL}/charges/${chargeId}/refunds/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Refund failed: ${response.status}`);
    }

    return {
      success: true,
      refundId: data.id,
      amount: data.amountInCents,
      status: data.status,
    };

  } catch (error) {
    console.error('Yoco refund error:', error);
    throw error;
  }
}
