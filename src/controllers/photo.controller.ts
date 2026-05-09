import type { Request, Response, NextFunction } from "express";
import { createPhoto, fetchPhotos } from "../services/photo.service.js";
import status from "http-status";
import type { CreatePhotoRequest, PhotoQuery } from "../types/photo.types.js";

export const PhotoController = {
  getPhotos: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as PhotoQuery;

      const photos = await fetchPhotos(query);
      return res.status(status.OK).json({ data: photos });
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req.body as CreatePhotoRequest;
      const file = req.file;

      if (!file) {
        return res
          .status(status.BAD_REQUEST)
          .json({ error: "File is required" });
      }

      const newPhoto = await createPhoto(request, file.buffer);

      return res.status(status.CREATED).json({ data: newPhoto });
    } catch (error) {
      next(error);
    }
  },
};
