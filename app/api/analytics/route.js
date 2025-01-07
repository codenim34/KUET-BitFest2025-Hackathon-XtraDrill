import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { auth } from '@clerk/nextjs';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    const db = conn.connection.db;

    // Get all stories (public + private) for the current user
    const stories = await db.collection('stories').find({ 
      authorId: userId,
      // No isPrivate filter to get both public and private stories
    }).toArray();
    
    // Calculate total loves (assuming loves is an array of user IDs)
    const totalLoves = stories.reduce((acc, story) => {
      return acc + (Array.isArray(story.loves) ? story.loves.length : 0);
    }, 0);

    // Calculate total words in stories (content + titles)
    const totalStoryWords = stories.reduce((acc, story) => {
      const contentWords = story.content?.trim().split(/\s+/) || [];
      const titleWords = story.title?.trim().split(/\s+/) || [];
      return acc + contentWords.length + titleWords.length;
    }, 0);

    // Get canvas collection stats for total words translated for this user
    const canvasEntries = await db.collection('canvas').find({ userId }).toArray();
    const totalCanvasWords = canvasEntries.reduce((acc, entry) => {
      const contentWords = entry.content?.trim().split(/\s+/) || [];
      const titleWords = entry.title?.trim().split(/\s+/) || [];
      return acc + contentWords.length + titleWords.length;
    }, 0);

    // Calculate total words translated (stories + canvas)
    const totalWordsTranslated = totalStoryWords + totalCanvasWords;

    // Get chat interactions for this user (number of conversations)
    const chatHistory = await db.collection('chats').find({ userId }).toArray();
    const totalChatInteractions = chatHistory.length; // Count number of chat sessions

    // Generate time series data (last 7 days)
    const timeSeriesData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayStories = stories.filter(s => 
        new Date(s.createdAt) >= dayStart && new Date(s.createdAt) <= dayEnd
      ).length;

      const dayChats = chatHistory.filter(c =>
        new Date(c.timestamp) >= dayStart && new Date(c.timestamp) <= dayEnd
      ).length;

      timeSeriesData.push({
        date: date.toLocaleDateString(),
        stories: dayStories,
        chats: dayChats,
        translations: dayStories + (canvasEntries.filter(c =>
          new Date(c.createdAt) >= dayStart && new Date(c.createdAt) <= dayEnd
        ).length)
      });
    }

    // Generate story length categories
    const storyLengthStats = {
      shortStories: stories.filter(s => {
        const words = s.content?.trim().split(/\s+/) || [];
        return words.length < 500;
      }).length,
      mediumStories: stories.filter(s => {
        const words = s.content?.trim().split(/\s+/) || [];
        return words.length >= 500 && words.length < 2000;
      }).length,
      longStories: stories.filter(s => {
        const words = s.content?.trim().split(/\s+/) || [];
        return words.length >= 2000;
      }).length,
      avgWordCount: Math.round(totalStoryWords / stories.length) || 0
    };

    // Get recent story activities (creations and loves)
    const recentActivities = [
      // Story creations
      ...stories.map(story => ({
        type: 'story_created',
        title: story.title,
        timestamp: story.createdAt
      })),
      // Story loves
      ...stories.filter(story => Array.isArray(story.loves) && story.loves.length > 0).map(story => ({
        type: 'story_loved',
        title: story.title,
        timestamp: story.updatedAt || story.createdAt,
        loveCount: Array.isArray(story.loves) ? story.loves.length : 0
      }))
    ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);

    return NextResponse.json({
      totalStats: {
        totalWordsTranslated,
        totalStoriesWritten: stories.length,
        totalChatInteractions,
        totalLoves
      },
      timeSeriesData,
      storyLengthStats,
      recentActivities
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
