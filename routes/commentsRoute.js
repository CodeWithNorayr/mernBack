import express from "express";
import getAllComments from "../controllers/commentsController.js";


const commentsRouter = express.Router();

commentsRouter.get("/comments",getAllComments);

export default commentsRouter;