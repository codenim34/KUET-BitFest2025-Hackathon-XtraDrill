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
  try {
    await connect();
    const publicStories = await Story.find({ isPublic: true })
      .select('title content')
      .sort({ createdAt: -1 });

    return NextResponse.json(publicStories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
