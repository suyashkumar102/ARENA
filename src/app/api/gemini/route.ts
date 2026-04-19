import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithFallback } from '@/lib/gemini';

const RequestSchema = z.object({
  type: z.enum(['briefing', 'recommendation', 'fan-assist', 'incident-summary']),
  arenaState: z.unknown(),
  query: z.string().max(500).optional(),
});

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

// Rate limiting note: x-forwarded-for can be spoofed by clients.
// For production, use Firebase Auth UID as the rate limit key.
// Authenticated requests include 'Authorization: Bearer <idToken>' header.
// Unauthenticated requests (fan-assist) fall back to IP-based limiting.
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  let record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(key, record);
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const key = bearerToken ?? (req.headers.get('x-forwarded-for') || 'anonymous');
  if (isRateLimited(key)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { type, arenaState, query } = RequestSchema.parse(body);
    
    let prompt = '';
    const stateStr = JSON.stringify(arenaState);

    if (type === 'briefing') {
      prompt = `You are ARENA AI analyst for Wankhede Stadium Mumbai during IPL MI vs CSK.
Given the current zone states, match phase, and predictions provided: ${stateStr}.
Generate a 3-sentence operational briefing for the venue director.
Sentence 1: Current biggest risk zone and why.
Sentence 2: What will happen in the next 10 minutes based on match state.
Sentence 3: One specific action to take right now (zone name, staff count, timing).
Be direct. Use numbers. No filler words.`;
    } else if (type === 'recommendation') {
      prompt = `You are ARENA's AI for Wankhede Stadium.
Current arena state: ${stateStr}.
Generate 3 specific, actionable recommendations ranked by urgency.
Format each as: [URGENT/NORMAL/MONITOR] Zone X: Action. Reason.`;
    } else if (type === 'fan-assist') {
      prompt = `You are a helpful stadium assistant at Wankhede Stadium, Mumbai for IPL 2026 MI vs CSK.
Current state: ${stateStr}.
Fan question: ${query}
Answer in under 40 words. Be conversational. Include specific directions, stall names, wait times where relevant.
You can respond in Hindi if the question is in Hindi.`;
    } else if (type === 'incident-summary') {
      prompt = `Summarize this stadium incident for the operations log:
${stateStr}
One sentence: what happened, which zone, current status, recommended action.`;
    }

    const text = await generateWithFallback(prompt);
    
    return NextResponse.json({ response: text });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request format', details: error.issues }, { status: 400 });
    }
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}
