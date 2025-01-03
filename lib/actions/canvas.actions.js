"use server";

import { connect } from "@/lib/mongodb/mongoose";
import Canvas from "@/lib/models/canvas";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/utils/pusher";

export async function createCanvas({ _id, title, content, authorId, authorName }) {
  try {
    await connect();

    const newCanvas = await Canvas.create({
      _id,
      title,
      content,
      authorId,
      authorName
    });

    revalidatePath("/canvas");
    return { success: true, data: newCanvas };
  } catch (error) {
    console.error("Error creating canvas:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCanvas(canvasId, { title, content, userId }) {
  try {
    await connect();

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(canvasId);
    const updatedCanvas = await Canvas.findByIdAndUpdate(
      objectId,
      { title, content },
      { new: true }
    );

    if (!updatedCanvas) {
      throw new Error("Canvas not found");
    }

    // Trigger Pusher event for real-time updates
    await pusherServer.trigger(`canvas-${canvasId}`, 'canvas-updated', {
      content,
      title,
      userId
    });

    revalidatePath(`/canvas/${canvasId}`);
    return { success: true, data: updatedCanvas };
  } catch (error) {
    console.error("Error updating canvas:", error);
    return { success: false, error: error.message };
  }
}

export async function getCanvasByAuthor(authorId) {
  try {
    await connect();

    const canvases = await Canvas.find({ authorId })
      .sort({ createdAt: -1 });

    return { success: true, data: canvases };
  } catch (error) {
    console.error("Error fetching canvases:", error);
    return { success: false, error: error.message };
  }
}

export async function getCanvasById(id) {
  try {
    await connect();

    // Convert string ID to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);
    const canvas = await Canvas.findById(objectId);
    
    if (!canvas) {
      throw new Error("Canvas not found");
    }

    return { success: true, data: canvas };
  } catch (error) {
    console.error("Error fetching canvas:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllCanvases() {
  try {
    await connect();

    const canvases = await Canvas.find().sort({ updatedAt: -1 });
    return { success: true, data: canvases };
  } catch (error) {
    console.error("Error getting canvases:", error);
    return { success: false, error: error.message };
  }
}
