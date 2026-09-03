import type { Collection, Photo } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { toBoolean } from "../utils/to-boolean.js";
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
    const exists = await prisma.collection.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!exists) break;

    slug = `${base}-${suffix}`;
    suffix++;
  }

  return slug;
};

const resolveCoverPhoto = async (
  collectionId: string,
  coverPhotoId?: string | null,
): Promise<Photo | null> => {
  if (coverPhotoId) {
    const cover = await prisma.photo.findUnique({
      where: { id: coverPhotoId },
    });
    if (cover) return cover;
  }

  return prisma.photo.findFirst({
    where: { collectionId },
    orderBy: { number: "asc" },
  });
};

export const fetchCollections = async (query: CollectionQuery) => {
  const collections = await prisma.collection.findMany({
    where: {
      ...(query.visibility !== undefined
        ? { visibility: toBoolean(query.visibility) === true }
        : {}),
    },
    orderBy: { order: "asc" },
  });

  return Promise.all(
    collections.map(async (collection) => ({
      ...collection,
      coverPhoto: await resolveCoverPhoto(
        collection.id,
        collection.coverPhotoId,
      ),
    })),
  );
};

export const fetchCollectionBySlug = async (slug: string) => {
  const collection = await prisma.collection.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!collection) throw new AppError("Collection not found", 404);

  const [coverPhoto, photos] = await Promise.all([
    resolveCoverPhoto(collection.id, collection.coverPhotoId),
    prisma.photo.findMany({
      where: { collectionId: collection.id },
      orderBy: { number: "asc" },
    }),
  ]);

  return { ...collection, coverPhoto, photos };
};

export const createCollection = async (title: string): Promise<Collection> => {
  if (!title || !title.trim()) {
    throw new AppError("Title is required", 400);
  }

  const slug = await generateUniqueSlug(title);
  const order = await prisma.collection.count();

  return prisma.collection.create({
    data: { title: title.trim(), slug, order },
  });
};

export const updateCollection = async (
  id: string,
  payload: UpdateCollectionRequest,
): Promise<Collection> => {
  const collection = await prisma.collection.findUnique({ where: { id } });

  if (!collection) throw new AppError("Collection not found", 404);

  const data: Parameters<typeof prisma.collection.update>[0]["data"] = {};

  if (payload.title !== undefined) {
    if (!payload.title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }
    data.title = payload.title.trim();
    data.slug = await generateUniqueSlug(payload.title, id);
  }

  if (payload.visibility !== undefined) {
    data.visibility = toBoolean(payload.visibility) === true;
  }

  return prisma.collection.update({ where: { id }, data });
};

export const setCollectionCover = async (
  id: string,
  coverPhotoId: string,
): Promise<Collection> => {
  const collection = await prisma.collection.findUnique({ where: { id } });

  if (!collection) throw new AppError("Collection not found", 404);

  const photo = await prisma.photo.findUnique({ where: { id: coverPhotoId } });

  if (!photo) throw new AppError("Photo not found", 404);

  if (photo.collectionId !== id) {
    throw new AppError("Photo does not belong to this collection", 400);
  }

  return prisma.collection.update({
    where: { id },
    data: { coverPhotoId },
  });
};

export const rearrangeCollections = async (
  orderedIds: string[],
): Promise<void> => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  // One transaction so a partial failure cannot leave a broken ordering.
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.collection.update({ where: { id }, data: { order: index } }),
    ),
  );
};

export const deleteCollection = async (id: string): Promise<void> => {
  const collection = await prisma.collection.findUnique({ where: { id } });

  if (!collection) throw new AppError("Collection not found", 404);

  const photoCount = await prisma.photo.count({ where: { collectionId: id } });

  if (photoCount > 0) {
    throw new AppError(
      "Cannot delete a collection that still has photos. Move or delete its photos first.",
      409,
    );
  }

  await prisma.collection.delete({ where: { id } });
};
