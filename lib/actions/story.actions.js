"use server";

import { connect } from "@/lib/mongodb/mongoose";
import Story from "@/lib/models/story";
import User from "@/lib/models/userModel";
import { revalidatePath } from "next/cache";

export async function createStory({ title, content, authorId, authorName, isPrivate }) {
  try {
    await connect();

    console.log("Creating story with data:", { title, authorId, authorName, isPrivate });

    const story = await Story.create({
      title,
      content,
      authorId,
      authorName,
      isPrivate: Boolean(isPrivate),
    });

    console.log("Created story:", story);

    revalidatePath("/stories");
    return { success: true, data: story };
  } catch (error) {
    console.error("Error creating story:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStory(storyId, { title, content, isPrivate }) {
  try {
    await connect();

    console.log("Updating story with data:", { storyId, title, isPrivate });

    const story = await Story.findById(storyId);
    
    if (!story) {
      throw new Error("Story not found");
    }

    story.title = title;
    story.content = content;
    story.isPrivate = Boolean(isPrivate);
    story.updatedAt = new Date();

    await story.save();

    console.log("Updated story:", story);

    revalidatePath("/stories");
    revalidatePath(`/stories/${storyId}`);
    
    return { success: true, data: story };
  } catch (error) {
    console.error("Error updating story:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteStory(storyId) {
  try {
    await connect();

    const story = await Story.findById(storyId);
    
    if (!story) {
      throw new Error("Story not found");
    }

    await Story.findByIdAndDelete(storyId);

    revalidatePath("/stories");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting story:", error);
    return { success: false, error: error.message };
  }
}

export async function getStories() {
  try {
    await connect();

    const stories = await Story.find({ 
      $or: [
        { isPrivate: false },
        { isPrivate: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });

    console.log("Fetched stories:", stories);

    return { success: true, data: stories };
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { success: false, error: error.message };
  }
}

export async function getStoryById(id) {
  try {
    await connect();

    const story = await Story.findById(id);
    if (!story) {
      return { success: false, error: "Story not found" };
    }

    // Fetch author's username
    const author = await User.findOne({ clerkId: story.authorId });
    const authorUsername = author ? author.userName : null;

    return { 
      success: true, 
      data: {
        ...story.toObject(),
        authorUsername
      }
    };
  } catch (error) {
    console.error("Error fetching story:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserStories(authorId, type = "all") {
  try {
    await connect();

    let query = { authorId };
    
    // Filter by privacy if specified
    if (type === "public") {
      query = {
        ...query,
        $or: [
          { isPrivate: false },
          { isPrivate: { $exists: false } }
        ]
      };
    } else if (type === "private") {
      query = {
        ...query,
        isPrivate: true
      };
    }

    const stories = await Story.find(query)
      .sort({ createdAt: -1 });

    console.log(`Fetched ${type} user stories:`, stories);

    return { success: true, data: stories };
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleLoveStory(storyId, userId) {
  try {
    await connect();
    console.log('Toggling love for story:', { storyId, userId });

    // First, ensure the story has a loves array
    await Story.updateOne(
      { _id: storyId, loves: { $exists: false } },
      { $set: { loves: [] } }
    );

    const story = await Story.findById(storyId);
    console.log('Found story:', story);

    if (!story) {
      console.log('Story not found');
      return { success: false, error: "Story not found" };
    }

    const isLoved = story.loves?.includes(userId) || false;
    console.log('Current love status:', { isLoved, loves: story.loves });

    let updatedStory;

    if (isLoved) {
      // Remove love
      console.log('Removing love');
      updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $pull: { loves: userId } },
        { new: true }
      );
    } else {
      // Add love
      console.log('Adding love');
      updatedStory = await Story.findByIdAndUpdate(
        storyId,
        { $addToSet: { loves: userId } },
        { new: true }
      );
    }

    console.log('Updated story:', updatedStory);

    revalidatePath("/stories");
    return { 
      success: true, 
      data: updatedStory,
      isLoved: !isLoved 
    };
  } catch (error) {
    console.error("Error toggling love:", error);
    return { success: false, error: error.message };
  }
}

export async function getLikedStories(userId) {
  try {
    await connect();

    const stories = await Story.find({
      loves: userId
    }).sort({ createdAt: -1 });

    return { success: true, data: stories };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
