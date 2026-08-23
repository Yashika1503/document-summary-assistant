const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LENGTH_GUIDANCE = {
  short: '2-3 sentences',
  medium: '4-6 sentences',
  long: '8-10 sentences',
};

async function generateSummary(text, length = 'medium') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Server is missing an AI API key. Contact the administrator.');
  }

  const lengthInstruction = LENGTH_GUIDANCE[length] || LENGTH_GUIDANCE.medium;

  const prompt = `You are a document summarization assistant. Summarize the following document.

Respond with ONLY valid JSON in this exact shape, no markdown formatting, no extra commentary:
{
  "summary": "a ${lengthInstruction} summary of the document",
  "keyPoints": ["key point 1", "key point 2", "key point 3"]
}

Document:
"""
${text.slice(0, 15000)}
"""`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
  });

  const rawText = response.text.trim();
  const cleaned = rawText.replace(/^```json\s*|```$/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!parsed.summary || !Array.isArray(parsed.keyPoints)) {
      throw new Error('Unexpected response shape');
    }
    return parsed;
  } catch (err) {
    // Fallback: AI didn't return clean JSON. Return the raw text as the summary
    // rather than failing the whole request.
    return {
      summary: rawText,
      keyPoints: [],
    };
  }
}

module.exports = generateSummary;