import { connect } from "@/lib/mongodb/mongoose";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

const StorySchema = new mongoose.Schema({
  title: String,
  content: String,
  authorId: String,
  authorName: String,
  createdAt: Date,
  isPublic: Boolean,
});

// Use the existing model if it exists, otherwise create a new one
const Story = mongoose.models.Story || mongoose.model('Story', StorySchema);

export async function GET() {
  console.log('Stories API called');
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    console.log('Connecting to MongoDB...');
    await connect();
    console.log('Connected to MongoDB');
    
    const publicStories = await Story.find({ isPrivate: false })
      .select('title content')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found stories:', publicStories.length);

    if (!publicStories || publicStories.length === 0) {
      console.log('No public stories found');
      return NextResponse.json([]);
    }

    return NextResponse.json(publicStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
