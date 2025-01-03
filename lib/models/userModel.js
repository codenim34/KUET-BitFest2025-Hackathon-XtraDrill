import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  image_url: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: false,
  },
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  likedStories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Story'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;