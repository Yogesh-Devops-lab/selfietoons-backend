import multer from "multer";
import path from "path";
import fs from "fs";

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "uploads/";

    if (file.fieldname === "openingImage") {
      uploadPath += "openimage/";
    } else if (file.fieldname === "closeImage") {
      uploadPath += "closeimage/";
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },


});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "application/pdf"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, or PDF allowed"), false);
  }
};


export const videoImagesUpload = multer({
  storage,
  fileFilter,
}).fields([
  { name: "openingImage", maxCount: 1 },
  { name: "closeImage", maxCount: 1 },
]);
