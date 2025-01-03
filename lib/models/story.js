import mongoose, { Schema, model, models } from "mongoose";

const StorySchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  authorId: {
    type: String,
    required: [true, "Author ID is required"],
  },
  authorName: {  
    type: String,
    required: [true, "Author name is required"],
  },
  isPrivate: {
    type: Boolean,
    required: true,
    default: false,
  },
  loves: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const Story = models?.Story || model("Story", StorySchema);

export default Story;
