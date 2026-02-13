import Course from "../models/Course.js";
import Educator from "../models/Educator.js";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const createCourse = async (req, res) => {
  try {
    const {
      courseTitle,
      courseDescription,
      coursePrice,
      discount,
      courseContent,
    } = req.body;

    if (!courseTitle || !courseDescription || !coursePrice || discount === undefined) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const educatorId = req.educator?._id;

    if (!educatorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized educator",
      });
    }

    // ===== Parse courseContent safely =====
    let parsedContent = [];
    if (courseContent) {
      try {
        parsedContent = JSON.parse(courseContent);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid courseContent format. Must be valid JSON.",
        });
      }
    }

    // ===== Upload image to Cloudinary if exists =====
    let imageUploader = null;
    if (req.file) {
      imageUploader = await cloudinary.uploader.upload(req.file.path, {
        folder: "courses/images",
      });
    }

    // ===== Create course =====
    const course = await Course.create({
      courseTitle,
      courseDescription,
      coursePrice,
      discount,
      courseContent: parsedContent,
      image: imageUploader ? imageUploader.secure_url : null,
      educator: educatorId,
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });

  } catch (error) {
    console.error("Create Course Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add course",
    });
  }
};



const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // ===== Find course =====
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ===== Auth educator =====
    const educatorId = req.educator?._id;
    if (!educatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized educator" });
    }

    // ===== Ownership check =====
    if (course.educator.toString() !== educatorId.toString()) {
      return res.status(403).json({ success: false, message: "You are not allowed to update this course" });
    }

    // ===== Build update object =====
    const updateData = {};
    const { courseTitle, courseDescription, coursePrice, discount, courseContent, isPublished } = req.body;

    if (courseTitle) updateData.courseTitle = courseTitle;
    if (courseDescription) updateData.courseDescription = courseDescription;
    if (coursePrice !== undefined) updateData.coursePrice = Number(coursePrice);
    if (discount !== undefined) updateData.discount = Number(discount);

    if (courseContent) {
      try {
        updateData.courseContent = JSON.parse(courseContent);
      } catch (err) {
        return res.status(400).json({ success: false, message: "Invalid courseContent JSON format" });
      }
    }

    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // ===== Handle image update =====
    if (req.file) {
      // Delete old Cloudinary image if exists
      if (course.image) {
        const publicId = course.image.split("/").pop().split(".")[0]; // assumes folder: courses/images
        await cloudinary.uploader.destroy(`courses/images/${publicId}`);
      }

      // Upload new image
      const uploadedImage = await cloudinary.uploader.upload(req.file.path, { folder: "courses/images" });
      updateData.image = uploadedImage.secure_url;
    }

    // ===== Update course =====
    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update course", error: error.message });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // ===== Find course =====
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // ===== Auth educator =====
    const educatorId = req.educator?._id;
    if (!educatorId) {
      return res.status(401).json({ success: false, message: "Unauthorized educator" });
    }

    // ===== Ownership check =====
    if (course.educator.toString() !== educatorId.toString()) {
      return res.status(403).json({ success: false, message: "You are not allowed to delete this course" });
    }

    // ===== Delete course image from Cloudinary =====
    if (course.image) {
      const publicId = course.image.split("/").pop().split(".")[0]; // assumes folder: courses/images
      await cloudinary.uploader.destroy(`courses/images/${publicId}`);
    }

    // ===== Delete course from DB =====
    await course.deleteOne();

    return res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete Course Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete course" });
  }
};


const getCourseById = async (req, res) => {
  try {

    const { id } = req.params;

    const course = await Course.findById(id).populate("educator", "name email image")

    if (!course) {
      return res.status(404).json({
        success: false, message: "Fetching course error"
      })
    }

    return res.status(200).json({
      success: true, data: course
    })

  } catch (error) {
    console.error("Fetching Course Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
}

export { createCourse, updateCourse, deleteCourse, getCourseById };
