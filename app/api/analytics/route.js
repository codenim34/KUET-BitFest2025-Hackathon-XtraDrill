import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const conn = await connectToDatabase();
    const db = conn.connection.db;

    // Get stories collection stats
    const stories = await db.collection('stories').find({}).toArray();
    const totalStoriesWritten = stories.length;
    
    // Calculate total loves (assuming loves is an array of user IDs)
    const totalLoves = stories.reduce((acc, story) => {
      return acc + (Array.isArray(story.loves) ? story.loves.length : 0);
    }, 0);

    // Calculate total words in stories
    const totalStoryWords = stories.reduce((acc, story) => {
      const words = story.content?.trim().split(/\\s+/) || [];
      return acc + (words.length || 0);
    }, 0);

    // Get canvas collection stats for total words translated
    const canvasEntries = await db.collection('canvas').find({}).toArray();
    const totalCanvasWords = canvasEntries.reduce((acc, entry) => {
      const words = entry.content?.trim().split(/\\s+/) || [];
      return acc + (words.length || 0);
    }, 0);

    // Calculate total words translated (stories + canvas)
    const totalWordsTranslated = totalStoryWords + totalCanvasWords;

    // Get chat interactions (from bengali-chat-history)
    const chatHistory = await db.collection('bengali-chat-history').find({}).toArray();
    const totalChatInteractions = chatHistory.length;

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
        const words = s.content?.trim().split(/\\s+/) || [];
        return words.length < 500;
      }).length,
      mediumStories: stories.filter(s => {
        const words = s.content?.trim().split(/\\s+/) || [];
        return words.length >= 500 && words.length < 2000;
      }).length,
      longStories: stories.filter(s => {
        const words = s.content?.trim().split(/\\s+/) || [];
        return words.length >= 2000;
      }).length,
      avgWordCount: Math.round(totalStoryWords / totalStoriesWritten) || 0
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
        totalStoriesWritten,
        totalChatInteractions,
        totalLoves
      },
      timeSeriesData,
      storyLengthStats,
      recentActivities
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
