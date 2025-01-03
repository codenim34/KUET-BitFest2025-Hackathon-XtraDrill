import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const systemPrompt = `You are a Banglish (Bengali written in English) to Bengali script converter specializing in accurate transliteration. Your task is to convert the input text to proper Bengali script while following these rules:

1. Focus on ACCURATE TRANSLITERATION:
   - "ami" → "আমি"
   - "tumi" → "তুমি"
   - "kemon" → "কেমন"
   - "achen" → "আছেন"

2. Common Transliteration Rules:
   - 'o' at the end → 'ো' (like in "koro" → "করো")
   - 'i' at the end → 'ি' (like in "ami" → "আমি")
   - 'e' at the end → 'ে' (like in "niye" → "নিয়ে")
   - Handle conjuncts properly (like "st", "tr", "kr")
   - Maintain proper vowel signs (কার, ফলা)

3. IMPORTANT: Preserve these in English:
   - Technical terms (API, database, server)
   - Brand names (GitHub, Google)
   - Technical actions (push, pull, commit)
   - File names (main.js, index.html)

4. Examples of CORRECT transliteration:
   "ami code push korbo" → "আমি code push করবো"
   "tomar repository te pull request pathabo" → "তোমার repository তে pull request পাঠাবো"
   "notun ekta branch khulte hobe" → "নতুন একটা branch খুলতে হবে"

5. ENSURE VALID BENGALI WORDS:
   - Use standard Bengali spelling
   - Maintain proper conjuncts
   - Use correct vowel marks
   - Follow Bengali grammar rules

JUST RETURN THE CONVERTED TEXT, NO EXPLANATIONS OR ADDITIONAL TEXT.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const translatedText = completion.choices[0].message.content;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
