import type { PhotoResponse } from "../types/photo.types.js";
import type { IPhoto } from "../models/photo.model.js";

/**
 * Maps a Mongoose photo document to a PhotoResponse.
 *
 * @param photo - Mongoose photo document to be mapped.
 * @returns A PhotoResponse object containing the mapped data from the Mongoose photo document.
 */
export const mapMongoosePhotoToDto = (photo: IPhoto): PhotoResponse => {
  return {
    id: photo._id.toString(),
    title: photo.title,
    description: photo.description,
    url: photo.url,
    collectionId: photo.collectionId.toString(),
    number: photo.number,
    visibility: photo.visibility,
    hero: photo.hero,
    cloudinaryId: photo.cloudinaryId,
  };
};
