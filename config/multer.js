import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

/* ===============================
   ✅ Cloudinary Config
================================= */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ===============================
   ✅ Unified Storage System
================================= */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "general";

    /* ---------- IMAGES ---------- */
    if (file.mimetype.startsWith("image/")) {
      // Detect route folder
      if (req.baseUrl.includes("courses")) {
        folder = "courses/images";
      } else if (req.baseUrl.includes("educators")) {
        folder = "educators/images";
      } else if (req.baseUrl.includes("users")) {
        folder = "users/images";
      } else {
        folder = "general/images";
      }

      return {
        folder,
        resource_type: "image",
        public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
      };
    }

    /* ---------- RESUMES ---------- */
    const allowedDocs = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedDocs.includes(file.mimetype)) {
      folder = "users/resumes";

      return {
        folder,
        resource_type: "raw", // 👈 required for PDFs/docs
        public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
      };
    }

    /* ---------- REJECT OTHERS ---------- */
    throw new Error("Unsupported file type!");
  },
});

/* ===============================
   ✅ Multer Upload Middleware
================================= */
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max (good for resumes)
  },
});

export default upload;
