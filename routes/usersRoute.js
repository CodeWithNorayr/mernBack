import express from "express"
import { countUsers, usersTotalList } from "../controllers/usersController.js";

const usersRouter = express.Router();

usersRouter.get( "/users-total-list", usersTotalList );

usersRouter.get( "/users-count", countUsers );

export default usersRouter;