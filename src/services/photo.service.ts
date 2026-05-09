import { Photo, type IPhoto } from "../models/photo.model.js";
import type { CreatePhotoRequest, PhotoQuery } from "../types/photo.types.js";
import { uploadImage } from "./cloudinary.service.js";

export const fetchPhotos = async (query: PhotoQuery): Promise<IPhoto[]> => {
  const filters: Record<string, unknown> = {};

  if (query.category) {
    filters.category = query.category.toLowerCase();
  }

  if (query.visibility !== undefined) {
    filters.visibility = query.visibility;
  }

  const photos = await Photo.find(filters).sort({
    number: 1,
  });

  return photos;
};

export const createPhoto = async (
  request: CreatePhotoRequest,
  fileBuffer: Buffer,
): Promise<IPhoto> => {
  const { cloudinaryId, url } = await uploadImage(fileBuffer);

  const newPhoto = await Photo.create({
    ...request,
    cloudinaryId,
    url,
  });

  return newPhoto;
};
