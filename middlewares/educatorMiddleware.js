import jwt from "jsonwebtoken";
import Educator from "../models/Educator.js";

const protectEducator = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const educator = await Educator.findById(decoded.id).select("-password");

    if (!educator) {
      return res
        .status(401)
        .json({ success: false, message: "Educator not found" });
    }

    req.educator = educator;
    next();

  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

export default protectEducator;
