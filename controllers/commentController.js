import Course from "../models/Course.js";
import Comment from "../models/CourseComment.js";
import User from "../models/User.js";

const createComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const userId = req.user?._id;
    const { courseId } = req.body;

    // ✅ Check authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not logged in",
      });
    }

    // ✅ Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    // ✅ Check course exists
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ✅ Validate comment text
    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // ✅ Create comment
    const newComment = await Comment.create({
      comment,
      courseId,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Create Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create comment",
    });
  }
};


const updateComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const { id } = req.params;
    const userId = req.user?._id;

    // ✅ Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Validate comment text
    if (!comment || comment.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    // ✅ Find comment
    const commentDoc = await Comment.findById(id);

    if (!commentDoc) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ✅ Ownership check
    if (commentDoc.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this comment",
      });
    }

    // ✅ Update
    commentDoc.comment = comment;
    await commentDoc.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: commentDoc,
    });
  } catch (error) {
    console.error("Update Comment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    // Find comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Optional: verify user exists in DB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found",
      });
    }

    // Ownership check
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this comment",
      });
    }

    // Delete the comment
    await comment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Comment successfully deleted",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};


const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Comment ID is required",
      });
    }

    const comment = await Comment.findById(id)
      .populate("user", "name email image")
      .populate("courseId", "courseTitle image coursePrice");

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Fetching Comment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comment",
    });
  }
};


export { createComment, updateComment, deleteComment, getCommentById };
