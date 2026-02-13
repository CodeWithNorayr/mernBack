import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI).then(()=>{
      console.log("DATABASE IS CONNECTED SUCCESSFULLY")
    })
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1)
  }
}

export default connectDb;