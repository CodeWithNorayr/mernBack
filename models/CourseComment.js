import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: false },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true},
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
})

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;