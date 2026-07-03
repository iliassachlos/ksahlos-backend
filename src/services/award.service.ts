import { Award, type IAward } from "../models/award.model.js";
import { uploadImage, deleteImage } from "./cloudinary.service.js";
import { AppError } from "../utils/app-error.js";

export const fetchAwards = async (): Promise<IAward[]> => {
  return Award.find().sort({ order: 1 });
};

export const createAward = async (fileBuffer: Buffer): Promise<IAward> => {
  const { cloudinaryId, url } = await uploadImage(fileBuffer);

  const order = await Award.countDocuments();

  return Award.create({ cloudinaryId, url, order });
};

export const rearrangeAwards = async (orderedIds: string[]): Promise<void> => {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw new AppError("orderedIds must be a non-empty array", 400);
  }

  const updates = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Award.bulkWrite(updates);
};

export const deleteAward = async (id: string): Promise<void> => {
  const award = await Award.findById(id);

  if (!award) throw new AppError("Award not found", 404);

  await deleteImage(award.cloudinaryId);
  await Award.findByIdAndDelete(id);
};
