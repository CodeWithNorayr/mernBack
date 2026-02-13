import express from "express";
import { getLikesCount, getTotalLikes, getLikesCountAll } from "../controllers/likesTotalController.js";

const likesTotalRouter = express.Router();

// Likes count for a single comment
likesTotalRouter.get("/likes-count/:commentId", getLikesCount);

// Total likes (all likes with details)
likesTotalRouter.get("/total-likes", getTotalLikes);

// Likes count for all comments (frontend can use this for optimization)
likesTotalRouter.get("/likes-count-all", getLikesCountAll);

export default likesTotalRouter;
