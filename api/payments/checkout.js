const YOCO_BASE_URL = 'https://payments.yoco.com/api';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

async function createYocoCheckout({ amountInCents, currency, successUrl, cancelUrl, failureUrl, metadata = {} }) {
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
    failureUrl,
    hasSecretKey: !!YOCO_SECRET_KEY,
    keyType: YOCO_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  });

  const requestBody = {
    amount: amountInCents,
    currency,
    successUrl,
    cancelUrl,
    ...(failureUrl ? { failureUrl } : {}),
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

    // Always capture raw response for debugging (Yoco sometimes returns non-JSON error bodies)
    const rawText = await response.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    console.log('YOCO checkout API raw response:', rawText);
    if (data) {
      console.log('YOCO checkout API response data:', JSON.stringify(data, null, 2));
    }

    if (!response.ok) {
      console.error('Yoco checkout API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: data ?? rawText,
        request: requestBody
      });

      const message =
        (data && (data.message || data.error || data.description || data?.errors?.[0]?.message)) ||
        rawText ||
        `Checkout creation failed: ${response.status} ${response.statusText}`;
      throw new Error(message);
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

export default async function handler(req, res) {
  console.log('=== CHECKOUT REQUEST ===');
  console.log('Request method:', req.method);
  console.log('Request origin:', req.headers.origin);
  console.log('YOCO_SECRET_KEY exists:', !!process.env.YOCO_SECRET_KEY);
  console.log('YOCO_SECRET_KEY value (first 10 chars):', process.env.YOCO_SECRET_KEY?.substring(0, 10));

  // CORS headers for production domains
  const allowedOrigins = ['https://giovanni-official.com', 'https://www.giovanni-official.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Checkout creation endpoint called with body:', JSON.stringify(req.body));
  try {
    const { amountInCents, amount, currency, successUrl, cancelUrl, failureUrl, metadata } = req.body;

    const providedAmount = amountInCents ?? amount;
    if (providedAmount == null || !currency || !successUrl || !cancelUrl) {
      return res.status(400).json({
        error: 'Missing required fields: amount (integer cents), currency, successUrl, cancelUrl'
      });
    }

    const amountCents = Number(providedAmount);
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return res.status(400).json({
        error: 'Invalid amount, must be a positive integer in cents'
      });
    }

    if (currency !== 'ZAR') {
      return res.status(400).json({
        error: 'Invalid currency. Only ZAR is supported.'
      });
    }

    // Live keys require HTTPS redirect URLs. Also enforce our production domain for redirects.
    const isLiveKey = typeof YOCO_SECRET_KEY === 'string' && YOCO_SECRET_KEY.startsWith('sk_live_');
    const urlsToCheck = [successUrl, cancelUrl, failureUrl].filter(Boolean);
    for (const u of urlsToCheck) {
      try {
        const parsed = new URL(u);
        if (isLiveKey && parsed.protocol !== 'https:') {
          return res.status(400).json({
            error: 'Invalid redirect URL protocol for live payments. Use https:// URLs or switch to a Yoco test secret key for localhost testing.',
            details: { url: u }
          });
        }

        if (isLiveKey) {
          const allowedHosts = new Set(['giovanni-official.com', 'www.giovanni-official.com']);
          if (!allowedHosts.has(parsed.hostname)) {
            return res.status(400).json({
              error: 'Invalid redirect URL host for live payments. Redirects must point to your production domain.',
              details: { url: u }
            });
          }
        }
      } catch {
        return res.status(400).json({
          error: 'Invalid redirect URL. Must be a valid absolute URL.',
          details: { url: u }
        });
      }
    }

    console.log('Creating Yoco checkout:', { amount: amountCents, currency, successUrl, cancelUrl, failureUrl });

    const result = await createYocoCheckout({
      amountInCents: amountCents,
      currency,
      successUrl,
      cancelUrl,
      failureUrl,
      metadata
    });

    res.json(result);
  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If YOCO_SECRET_KEY is missing, provide clear guidance
    if (errorMessage.includes('YOCO_SECRET_KEY')) {
      return res.status(500).json({
        error: 'Checkout creation failed',
        message: 'Server configuration error: YOCO_SECRET_KEY is not set in Vercel environment variables',
        details: 'Add YOCO_SECRET_KEY to your Vercel project settings and redeploy'
      });
    }
    
    res.status(502).json({
      error: 'Checkout creation failed',
      message: errorMessage
    });
  }
}
