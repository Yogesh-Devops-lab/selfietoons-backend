import mongoose from "mongoose";

const consumerSchema = new mongoose.Schema({
  businessName: { type: String },
  ownerName: { type: String },
  mobile: { type: String, required: true },
  businessCategory: { type: String },
  accountType: { type: String, enum: ["personal" , "business"], default: "business" },
  brandLogo: { type: String },
  location: { type: String },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },        
  otpExpiry: { type: Date },    
}, { timestamps: true });

export default mongoose.model("Consumer", consumerSchema);
