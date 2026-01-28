import mongoose from "mongoose";

const GenerateVideoSchema = new mongoose.Schema({
  consumerId: { type: mongoose.Schema.Types.ObjectId, ref: "Consumer", required: true },  
  videoCategory: { type: String, required: true },
  //openingImage: { type: String , required: true },
  //closeImage: { type: String, required: true },
  videoPrompt: { type: String, required: true},
  publicUrl: { type: String },
  videoUrl: { type: String },        
  videoFile: { type: String },       
  duration: { type: Number },
}, { timestamps: true });

export default mongoose.model("GenerateVideo", GenerateVideoSchema);
        