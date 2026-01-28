import { videoPrompts } from "../../data/videoPrompts.js";
import { generateKlingVideo } from "../../services/klingVideoService.js";
import GenerateVideo from "../../modules/consumer/GenerateVideo.js";
import axios from "axios";


// const BASE_URL = "https://python.selfietoons.com";

export const imageUrlToBase64 = async (imageUrl) => {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data, "binary").toString("base64");
};


// export const imageUrlToBase64 = async (imageUrl) => {
//   const response = await axios.get(imageUrl, {
//     responseType: "arraybuffer",
//   });

//   const contentType = response.headers["content-type"];
//   const base64 = Buffer.from(response.data).toString("base64");

//   return `data:${contentType};base64,${base64}`;
// };

export const createVideoFromImages = async (req, res) => {
  try {

    const { consumerId ,category, subStyle } = req.body;
    // const consumerId = req.user.id; // from JWT middleware

    const openingFile = req.files?.openingImage?.[0]?.path || req.body.openingImage;
    const closeFile = req.files?.closeImage?.[0]?.path || req.body.closeImage;

    console.log("openingFile" , openingFile);
    console.log("openingFile" , closeFile);

    


    if (!openingFile || !closeFile) {
      return res.status(400).json({
        success: false,
        error: "Opening and Closing images are required",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const openingImageUrl = `${baseUrl}/${openingFile.replace(/\\/g, "/")}`;
    const closeImageUrl = `${baseUrl}/${closeFile.replace(/\\/g, "/")}`;

    console.log("openingImageUrl", openingImageUrl);
    console.log("closeImageUrl", closeImageUrl);

    const openingImage = await imageUrlToBase64(openingImageUrl);
    const closeImage = await imageUrlToBase64(closeImageUrl);

   //     const openingImage = await imageUrlToBase64(`https://server.selfietoons.com/uploads/vimal.jpeg`);  //`https://server.selfietoons.com/uploads/vimal.jpeg`  ;
    // const closeImage = await imageUrlToBase64(`https://server.selfietoons.com/uploads/the-sweetest-christmas.jpg`);  //`https://server.selfietoons.com/uploads/the-sweetest-christmas.jpg`;

    console.log(typeof openingImage);           // "string"
console.log(openingImage.startsWith("data:image")); // true


    if (!openingImage || !closeImage || !category || !subStyle) {
      return res.status(400).json({
        success: false,
        error: "openingImage, closeImage, category, subStyle are required",
      });
    }

    const categoryBlock = videoPrompts[category];
    if (!categoryBlock) {
      return res.status(400).json({
        success: false,
        error: `Category '${category}' is not supported`,
      });
    }

    const selectedPromptSet = categoryBlock[subStyle];
    

    if (!selectedPromptSet?.prompt) {
      return res.status(400).json({
        success: false,
        error: `Invalid subStyle '${subStyle}'`,
      });
    }

    
    // openingImage = `https://server.selfitoons.com/${openingImage}`;
    // closeImage = `https://server.selfitoons.com/${closeImage}`;


    const klingPayload = {
      model_name: "kling-v2-1",
      mode: "pro",  
      duration: "10",
      aspect_ratio: "9:16",
      image: openingImage,
      image_tail: closeImage,
      prompt: selectedPromptSet.prompt,
      negative_prompt:
        "face morphing, changing face, multiple faces, uneven skin tone, face distortion, artifacts, blurry",
      cfg_scale: 0.6,
      external_task_id: `video_${Date.now()}`,
    };

    // 🎥 Generate & download video
    const result = await generateKlingVideo(klingPayload, consumerId);

    console.log("result" , result);
    

    // 💾 Store in DB
    const savedVideo = await GenerateVideo.create({
      consumerId,
      videoCategory: category,
     // openingImage,
     // closeImage,
      videoPrompt: selectedPromptSet.prompt,
      videoUrl: result.url,
      videoFile: result.file,
	  publicUrl : result.publicUrl,
      duration: result.duration,
    });

    return res.json({
      success: true,
      message: "Video generated & saved successfully",
      data: savedVideo,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};




export const getVideosByConsumerId = async (req, res) => {
  try {
    const { consumerId } = req.body;

    if (!consumerId) {
      return res.status(400).json({
        success: false,
        error: "consumerId is required",
      });
    }

    const videos = await GenerateVideo.find({ consumerId })
      // .sort({ createdAt: -1 }); // latest first

    return res.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};