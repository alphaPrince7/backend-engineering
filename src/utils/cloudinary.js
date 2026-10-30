import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    console.log("Cloudinary upload successful:", {
      public_id: response.public_id,
      secure_url: response.secure_url,
    });

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message, error.http_code);

    return null;
  } finally {
    // Always remove the temporary local file safely
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log("Temporary file deleted:", localFilePath);
      }
    } catch (cleanupError) {
      console.error("Temporary file cleanup error:", cleanupError.message);
    }
  }
};

export { uploadOnCloudinary };
