import Educator from "../models/Educator.js";

const totalEducatorsList = async ( _, res ) => {
  try {
    const educators = await Educator.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: educators.length,
      data: educators,
    });
  } catch (error) {
    console.error("Error fetching educators:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch educators",
    });
  }
};

const educatorsCount = async ( _, res ) => {
  try {
    const count = await Educator.countDocuments();

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error counting educators:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to count educators",
    });
  }
};

export { totalEducatorsList, educatorsCount };
