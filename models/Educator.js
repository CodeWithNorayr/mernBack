import mongoose from "mongoose";

const educatorSchema = ({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  image: { type: String, default: "" },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 }
})

const Educator = mongoose.models.Educator || mongoose.model("Educator", educatorSchema)

export default Educator