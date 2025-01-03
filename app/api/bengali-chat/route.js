import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { connect } from "@/lib/mongodb/mongoose";
import Chat from "@/lib/models/chat";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { messages, storyContext, chatId, userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ইউজার আইডি প্রয়োজন' }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1];

    let systemPrompt = `You are a helpful assistant that ALWAYS responds in Bengali script (Bangla). Important instructions:

1. ALWAYS respond in proper Bengali script
2. If the user writes in English, translate your response to Bengali
3. If the user writes in Banglish, respond in Bengali script
4. Keep your responses natural and conversational in Bengali
5. Use proper Bengali grammar and vocabulary
6. If explaining technical terms, use the Bengali equivalent when possible
7. Format lists and points in Bengali style

Example responses:
User: "How are you?"
Assistant: "আমি ভালো আছি, আপনি কেমন আছেন?"

User: "Tell me about artificial intelligence"
Assistant: "কৃত্রিম বুদ্ধিমত্তা হল একটি প্রযুক্তি যা কম্পিউটার সিস্টেমকে মানুষের মতো চিন্তা করতে এবং শিখতে সক্ষম করে।"

Remember: ALWAYS respond in proper Bengali script, regardless of how the user writes their message.`;

    if (storyContext) {
      systemPrompt += ` এখানে গল্পের প্রসঙ্গ রয়েছে: ${storyContext.content}`;
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

    const assistantMessage = completion.choices[0].message;

    // Save messages to database
    await connect();
    
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return NextResponse.json({ error: 'চ্যাট পাওয়া যায়নি' }, { status: 404 });
      }
      chat.messages.push(
        { ...userMessage, timestamp: new Date() },
        { ...assistantMessage, timestamp: new Date() }
      );
      if (chat.title === 'নতুন চ্যাট') {
        chat.title = userMessage.content.slice(0, 50) + "...";
      }
    } else {
      chat = await Chat.create({
        userId,
        title: userMessage.content.slice(0, 50) + "...",
        messages: [
          { ...userMessage, timestamp: new Date() },
          { ...assistantMessage, timestamp: new Date() }
        ],
        storyContext: storyContext ? {
          storyId: storyContext._id,
          title: storyContext.title,
          content: storyContext.content
        } : null
      });
    }

    await chat.save();

    return NextResponse.json({ 
      response: assistantMessage.content,
      chatId: chat._id
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'একটি ত্রুটি ঘটেছে' },
      { status: 500 }
    );
  }
}
