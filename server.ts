import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

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
