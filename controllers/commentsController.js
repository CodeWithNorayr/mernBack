import Comment from "../models/CourseComment.js";

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("user", "name email image")
      .sort({ createdAt: -1 }); // optional: newest comments first

    return res.status(200).json({
      success: true,
      total: comments.length,
      data: comments,
    });
  } catch (error) {
    console.error("Fetching Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

export default getAllComments;
