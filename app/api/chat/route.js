import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { messages, storyContext } = await request.json();

    let systemPrompt = "You are a helpful assistant that always responds in Bengali script, even if the question is in English or Banglish.";
    
    if (storyContext) {
      systemPrompt += ` Here is some context about the story: ${storyContext}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return NextResponse.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
