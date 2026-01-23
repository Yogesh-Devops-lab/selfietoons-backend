import mongoose from "mongoose";

const consumerSchema = new mongoose.Schema({
  name: { type: String },
  dob: { type: Date },
  mobile: { type: String, required: true },
  selfie: { type: String },
  location: { type: String },
  lat:{ type: Number },
  lon:{ type: Number },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },        
  otpExpiry: { type: Date },    
}, { timestamps: true });

export default mongoose.model("Consumer", consumerSchema);
