import mongoose from "mongoose";

const likesSchema = new mongoose.Schema({
  like: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true }
}, { timestamps: true });

// Prevent duplicate likes per user per comment
likesSchema.index({ userId: 1, commentId: 1 }, { unique: true });

const Like = mongoose.models.Like || mongoose.model("Like", likesSchema);

export default Like;
