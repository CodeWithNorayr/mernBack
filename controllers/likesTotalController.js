import Like from "../models/Likes.js";
import Comment from "../models/CourseComment.js";

// Get likes count for a single comment
const getLikesCount = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const likesCount = await Like.countDocuments({ commentId });

    return res.status(200).json({
      success: true,
      likesCount, // ✅ only likes count
    });

  } catch (error) {
    console.error("Get Likes Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch likes count",
    });
  }
};

// Get all likes (for admin or debugging)
const getTotalLikes = async (req, res) => {
  try {
    const likes = await Like.find()
      .populate("userId", "name image email")
      .populate("commentId", "comment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalLikes: likes.length,
      data: likes,
    });

  } catch (error) {
    console.error("Get Total Likes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch likes",
    });
  }
};

// Optional: get likes count for all comments at once (recommended!)
const getLikesCountAll = async (req, res) => {
  try {
    const comments = await Comment.find();
    const likesCount = {};

    for (const comment of comments) {
      likesCount[comment._id] = await Like.countDocuments({ commentId: comment._id });
    }

    return res.status(200).json({
      success: true,
      likesCount,
    });

  } catch (error) {
    console.error("Get Likes Count All Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch likes count",
    });
  }
};

export { getLikesCount, getTotalLikes, getLikesCountAll };
