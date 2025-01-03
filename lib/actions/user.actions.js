"use server";

import { connect } from "@/lib/mongodb/mongoose";
import User from "@/lib/models/userModel";

export async function fetchUserByClerkId(clerkId) {
  try {
    await connect();
    
    const user = await User.findOne({ clerkId: clerkId });
    
    if (!user) throw new Error("User not found");
    
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
      { new: true }
    );
    
    if (!updatedUser) throw new Error("User not found");
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}
