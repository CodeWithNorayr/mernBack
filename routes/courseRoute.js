import express from "express";
import protectEducator from "../middlewares/educatorMiddleware.js";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseById,
} from "../controllers/courseController.js";
import upload from "../config/multer.js";

const courseRouter = express.Router();

/* ==============================
   ✅ CREATE COURSE
============================== */
courseRouter.post(
  "/create",
  protectEducator,
  upload.single("image"),
  createCourse
);

/* ==============================
   ✅ UPDATE COURSE
============================== */
courseRouter.put(
  "/update/:id",
  protectEducator,
  upload.single("image"),
  updateCourse
);

/* ==============================
   ✅ DELETE COURSE
============================== */
courseRouter.delete(
  "/delete/:id",
  protectEducator,
  deleteCourse
);

/* ==============================
   ✅ GET COURSE BY ID
============================== */
courseRouter.get(
  "/course/:id",
  getCourseById
);

export default courseRouter;
