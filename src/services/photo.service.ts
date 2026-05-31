import { Photo, type IPhoto } from "../models/photo.model.js";
import type { CreatePhotoRequest, UpdatePhotoRequest, PhotoQuery } from "../types/photo.types.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";
import { AppError } from "../utils/app-error.js";

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

export const updatePhoto = async (
  id: string,
  request: UpdatePhotoRequest,
): Promise<IPhoto> => {
  const photo = await Photo.findByIdAndUpdate(id, request, { new: true });

  if (!photo) throw new AppError("Photo not found", 404);

  return photo;
};

export const deletePhoto = async (id: string): Promise<void> => {
  const photo = await Photo.findById(id);

  if (!photo) throw new AppError("Photo not found", 404);

  await deleteImage(photo.cloudinaryId);
  await Photo.findByIdAndDelete(id);
};
