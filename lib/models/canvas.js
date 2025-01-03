import mongoose, { Schema, model, models } from "mongoose";

const CanvasSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
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

const Canvas = models?.Canvas || model("Canvas", CanvasSchema);

export default Canvas;
