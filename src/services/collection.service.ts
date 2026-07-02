import { Types } from "mongoose";
import { Collection, type ICollection } from "../models/collection.model.js";
import { Photo, type IPhoto } from "../models/photo.model.js";
import { AppError } from "../utils/app-error.js";
import { slugify } from "../utils/slugify.js";
import type {
  CollectionQuery,
  UpdateCollectionRequest,
} from "../types/collection.types.js";

const generateUniqueSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  const base = slugify(title) || "collection";
  let slug = base;
  let suffix = 2;

  while (true) {
    const filter: Record<string, unknown> = { slug };
    if (excludeId) filter._id = { $ne: excludeId };

    const exists = await Collection.exists(filter);
    if (!exists) break;

    slug = `${base}-${suffix}`;
    suffix++;
  }

  return slug;
};

// Resolve the image to show for a collection: the admin-set cover, or a
// fallback to the first photo in the collection (by number) so every
// collection always has an image. Returns null if the collection has no photos.
const resolveCoverPhoto = async (
  collectionId: Types.ObjectId,
  coverPhotoId?: Types.ObjectId | null,
): Promise<IPhoto | null> => {
  if (coverPhotoId) {
    const cover = await Photo.findById(coverPhotoId);
    if (cover) return cover;
  }

  return Photo.findOne({ collectionId }).sort({ number: 1 });
};

export const fetchCollections = async (query: CollectionQuery) => {
  const filter: Record<string, unknown> = {};

  if (query.visibility !== undefined) {
    filter.visibility = query.visibility;
  }

  const collections = await Collection.find(filter).sort({ order: 1 });

  return Promise.all(
    collections.map(async (collection) => ({
      ...collection.toObject(),
      coverPhoto: await resolveCoverPhoto(
        collection._id as Types.ObjectId,
        collection.coverPhotoId,
      ),
    })),
  );
};

export const fetchCollectionBySlug = async (slug: string) => {
  const collection = await Collection.findOne({ slug: slug.toLowerCase() });

  if (!collection) throw new AppError("Collection not found", 404);

  const collectionId = collection._id as Types.ObjectId;

  const [coverPhoto, photos] = await Promise.all([
    resolveCoverPhoto(collectionId, collection.coverPhotoId),
    Photo.find({ collectionId }).sort({ number: 1 }),
  ]);

  return { ...collection.toObject(), coverPhoto, photos };
};

export const createCollection = async (
  title: string,
): Promise<ICollection> => {
  if (!title || !title.trim()) {
    throw new AppError("Title is required", 400);
  }

  const slug = await generateUniqueSlug(title);
  const order = await Collection.countDocuments();

  return Collection.create({ title: title.trim(), slug, order });
};

export const updateCollection = async (
  id: string,
  payload: UpdateCollectionRequest,
): Promise<ICollection> => {
  const collection = await Collection.findById(id);

  if (!collection) throw new AppError("Collection not found", 404);

  if (payload.title !== undefined) {
    if (!payload.title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    collection.title = payload.title.trim();
    collection.slug = await generateUniqueSlug(payload.title, id);
  }

  if (payload.visibility !== undefined) {
    collection.visibility = payload.visibility;
  }

  await collection.save();

  return collection;
};

export const setCollectionCover = async (
  id: string,
  coverPhotoId: string,
): Promise<ICollection> => {
  const collection = await Collection.findById(id);

  if (!collection) throw new AppError("Collection not found", 404);

  const photo = await Photo.findById(coverPhotoId);

  if (!photo) throw new AppError("Photo not found", 404);

  if (photo.collectionId.toString() !== id) {
    throw new AppError("Photo does not belong to this collection", 400);
  }

  collection.coverPhotoId = new Types.ObjectId(coverPhotoId);

  await collection.save();

  return collection;
};

export const rearrangeCollections = async (
  orderedIds: string[],
): Promise<void> => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  const operations = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Collection.bulkWrite(operations);
};

export const deleteCollection = async (id: string): Promise<void> => {
  const collection = await Collection.findById(id);

  if (!collection) throw new AppError("Collection not found", 404);

  const photoCount = await Photo.countDocuments({ collectionId: id });

  if (photoCount > 0) {
    throw new AppError(
      "Cannot delete a collection that still has photos. Move or delete its photos first.",
      409,
    );
  }

  await Collection.findByIdAndDelete(id);
};
