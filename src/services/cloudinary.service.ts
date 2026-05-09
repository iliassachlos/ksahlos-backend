import type { CloudinaryUploadResponse } from "../types/cloudinary.types.js";
import { v2 as cloudinary } from "cloudinary";

export const uploadImage = (
  fileBuffer: Buffer,
): Promise<CloudinaryUploadResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ksahlos" }, (error, result) => {
        if (error || !result) {
          return reject(
            error || new Error("Unknown error during image upload"),
          );
        }

        resolve({
          cloudinaryId: result.public_id,
          url: result.secure_url,
        });
      })
      .end(fileBuffer);
  });
};

export const deleteImage = async (cloudinaryId: string): Promise<void> => {
  await cloudinary.uploader.destroy(cloudinaryId);
};
