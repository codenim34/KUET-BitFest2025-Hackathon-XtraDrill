"use server";

import { connect } from "@/lib/mongodb/mongoose";
import Story from "@/lib/models/story";
import { revalidatePath } from "next/cache";

export async function createStory({ title, content, authorId, authorName }) {
  try {
    await connect();

    const story = await Story.create({
      title,
      content,
      authorId,
      authorName,
    });

    revalidatePath("/stories");
    return { success: true, data: story };
  } catch (error) {
    console.error("Error creating story:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStory(storyId, { title, content }) {
  try {
    await connect();

    const story = await Story.findById(storyId);
    
    if (!story) {
      throw new Error("Story not found");
    }

    story.title = title;
    story.content = content;
    story.updatedAt = new Date();

    await story.save();

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

    const stories = await Story.find()
      .sort({ createdAt: -1 });

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
      throw new Error("Story not found");
    }

    return { success: true, data: story };
  } catch (error) {
    console.error("Error fetching story:", error);
    return { success: false, error: error.message };
  }
}
