import express from "express";

import {
  deleteUser,
  findUserById,
  sendEmail,
  sendResetOtp,
  updateUser,
  userLogin,
  userRegistration,
  verifyResetOtp,
  verifySendOtp,
} from "../controllers/userController.js";

import protectUser from "../middlewares/userMiddleware.js";
import upload from "../config/multer.js";

const userRouter = express.Router();

/* ===========================
   AUTH ROUTES
=========================== */

// Registration
userRouter.post(
  "/registration",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  userRegistration
);

// Login
userRouter.post("/login", userLogin);

/* ===========================
   USER PROFILE ROUTES
=========================== */

// Get logged-in user profile
userRouter.get("/me", protectUser, findUserById);

// Update user profile (auth first, then upload)
userRouter.put(
  "/update-user",
  protectUser,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  updateUser
);

// Delete user account
userRouter.delete("/me", protectUser, deleteUser);

/* ===========================
   EMAIL OTP ROUTES
=========================== */

// Send email verification OTP
userRouter.post("/send-email-otp", protectUser, sendEmail);

// Verify email OTP
userRouter.post("/verify-email-otp", protectUser, verifySendOtp);

/* ===========================
   PASSWORD RESET ROUTES
=========================== */

// Send reset OTP (NO login required)
userRouter.post("/send-reset-otp", sendResetOtp);

// Verify reset OTP (NO login required)
userRouter.post("/verify-reset-otp", verifyResetOtp);

export default userRouter;
