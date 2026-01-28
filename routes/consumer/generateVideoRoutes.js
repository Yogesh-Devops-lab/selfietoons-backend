import express from "express";
import { createVideoFromImages, getVideosByConsumerId } from "../../controllers/consumer/generateVideo.js";
import { videoImagesUpload } from "../../middleware/videoImageUploads.js";


const router = express.Router();

router.post("/generateVideo", videoImagesUpload ,  createVideoFromImages);
router.post("/get-by-consumer", getVideosByConsumerId);


export default router;
