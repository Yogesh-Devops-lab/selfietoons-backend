import axios from "axios";
import { downloadFileFromUrl } from "../utils/fileUtils.js";
import jwt from "jsonwebtoken";
import path from "path";

const KLING_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJBTDNIckduTUpNVEVmYUVRTVFiSFJSTUVlTEVrSmg4VCIsImV4cCI6MTc2ODIwODUzOSwibmJmIjoxNzY4MTk3NzM0fQ.t6wRACsXOijrleTG5_TScHd9KCQPAvXOVL0jjMaCETY";
const KLING_API_BASE =
  process.env.KLING_API_BASE || "https://api-singapore.klingai.com";

const ak = process.env.ACCESS_KEY; 
const sk = process.env.SECRET_KEY; 

const encodeJwtToken = (ak, sk) => {
  const now = Math.floor(Date.now() / 1000); // current time in seconds

  const payload = {
    iss: ak,
    exp: now + 1800, // valid for 30 minutes
    nbf: now - 5, // valid from 5 seconds ago
  };

  const token = jwt.sign(payload, sk, {
    algorithm: "HS256",
  });

  return token;
};


const createKlingTask = async (payload , authorization) => {

  try {
    const url = `${KLING_API_BASE}/v1/videos/image2video`;

    const { data } = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authorization}`,   //`Bearer ${KLING_API_KEY}`
      },
    });

    if (data.code !== 0) {
      console.error("❌ [createKlingTask] Kling API error:", {
        payload,
        response: data,
      });
      throw new Error(data.message || "Kling task creation failed");
    }

    console.log("✅ [createKlingTask] Task created:", data.data.task_id);

    return data.data.task_id;
  } catch (err) {
    console.error("🔥 [createKlingTask] Axios / Runtime error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      payload,
    });

    throw err;
  }
};

const pollKlingTask = async (taskId , authorization) => {
  try {
    const url = `${KLING_API_BASE}/v1/videos/image2video/${taskId}`;

    console.log("url", url);

    while (true) {
      const { data } = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authorization}` ,                       //`Bearer ${KLING_API_KEY}`
        },
      });

      if (data.code !== 0) {
        console.error("❌ [pollKlingTask] Kling polling error:", {
          taskId,
          response: data,
        });
        throw new Error(data.message || "Kling polling error");
      }

      const status = data.data.task_status;
      console.log(`⏳ [pollKlingTask] Task ${taskId} status:`, status);

      if (status === "succeed") {
        const video = data.data.task_result.videos?.[0];
        if (!video?.url) {
          console.error("❌ [pollKlingTask] No video URL:", data.data);
          throw new Error("Kling success but no video URL");
        }

        console.log("✅ [pollKlingTask] Video ready:", video.url);

        return {
          videoUrl: video.url,
          duration: video.duration,
        };
      }

      if (status === "failed") {
        console.error("❌ [pollKlingTask] Task failed:", data.data);
        throw new Error("Kling task failed");
      }

      await new Promise((r) => setTimeout(r, 5000));
    }
  } catch (err) {
    console.error("🔥 [pollKlingTask] Runtime error:", {
      taskId,
      message: err.message,
      response: err.response?.data,
    });

    throw err;
  }
};

export const generateKlingVideo = async (payload, consumerId) => {
  const authorization = encodeJwtToken(ak, sk);
  console.log(authorization);

  try {
    console.log("🎬 [generateKlingVideo] Starting video generation", {
      consumerId,
      payload,
    });

    const taskId = await createKlingTask(payload , authorization);
    const result = await pollKlingTask(taskId , authorization);

    const folderPath = `uploads/generated-videos/${consumerId}`;
    const fileName = `kling_${Date.now()}.mp4`;

    const localFile = await downloadFileFromUrl(
      result.videoUrl,
      fileName,
      folderPath
    );

     const publicBase = "https://python.selfietoons.com/";
    const relativePath = path.relative(
      "/var/www/vhosts/selfietoons.com/python.selfietoons.com",
      localFile
    ).replace(/\\/g, "/"); // handle Windows slashes if any

    const publicUrl = publicBase + relativePath;


    console.log("✅ [generateKlingVideo] Video downloaded:", localFile);

    return {
      taskId,
      url: result.videoUrl,
      file: localFile,
      publicUrl,
      duration: result.duration,
    };
  } catch (err) {
    console.error("🔥 [generateKlingVideo] Failed:", {
      consumerId,
      message: err.message,
      stack: err.stack,
    });

    throw err;
  }
};
