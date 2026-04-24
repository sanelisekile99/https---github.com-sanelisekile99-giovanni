import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

import { processYocoPayment, createYocoCheckout } from './yoco.js';

console.log('Current working directory:', process.cwd());
console.log('Environment variables loaded:');
console.log('YOCO_SECRET_KEY exists:', !!process.env.YOCO_SECRET_KEY);
console.log('YOCO_SECRET_KEY value:', process.env.YOCO_SECRET_KEY ? '***' + process.env.YOCO_SECRET_KEY.slice(-4) : 'undefined');
console.log('All env vars with YOCO:', Object.keys(process.env).filter(key => key.includes('YOCO')));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow any localhost origin during development
    try {
      const url = new URL(origin);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (e) {
      // If parsing fails, fall through to env check
    }

    // Fallback to explicit FRONTEND_URL if set
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    return callback(new Error('CORS policy: origin not allowed'));
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create Yoco checkout session (for hosted checkout)
app.post('/api/payments/checkout', async (req, res) => {
  console.log('Checkout creation endpoint called with body:', req.body);
  try {
    const { amount, currency, successUrl, cancelUrl, metadata } = req.body;

    if (!amount || !currency || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Missing required fields: amount, currency, successUrl, cancelUrl'
      });
    }

    console.log('Creating Yoco checkout:', { amount, currency, successUrl, cancelUrl });

    const result = await createYocoCheckout({
      amountInCents: amount,
      currency,
      successUrl,
      cancelUrl,
      metadata
    });

    res.json(result);
  } catch (error) {
    console.error('Checkout creation error:', error);
    res.status(500).json({
      error: 'Checkout creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Process Yoco payment
app.post('/api/payments/yoco', async (req, res) => {
  try {
    const {
      token,
      amount,
      currency,
      customer,
      shippingAddress,
      items,
      subtotal,
      shipping,
      tax,
      total
    } = req.body;

    if (!token || !amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: token, amount, currency'
      });
    }

    console.log('Processing Yoco payment:', {
      token: token.substring(0, 10) + '...',
      amount,
      currency,
      customer: customer?.email,
      itemCount: items?.length
    });

    const result = await processYocoPayment({
      token,
      amountInCents: amount,
      currency,
      metadata: {
        customer,
        shippingAddress,
        items,
        subtotal,
        shipping,
        tax,
        total
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Payment processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create order after successful payment
app.post('/api/orders', async (req, res) => {
  try {
    const {
      paymentId,
      amount,
      currency,
      customer,
      shippingAddress,
      items,
      subtotal,
      shipping,
      tax,
      total
    } = req.body;

    if (!paymentId || !amount || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: paymentId, amount, currency'
      });
    }

    console.log('Creating order for payment:', {
      paymentId,
      amount,
      currency,
      customer: customer?.email,
      itemCount: items?.length
    });

    // Here you would typically verify the payment with Yoco's API
    // For now, we'll trust the payment ID from the frontend

    // Create order record (in a real app, this would be saved to a database)
    const order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentId,
      customer,
      shippingAddress,
      items,
      amounts: {
        subtotal,
        shipping,
        tax,
        total
      },
      currency,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    res.json({ order });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Order creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Yoco webhook handler
app.post('/api/webhooks/yoco', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const signature = req.headers['x-yoco-signature'];
    const payload = req.body;

    // TODO: Verify webhook signature
    console.log('Yoco webhook received:', payload);

    // Handle different webhook events
    // - payment.succeeded
    // - payment.failed
    // - payment.cancelled

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
