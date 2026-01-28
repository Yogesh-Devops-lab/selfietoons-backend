import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/brandLogos");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {      
      
    cb(new Error("Only JPG, PNG, or PDF allowed"), false);
  }
};

export const logoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max            
})
                    

// .fields([
//   { name: "photo", maxCount: 1 },
//   { name: "document", maxCount: 1 },
// ]);
