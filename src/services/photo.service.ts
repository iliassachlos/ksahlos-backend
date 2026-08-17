import { Photo, type IPhoto } from "../models/photo.model.js";
import { Collection } from "../models/collection.model.js";
import type {
  CreatePhotoRequest,
  UpdatePhotoRequest,
  PhotoQuery,
} from "../types/photo.types.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";
import { AppError } from "../utils/app-error.js";

const MAX_HERO_PHOTOS = 4;

const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined) return undefined;
  return value === true || value === "true";
};

const assertHeroLimit = async (excludeId?: string): Promise<void> => {
  const filter: Record<string, unknown> = { hero: true };
  if (excludeId) filter._id = { $ne: excludeId };

  const heroCount = await Photo.countDocuments(filter);

  if (heroCount >= MAX_HERO_PHOTOS) {
    throw new AppError(
      `Only ${MAX_HERO_PHOTOS} hero photos are allowed`,
      400,
    );
  }
};

export const fetchPhotos = async (query: PhotoQuery): Promise<IPhoto[]> => {
  const filters: Record<string, unknown> = {};

  if (query.title) {
    filters.title = { $regex: query.title, $options: "i" };
  }

  if (query.collection) {
    const collection = await Collection.findOne({
      slug: query.collection.toLowerCase(),
    });

    // Unknown collection slug -> no photos match.
    if (!collection) return [];

    filters.collectionId = collection._id;
  }

  if (query.visibility !== undefined) {
    filters.visibility = query.visibility;
  }

  if (query.hero !== undefined) {
    filters.hero = query.hero;
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
  const collection = await Collection.findById(request.collectionId);

  if (!collection) throw new AppError("Collection not found", 404);

  const hero = toBoolean(request.hero) ?? false;

  if (hero) {
    await assertHeroLimit();
  }

  const { cloudinaryId, url } = await uploadImage(fileBuffer);

  const lastPhoto = await Photo.findOne().sort({ number: -1 });
  const number = lastPhoto ? lastPhoto.number + 1 : 1;

  const newPhoto = await Photo.create({
    ...request,
    cloudinaryId,
    url,
    number,
    visibility: true,
    hero,
  });

  return newPhoto;
};

export const updatePhoto = async (
  id: string,
  request: UpdatePhotoRequest,
  fileBuffer?: Buffer,
): Promise<IPhoto> => {
  const photo = await Photo.findById(id);

  if (!photo) throw new AppError("Photo not found", 404);

  if (request.collectionId) {
    const collectionExists = await Collection.exists({
      _id: request.collectionId,
    });
    if (!collectionExists) throw new AppError("Collection not found", 404);
  }

  const nextHero = toBoolean(request.hero) ?? photo.hero;
  const nextVisibility = toBoolean(request.visibility) ?? photo.visibility;

  if (nextHero && !nextVisibility) {
    throw new AppError("A hero photo must be visible", 400);
  }

  if (nextHero && !photo.hero) {
    await assertHeroLimit(id);
  }

  const updates: Record<string, unknown> = { ...request };

  if (fileBuffer && fileBuffer.length > 0) {
    const { cloudinaryId, url } = await uploadImage(fileBuffer);
    await deleteImage(photo.cloudinaryId);
    updates.cloudinaryId = cloudinaryId;
    updates.url = url;
  }

  const updated = await Photo.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  return updated!;
};

export const rearrangePhotos = async (
  orderedIds: string[],
): Promise<void> => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  const operations = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { number: index + 1 } },
    },
  }));

  await Photo.bulkWrite(operations);
};

export const deletePhoto = async (id: string): Promise<void> => {
  const photo = await Photo.findById(id);

  if (!photo) throw new AppError("Photo not found", 404);

  await deleteImage(photo.cloudinaryId);
  await Photo.findByIdAndDelete(id);
};
