import type { Award } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";
import { AppError } from "../utils/app-error.js";

export const fetchAwards = async (): Promise<Award[]> => {
  return prisma.award.findMany({ orderBy: { order: "asc" } });
};

export const createAward = async (fileBuffer: Buffer): Promise<Award> => {
  const { cloudinaryId, url } = await uploadImage(fileBuffer);

  const order = await prisma.award.count();

  return prisma.award.create({ data: { cloudinaryId, url, order } });
};

export const rearrangeAwards = async (orderedIds: string[]): Promise<void> => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  // One transaction so a partial failure cannot leave a broken ordering.
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.award.update({ where: { id }, data: { order: index } }),
    ),
  );
};

export const deleteAward = async (id: string): Promise<void> => {
  const award = await prisma.award.findUnique({ where: { id } });

  if (!award) throw new AppError("Award not found", 404);

  await deleteImage(award.cloudinaryId);
  await prisma.award.delete({ where: { id } });
};
