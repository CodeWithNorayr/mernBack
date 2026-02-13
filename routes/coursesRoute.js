import express from "express"
import getCourses from "../controllers/coursesControllers.js";

const coursesRouter = express.Router();

coursesRouter.get("/getAllCourses",getCourses);

export default coursesRouter;