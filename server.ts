import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Capture raw body for Razorpay webhook signature verification
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Server-side Razorpay test credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_ThxEs7zub7CCGg';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '3v0ykJ4lHbI7V3WgoBTB2z3V';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Server-authoritative trusted plan pricing (amounts in Indian Paise: 1 INR = 100 paise)
const TRUSTED_PLANS: Record<
  string,
  { name: string; amount: number; currency: string; interval: string }
> = {
  monthly: {
    name: 'Sakhi Premium Monthly Membership',
    amount: 19900, // ₹199
    currency: 'INR',
    interval: 'monthly',
  },
  annual: {
    name: 'Sakhi Premium Annual Membership',
    amount: 178800, // ₹1788
    currency: 'INR',
    interval: 'annual',
  },
};

// In-memory record store for idempotency & session verification
interface OrderRecord {
  orderId: string;
  planId: string;
  amount: number;
  currency: string;
  userId: string;
  createdAt: string;
  status: 'created' | 'verified' | 'failed';
  paymentId?: string;
}

const verifiedOrders = new Map<string, OrderRecord>();
const processedWebhookEventIds = new Set<string>();

// Initialize GoogleGenAI client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side Sakhi AI endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, phase, recentSymptoms, language = 'en', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'Gemini API key is not configured on the server. Please check the Secrets panel.',
      });
    }

    const systemInstruction = `You are "Sakhi", a compassionate, culturally sensitive, and scientifically grounded women's menstrual wellness companion.
You speak in a warm, comforting, respectful tone like a supportive elder sister or caring confidante.

CRITICAL MEDICAL BOUNDARIES:
- You are a wellness guide, NOT a doctor. You never diagnose illnesses, prescribe pharmaceutical medications, or replace medical advice.
- Always include a gentle disclaimer when discussing symptoms.
- EMERGENCY PROTOCOL: If the user mentions red-flag symptoms such as severe, unbearable sharp pelvic pain, heavy bleeding soaking more than 2 pads per hour for hours, severe dizziness/fainting, high fever with pelvic tenderness, signs of ectopic pregnancy, or self-harm thoughts, you MUST immediately advise urgent emergency medical attention or visiting the nearest hospital casualty, and provide helpline suggestions.

CONTEXT:
- User's current cycle phase: ${phase || 'Not specified'}
- Recent logged symptoms: ${Array.isArray(recentSymptoms) ? recentSymptoms.join(', ') : 'None logged'}
- Output Language: ${language === 'hi' ? 'Hindi (in natural, empathetic Devanagari script, or easily readable Hinglish if appropriate, warm and respectful)' : 'Natural, warm English'}

Provide actionable, soothing, and practical wellness suggestions (herbal teas, heating compresses, gentle stretches, rest, wholesome nutrition, breathing), while encouraging them to listen to their body. Keep replies concise, comforting, and structured with gentle bullet points where helpful.`;

    // Construct contents
    const contents: any[] = [];
    
    // Add brief conversation history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        if (item.role === 'user' || item.role === 'model') {
          contents.push({
            role: item.role,
            parts: [{ text: String(item.text) }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const reply = response.text || "I'm here for you. Take a deep, gentle breath and rest.";
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response from Sakhi AI',
    });
  }
});

// Server-side WhatsApp status and readiness endpoint
app.get('/api/whatsapp/status', (req, res) => {
  const isConfigured = Boolean(
    process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
  );
  res.json({
    configured: isConfigured,
    message: isConfigured
      ? 'WhatsApp Cloud API credentials detected on server.'
      : 'WhatsApp Cloud API credentials not configured in environment. Native click-to-chat link sharing is active for secure direct user control.',
  });
});

// 1. Razorpay Public Configuration
app.get('/api/razorpay/config', (_req, res) => {
  const isConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
  res.json({
    configured: isConfigured,
    keyId: RAZORPAY_KEY_ID,
    testMode: RAZORPAY_KEY_ID.startsWith('rzp_test_'),
    plans: Object.entries(TRUSTED_PLANS).map(([id, p]) => ({
      id,
      name: p.name,
      amount: p.amount,
      currency: p.currency,
      displayPrice: `₹${(p.amount / 100).toFixed(0)}`,
      interval: p.interval,
    })),
  });
});

