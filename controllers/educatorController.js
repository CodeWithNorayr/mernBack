import Educator from "../models/Educator.js";
import bcrypt from "bcrypt";
import validator from "validator";
import generateToken from "../utils/generateToken.js";
import path from "path";
import fs from "fs";
import transporter from "../utils/nodemailer.js";
import { v2 as cloudinary } from "cloudinary";

/* =========================
   REGISTER EDUCATOR
========================= */
const educatorRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const image = req.file;

    // ===== Validation =====
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
    }

    // ===== Check if educator exists =====
    const educatorExists = await Educator.findOne({ email });
    if (educatorExists) {
      return res.status(409).json({ success: false, message: "Educator already exists" });
    }

    // ===== Hash password =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== Upload image to Cloudinary =====
    let imageUploader = null;
    if (image) {
      imageUploader = await cloudinary.uploader.upload(image.path, { folder: "educators/images" });
    }

    // ===== Create educator =====
    const educator = await Educator.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      image: imageUploader ? imageUploader.secure_url : null,
    });

    // ===== Generate token =====
    const token = generateToken(educator._id);

    return res.status(201).json({
      success: true,
      message: "Educator registered successfully",
      token,
      educator: {
        id: educator._id,
        name: educator.name,
        email: educator.email,
        image: educator.image,
      },
    });
  } catch (error) {
    console.error("Educator Registration Error:", error);
    return res.status(500).json({ success: false, message: "Failed to register educator" });
  }
};


/* =========================
   LOGIN EDUCATOR
========================= */
const educatorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

    const educator = await Educator.findOne({ email });
    if (!educator) return res.status(404).json({ success: false, message: "Educator not found" });

    const isMatch = await bcrypt.compare(password, educator.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(educator._id);
    return res.status(200).json({ success: true, message: "Educator logged in successfully", token, educator: { id: educator._id, name: educator.name, email: educator.email, image: educator.image } });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to login educator" });
  }
};

/* =========================
   GET EDUCATOR PROFILE
========================= */
const getEducatorById = async (req, res) => {
  try {
    const educator = await Educator.findById(req.educator._id).select("-password");
    if (!educator) return res.status(404).json({ success: false, message: "Educator not found" });

    return res.status(200).json({ success: true, data: educator });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to fetch educator" });
  }
};

/* =========================
   UPDATE EDUCATOR
========================= */
const updateEducator = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const image = req.file;

    // ===== Find educator =====
    const educator = await Educator.findById(req.educator._id);
    if (!educator) {
      return res.status(404).json({ success: false, message: "Educator not found" });
    }

    const updateData = {};

    // ===== Update name =====
    if (name) updateData.name = name.trim();

    // ===== Update email =====
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }

      const emailTaken = await Educator.findOne({ email, _id: { $ne: educator._id } });
      if (emailTaken) {
        return res.status(409).json({ success: false, message: "Email already in use" });
      }

      updateData.email = email.toLowerCase().trim();
    }

    // ===== Update password =====
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // ===== Update image =====
    if (image) {
      // Delete old image from Cloudinary if exists
      if (educator.image) {
        // Extract public_id from URL
        const publicId = educator.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`educators/images/${publicId}`);
      }

      // Upload new image
      const uploadedImage = await cloudinary.uploader.upload(image.path, { folder: "educators/images" });
      updateData.image = uploadedImage.secure_url;
    }

    // ===== Update educator in DB =====
    const updatedEducator = await Educator.findByIdAndUpdate(
      educator._id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Educator updated successfully",
      educator: {
        id: updatedEducator._id,
        name: updatedEducator.name,
        email: updatedEducator.email,
        image: updatedEducator.image,
      },
    });

  } catch (error) {
    console.error("Update Educator Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update educator" });
  }
};

/* =========================
   DELETE EDUCATOR
========================= */
const deleteEducator = async (req, res) => {
  try {
    const educator = await Educator.findById(req.educator._id);
    if (!educator) {
      return res.status(404).json({ success: false, message: "Educator not found" });
    }

    // Delete image from Cloudinary if exists
    if (educator.image) {
      const publicId = educator.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`educators/images/${publicId}`);
    }

    // Delete educator from DB
    await Educator.findByIdAndDelete(req.educator._id);

    return res.status(200).json({ success: true, message: "Educator deleted successfully" });

  } catch (error) {
    console.error("Delete Educator Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete educator" });
  }
};


/* =========================
   SEND EMAIL OTP
========================= */
const sendMail = async (req, res) => {
  try {
    const educator = await Educator.findById(req.educator._id);
    if (!educator) return res.status(404).json({ success: false, message: "Educator not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    educator.verifyOtp = otp;
    educator.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await educator.save();

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: educator.email,
      subject: "Email Verification OTP",
      text: `Your verification OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({ success: true, message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

/* =========================
   VERIFY EMAIL OTP
========================= */
const verifyMail = async (req, res) => {
  try {
    const { otp } = req.body;
    const educator = await Educator.findById(req.educator._id);
    if (!educator) return res.status(404).json({ success: false, message: "Educator not found" });

    if (!educator.verifyOtp || !educator.verifyOtpExpireAt) return res.status(400).json({ success: false, message: "No OTP request found" });

    if (educator.verifyOtpExpireAt < Date.now()) {
      educator.verifyOtp = null;
      educator.verifyOtpExpireAt = null;
      await educator.save();
      return res.status(410).json({ success: false, message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, educator.verifyOtp);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    educator.isAccountVerified = true;
    educator.verifyOtp = null;
    educator.verifyOtpExpireAt = null;
    await educator.save();

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

/* =========================
   SEND RESET OTP
========================= */
const sendResetOtp = async (req, res) => {
  try {
    const educator = await Educator.findById(req.educator._id);
    if (!educator) return res.status(404).json({ success: false, message: "Educator not found" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    educator.resetOtp = otp;
    educator.resetOtpExpireAt = Date.now() + 10 * 60 * 1000;
    await educator.save();

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: educator.email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    });

    return res.status(200).json({ success: true, message: "Reset OTP sent to your email" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to send reset OTP" });
  }
};

/* =========================
   VERIFY RESET OTP
========================= */
const verifyResetOtp = async (req, res) => {
  try {
    const { otp, password } = req.body;
    const educator = await Educator.findById(req.educator._id);
    if (!educator) return res.status(404).json({ success: false, message: "Educator not found" });

    if (!educator.resetOtp || !educator.resetOtpExpireAt) return res.status(400).json({ success: false, message: "No reset OTP request found" });

    if (educator.resetOtpExpireAt < Date.now()) {
      educator.resetOtp = null;
      educator.resetOtpExpireAt = null;
      await educator.save();
      return res.status(410).json({ success: false, message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, educator.resetOtp);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (!password || password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters long" });

    educator.password = await bcrypt.hash(password, 10);
    educator.resetOtp = null;
    educator.resetOtpExpireAt = null;
    await educator.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

export {
  educatorRegistration,
  educatorLogin,
  getEducatorById,
  updateEducator,
  deleteEducator,
  sendMail,
  verifyMail,
  sendResetOtp,
  verifyResetOtp
};
