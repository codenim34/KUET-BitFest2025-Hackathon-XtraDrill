import mongoose, { Schema } from "mongoose";

const ChatSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
  },
  title: {
    type: String,
    default: "New Chat",
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  storyContext: {
    storyId: String,
    title: String,
    content: String
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

ChatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
export default Chat;
