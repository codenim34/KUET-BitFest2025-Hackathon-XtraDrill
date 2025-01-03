import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not defined');
      return NextResponse.json({ error: 'GROQ API key not configured' }, { status: 500 });
    }

    const { content } = await req.json();
    console.log('Received content for title generation');
    
    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a modern Bangla title generator. Create engaging, contemporary titles for stories.

STEP 1 - Understand Content:
1. Identify the main person or topic
2. Find the key point or message
3. Note any interesting modern context

STEP 2 - Create Title:
1. Make it short and catchy (3-7 words)
2. Use everyday modern Bangla
3. Make it relatable to today's readers
4. Return only the Bangla title

RULES:
1. Must include who or what the story is about
2. Use simple, modern Bangla words
3. No English or transliterated words
4. No fancy punctuation (only — if needed)
5. Return just the title

Examples:
Content: Story about a student struggling with online classes
Output: অনলাইন ক্লাসে একজন ছাত্রের গল্প

Content: A food delivery guy's daily experiences
Output: ফুড রাইডারের রোজনামচা

Content: A girl's social media addiction
Output: সোশ্যাল মিডিয়ায় হারিয়ে যাওয়া

Remember: Just give the Bangla title, nothing else.`
        },
        {
          role: "user",
          content: content
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      stream: false
    });

    let generatedTitle = completion.choices[0]?.message?.content?.trim();
    console.log('Raw GROQ response:', generatedTitle);

    // Clean up the response
    if (generatedTitle) {
      // Remove any English text or explanations
      generatedTitle = generatedTitle
        .split('\n')
        .filter(line => /[\u0980-\u09FF]/.test(line))[0] || generatedTitle;
      
      // Remove quotes if present
      generatedTitle = generatedTitle.replace(/["']/g, '').trim();
    }

    console.log('Cleaned title:', generatedTitle);

    if (!generatedTitle) {
      console.error('No valid title generated from GROQ');
      return NextResponse.json({ error: 'Failed to generate title' }, { status: 500 });
    }

    return NextResponse.json({ generatedTitle });
  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate title' }, 
      { status: 500 }
    );
  }
}
