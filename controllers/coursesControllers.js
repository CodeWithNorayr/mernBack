import Course from "../models/Course.js";

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ createdAt: -1 })
      .populate("educator", "name email image"); // optional

    return res.status(200).json({
      success: true,
      totalCourses: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Fetching Courses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export default getCourses 