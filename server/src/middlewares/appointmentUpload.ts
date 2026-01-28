import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure appointments upload directory exists
const appointmentsDir = "uploads/appointments";
if (!fs.existsSync(appointmentsDir)) {
  fs.mkdirSync(appointmentsDir, { recursive: true });
}

// Store files in /uploads/appointments folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, appointmentsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    cb(null, `appointment-${timestamp}-${random}${ext}`);
  }
});

// Filter to accept only images
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const appointmentUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB per file (larger for damage photos)
});
