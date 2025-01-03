import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { connect } from "@/lib/mongodb/mongoose";
import Story from "@/lib/models/story";
import Canvas from "@/lib/models/canvas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Connect to MongoDB
    await connect();

    // First, let's process the query with AI to handle Banglish
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a search query processor. Your task is to:
          1. If the input is in Banglish (Bengali written in English), convert it to proper Bengali
          2. Generate relevant search keywords in both Bengali and English
          3. Return a JSON string with format: { "bengali": "বাংলা টেক্সট", "english": "english text", "keywords": ["keyword1", "keyword2"] }
          4. Keep technical terms in English`
        },
        {
          role: "user",
          content: query
        }
      ]
    });

    const processedQuery = JSON.parse(completion.choices[0].message.content);
    
    // Search in Stories
    const stories = await Story.find({
      $or: [
        { title: { $regex: new RegExp(processedQuery.bengali, 'i') } },
        { content: { $regex: new RegExp(processedQuery.bengali, 'i') } },
        { title: { $regex: new RegExp(processedQuery.english, 'i') } },
        { content: { $regex: new RegExp(processedQuery.english, 'i') } },
        { keywords: { $in: processedQuery.keywords } }
      ]
    }).limit(10);

    // Search in Canvas
    const canvases = await Canvas.find({
      $or: [
        { title: { $regex: new RegExp(processedQuery.bengali, 'i') } },
        { description: { $regex: new RegExp(processedQuery.bengali, 'i') } },
        { title: { $regex: new RegExp(processedQuery.english, 'i') } },
        { description: { $regex: new RegExp(processedQuery.english, 'i') } },
        { keywords: { $in: processedQuery.keywords } }
      ]
    }).limit(10);

    return NextResponse.json({
      stories: stories.map(story => ({
        id: story._id,
        title: story.title,
        type: 'story',
        preview: story.content.substring(0, 100) + '...',
        createdAt: story.createdAt
      })),
      canvases: canvases.map(canvas => ({
        id: canvas._id,
        title: canvas.title,
        type: 'canvas',
        preview: canvas.description,
        createdAt: canvas.createdAt
      }))
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
