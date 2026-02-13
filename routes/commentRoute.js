import express from "express";
import protectUser from "../middlewares/userMiddleware.js";
import { createComment, deleteComment, getCommentById, updateComment } from "../controllers/commentController.js";

const commentRouter = express.Router();

// Create comment
commentRouter.post("/create-comment", protectUser, createComment);

// Update comment (needs :id)
commentRouter.put("/update-comment/:id", protectUser, updateComment);

// Delete comment (needs :id)
commentRouter.delete("/delete-comment/:id", protectUser, deleteComment);

// Get comment by ID (optional: public route)
commentRouter.get("/comment/:id", protectUser, getCommentById);

export default commentRouter;
