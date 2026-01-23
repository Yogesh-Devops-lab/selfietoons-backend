import fs from "node:fs";
import path from "node:path";
import axios from "axios";

// Only supports remote image URLs
export const readImageAsBase64 = async (imageUrl) => {
  if (!imageUrl.startsWith("http")) {
    throw new Error("Only image URLs are supported");
  }
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary").toString("base64");
};

// Save the generated base64 image locally
export const saveBase64Image = async (base64, filename = "output.png") => {
  const buffer = Buffer.from(base64, "base64");
  const outDir = path.resolve("src/public/outputs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const outputPath = path.join(outDir, filename);
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
};

/**
 * Downloads ANY file from a URL (video/image/etc.)
 * and saves it in /src/public/videos
 *
 * @param {string} fileUrl - URL returned by Kling
 * @param {string} filename - Name to save
 * @returns {string} - Local file path
 */
// export const downloadFileFromUrl = async (fileUrl, filename) => {
//   try {
//     const outDir = path.resolve("src/public/videos");

//     if (!fs.existsSync(outDir)) {
//       fs.mkdirSync(outDir, { recursive: true });
//     }

//     const outputPath = path.join(outDir, filename);

//     const response = await axios.get(fileUrl, {
//       responseType: "arraybuffer",
//     });

//     fs.writeFileSync(outputPath, response.data);

//     return outputPath;
//   } catch (err) {
//     console.error("Error downloading file:", err.message);
//     throw new Error("Failed to download video file");
//   }
// };


export const downloadFileFromUrl = async (url, filename, folderPath) => {
  const fullDir = path.resolve(folderPath);

  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }

  const filePath = path.join(fullDir, filename);

  const response = await axios({
    method: "GET",
    url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
};