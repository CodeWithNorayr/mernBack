import Like from "../models/Likes.js";
import Comment from "../models/CourseComment.js";

const createLike = async (req, res) => {
  try {
    const { commentId } = req.body;
    const userId = req.user._id;

    // 1. Validate input
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

    // 2. Check if comment exists
    const commentData = await Comment.findById(commentId);

    if (!commentData) {
      return res.status(404).json({
        success: false,
       message: "Comment not found",
      });
    }

    // 3. Check if already liked
    const isAlreadyLiked = await Like.findOne({ userId, commentId });

    if (isAlreadyLiked) {
      return res.status(409).json({
        success: false,
        message: "You already liked this comment",
      });
    }

    // 4. Create Like
    await Like.create({
      userId,
      commentId,
      like: true,
    });

    return res.status(201).json({
      success: true,
      message: "Comment liked successfully",
    });

  } catch (error) {
    console.error("Create Like Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to like comment",
    });
  }
};

const toggleLike = async (req, res) => {
  const { commentId } = req.body;
  const userId = req.user._id;

  const existing = await Like.findOne({ userId, commentId });

  if (existing) {
    await Like.deleteOne({ _id: existing._id });
    return res.json({ success: true, message: "Unliked" });
  }

  await Like.create({ userId, commentId });

  return res.json({ success: true, message: "Liked" });
};

export { createLike, toggleLike };
