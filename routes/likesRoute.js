import express from "express"
import protectUser from "../middlewares/userMiddleware.js";
import { toggleLike } from "../controllers/likesController.js";

const likesRouter = express.Router();

likesRouter.post("/toggle-like",protectUser,toggleLike);

export default likesRouter;