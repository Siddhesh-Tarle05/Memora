import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    name: {
      type: String,
      default: "Untitled Collection",
      trim: true
    },

    noteIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "notes"
      }
    ],

    // 🧠 Optional: store tags summary of cluster
    tags: [
      {
        type: String
      }
    ],

    // 🧠 Optional: cluster size (for UI)
    size: {
      type: Number,
      default: 0
    },

    // 🧠 Optional: centroid embedding (advanced)
    centroid: {
      type: [Number], // vector
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 🔥 Auto update size before save
collectionSchema.pre("save", function (next) {
  this.size = this.noteIds.length;
  next();
});

export default mongoose.model("Collection", collectionSchema);