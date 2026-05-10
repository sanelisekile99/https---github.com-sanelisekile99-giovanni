const YOCO_BASE_URL = 'https://api.yoco.com/v1';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

async function createYocoCharge({ token, amountInCents, currency, cardNumber, expiryMonth, expiryYear, cvv, cardholderName, metadata = {} }) {
  console.log('YOCO_SECRET_KEY check:', !!YOCO_SECRET_KEY);
  if (!YOCO_SECRET_KEY) {
    console.error('ERROR: YOCO_SECRET_KEY environment variable is missing or empty');
    throw new Error('YOCO_SECRET_KEY environment variable is required');
  }

  if (!YOCO_SECRET_KEY.startsWith('sk_live_') && !YOCO_SECRET_KEY.startsWith('sk_test_')) {
    console.error('ERROR: YOCO_SECRET_KEY does not appear to be a valid Yoco secret key format');
    throw new Error('Invalid YOCO_SECRET_KEY format');
  }

  console.log('Creating YOCO charge with:', {
    amount: amountInCents,
    currency,
    hasToken: !!token,
    hasCardDetails: !!(cardNumber && expiryMonth && expiryYear && cvv),
    hasSecretKey: !!YOCO_SECRET_KEY,
    keyType: YOCO_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  });

  // Build request body based on what we have
  const requestBody = {
    amount: amountInCents,
    currency,
    metadata: {
      ...metadata,
      source: 'giovanni-ecommerce',
      timestamp: new Date().toISOString(),
    },
  };

  // Add token or card details
  if (token) {
    requestBody.token = token;
  } else if (cardNumber && expiryMonth && expiryYear && cvv) {
    // Send card details directly - Yoco may need these fields
    requestBody.card = {
      number: cardNumber,
      expiry_month: parseInt(expiryMonth),
      expiry_year: 2000 + parseInt(expiryYear),
      cvc: cvv,
    };
    if (cardholderName) {
      requestBody.card.name_on_card = cardholderName;
      requestBody.metadata.cardholderName = cardholderName;
    }
  }

  console.log('Charge request body (masked):', {
    amount: amountInCents,
    currency,
    ...(token && { token }),
    ...(cardNumber && { card: { number: `****${cardNumber.slice(-4)}`, expiry_month: expiryMonth, expiry_year: expiryYear, cvc: '***' } }),
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
      token, 
      amountInCents, 
      amount, 
      currency, 
      metadata,
      // Card details for tokenization
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

    // Determine if we're using a token or need to use card details
    let chargeToken = token;
    
    if (!chargeToken && (cardNumber && expiryMonth && expiryYear && cvv && cardholderName)) {
      // We have card details - send directly to Yoco
      console.log('Card details provided, creating charge with card data...');
      
      const result = await createYocoCharge({
        amountInCents: amountCents,
        currency,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardholderName,
        metadata
      });

      return res.json(result);
    } else if (!chargeToken) {
      return res.status(400).json({
        error: 'Missing required fields: either token or full card details (cardNumber, expiryMonth, expiryYear, cvv, cardholderName)'
      });
    }

    // If we have a token, use it directly
    console.log('Creating Yoco charge with token:', { amount: amountCents, currency, hasToken: !!chargeToken });

    const result = await createYocoCharge({
      token: chargeToken,
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
