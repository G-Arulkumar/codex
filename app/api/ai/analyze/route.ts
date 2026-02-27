import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const requestSchema = z.object({
  title: z.string(),
  quantity: z.number(),
  foodType: z.enum(['veg', 'non-veg']),
  pickupDeadline: z.string()
});

const fallback = {
  safeConsumptionTime: 'Consume within 4-6 hours',
  urgencyLevel: 'MEDIUM',
  storageAdvice: 'Keep in insulated containers below 5°C until pickup.'
};

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const gemmaApiKey = process.env.GEMMA_API_KEY;
  if (!gemmaApiKey) {
    return NextResponse.json(fallback);
  }

  const prompt = `You are a food safety assistant. Return ONLY JSON with keys safeConsumptionTime, urgencyLevel(LOW|MEDIUM|HIGH), storageAdvice. Data: ${JSON.stringify(parsed.data)}`;

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemma-2-9b-it:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': gemmaApiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });

    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const json = JSON.parse(text);
    return NextResponse.json({
      safeConsumptionTime: json.safeConsumptionTime ?? fallback.safeConsumptionTime,
      urgencyLevel: json.urgencyLevel ?? fallback.urgencyLevel,
      storageAdvice: json.storageAdvice ?? fallback.storageAdvice
    });
  } catch {
    return NextResponse.json(fallback);
  }
}
