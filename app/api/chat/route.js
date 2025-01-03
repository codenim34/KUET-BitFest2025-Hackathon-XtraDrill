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
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1];

    let systemPrompt = `You are a helpful assistant that responds in Bengali script. CRITICAL INSTRUCTION: When you see English words in the input, follow these rules:

1. DO NOT TRANSLITERATE OR TRANSLATE these types of English words - keep them EXACTLY as they appear:
   - Technical terms (computer, software, code, API, server)
   - Brand names (Facebook, GitHub, Google)
   - Technical actions (push, pull, commit, merge)
   - Product features (pull request, news feed)
   - Technical concepts (database, bug, deploy)

2. Examples of correct responses:
   "ami GitHub e pull request create korbo"
   ➜ "আমি GitHub এ pull request create করবো"
   
   "Facebook account khulte hobe"
   ➜ "Facebook account খুলতে হবে"
   
   "database e data push korbo"
   ➜ "database এ data push করবো"

3. Examples of WRONG responses (DO NOT DO THIS):
   ❌ "আমি গিটহাব এ পুল রিকুয়েস্ট ক্রিয়েট করবো"
   ❌ "ফেসবুক একাউন্ট খুলতে হবে"
   ❌ "ডাটাবেস এ ডাটা পুশ করবো"

Only translate common everyday English words to Bengali. ALL technical terms, brand names, and technical concepts MUST stay in English exactly as written.`;
    
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

    const assistantMessage = completion.choices[0].message;

    // Save messages to database
    await connect();
    
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      chat.messages.push(
        { ...userMessage, timestamp: new Date() },
        { ...assistantMessage, timestamp: new Date() }
      );
      if (chat.title === 'New Chat') {
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
      { error: error.message },
      { status: 500 }
    );
  }
}
