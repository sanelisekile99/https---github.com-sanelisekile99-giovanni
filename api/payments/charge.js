const YOCO_BASE_URL = 'https://payments.yoco.com/api';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

async function createYocoToken({ cardNumber, expiryMonth, expiryYear, cvv, cardholderName }) {
  console.log('Creating Yoco token...');
  
  if (!YOCO_SECRET_KEY) {
    throw new Error('YOCO_SECRET_KEY environment variable is required');
  }

  const requestBody = {
    number: cardNumber,
    expiry_month: parseInt(expiryMonth),
    expiry_year: parseInt(expiryYear),
    cvc: cvv,
    name_on_card: cardholderName,
  };

  console.log('Token request (masked):', {
    number: `****${cardNumber.slice(-4)}`,
    expiry_month: expiryMonth,
    expiry_year: expiryYear,
    cvc: '***',
    name_on_card: cardholderName,
  });

  try {
    const response = await fetch(`${YOCO_BASE_URL}/tokenize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const rawText = await response.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = null;
    }

    console.log('Yoco tokenize response status:', response.status);

    if (!response.ok) {
      console.error('Yoco tokenize error:', { status: response.status, error: data ?? rawText });
      const message = (data && (data.message || data.error)) || rawText || 'Tokenization failed';
      throw new Error(message);
    }

    console.log('Token created successfully:', data.id);
    return data.id;

  } catch (error) {
    console.error('Yoco token creation error:', error);
    throw error;
  }
}

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

  console.log('Creating YOCO charge with:', {
    amount: amountInCents,
    currency,
    hasToken: !!token,
    hasSecretKey: !!YOCO_SECRET_KEY,
    keyType: YOCO_SECRET_KEY.startsWith('sk_live_') ? 'LIVE' : 'TEST'
  });

  const requestBody = {
    amount: amountInCents,
    currency,
    token,
    metadata: {
      ...metadata,
      source: 'giovanni-ecommerce',
      timestamp: new Date().toISOString(),
    },
  };

  console.log('Charge request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(`${YOCO_BASE_URL}/charges/`, {
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
  console.log('=== CHARGE REQUEST ===');
  console.log('Request method:', req.method);
  console.log('Request origin:', req.headers.origin);
  console.log('YOCO_SECRET_KEY exists:', !!process.env.YOCO_SECRET_KEY);

  // CORS handling
  const allowedOrigins = [
    'https://giovanni-official.com',
    'https://www.giovanni-official.com',
    'https://exclusive-minimal-refined-1.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const origin = req.headers.origin;
  const configuredFrontend = process.env.FRONTEND_URL || process.env.VERCEL_URL || '';

  let allowOrigin = '';
  if (!origin) {
    allowOrigin = '*';
  } else if (allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else if (configuredFrontend && origin === configuredFrontend) {
    allowOrigin = origin;
  } else if (/\.vercel\.app$/.test(origin)) {
    allowOrigin = origin;
  }

  console.log('CORS: allowOrigin ->', allowOrigin);
  
  const effectiveAllowOrigin = allowOrigin || '*';
  res.setHeader('Access-Control-Allow-Origin', effectiveAllowOrigin);
  if (effectiveAllowOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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

    // Determine if we're using a token or need to create one from card details
    let chargeToken = token;
    
    if (!chargeToken && (cardNumber && expiryMonth && expiryYear && cvv && cardholderName)) {
      // Tokenize the card details
      console.log('Card details provided, creating token...');
      try {
        chargeToken = await createYocoToken({
          cardNumber,
          expiryMonth,
          expiryYear,
          cvv,
          cardholderName,
        });
      } catch (tokenError) {
        console.error('Tokenization failed:', tokenError);
        return res.status(400).json({
          error: 'Card validation failed',
          message: tokenError instanceof Error ? tokenError.message : 'Invalid card details'
        });
      }
    } else if (!chargeToken) {
      return res.status(400).json({
        error: 'Missing required fields: either token or full card details (cardNumber, expiryMonth, expiryYear, cvv, cardholderName)'
      });
    }

    console.log('Creating Yoco charge:', { amount: amountCents, currency, hasToken: !!chargeToken });

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