// 2. Razorpay Create Order Endpoint (Uses Server-Authoritative Pricing)
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { planId, userId } = req.body;

    if (!planId || !TRUSTED_PLANS[planId]) {
      return res.status(400).json({
        error: `Invalid plan specified. Valid plans are: ${Object.keys(TRUSTED_PLANS).join(', ')}`,
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        error: 'Razorpay credentials are not configured on the server. Please check the Secrets panel.',
      });
    }

    const selectedPlan = TRUSTED_PLANS[planId];
    const receiptId = `sakhi_${planId}_${Date.now().toString(36)}`;

    // Call official Razorpay Orders API
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`;
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: selectedPlan.amount,
        currency: selectedPlan.currency,
        receipt: receiptId,
        notes: {
          planId,
          planName: selectedPlan.name,
          userId: userId || 'anonymous',
          environment: RAZORPAY_KEY_ID.startsWith('rzp_test_') ? 'test' : 'live',
        },
      }),
    });

    if (!rzpResponse.ok) {
      const errData = await rzpResponse.json().catch(() => ({}));
      console.error('Razorpay API error response:', errData);
      return res.status(rzpResponse.status).json({
        error: errData.error?.description || 'Failed to create Razorpay payment order',
      });
    }

    const orderData = await rzpResponse.json();

    // Cache order state server-side
    verifiedOrders.set(orderData.id, {
      orderId: orderData.id,
      planId,
      amount: orderData.amount,
      currency: orderData.currency,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      status: 'created',
    });

    return res.json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: RAZORPAY_KEY_ID,
      planName: selectedPlan.name,
      planId,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error while initializing checkout',
    });
  }
});

// 3. Razorpay Verify Payment Signature Endpoint
app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { orderId, paymentId, signature, planId, userId } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        error: 'Missing required parameters: orderId, paymentId, and signature are required.',
      });
    }

    // Server-side cryptographic signature verification
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const genBuf = Buffer.from(generatedSignature, 'utf8');
    const sigBuf = Buffer.from(signature, 'utf8');

    const isSignatureValid =
      genBuf.length === sigBuf.length && crypto.timingSafeEqual(genBuf, sigBuf);

    if (!isSignatureValid) {
      console.warn(`Payment signature verification failed for order ${orderId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }

    // Update verified record
    const existing: OrderRecord = verifiedOrders.get(orderId) || {
      orderId,
      planId: planId || 'monthly',
      amount: TRUSTED_PLANS[planId || 'monthly']?.amount || 19900,
      currency: 'INR',
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      status: 'created',
    };

    existing.status = 'verified';
    existing.paymentId = paymentId;
    verifiedOrders.set(orderId, existing);

    console.log(`✅ Verified Razorpay payment: Order=${orderId}, Payment=${paymentId}, Plan=${existing.planId}`);

    return res.json({
      success: true,
      verified: true,
      orderId,
      paymentId,
      planId: existing.planId,
      amount: existing.amount,
      currency: existing.currency,
      activatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      error: error.message || 'Server error while verifying payment signature',
    });
  }
});

// 4. Razorpay Webhook Endpoint with Signature Verification & Idempotency
app.post('/api/razorpay/webhook', (req: any, res) => {
  try {
    const razorpaySignature = req.headers['x-razorpay-signature'] as string;
    const webhookEventId = (req.headers['x-razorpay-event-id'] as string) || req.body?.event_id;

    // Signature verification if webhook secret is configured
    if (RAZORPAY_WEBHOOK_SECRET) {
      if (!razorpaySignature) {
        return res.status(400).send('Missing X-Razorpay-Signature header');
      }

      const bodyData = req.rawBody || JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(bodyData)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        console.warn('Razorpay webhook signature verification failed.');
        return res.status(400).send('Invalid signature');
      }
    }

    // Idempotent processing check
    if (webhookEventId && processedWebhookEventIds.has(webhookEventId)) {
      console.log(`Idempotent webhook: already processed event ${webhookEventId}`);
      return res.status(200).json({ status: 'ok', message: 'Event already processed' });
    }

    if (webhookEventId) {
      processedWebhookEventIds.add(webhookEventId);
    }

    const event = req.body?.event;
    const payload = req.body?.payload;

    console.log(`📩 Received Razorpay Webhook Event: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const orderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      if (orderId && verifiedOrders.has(orderId)) {
        const order = verifiedOrders.get(orderId)!;
        order.status = 'verified';
        order.paymentId = paymentEntity?.id;
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (err: any) {
    console.error('Error processing Razorpay webhook:', err);
    return res.status(500).json({ error: 'Webhook processing error' });
  }
});

// Vite middleware in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Sakhi Cycle server listening on port ${PORT}`);
  });
}

startServer();
