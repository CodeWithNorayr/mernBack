import User from "../models/User.js";
import bcrypt from "bcrypt";
import validator from "validator";
import generateToken from "../utils/generateToken.js";
import fs from "fs";
import transporter from "../utils/nodemailer.js";
import { v2 as cloudinary } from "cloudinary";

const userRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const image = req.files?.image?.[0];
    const resume = req.files?.resume?.[0];

    // ===== Validation =====
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password too weak",
      });
    }

    // ===== Check if user exists =====
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // ===== Hash password =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== Upload Files to Cloudinary =====
    let imageUpload = null;
    let resumeUpload = null;

    if (image) {
      imageUpload = await cloudinary.uploader.upload(image.path);
    }

    if (resume) {
      resumeUpload = await cloudinary.uploader.upload(resume.path);
    }

    // ===== Create user =====
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      image: imageUpload ? imageUpload.secure_url : null,
      resume: resumeUpload ? resumeUpload.secure_url : null,
    });

    // ===== Generate token =====
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        resume: user.resume,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

/* ================= LOGIN ================= */
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, image: user.image },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

/* ================= GET PROFILE ================= */
const findUserById = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
};

/* ================= UPDATE ================= */
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const image = req.files?.image?.[0];
    const resume = req.files?.resume?.[0];

    // ===== Find user =====
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};

    // ===== Update Name =====
    if (name) updateData.name = name;

    // ===== Update Email =====
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email",
        });
      }

      // Check duplicate email
      const emailExists = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      }

      updateData.email = email;
    }

    // ===== Update Password =====
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 8 characters",
        });
      }

      updateData.password = await bcrypt.hash(password, 10);
    }

    // ===== Upload New Image to Cloudinary =====
    if (image) {
      const imageUpload = await cloudinary.uploader.upload(image.path, {
        folder: "users/images",
      });

      updateData.image = imageUpload.secure_url;
    }

    // ===== Upload New Resume to Cloudinary =====
    if (resume) {
      const resumeUpload = await cloudinary.uploader.upload(resume.path, {
        folder: "users/resumes",
      });

      updateData.resume = resumeUpload.secure_url;
    }

    // ===== Update User in DB =====
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update Error:", err);

    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};


/* ================= DELETE ================= */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ===== Delete image from Cloudinary =====
    if (user.image) {
      // Extract public_id from URL
      const publicId = user.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`users/images/${publicId}`);
    }

    // ===== Delete resume from Cloudinary =====
    if (user.resume) {
      const publicId = user.resume.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`users/resumes/${publicId}`);
    }

    // ===== Delete user from DB =====
    await user.deleteOne();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ success: false, message: "Deletion failed" });
  }
};

/* ================= EMAIL OTP ================= */
const sendEmail = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.verifyOtp = otp;
  user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;

  await user.save();

  await transporter.sendMail({
    to: user.email,
    subject: "Verify Email",
    text: `Your OTP is ${otp}`,
  });

  res.json({ success: true });
};

/* ================= VERIFY EMAIL OTP ================= */
const verifySendOtp = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.verifyOtp) return res.status(400).json({ success: false });

  if (user.verifyOtpExpireAt < Date.now()) return res.status(410).json({ success: false });

  if (!(await bcrypt.compare(req.body.otp, user.verifyOtp))) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  user.isAccountVerified = true;
  user.verifyOtp = null;
  user.verifyOtpExpireAt = null;
  await user.save();

  res.json({ success: true });
};

/* ================= RESET PASSWORD ================= */
const sendResetOtp = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ success: false });

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  user.resetOtp = otp;
  user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;

  await user.save();

  await transporter.sendMail({
    to: user.email,
    subject: "Password Reset OTP",
    text: `Your OTP is ${otp}`,
  });

  res.json({ success: true });
};

const verifyResetOtp = async (req, res) => {
  const { otp, password } = req.body;
  const user = await User.findById(req.user._id);

  if (!user || user.resetOtpExpireAt < Date.now()) {
    return res.status(400).json({ success: false });
  }

  if (!(await bcrypt.compare(otp, user.resetOtp))) {
    return res.status(400).json({ success: false });
  }

  user.password = await bcrypt.hash(password, 10);
  user.resetOtp = null;
  user.resetOtpExpireAt = null;
  await user.save();

  res.json({ success: true });
};

export {
  userRegistration,
  userLogin,
  findUserById,
  updateUser,
  deleteUser,
  sendEmail,
  verifySendOtp,
  sendResetOtp,
  verifyResetOtp
};
