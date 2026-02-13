import express from "express";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoute.js";
import connectDb from "./config/db.js";
import educatorRouter from "./routes/educatorRoute.js";
import coursesRouter from "./routes/coursesRoute.js";
import courseRouter from "./routes/courseRoute.js";
import commentRouter from "./routes/commentRoute.js";
import commentsRouter from "./routes/commentsRoute.js";
import likesTotalRouter from "./routes/likesTotalRoute.js";
import likesRouter from "./routes/likesRoute.js";
import educatorsRouter from "./routes/educatorsRoute.js";
import usersRouter from "./routes/usersRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/placeOrderRoute.js";
import connectCloudinary from "./config/cloudinary.js";

const PORT = process.env.PORT || 4000;

const app = express();

// ✅ Body parser
app.use(express.json());

// ✅ Enable CORS for frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // fallback for dev
    credentials: true,
  })
);

// ✅ API Routes
app.use("/api/user", userRouter);
app.use("/api/educator", educatorRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/course", courseRouter);
app.use("/api/comment", commentRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/total-likes", likesTotalRouter);
app.use("/api/likes", likesRouter);
app.use("/api/educators-list", educatorsRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ Root route
app.get("/", (_, res) => {
  res.send("API IS WORKING");
});

// ============================
// ✅ Start Server (Render-ready)
// ============================
const startServer = async () => {
  try {
    // Connect to MongoDB
    connectDb();

    // Connect to Cloudinary
    await connectCloudinary();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
  }
};

startServer();
