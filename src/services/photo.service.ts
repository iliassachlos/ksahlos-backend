import type { Photo } from "@prisma/client";
import { prisma } from "../config/prisma.js";
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
  const heroCount = await prisma.photo.count({
    where: {
      hero: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (heroCount >= MAX_HERO_PHOTOS) {
    throw new AppError(`Only ${MAX_HERO_PHOTOS} hero photos are allowed`, 400);
  }
};

export const fetchPhotos = async (query: PhotoQuery): Promise<Photo[]> => {
  let collectionId: string | undefined;

  if (query.collection) {
    const collection = await prisma.collection.findUnique({
      where: { slug: query.collection.toLowerCase() },
      select: { id: true },
    });

    // Unknown collection slug -> no photos match.
    if (!collection) return [];

    collectionId = collection.id;
  }

  return prisma.photo.findMany({
    where: {
      ...(query.title ? { title: { contains: query.title } } : {}),
      ...(collectionId ? { collectionId } : {}),
      ...(query.visibility !== undefined
        ? { visibility: query.visibility }
        : {}),
      ...(query.hero !== undefined ? { hero: query.hero } : {}),
    },
    orderBy: { number: "asc" },
  });
};

export const createPhoto = async (
  request: CreatePhotoRequest,
  fileBuffer: Buffer,
): Promise<Photo> => {
  const collection = await prisma.collection.findUnique({
    where: { id: request.collectionId },
    select: { id: true },
  });

  if (!collection) throw new AppError("Collection not found", 404);

  const hero = toBoolean(request.hero) ?? false;

  if (hero) {
    await assertHeroLimit();
  }

  const { cloudinaryId, url } = await uploadImage(fileBuffer);

  const lastPhoto = await prisma.photo.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const number = lastPhoto ? lastPhoto.number + 1 : 1;

  return prisma.photo.create({
    data: {
      title: request.title,
      description: request.description ?? "",
      collectionId: request.collectionId,
      cloudinaryId,
      url,
      number,
      visibility: true,
      hero,
    },
  });
};

export const updatePhoto = async (
  id: string,
  request: UpdatePhotoRequest,
  fileBuffer?: Buffer,
): Promise<Photo> => {
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) throw new AppError("Photo not found", 404);

  if (request.collectionId) {
    const collectionExists = await prisma.collection.findUnique({
      where: { id: request.collectionId },
      select: { id: true },
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

  const updates: Parameters<typeof prisma.photo.update>[0]["data"] = {
    ...(request.title !== undefined ? { title: request.title } : {}),
    ...(request.description !== undefined
      ? { description: request.description }
      : {}),
    ...(request.collectionId !== undefined
      ? { collectionId: request.collectionId }
      : {}),
    ...(request.hero !== undefined ? { hero: nextHero } : {}),
    ...(request.visibility !== undefined
      ? { visibility: nextVisibility }
      : {}),
  };

  if (fileBuffer && fileBuffer.length > 0) {
    const { cloudinaryId, url } = await uploadImage(fileBuffer);
    await deleteImage(photo.cloudinaryId);
    updates.cloudinaryId = cloudinaryId;
    updates.url = url;
  }

  return prisma.photo.update({ where: { id }, data: updates });
};

export const rearrangePhotos = async (orderedIds: string[]): Promise<void> => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  // One transaction so a partial failure cannot leave a broken ordering.
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.photo.update({ where: { id }, data: { number: index + 1 } }),
    ),
  );
};

export const deletePhoto = async (id: string): Promise<void> => {
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (!photo) throw new AppError("Photo not found", 404);

  await deleteImage(photo.cloudinaryId);
  await prisma.photo.delete({ where: { id } });
};
