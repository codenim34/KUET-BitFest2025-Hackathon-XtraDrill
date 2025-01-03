"use server";

import { connect } from "@/lib/mongodb/mongoose";
import User from "@/lib/models/userModel";

export async function fetchUserByClerkId(clerkId) {
  try {
    await connect();
    
    let user = await User.findOne({ clerkId: clerkId });
    
    if (!user) {
      // Create a new user if they don't exist
      user = await User.create({
        clerkId,
        stories: [],
        likedStories: [],
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function updateUser({ clerkId, updateData }) {
  try {
    await connect();
    
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { ...updateData },
      { new: true, upsert: true } // Add upsert option to create if doesn't exist
    );
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function fetchUserByUsername(username) {
  try {
    await connect();
    
    const user = await User.findOne({ userName: username });
    return user;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
}
