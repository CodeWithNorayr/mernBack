import User from "../models/User.js";

const usersTotalList = async ( _, res ) => {
  try {
    
    const users = await User.find().select("-password").sort({createdAt: -1});

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    })

  } catch (error) {
     console.error("Error fetching users:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
}

const countUsers = async ( _, res ) => {
  try {
    
    const count = await User.countDocuments();

    return res.status(200).json({
      success: true,
      data: count
    })

  } catch (error) {
    console.error("Error counting users:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to count users",
    });
  }
}

export { usersTotalList, countUsers };