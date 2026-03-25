import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String },
  text: { type: String, required: true },
  tags: { type: [String], default: [] },
  topic: { type: String },
  isHighlight: { type: Boolean, default: false }
});
const  notesModel=mongoose.model("Note", noteSchema);

export default notesModel;