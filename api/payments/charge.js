const YOCO_BASE_URL = 'https://api.yoco.com/v1';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
// Backend needs YOCO_PUBLIC_KEY (not VITE_YOCO_PUBLIC_KEY which is frontend only)
const YOCO_PUBLIC_KEY = process.env.YOCO_PUBLIC_KEY || process.env.VITE_YOCO_PUBLIC_KEY;

// Step 1: Tokenize card details
async function tokenizeCard({ cardNumber, expiryMonth, expiryYear, cvc }) {
  console.log('Tokenizing card on backend...');
  console.log('Public key available:', !!YOCO_PUBLIC_KEY);
  
  if (!YOCO_PUBLIC_KEY) {
    throw new Error('YOCO_PUBLIC_KEY not configured in environment variables');
  }
  
  const tokenResponse = await fetch(`${YOCO_BASE_URL}/tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicKey: YOCO_PUBLIC_KEY,
      card: {
        number: cardNumber.replace(/\s/g, ''),
        expiryMonth: parseInt(expiryMonth),
        expiryYear: 2000 + parseInt(expiryYear),
        cvc: cvc,
      },
    }),
  });

  const tokenData = await tokenResponse.json();
  
  console.log('Tokenization response status:', tokenResponse.status);
  console.log('Tokenization response:', JSON.stringify(tokenData, null, 2));
  
  if (!tokenResponse.ok || !tokenData.id) {
    const errorMsg = tokenData?.message || tokenData?.error || tokenData?.description || JSON.stringify(tokenData) || 'Card tokenization failed';
    console.error('Tokenization error:', errorMsg);
    console.error('Public key used:', YOCO_PUBLIC_KEY ? `${YOCO_PUBLIC_KEY.substring(0, 10)}...` : 'NOT SET');
    throw new Error(errorMsg);
  }

  console.log('Card tokenized successfully, token:', tokenData.id);
  return tokenData.id;
}

// Step 2: Create charge with token
async function createYocoCharge({ token, amountInCents, currency, metadata = {} }) {
  console.log('YOCO_SECRET_KEY check:', !!YOCO_SECRET_KEY);
  if (!YOCO_SECRET_KEY) {
    console.error('ERROR: YOCO_SECRET_KEY environment variable is missing or empty');
    throw new Error('YOCO_SECRET_KEY environment variable is required');
  }

  if (!YOCO_SECRET_KEY.startsWith('sk_live_') && !YOCO_SECRET_KEY.startsWith('sk_test_')) {
    console.error('ERROR: YOCO_SECRET_KEY does not appear to be a valid Yoco secret key format');
    throw new Error('Invalid YOCO_SECRET_KEY format');
  }

  if (!token) {
    throw new Error('Payment token is required');
  }

  console.log('Creating YOCO charge with token:', {
    amount: amountInCents,
    currency,
    hasToken: !!token,
    hasSecretKey: !!YOCO_SECRET_KEY,
    keyType: YOCO_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  });

  // Build request body - ONLY token-based charges
  const requestBody = {
    token,
    amount: amountInCents,
    currency,
    metadata: {
      ...metadata,
      source: 'giovanni-ecommerce',
      timestamp: new Date().toISOString(),
    },
  };

  console.log('Charge request body:', {
    amount: amountInCents,
    currency,
    hasToken: !!requestBody.token,
    metadata: requestBody.metadata,
  });

  try {
    const response = await fetch(`${YOCO_BASE_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('YOCO charge API response status:', response.status);
    console.log('YOCO charge API response headers:', Object.fromEntries(response.headers.entries()));

    // Always capture raw response for debugging
    const rawText = await response.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    console.log('YOCO charge API raw response:', rawText);
    if (data) {
      console.log('YOCO charge API response data:', JSON.stringify(data, null, 2));
    }

    if (!response.ok) {
      console.error('Yoco charge API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: data ?? rawText,
        request: requestBody
      });

      const message =
        (data && (data.message || data.error || data.description || data?.errors?.[0]?.message)) ||
        rawText ||
        `Charge creation failed: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    console.log('Yoco charge created successfully:', {
      id: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
    });

    return {
      success: true,
      transactionId: data.id,
      status: data.status,
      amount: data.amount,
      currency: data.currency,
      metadata: data.metadata,
      createdAt: data.createdAt || new Date().toISOString(),
    };

  } catch (error) {
    console.error('Yoco charge creation error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Set CORS headers FIRST, before any other response handling
  const origin = req.headers.origin;
  
  // Allow both the custom domain and any Vercel deployment
  const allowOrigins = [
    'https://giovanni-official.com',
    'https://www.giovanni-official.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  
  // Accept request if:
  // 1. Origin is in allowed list
  // 2. Origin is a Vercel deployment (.vercel.app)
  // 3. No origin header (direct requests)
  let allowOrigin = '*';
  if (origin) {
    if (allowOrigins.includes(origin) || /\.vercel\.app$/.test(origin) || /\.giovanni-official\.com$/.test(origin)) {
      allowOrigin = origin;
    }
  }
  
  // Set CORS headers - CRITICAL: do this before any early returns
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (allowOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  console.log('=== CHARGE REQUEST ===');
  console.log('Request method:', req.method);
  console.log('Request origin:', origin);
  console.log('CORS allowOrigin:', allowOrigin);
  console.log('YOCO_SECRET_KEY exists:', !!process.env.YOCO_SECRET_KEY);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Rejecting unsupported method:', req.method);
    return res.status(405).json({ error: 'Method not allowed', allowedMethods: 'POST, OPTIONS' });
  }

  console.log('Charge creation endpoint called with body:', JSON.stringify(req.body));
  try {
    const { 
      amountInCents, 
      amount, 
      currency, 
      metadata,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      cardholderName,
    } = req.body;

    const providedAmount = amountInCents ?? amount;
    if (providedAmount == null || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: amount (or amountInCents), currency'
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

    // Validate card details
    if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({
        error: 'Missing required fields: cardNumber, expiryMonth, expiryYear, cvv'
      });
    }

    // Step 1: Tokenize the card on backend (no CORS issues)
    console.log('Step 1: Tokenizing card...');
    const token = await tokenizeCard({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc: cvv,
    });

    // Step 2: Create charge with token
    console.log('Step 2: Creating charge with token...');
    const result = await createYocoCharge({
      token,
      amountInCents: amountCents,
      currency,
      metadata
    });

    res.json(result);
  } catch (error) {
    console.error('=== CHARGE ERROR ===');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // If YOCO_SECRET_KEY is missing, provide clear guidance
    if (errorMessage.includes('YOCO_SECRET_KEY')) {
      return res.status(500).json({
        error: 'Charge creation failed',
        message: 'Server configuration error: YOCO_SECRET_KEY is not set in Vercel environment variables',
        details: 'Add YOCO_SECRET_KEY to your Vercel project settings and redeploy'
      });
    }
    
    res.status(402).json({
      error: 'Charge creation failed',
      message: errorMessage
    });
  }
}
