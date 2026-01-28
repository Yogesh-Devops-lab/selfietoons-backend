import express from "express";
import { sendOtp, verifyConsumerOtp } from "../../controllers/consumer/consumerAuth.js";
import { logoUpload } from "../../middleware/logoUploads.js";


const router = express.Router();

// Send OTP / Login
router.post("/login", sendOtp); 

// Verify OTP
router.post("/verify-otp", logoUpload.single('brandLogo') , verifyConsumerOtp);

export default router;
