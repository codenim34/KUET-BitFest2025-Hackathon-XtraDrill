import mongoose from "mongoose";

const CanvasSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "Untitled Canvas",
  },
  content: {
    type: String,
    default: "",
  },
  authorId: {
    type: String,
    required: [true, "Author ID is required"],
  },
  authorName: {
    type: String,
    required: [true, "Author name is required"],
  }
}, {
  timestamps: true
});

export default mongoose.models.Canvas || mongoose.model("Canvas", CanvasSchema);
