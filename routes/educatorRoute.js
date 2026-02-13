import express from "express";
import upload from "../config/multer.js";
import { deleteEducator, getEducatorById, educatorLogin, educatorRegistration, sendMail, sendResetOtp, updateEducator, verifyMail, verifyResetOtp } from "../controllers/educatorController.js";
import protectEducator from "../middlewares/educatorMiddleware.js";

const educatorRouter = express.Router();

educatorRouter.post("/registration",upload.single("image"),educatorRegistration);

educatorRouter.post("/login",educatorLogin);

educatorRouter.get("/educator",protectEducator,getEducatorById);

educatorRouter.put("/updateEducator",upload.single("image"),protectEducator,updateEducator);

educatorRouter.delete("/deleteEducator",protectEducator,deleteEducator);

educatorRouter.post("/sendOtpEmail",protectEducator,sendMail);

educatorRouter.post("/verifyOtpMail",protectEducator,verifyMail);

educatorRouter.post("/sendResetOtp",protectEducator,sendResetOtp);

educatorRouter.post("/verifyResetOtp",protectEducator,verifyResetOtp);

export default educatorRouter;