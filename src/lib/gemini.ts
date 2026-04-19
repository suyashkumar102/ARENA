import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// This should only be used server-side
const apiKey = process.env.GEMINI_API_KEY || '';

export const genAI = new GoogleGenerativeAI(apiKey);

// Models in priority order — tries each until one works
// gemini-2.5-flash-lite has the most generous free tier quota
const MODEL_PRIORITY = [
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
];

export const getGeminiModel = (modelName?: string) => {
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set.');
  }
  return genAI.getGenerativeModel({ model: modelName ?? MODEL_PRIORITY[0] });
};

export const generateWithFallback = async (prompt: string): Promise<string> => {
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`[Gemini] Used model: ${modelName}`);
      return result.response.text();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429 || status === 404) {
        console.warn(`[Gemini] Model ${modelName} unavailable (${status}), trying next...`);
        continue;
      }
      throw err; // Non-quota error, don't retry
    }
  }
  throw new Error('All Gemini models exhausted quota or unavailable');
};
