import { connect } from "@/lib/mongodb/mongoose";
import Story from "@/lib/models/story";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { storyId } = await req.json();
    if (!storyId) {
      return NextResponse.json(
        { error: "Story ID is required" },
        { status: 400 }
      );
    }

    await connect();

    // Find the story and check if user has already loved it
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: "Story not found" },
        { status: 404 }
      );
    }

    const hasLoved = story.loves?.includes(userId);
    let updatedStory;

    if (hasLoved) {
      // Remove love
      updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $pull: { loves: userId } },
        { new: true }
      );
    } else {
      // Add love
      updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $addToSet: { loves: userId } },
        { new: true }
      );
    }

    // Return the updated story with love status
    return NextResponse.json({
      success: true,
      data: {
        ...updatedStory.toObject(),
        isLoved: !hasLoved,
        loveCount: (updatedStory.loves || []).length
      }
    });

  } catch (error) {
    console.error("Error toggling love:", error);
    return NextResponse.json(
      { error: error.message || "Failed to toggle love" },
      { status: 500 }
    );
  }
}
